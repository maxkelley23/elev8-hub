import { z } from 'zod';

// =====================================================
// CAMPAIGN TYPES - Dynamic AI-Powered System
// =====================================================

/**
 * Campaign Intake Schema
 * Flexible intake that accepts natural language or structured input
 */
export const CampaignIntakeSchema = z.object({
  // Core request (can be vague!)
  request: z.string().min(10, 'Please describe what you need'),

  // Optional structured fields
  vertical: z.string().optional(), // e.g., "hvac", "real-estate", "saas"
  goal: z.string().optional(), // e.g., "book-demo", "nurture-leads"
  audience: z.string().optional(), // e.g., "business-owners-50-employees"

  // Campaign structure preferences
  numTouches: z.number().int().min(3).max(15).optional(),
  totalDays: z.number().int().min(7).max(90).optional(),
  cadence: z.enum(['aggressive', 'balanced', 'gentle']).default('balanced'),

  // Channels
  channels: z.array(z.enum(['email', 'linkedin', 'sms'])).default(['email']),
  includeLinkedIn: z.boolean().default(true),
  includeSMS: z.boolean().default(false),

  // Content preferences
  tone: z.string().optional(), // e.g., "professional-friendly"
  emphasize: z.string().optional(), // Topics to emphasize
  avoid: z.string().optional(), // Topics to avoid
  abSubjects: z.boolean().default(true), // A/B test subjects

  // Advanced
  complianceLevel: z.enum(['standard', 'strict', 'custom']).default('standard'),
  customRules: z.array(z.string()).optional(),
});

export type CampaignIntake = z.infer<typeof CampaignIntakeSchema>;

/**
 * Campaign Analysis Result
 * AI's understanding of the request
 */
export const CampaignAnalysisSchema = z.object({
  // What AI understood
  vertical: z.string(),
  campaignType: z.string(), // cold, nurture, re-engagement, event, etc.
  audience: z.string(),
  goal: z.string(),

  // Gathered context
  painPoints: z.array(z.string()),
  benefits: z.array(z.string()),
  objections: z.array(z.string()),

  // Recommendations
  estimatedTouchPoints: z.number().int(),
  estimatedDays: z.number().int(),
  recommendedChannels: z.array(z.string()),
  recommendedTone: z.string(),
  complianceRequirements: z.array(z.string()),

  // Supporting data
  similarCampaigns: z.array(z.object({
    id: z.string(),
    title: z.string(),
    performance: z.number(),
    insights: z.string(),
  })).optional(),

  knowledgeBaseEntries: z.array(z.object({
    id: z.string(),
    content: z.string(),
    confidence: z.number(),
  })).optional(),
});

export type CampaignAnalysis = z.infer<typeof CampaignAnalysisSchema>;

/**
 * Campaign Step Schema
 * Individual touchpoint in the campaign
 */
export const CampaignStepSchema = z.object({
  n: z.number().int().min(1),
  channel: z.enum(['email', 'linkedin', 'sms']),
  delay: z.number().int().min(0), // Days from campaign start
  purpose: z.string(), // e.g., "set-expectations", "deliver-value"
  reasoning: z.string().optional(), // Why this step/timing?
});

export type CampaignStep = z.infer<typeof CampaignStepSchema>;

/**
 * Campaign Plan Schema
 * Complete campaign structure
 */
export const CampaignPlanSchema = z.object({
  vertical: z.string().optional(),
  campaignType: z.string().optional(),
  steps: z.array(CampaignStepSchema),
  totalDays: z.number().int(),
  totalTouches: z.number().int(),
  cadence: z.enum(['aggressive', 'balanced', 'gentle']).optional(),
  tone: z.string().optional(),
  reasoning: z.string().optional(),

  // Performance estimates
  estimatedPerformance: z.object({
    openRate: z.number().optional(),
    replyRate: z.number().optional(),
    confidence: z.number().optional(),
  }).optional(),

  // Metadata
  patternsUsed: z.array(z.number()).optional(),
  rationale: z.string().optional(),
});

export type CampaignPlan = z.infer<typeof CampaignPlanSchema>;

/**
 * Campaign Message Schema
 * Individual message content
 */
export const CampaignMessageSchema = z.object({
  step: z.number().int(),
  channel: z.enum(['email', 'linkedin', 'sms']),

  // Email-specific fields
  preheader: z.string().max(120).optional(), // Allow a bit longer, we'll warn if >90
  subjectA: z.string().max(100).optional(), // Allow longer, we'll warn if >55
  subjectB: z.string().max(100).optional(), // If A/B testing
  body: z.string().max(3000), // Allow longer messages

  // LinkedIn-specific fields
  // (body is used for LinkedIn message too)

  // SMS-specific fields
  smsBody: z.string().max(160).optional(),

  // Metadata
  metadata: z.object({
    snippetsUsed: z.array(z.object({
      id: z.string(),
      score: z.number(),
      tag: z.string(),
    })).optional(),
    complianceChecks: z.array(z.string()).optional(),
    wordCount: z.number().optional(),
    estimatedReadTime: z.string().optional(),
  }).optional(),
});

export type CampaignMessage = z.infer<typeof CampaignMessageSchema>;

/**
 * Campaign Write Result Schema
 * Complete campaign content
 */
export const CampaignWriteResultSchema = z.object({
  messages: z.array(CampaignMessageSchema),

  // Campaign-level metadata
  campaignMetadata: z.object({
    totalSnippetsUsed: z.number(),
    avgSnippetScore: z.number(),
    compliancePassed: z.boolean(),
    estimatedEngagement: z.number().optional(),
  }).optional(),
});

export type CampaignWriteResult = z.infer<typeof CampaignWriteResultSchema>;

/**
 * Campaign Validation Result Schema
 * Compliance check results
 */
export const CampaignValidationSchema = z.object({
  valid: z.boolean(),

  violations: z.array(z.object({
    step: z.number(),
    field: z.string(),
    severity: z.enum(['high', 'medium', 'low']),
    rule: z.string(),
    issue: z.string(),
    location: z.string().optional(),
    autoFixAvailable: z.boolean(),
    suggestedFix: z.string().optional(),
  })),

  warnings: z.array(z.object({
    step: z.number(),
    severity: z.enum(['high', 'medium', 'low']),
    rule: z.string(),
    issue: z.string(),
    suggestion: z.string(),
  })),

  fixes: z.array(z.object({
    step: z.number(),
    field: z.string(),
    original: z.string(),
    fixed: z.string(),
  })),

  summary: z.object({
    totalViolations: z.number(),
    totalWarnings: z.number(),
    autoFixApplied: z.number(),
    requiresManualReview: z.boolean(),
  }),
});

export type CampaignValidation = z.infer<typeof CampaignValidationSchema>;

/**
 * Complete Campaign Schema
 * Full campaign with all data
 */
export const CompleteCampaignSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  segment: z.string(),
  status: z.enum(['draft', 'active', 'archived', 'deleted']).default('draft'),

  // Campaign data
  intake: CampaignIntakeSchema,
  analysis: CampaignAnalysisSchema.optional(),
  plan: CampaignPlanSchema,
  messages: z.array(CampaignMessageSchema),
  validation: CampaignValidationSchema.optional(),

  // Metadata
  version: z.number().int().default(1),
  created_by: z.string().uuid().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type CompleteCampaign = z.infer<typeof CompleteCampaignSchema>;

// =====================================================
// EXPORT SCHEMAS
// =====================================================

/**
 * Instantly CSV Export Schema
 */
export const InstantlyExportRowSchema = z.object({
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
  // Dynamic columns based on variables used
  customFields: z.record(z.string()).optional(),
});

export type InstantlyExportRow = z.infer<typeof InstantlyExportRowSchema>;

/**
 * LinkedIn CSV Export Schema
 */
export const LinkedInExportRowSchema = z.object({
  profileUrl: z.string().url(),
  firstName: z.string(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
  position: z.string().optional(),
  // Message sequence
  messages: z.array(z.object({
    step: z.number(),
    delay: z.number(),
    body: z.string(),
  })),
});

export type LinkedInExportRow = z.infer<typeof LinkedInExportRowSchema>;

// =====================================================
// DATABASE SCHEMAS (for Supabase)
// =====================================================

/**
 * Campaign Database Row
 * Matches campaigns table structure
 */
export interface CampaignDBRow {
  id: string;
  title: string;
  segment: string;
  status: 'draft' | 'active' | 'archived' | 'deleted';
  created_by?: string;
  version: number;
  json_spec: {
    intake: CampaignIntake;
    analysis?: CampaignAnalysis;
    plan: CampaignPlan;
    messages: CampaignMessage[];
    validation?: CampaignValidation;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Snippet Database Row
 */
export interface SnippetDBRow {
  id: string;
  tag: string; // 'subject', 'opener', 'cta', 'closer', etc.
  segment: string; // 'hvac', 'realtor', 'saas', 'general'
  content: {
    text: string;
    variables?: string[];
  };
  is_active: boolean;
  performance_score?: number; // 0.00 to 1.00
  usage_count: number;
  success_rate?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Campaign Pattern Database Row
 */
export interface CampaignPatternDBRow {
  id: string;
  vertical: string;
  campaign_type: string;
  pattern: {
    steps: CampaignStep[];
    avgDays: number;
    avgTouches: number;
  };
  performance_avg: number;
  usage_count: number;
  created_at: string;
}

/**
 * Compliance Rule Database Row
 */
export interface ComplianceRuleDBRow {
  id: string;
  vertical: string; // 'hvac', 'real-estate', 'healthcare', 'general'
  rule_type: 'banned-phrase' | 'required-disclosure' | 'format' | 'variable-restriction';
  rule_spec: {
    pattern?: string; // Regex pattern
    message?: string; // Error message
    severity: 'high' | 'medium' | 'low';
    suggestion?: string;
    autoFix?: boolean;
  };
  auto_fix: boolean;
  active: boolean;
  created_at: string;
}

// =====================================================
// UTILITY TYPES
// =====================================================

export type CampaignChannel = 'email' | 'linkedin' | 'sms';
export type CampaignCadence = 'aggressive' | 'balanced' | 'gentle';
export type CampaignStatus = 'draft' | 'active' | 'archived' | 'deleted';
export type ComplianceSeverity = 'high' | 'medium' | 'low';
