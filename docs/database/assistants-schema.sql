-- ============================================================
-- VOICE ASSISTANT SYSTEM - DATABASE SCHEMA
-- ============================================================
-- This file documents the Supabase PostgreSQL schema for the
-- Voice Assistant Builder feature.
--
-- Status: DOCUMENTED (not yet implemented in app)
-- These tables should be created when persistence is ready.
--
-- PREREQUISITES:
-- The following trigger function should exist in your database:
-- ============================================================

-- Helper function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================

-- ============================================================
-- ASSISTANTS TABLE
-- Stores voice assistant configurations
-- ============================================================

CREATE TABLE IF NOT EXISTS assistants (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership & Auth
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic info
  name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),

  -- Configuration (JSONB for flexibility and partial updates)
  builder_input JSONB NOT NULL,         -- Original AssistantBuilderInput
  generated_prompt TEXT NOT NULL,        -- Full system prompt
  vapi_config JSONB NOT NULL,           -- VapiAssistantCreatePayload

  -- Vapi integration
  vapi_assistant_id VARCHAR(100) UNIQUE, -- Set after deployment to Vapi
  vapi_phone_number_id VARCHAR(100),     -- Phone number assigned by Vapi

  -- Analytics (denormalized for quick access)
  total_calls INTEGER NOT NULL DEFAULT 0,
  avg_duration_seconds DECIMAL(10, 2),
  successful_transfers INTEGER NOT NULL DEFAULT 0,

  -- Versioning
  version INTEGER NOT NULL DEFAULT 1,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deployed_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_vapi_state CHECK (
    (status = 'active' AND vapi_assistant_id IS NOT NULL) OR
    (status != 'active')
  )
);

-- Indexes for common queries
CREATE INDEX idx_assistants_user_id ON assistants(user_id);
CREATE INDEX idx_assistants_status ON assistants(status);
CREATE INDEX idx_assistants_created_at ON assistants(created_at DESC);
CREATE INDEX idx_assistants_vapi_id ON assistants(vapi_assistant_id) WHERE vapi_assistant_id IS NOT NULL;

-- Auto-update updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON assistants
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- ASSISTANT_CALL_LOGS TABLE
-- Tracks individual calls for analytics and debugging
-- ============================================================

CREATE TABLE IF NOT EXISTS assistant_call_logs (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationship
  assistant_id UUID NOT NULL REFERENCES assistants(id) ON DELETE CASCADE,

  -- Vapi call data
  vapi_call_id VARCHAR(100) UNIQUE NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Outcome
  status VARCHAR(50) NOT NULL,           -- 'completed', 'no-answer', 'busy', 'failed'
  end_reason VARCHAR(100),               -- 'customer-ended-call', 'assistant-ended-call', etc.
  transferred_to_human BOOLEAN DEFAULT FALSE,

  -- Data
  transcript JSONB,                      -- Full conversation array
  summary TEXT,                          -- Generated summary
  sentiment_score DECIMAL(3, 2) CHECK (sentiment_score >= -1.00 AND sentiment_score <= 1.00),  -- -1.00 to 1.00

  -- Cost tracking
  cost_usd DECIMAL(10, 4),

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_call_status CHECK (status IN ('completed', 'no-answer', 'busy', 'failed')),
  CONSTRAINT call_end_after_start CHECK (ended_at IS NULL OR ended_at >= started_at)
);

-- Indexes for call log queries
CREATE INDEX idx_call_logs_assistant ON assistant_call_logs(assistant_id);
CREATE INDEX idx_call_logs_started ON assistant_call_logs(started_at DESC);
CREATE INDEX idx_call_logs_vapi_id ON assistant_call_logs(vapi_call_id);

-- ============================================================
-- ASSISTANT_TOOLS TABLE
-- Reusable tool/function library for assistants
-- ============================================================

CREATE TABLE IF NOT EXISTS assistant_tools (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic info
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,        -- 'scheduling', 'data-collection', 'transfer', 'custom'

  -- Function definition (JSON Schema format)
  parameters JSONB NOT NULL,            -- { type: 'object', required: [...], properties: {...} }

  -- Implementation
  endpoint_url VARCHAR(500),             -- Webhook URL to call
  endpoint_method VARCHAR(10) DEFAULT 'POST',
  endpoint_headers JSONB,                -- Custom headers

  -- Usage tracking
  usage_count INTEGER NOT NULL DEFAULT 0,
  success_rate DECIMAL(5, 2) CHECK (success_rate >= 0 AND success_rate <= 100),  -- 0-100 percentage

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint per user
  CONSTRAINT unique_tool_per_user UNIQUE (user_id, name),
  -- Category must be valid
  CONSTRAINT valid_tool_category CHECK (category IN ('scheduling', 'data-collection', 'transfer', 'custom'))
);

-- Indexes
CREATE INDEX idx_tools_user ON assistant_tools(user_id);
CREATE INDEX idx_tools_category ON assistant_tools(category);
CREATE INDEX idx_tools_active ON assistant_tools(is_active) WHERE is_active = TRUE;

-- Auto-update updated_at
CREATE TRIGGER set_tools_updated_at
  BEFORE UPDATE ON assistant_tools
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- ASSISTANT_DRAFTS TABLE (Optional)
-- Auto-save drafts for in-progress wizard sessions
-- ============================================================

CREATE TABLE IF NOT EXISTS assistant_drafts (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Draft data
  form_state JSONB NOT NULL,             -- AssistantWizardState
  current_step VARCHAR(50),

  -- Session info
  last_edited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,       -- Auto-delete after 7 days

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_draft_step CHECK (current_step IN ('basics', 'capabilities', 'compliance', 'persona', 'knowledge', 'preview')),
  CONSTRAINT draft_expires_after_created CHECK (expires_at > created_at)
);

-- Auto-update last_edited_at when draft changes
CREATE TRIGGER set_drafts_updated_at
  BEFORE UPDATE ON assistant_drafts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- Index for cleanup queries
CREATE INDEX idx_drafts_expires ON assistant_drafts(expires_at);
CREATE INDEX idx_drafts_user ON assistant_drafts(user_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_drafts ENABLE ROW LEVEL SECURITY;

-- Users can only access their own assistants
CREATE POLICY assistants_user_policy ON assistants
  FOR ALL USING (auth.uid() = user_id);

-- Users can only see call logs for their assistants
CREATE POLICY call_logs_user_policy ON assistant_call_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM assistants
      WHERE assistants.id = assistant_call_logs.assistant_id
        AND assistants.user_id = auth.uid()
    )
  );

-- Users can only manage their own tools
CREATE POLICY tools_user_policy ON assistant_tools
  FOR ALL USING (auth.uid() = user_id);

-- Users can only manage their own drafts
CREATE POLICY drafts_user_policy ON assistant_drafts
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- USEFUL QUERIES
-- ============================================================

-- Get all assistants for current user with call stats
-- SELECT
--   a.id,
--   a.name,
--   a.status,
--   a.created_at,
--   a.total_calls,
--   a.avg_duration_seconds,
--   COUNT(acl.id) as recent_call_count
-- FROM assistants a
-- LEFT JOIN assistant_call_logs acl ON a.id = acl.assistant_id
--   AND acl.created_at > NOW() - INTERVAL '30 days'
-- WHERE a.user_id = auth.uid()
-- GROUP BY a.id
-- ORDER BY a.created_at DESC;

-- Get analytics for specific assistant
-- SELECT
--   COUNT(*) as total_calls,
--   COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
--   ROUND(AVG(duration_seconds)::numeric, 2) as avg_duration_seconds,
--   COUNT(CASE WHEN transferred_to_human = TRUE THEN 1 END) as human_transfers,
--   ROUND(100.0 * COUNT(CASE WHEN transferred_to_human = TRUE THEN 1 END) / COUNT(*), 2) as transfer_rate,
--   ROUND(SUM(cost_usd)::numeric, 2) as total_cost_usd,
--   ROUND(AVG(CASE WHEN sentiment_score IS NOT NULL THEN sentiment_score END)::numeric, 2) as avg_sentiment
-- FROM assistant_call_logs
-- WHERE assistant_id = $1
--   AND created_at > NOW() - INTERVAL $2; -- $2 example: '30 days'

-- Find high-performing assistants
-- SELECT
--   a.id,
--   a.name,
--   COUNT(acl.id) as call_count,
--   ROUND(100.0 * COUNT(CASE WHEN acl.status = 'completed' THEN 1 END) / COUNT(*), 2) as completion_rate
-- FROM assistants a
-- LEFT JOIN assistant_call_logs acl ON a.id = acl.assistant_id
--   AND acl.created_at > NOW() - INTERVAL '30 days'
-- WHERE a.user_id = auth.uid()
--   AND a.status = 'active'
-- GROUP BY a.id
-- HAVING COUNT(*) > 10
-- ORDER BY completion_rate DESC;
