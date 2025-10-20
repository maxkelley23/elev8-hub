import { z } from 'zod';
import { AssistantBuilderInputSchema } from '@/lib/assistant/builders';

// ============================================================
// VAPI-SPECIFIC TYPES (matches their API exactly)
// ============================================================

export const VapiVoiceConfigSchema = z.object({
  provider: z.enum(['vapi', 'elevenlabs', 'playht', 'rime-ai']),
  voiceId: z.string(),
  speed: z.number().min(0.5).max(2.0).optional(),
  stability: z.number().min(0).max(1).optional(),
  similarityBoost: z.number().min(0).max(1).optional(),
});

export type VapiVoiceConfig = z.infer<typeof VapiVoiceConfigSchema>;

export const VapiModelConfigSchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'groq', 'together-ai']),
  model: z.string(),
  temperature: z
    .number()
    .min(0)
    .max(2)
    .default(0.7)
    .describe('Temperature: 0-2 range. OpenAI typically 0-1, others may support up to 2'),
  maxTokens: z.number().int().positive().optional(),
  systemPrompt: z.string().optional(),
});

export type VapiModelConfig = z.infer<typeof VapiModelConfigSchema>;

export const VapiTranscriberConfigSchema = z.object({
  provider: z.enum(['deepgram', 'gladia']),
  model: z.string(),
  language: z.string().optional(),
});

export type VapiTranscriberConfig = z.infer<typeof VapiTranscriberConfigSchema>;

export const VapiAssistantCreatePayloadSchema = z.object({
  name: z.string().min(1).max(100),
  firstMessage: z.string().max(500),
  model: VapiModelConfigSchema,
  voice: VapiVoiceConfigSchema,
  transcriber: VapiTranscriberConfigSchema,
  clientMessages: z
    .array(
      z.enum(['transcript', 'hang', 'function-call', 'speech-update', 'metadata', 'conversation-update'])
    )
    .optional(),
  serverMessages: z
    .array(z.enum(['end-of-call-report', 'status-update', 'hang', 'function-call']))
    .optional(),
  silenceTimeoutSeconds: z.number().int().min(5).max(60).default(15),
  maxDurationSeconds: z.number().int().min(60).max(3600).default(600),
  backgroundSound: z.enum(['off', 'office']).optional(),
  backchannelingEnabled: z.boolean().default(false),
  backgroundDenoisingEnabled: z.boolean().default(true),
  modelOutputInMessagesEnabled: z.boolean().default(false),
  transportConfigurations: z.array(z.any()).optional(),
  serverUrl: z.string().url().optional(),
  serverUrlSecret: z.string().optional(),
});

export type VapiAssistantCreatePayload = z.infer<typeof VapiAssistantCreatePayloadSchema>;

// ============================================================
// OUR BUSINESS TYPES (extends Vapi with our logic)
// ============================================================

export const AssistantConfigDBRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string(),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),

  // Original builder input (for editing)
  builder_input: AssistantBuilderInputSchema,

  // Generated artifacts
  generated_prompt: z.string(),
  vapi_config: VapiAssistantCreatePayloadSchema,

  // Vapi integration
  vapi_assistant_id: z.string().optional(),
  vapi_phone_number_id: z.string().optional(),

  // Analytics
  total_calls: z.number().int().default(0),
  avg_duration_seconds: z.number().optional(),
  successful_transfers: z.number().int().default(0),

  // Metadata
  version: z.number().int().default(1),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  deployed_at: z.string().datetime().optional(),
});

export type AssistantConfigDBRow = z.infer<typeof AssistantConfigDBRowSchema>;

// ============================================================
// REUSABLE TOOL LIBRARY
// ============================================================

export const AssistantToolDBRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),

  name: z.string().min(1).max(100),
  description: z.string().min(10).max(500),
  category: z.enum(['scheduling', 'data-collection', 'transfer', 'custom']),

  // Function definition (JSON Schema)
  parameters: z.object({
    type: z.literal('object'),
    required: z.array(z.string()).optional(),
    properties: z.record(z.any()),
  }),

  // Implementation
  endpoint_url: z.string().url().optional(),
  endpoint_method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).default('POST'),
  endpoint_headers: z.record(z.string()).optional(),

  // Usage tracking
  usage_count: z.number().int().default(0),
  success_rate: z.number().min(0).max(100).optional(),

  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type AssistantToolDBRow = z.infer<typeof AssistantToolDBRowSchema>;

// ============================================================
// UI STATE TYPES
// ============================================================

export const AssistantWizardStepSchema = z.enum([
  'basics',
  'capabilities',
  'compliance',
  'persona',
  'knowledge',
  'preview',
]);

export type AssistantWizardStep = z.infer<typeof AssistantWizardStepSchema>;

export const AssistantWizardStateSchema = z.object({
  currentStep: AssistantWizardStepSchema,
  completedSteps: z.array(AssistantWizardStepSchema),
  isDirty: z.boolean(),
  validationErrors: z.record(z.array(z.string())),
  livePreview: z
    .object({
      prompt: z.string(),
      config: VapiAssistantCreatePayloadSchema.partial(),
    })
    .optional(),
});

export type AssistantWizardState = z.infer<typeof AssistantWizardStateSchema>;

// ============================================================
// ASSISTANT LIBRARY
// ============================================================

export const AssistantLibraryCardSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  company: z.string(),
  objective: z.string(),
  status: z.enum(['draft', 'active', 'archived']),
  created_at: z.string().datetime(),
  deployed_at: z.string().datetime().optional(),
  total_calls: z.number().int().default(0),
});

export type AssistantLibraryCard = z.infer<typeof AssistantLibraryCardSchema>;

// ============================================================
// EXPORT TYPES
// ============================================================

export const AssistantExportFormatSchema = z.enum(['json', 'vapi-json', 'markdown']);

export type AssistantExportFormat = z.infer<typeof AssistantExportFormatSchema>;

// ============================================================
// ANALYTICS
// ============================================================

export const AssistantCallLogSchema = z.object({
  id: z.string().uuid(),
  assistant_id: z.string().uuid(),
  vapi_call_id: z.string(),
  started_at: z.string().datetime(),
  ended_at: z.string().datetime().optional(),
  duration_seconds: z.number().int().optional(),
  status: z.enum(['completed', 'no-answer', 'busy', 'failed']),
  end_reason: z.string().optional(),
  transferred_to_human: z.boolean().default(false),
  transcript: z.array(z.object({ role: z.string(), content: z.string() })).optional(),
  summary: z.string().optional(),
  sentiment_score: z.number().min(-1).max(1).optional(),
  cost_usd: z.number().optional(),
});

export type AssistantCallLog = z.infer<typeof AssistantCallLogSchema>;

export const AssistantAnalyticsSchema = z.object({
  assistant_id: z.string().uuid(),
  total_calls: z.number().int(),
  completed_calls: z.number().int(),
  avg_duration_seconds: z.number(),
  successful_transfers: z.number().int(),
  transfer_rate: z.number().min(0).max(100),
  avg_sentiment: z.number().min(-1).max(1).optional(),
  total_cost_usd: z.number(),
  period_start: z.string().datetime(),
  period_end: z.string().datetime(),
});

export type AssistantAnalytics = z.infer<typeof AssistantAnalyticsSchema>;
