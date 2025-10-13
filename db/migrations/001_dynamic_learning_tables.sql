-- =====================================================
-- MIGRATION 001: Dynamic Learning Tables
-- =====================================================
-- Extends Phase 1 schema with AI learning capabilities
-- Adds: campaign_patterns, compliance_rules, knowledge_base, campaign_performance
-- =====================================================

-- =====================================================
-- TABLE: campaign_patterns
-- =====================================================
-- Stores successful campaign structures that AI can learn from
-- Used by Campaign Strategist Agent to recommend structures
-- =====================================================

CREATE TABLE IF NOT EXISTS campaign_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Pattern classification
  vertical TEXT NOT NULL, -- e.g., 'hvac', 'real-estate', 'saas', 'general'
  campaign_type TEXT NOT NULL, -- e.g., 'cold-outreach', 'nurture', 're-engagement'

  -- Pattern structure
  pattern JSONB NOT NULL,
  -- Structure: {
  --   steps: [{ n, channel, delay, purpose, reasoning }],
  --   avgDays: number,
  --   avgTouches: number
  -- }

  -- Performance metrics
  performance_avg DECIMAL(5,4) DEFAULT 0.0000, -- 0.0000 to 1.0000 (e.g., 0.2500 = 25% reply rate)
  usage_count INT DEFAULT 0, -- How many times this pattern was used

  -- Metadata
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaign_patterns_vertical ON campaign_patterns(vertical);
CREATE INDEX IF NOT EXISTS idx_campaign_patterns_type ON campaign_patterns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_campaign_patterns_performance ON campaign_patterns(performance_avg DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_patterns_active ON campaign_patterns(is_active);

-- Trigger for updated_at
CREATE TRIGGER update_campaign_patterns_updated_at
  BEFORE UPDATE ON campaign_patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: compliance_rules
-- =====================================================
-- Dynamic compliance rules queryable by AI
-- Replaces hardcoded compliance logic with database-driven rules
-- =====================================================

CREATE TABLE IF NOT EXISTS compliance_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Rule classification
  vertical TEXT NOT NULL, -- e.g., 'hvac', 'real-estate', 'healthcare', 'general'
  rule_type TEXT NOT NULL CHECK (
    rule_type IN ('banned-phrase', 'required-disclosure', 'format', 'variable-restriction', 'custom')
  ),

  -- Rule specification
  rule_spec JSONB NOT NULL,
  -- Structure: {
  --   pattern?: string, // Regex pattern
  --   message: string, // Error message
  --   severity: 'high' | 'medium' | 'low',
  --   suggestion?: string,
  --   autoFix?: boolean,
  --   appliesTo: ['email' | 'linkedin' | 'sms'],
  --   fields: ['subject' | 'preheader' | 'body']
  -- }

  -- Rule metadata
  name TEXT NOT NULL,
  description TEXT,
  auto_fix BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_compliance_rules_vertical ON compliance_rules(vertical);
CREATE INDEX IF NOT EXISTS idx_compliance_rules_type ON compliance_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_compliance_rules_active ON compliance_rules(active);

-- Trigger for updated_at
CREATE TRIGGER update_compliance_rules_updated_at
  BEFORE UPDATE ON compliance_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: knowledge_base
-- =====================================================
-- Stores domain knowledge snippets for AI retrieval
-- Used by Campaign Strategist Agent to understand verticals
-- =====================================================

CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Classification
  category TEXT NOT NULL, -- e.g., 'pain-point', 'benefit', 'objection', 'industry-insight'
  vertical TEXT NOT NULL, -- e.g., 'hvac', 'real-estate', 'saas', 'general'
  tags TEXT[], -- Additional tags for flexible querying

  -- Content
  content TEXT NOT NULL, -- The knowledge snippet
  source TEXT, -- Where this knowledge came from (URL, document, etc.)

  -- Metadata
  confidence_score DECIMAL(3,2) DEFAULT 0.50, -- 0.00 to 1.00 confidence
  usage_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_vertical ON knowledge_base(vertical);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_tags ON knowledge_base USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_confidence ON knowledge_base(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_active ON knowledge_base(is_active);

-- Trigger for updated_at
CREATE TRIGGER update_knowledge_base_updated_at
  BEFORE UPDATE ON knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: campaign_performance
-- =====================================================
-- Stores campaign performance data for AI learning
-- Used by Performance Analyzer Agent to improve future campaigns
-- =====================================================

CREATE TABLE IF NOT EXISTS campaign_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Campaign reference
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,

  -- Performance metrics
  metrics JSONB NOT NULL,
  -- Structure: {
  --   sent: number,
  --   delivered: number,
  --   opened: number,
  --   clicked: number,
  --   replied: number,
  --   booked: number,
  --   openRate: number,
  --   clickRate: number,
  --   replyRate: number,
  --   conversionRate: number,
  --   byStep: [{ step, sent, opened, clicked, replied }]
  -- }

  -- Data source
  platform TEXT, -- e.g., 'instantly', 'lemlist', 'manual'
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaign_performance_campaign_id ON campaign_performance(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_performance_platform ON campaign_performance(platform);
CREATE INDEX IF NOT EXISTS idx_campaign_performance_imported_at ON campaign_performance(imported_at DESC);

-- =====================================================
-- TABLE: snippet_performance
-- =====================================================
-- Track individual snippet performance over time
-- Enables data-driven snippet selection
-- =====================================================

CREATE TABLE IF NOT EXISTS snippet_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Snippet reference
  snippet_id UUID NOT NULL REFERENCES snippets(id) ON DELETE CASCADE,

  -- Campaign reference
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,

  -- Performance data
  metric_type TEXT NOT NULL, -- e.g., 'open_rate', 'reply_rate', 'click_rate'
  metric_value DECIMAL(5,4) NOT NULL, -- 0.0000 to 1.0000

  -- Context
  step_number INT, -- Which step in the campaign
  channel TEXT, -- 'email', 'linkedin', 'sms'

  -- Timestamp
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_snippet_performance_snippet_id ON snippet_performance(snippet_id);
CREATE INDEX IF NOT EXISTS idx_snippet_performance_campaign_id ON snippet_performance(campaign_id);
CREATE INDEX IF NOT EXISTS idx_snippet_performance_metric_type ON snippet_performance(metric_type);

-- =====================================================
-- VIEWS FOR AI AGENTS
-- =====================================================

-- View: Top performing patterns by vertical
CREATE OR REPLACE VIEW top_patterns_by_vertical AS
SELECT
  vertical,
  campaign_type,
  pattern,
  performance_avg,
  usage_count,
  created_at
FROM campaign_patterns
WHERE is_active = TRUE
ORDER BY vertical, performance_avg DESC, usage_count DESC;

-- View: Active compliance rules by vertical
CREATE OR REPLACE VIEW active_compliance_rules AS
SELECT
  id,
  vertical,
  rule_type,
  name,
  description,
  rule_spec,
  auto_fix
FROM compliance_rules
WHERE active = TRUE
ORDER BY vertical, rule_type;

-- View: High-confidence knowledge by vertical
CREATE OR REPLACE VIEW trusted_knowledge AS
SELECT
  vertical,
  category,
  content,
  confidence_score,
  usage_count,
  tags
FROM knowledge_base
WHERE is_active = TRUE AND confidence_score >= 0.70
ORDER BY vertical, category, confidence_score DESC;

-- View: Snippet performance summary
CREATE OR REPLACE VIEW snippet_performance_summary AS
SELECT
  s.id AS snippet_id,
  s.tag,
  s.segment,
  s.content,
  COUNT(sp.id) AS performance_records,
  AVG(sp.metric_value) AS avg_performance,
  MAX(sp.metric_value) AS best_performance,
  s.usage_count
FROM snippets s
LEFT JOIN snippet_performance sp ON s.id = sp.snippet_id
WHERE s.is_active = TRUE
GROUP BY s.id, s.tag, s.segment, s.content, s.usage_count
ORDER BY avg_performance DESC NULLS LAST;

-- =====================================================
-- FUNCTIONS FOR AI AGENTS
-- =====================================================

-- Function: Get best patterns for a vertical and campaign type
CREATE OR REPLACE FUNCTION get_best_patterns(
  p_vertical TEXT,
  p_campaign_type TEXT,
  p_limit INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  pattern JSONB,
  performance_avg DECIMAL,
  usage_count INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.id,
    cp.pattern,
    cp.performance_avg,
    cp.usage_count
  FROM campaign_patterns cp
  WHERE cp.vertical = p_vertical
    AND cp.campaign_type = p_campaign_type
    AND cp.is_active = TRUE
  ORDER BY cp.performance_avg DESC, cp.usage_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function: Get compliance rules for vertical and channel
CREATE OR REPLACE FUNCTION get_compliance_rules(
  p_vertical TEXT,
  p_channel TEXT DEFAULT 'email'
)
RETURNS TABLE (
  id UUID,
  rule_type TEXT,
  name TEXT,
  rule_spec JSONB,
  auto_fix BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cr.id,
    cr.rule_type,
    cr.name,
    cr.rule_spec,
    cr.auto_fix
  FROM compliance_rules cr
  WHERE cr.active = TRUE
    AND (cr.vertical = p_vertical OR cr.vertical = 'general')
    AND cr.rule_spec->>'appliesTo' LIKE '%' || p_channel || '%'
  ORDER BY
    CASE WHEN cr.vertical = p_vertical THEN 1 ELSE 2 END,
    CASE (cr.rule_spec->>'severity')
      WHEN 'high' THEN 1
      WHEN 'medium' THEN 2
      WHEN 'low' THEN 3
      ELSE 4
    END;
END;
$$ LANGUAGE plpgsql;

-- Function: Get knowledge for vertical and category
CREATE OR REPLACE FUNCTION get_knowledge(
  p_vertical TEXT,
  p_category TEXT,
  p_min_confidence DECIMAL DEFAULT 0.50,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  confidence_score DECIMAL,
  tags TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.content,
    kb.confidence_score,
    kb.tags
  FROM knowledge_base kb
  WHERE kb.is_active = TRUE
    AND (kb.vertical = p_vertical OR kb.vertical = 'general')
    AND kb.category = p_category
    AND kb.confidence_score >= p_min_confidence
  ORDER BY
    CASE WHEN kb.vertical = p_vertical THEN 1 ELSE 2 END,
    kb.confidence_score DESC,
    kb.usage_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function: Update snippet performance score
CREATE OR REPLACE FUNCTION update_snippet_performance_score(
  p_snippet_id UUID
)
RETURNS VOID AS $$
DECLARE
  avg_score DECIMAL(3,2);
BEGIN
  -- Calculate average performance from snippet_performance table
  SELECT AVG(metric_value)::DECIMAL(3,2)
  INTO avg_score
  FROM snippet_performance
  WHERE snippet_id = p_snippet_id;

  -- Update snippet with new performance score
  IF avg_score IS NOT NULL THEN
    UPDATE snippets
    SET performance_score = avg_score,
        updated_at = NOW()
    WHERE id = p_snippet_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function: Record pattern usage
CREATE OR REPLACE FUNCTION record_pattern_usage(p_pattern_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE campaign_patterns
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE id = p_pattern_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Record knowledge usage
CREATE OR REPLACE FUNCTION record_knowledge_usage(p_knowledge_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE knowledge_base
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE id = p_knowledge_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT ALL ON campaign_patterns TO anon, authenticated;
GRANT ALL ON compliance_rules TO anon, authenticated;
GRANT ALL ON knowledge_base TO anon, authenticated;
GRANT ALL ON campaign_performance TO anon, authenticated;
GRANT ALL ON snippet_performance TO anon, authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Next: Run seed.sql to populate initial data
-- =====================================================
