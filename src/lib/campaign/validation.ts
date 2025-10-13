/**
 * Campaign Compliance Validation Helpers
 *
 * Regex-based compliance checking inspired by mortgage system patterns
 * Works alongside AI-powered validation for comprehensive compliance
 */

import type { CampaignMessage, ComplianceSeverity } from '@/types/campaign';

// =====================================================
// COMPLIANCE VIOLATION TYPES
// =====================================================

export interface ComplianceViolation {
  step: number;
  field: string;
  severity: ComplianceSeverity;
  rule: string;
  issue: string;
  location?: string;
  autoFixAvailable: boolean;
  suggestedFix?: string;
}

export interface ComplianceWarning {
  step: number;
  severity: ComplianceSeverity;
  rule: string;
  issue: string;
  suggestion: string;
}

// =====================================================
// COMPLIANCE RULES REGISTRY
// =====================================================

/**
 * Base compliance rule structure
 * These are regex-based rules that can be checked quickly
 * For more nuanced checks, use AI validation
 */
export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  severity: ComplianceSeverity;
  pattern: RegExp;
  applies_to: ('email' | 'linkedin' | 'sms')[];
  fields: ('subject' | 'preheader' | 'body')[];
  auto_fix: boolean;
  suggestion: string;
}

/**
 * Universal compliance rules (apply to all verticals)
 */
export const UNIVERSAL_RULES: ComplianceRule[] = [
  // Rate-related promises
  {
    id: 'no-rate-guarantees',
    name: 'No Rate Guarantees',
    description: 'Cannot guarantee specific rates or pricing',
    severity: 'high',
    pattern: /\b(guarantee(d)?\s+(rate|price|cost)|locked?\s+rate|rate\s+lock|best\s+rate)\b/gi,
    applies_to: ['email', 'linkedin', 'sms'],
    fields: ['subject', 'body'],
    auto_fix: false,
    suggestion: 'Replace with "competitive rates" or "check current rates"',
  },

  // Unrealistic promises
  {
    id: 'no-unrealistic-promises',
    name: 'No Unrealistic Promises',
    description: 'Avoid absolute guarantees and unrealistic claims',
    severity: 'high',
    pattern: /\b(100%\s+guaranteed|always\s+approved|never\s+fail|instant\s+approval|guaranteed\s+results)\b/gi,
    applies_to: ['email', 'linkedin', 'sms'],
    fields: ['subject', 'body'],
    auto_fix: false,
    suggestion: 'Use realistic language like "often", "typically", "in most cases"',
  },

  // Spam trigger words
  {
    id: 'no-spam-triggers',
    name: 'Avoid Spam Triggers',
    description: 'Words that trigger spam filters',
    severity: 'medium',
    pattern: /\b(click here now|act now|limited time|urgent|free money|winner|congratulations|prize)\b/gi,
    applies_to: ['email', 'linkedin', 'sms'],
    fields: ['subject', 'body'],
    auto_fix: false,
    suggestion: 'Reword to avoid spam triggers while maintaining message intent',
  },

  // Excessive punctuation
  {
    id: 'no-excessive-punctuation',
    name: 'No Excessive Punctuation',
    description: 'Multiple exclamation marks or question marks',
    severity: 'low',
    pattern: /[!?]{2,}/g,
    applies_to: ['email', 'linkedin', 'sms'],
    fields: ['subject', 'body'],
    auto_fix: true,
    suggestion: 'Use single punctuation marks',
  },

  // All caps words
  {
    id: 'no-all-caps',
    name: 'No ALL CAPS',
    description: 'Words in all capitals (excluding acronyms)',
    severity: 'low',
    pattern: /\b[A-Z]{4,}\b/g, // 4+ consecutive caps
    applies_to: ['email', 'linkedin', 'sms'],
    fields: ['subject', 'body'],
    auto_fix: true,
    suggestion: 'Convert to sentence case',
  },

  // Subject line length
  {
    id: 'subject-length-limit',
    name: 'Subject Line Length',
    description: 'Subject line should be under 55 characters for optimal display',
    severity: 'medium',
    pattern: /.{56,}/,
    applies_to: ['email'],
    fields: ['subject'],
    auto_fix: false,
    suggestion: 'Shorten subject line to 55 characters or less',
  },

  // Preheader length
  {
    id: 'preheader-length-limit',
    name: 'Preheader Length',
    description: 'Preheader should be under 90 characters',
    severity: 'low',
    pattern: /.{91,}/,
    applies_to: ['email'],
    fields: ['preheader'],
    auto_fix: false,
    suggestion: 'Shorten preheader to 90 characters or less',
  },

  // SMS length
  {
    id: 'sms-length-limit',
    name: 'SMS Length',
    description: 'SMS should be under 160 characters',
    severity: 'high',
    pattern: /.{161,}/,
    applies_to: ['sms'],
    fields: ['body'],
    auto_fix: false,
    suggestion: 'Shorten message to 160 characters or less',
  },

  // Variable restrictions in subject line
  {
    id: 'no-variables-in-subject',
    name: 'No Variables in Subject (except first name)',
    description: 'Only {{recipient.f_name}} allowed in subject lines',
    severity: 'medium',
    pattern: /\{\{(?!recipient\.f_name\}\})[^}]+\}\}/g,
    applies_to: ['email'],
    fields: ['subject'],
    auto_fix: false,
    suggestion: 'Remove variables from subject line or use only {{recipient.f_name}}',
  },
];

/**
 * Vertical-specific rules
 * These can be extended per industry
 */
export const VERTICAL_RULES: Record<string, ComplianceRule[]> = {
  'hvac': [
    {
      id: 'hvac-license-disclosure',
      name: 'HVAC License Disclosure',
      description: 'Include license number in communications',
      severity: 'high',
      pattern: /\b(license|lic\.?)\s*#?\s*\d+/gi,
      applies_to: ['email', 'linkedin', 'sms'],
      fields: ['body'],
      auto_fix: false,
      suggestion: 'Include HVAC license number in email footer or body',
    },
  ],

  'real-estate': [
    {
      id: 'realtor-fair-housing',
      name: 'Fair Housing Compliance',
      description: 'Avoid discriminatory language',
      severity: 'high',
      pattern: /\b(family-oriented|perfect for families|adults only|no children|mature building)\b/gi,
      applies_to: ['email', 'linkedin', 'sms'],
      fields: ['body'],
      auto_fix: false,
      suggestion: 'Remove language that could violate Fair Housing Act',
    },
  ],

  'healthcare': [
    {
      id: 'healthcare-hipaa',
      name: 'HIPAA Compliance',
      description: 'Do not include PHI in unsecured communications',
      severity: 'high',
      pattern: /\b(diagnosis|condition|treatment|medical record|patient)\b/gi,
      applies_to: ['email', 'linkedin', 'sms'],
      fields: ['body'],
      auto_fix: false,
      suggestion: 'Remove any protected health information (PHI)',
    },
  ],

  'financial': [
    {
      id: 'financial-disclaimers',
      name: 'Financial Disclaimers Required',
      description: 'Financial services require disclaimers',
      severity: 'high',
      pattern: /\b(invest|return|profit|earn)\b/gi,
      applies_to: ['email'],
      fields: ['body'],
      auto_fix: false,
      suggestion: 'Add required financial disclaimers to email footer',
    },
  ],
};

// =====================================================
// VALIDATION FUNCTIONS
// =====================================================

/**
 * Check a single field against a rule
 */
export function checkRule(
  text: string,
  rule: ComplianceRule,
): { matches: RegExpMatchArray[]; locations: string[] } | null {
  const matches: RegExpMatchArray[] = [];
  const locations: string[] = [];

  let match: RegExpExecArray | null;
  const regex = new RegExp(rule.pattern.source, rule.pattern.flags);

  while ((match = regex.exec(text)) !== null) {
    matches.push(match);

    // Calculate location context (30 chars before and after)
    const start = Math.max(0, match.index - 30);
    const end = Math.min(text.length, match.index + match[0].length + 30);
    const context = text.substring(start, end);
    locations.push(`...${context}...`);
  }

  return matches.length > 0 ? { matches, locations } : null;
}

/**
 * Auto-fix a violation if possible
 */
export function autoFix(text: string, rule: ComplianceRule): string {
  if (!rule.auto_fix) return text;

  switch (rule.id) {
    case 'no-excessive-punctuation':
      // Replace multiple !!! or ??? with single
      return text.replace(/!{2,}/g, '!').replace(/\?{2,}/g, '?');

    case 'no-all-caps':
      // Convert ALL CAPS words to Title Case (excluding common acronyms)
      const acronyms = ['HVAC', 'ROI', 'CEO', 'CTA', 'USA', 'API', 'SEO', 'CRM'];
      return text.replace(/\b[A-Z]{4,}\b/g, (word) => {
        if (acronyms.includes(word)) return word;
        return word.charAt(0) + word.slice(1).toLowerCase();
      });

    default:
      return text;
  }
}

/**
 * Validate a campaign message against all applicable rules
 */
export function validateMessage(
  message: CampaignMessage,
  vertical: string = 'general',
): { violations: ComplianceViolation[]; warnings: ComplianceWarning[] } {
  const violations: ComplianceViolation[] = [];
  const warnings: ComplianceWarning[] = [];

  // Combine universal and vertical-specific rules
  const rules = [
    ...UNIVERSAL_RULES,
    ...(VERTICAL_RULES[vertical.toLowerCase()] || []),
  ];

  // Filter rules that apply to this channel
  const applicableRules = rules.filter(rule =>
    rule.applies_to.includes(message.channel)
  );

  for (const rule of applicableRules) {
    // Check each field that the rule applies to
    for (const field of rule.fields) {
      let text = '';

      switch (field) {
        case 'subject':
          text = message.subjectA || '';
          break;
        case 'preheader':
          text = message.preheader || '';
          break;
        case 'body':
          text = message.channel === 'sms' ? (message.smsBody || '') : message.body;
          break;
      }

      if (!text) continue;

      const result = checkRule(text, rule);

      if (result) {
        const violation: ComplianceViolation = {
          step: message.step,
          field,
          severity: rule.severity,
          rule: rule.name,
          issue: `${rule.description}: "${result.matches[0][0]}"`,
          location: result.locations[0],
          autoFixAvailable: rule.auto_fix,
          suggestedFix: rule.auto_fix ? autoFix(text, rule) : rule.suggestion,
        };

        if (rule.severity === 'high') {
          violations.push(violation);
        } else {
          warnings.push({
            step: message.step,
            severity: rule.severity,
            rule: rule.name,
            issue: violation.issue,
            suggestion: violation.suggestedFix || rule.suggestion,
          });
        }
      }
    }
  }

  return { violations, warnings };
}

/**
 * Validate an entire campaign
 */
export function validateCampaign(
  messages: CampaignMessage[],
  vertical: string = 'general',
): {
  violations: ComplianceViolation[];
  warnings: ComplianceWarning[];
  fixes: Array<{ step: number; field: string; original: string; fixed: string }>;
} {
  const allViolations: ComplianceViolation[] = [];
  const allWarnings: ComplianceWarning[] = [];
  const fixes: Array<{ step: number; field: string; original: string; fixed: string }> = [];

  for (const message of messages) {
    const { violations, warnings } = validateMessage(message, vertical);

    allViolations.push(...violations);
    allWarnings.push(...warnings);

    // Apply auto-fixes
    for (const violation of violations) {
      if (violation.autoFixAvailable && violation.suggestedFix) {
        const originalText = getMessageField(message, violation.field);
        if (originalText && originalText !== violation.suggestedFix) {
          fixes.push({
            step: message.step,
            field: violation.field,
            original: originalText,
            fixed: violation.suggestedFix,
          });
        }
      }
    }
  }

  return { violations: allViolations, warnings: allWarnings, fixes };
}

/**
 * Helper: Get field value from message
 */
function getMessageField(message: CampaignMessage, field: string): string {
  switch (field) {
    case 'subject':
      return message.subjectA || '';
    case 'preheader':
      return message.preheader || '';
    case 'body':
      return message.channel === 'sms' ? (message.smsBody || '') : message.body;
    default:
      return '';
  }
}

/**
 * Helper: Apply fixes to a message
 */
export function applyFixes(
  message: CampaignMessage,
  fixes: Array<{ step: number; field: string; original: string; fixed: string }>,
): CampaignMessage {
  const messageFixes = fixes.filter(f => f.step === message.step);

  const updatedMessage = { ...message };

  for (const fix of messageFixes) {
    switch (fix.field) {
      case 'subject':
        updatedMessage.subjectA = fix.fixed;
        break;
      case 'preheader':
        updatedMessage.preheader = fix.fixed;
        break;
      case 'body':
        if (message.channel === 'sms') {
          updatedMessage.smsBody = fix.fixed;
        } else {
          updatedMessage.body = fix.fixed;
        }
        break;
    }
  }

  return updatedMessage;
}

/**
 * Get all rules for a vertical
 */
export function getRulesForVertical(vertical: string = 'general'): ComplianceRule[] {
  return [
    ...UNIVERSAL_RULES,
    ...(VERTICAL_RULES[vertical.toLowerCase()] || []),
  ];
}

/**
 * Add a custom rule at runtime
 */
export function addCustomRule(vertical: string, rule: ComplianceRule): void {
  if (!VERTICAL_RULES[vertical.toLowerCase()]) {
    VERTICAL_RULES[vertical.toLowerCase()] = [];
  }
  VERTICAL_RULES[vertical.toLowerCase()].push(rule);
}
