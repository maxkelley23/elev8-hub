/**
 * Campaign Heuristics - Smart Defaults
 *
 * Provides intelligent defaults based on campaign type, vertical, and goal
 * These are starting points that AI can refine based on context
 */

import type {
  CampaignIntake,
  CampaignStep,
  CampaignChannel,
  CampaignCadence,
} from '@/types/campaign';

// =====================================================
// CADENCE PATTERNS
// =====================================================

/**
 * Recommended delays (in days) between touches based on cadence
 */
export const CADENCE_PATTERNS: Record<
  CampaignCadence,
  { minDelay: number; maxDelay: number; avgDelay: number }
> = {
  aggressive: {
    minDelay: 1,
    maxDelay: 3,
    avgDelay: 2, // Touch every ~2 days
  },
  balanced: {
    minDelay: 2,
    maxDelay: 5,
    avgDelay: 3, // Touch every ~3 days
  },
  gentle: {
    minDelay: 4,
    maxDelay: 7,
    avgDelay: 5, // Touch every ~5 days
  },
};

// =====================================================
// CAMPAIGN TYPE DEFAULTS
// =====================================================

export interface CampaignTypeDefaults {
  numTouches: number;
  totalDays: number;
  cadence: CampaignCadence;
  channels: CampaignChannel[];
  tone: string;
  structure: string[]; // Step purposes in order
}

/**
 * Default structures for common campaign types
 */
export const CAMPAIGN_TYPE_DEFAULTS: Record<string, CampaignTypeDefaults> = {
  'cold-outreach': {
    numTouches: 7,
    totalDays: 21,
    cadence: 'balanced',
    channels: ['email', 'linkedin'],
    tone: 'professional-friendly',
    structure: [
      'set-expectations', // Step 1: Intro, set the stage
      'deliver-value', // Step 2: Provide value/insight
      'social-proof', // Step 3: Case study or testimonial
      'overcome-objection', // Step 4: Address common objection
      'create-urgency', // Step 5: Time-sensitive reason
      'final-value', // Step 6: One more piece of value
      'breakup', // Step 7: Friendly exit
    ],
  },

  'nurture': {
    numTouches: 5,
    totalDays: 35,
    cadence: 'gentle',
    channels: ['email'],
    tone: 'helpful-educational',
    structure: [
      'welcome', // Step 1: Welcome and set expectations
      'educate', // Step 2: Educational content
      'case-study', // Step 3: Success story
      'resource', // Step 4: Valuable resource
      'check-in', // Step 5: Soft CTA
    ],
  },

  're-engagement': {
    numTouches: 4,
    totalDays: 14,
    cadence: 'aggressive',
    channels: ['email', 'sms'],
    tone: 'casual-friendly',
    structure: [
      'we-miss-you', // Step 1: Re-introduce value
      'whats-new', // Step 2: Show what's changed
      'special-offer', // Step 3: Incentive to return
      'last-chance', // Step 4: Final reminder
    ],
  },

  'event-promo': {
    numTouches: 5,
    totalDays: 14,
    cadence: 'balanced',
    channels: ['email', 'linkedin'],
    tone: 'enthusiastic-professional',
    structure: [
      'save-the-date', // Step 1: Announce event
      'event-value', // Step 2: Why attend
      'agenda-speakers', // Step 3: Details and speakers
      'last-seats', // Step 4: Create urgency
      'final-reminder', // Step 5: Last chance
    ],
  },

  'demo-request': {
    numTouches: 6,
    totalDays: 18,
    cadence: 'balanced',
    channels: ['email', 'linkedin'],
    tone: 'professional-consultative',
    structure: [
      'intro-value-prop', // Step 1: Introduce solution
      'pain-point', // Step 2: Address specific pain
      'demo-invite', // Step 3: Soft demo CTA
      'case-study', // Step 4: Social proof
      'demo-reminder', // Step 5: Stronger demo CTA
      'final-reach', // Step 6: Last attempt
    ],
  },

  'product-launch': {
    numTouches: 6,
    totalDays: 21,
    cadence: 'balanced',
    channels: ['email'],
    tone: 'excited-informative',
    structure: [
      'teaser', // Step 1: Build anticipation
      'announcement', // Step 2: Launch announcement
      'features-benefits', // Step 3: Deep dive
      'use-cases', // Step 4: How to use it
      'early-adopter', // Step 5: Early bird offer
      'reminder', // Step 6: Final push
    ],
  },
};

// =====================================================
// VERTICAL-SPECIFIC DEFAULTS
// =====================================================

export interface VerticalDefaults {
  preferredChannels: CampaignChannel[];
  typicalTone: string;
  avgResponseTime: number; // in days
  commonGoals: string[];
}

export const VERTICAL_DEFAULTS: Record<string, VerticalDefaults> = {
  hvac: {
    preferredChannels: ['email', 'sms'],
    typicalTone: 'professional-friendly',
    avgResponseTime: 2,
    commonGoals: ['book-service', 'seasonal-offer', 'maintenance-plan'],
  },

  'real-estate': {
    preferredChannels: ['email', 'linkedin'],
    typicalTone: 'professional-warm',
    avgResponseTime: 3,
    commonGoals: ['listing-inquiry', 'buyer-lead', 'seller-lead', 'market-update'],
  },

  saas: {
    preferredChannels: ['email', 'linkedin'],
    typicalTone: 'professional-consultative',
    avgResponseTime: 4,
    commonGoals: ['book-demo', 'trial-signup', 'upgrade', 'feature-adoption'],
  },

  healthcare: {
    preferredChannels: ['email'],
    typicalTone: 'professional-empathetic',
    avgResponseTime: 5,
    commonGoals: ['appointment-booking', 'health-screening', 'wellness-program'],
  },

  financial: {
    preferredChannels: ['email', 'linkedin'],
    typicalTone: 'professional-trustworthy',
    avgResponseTime: 5,
    commonGoals: ['consultation', 'planning-session', 'investment-review'],
  },

  ecommerce: {
    preferredChannels: ['email', 'sms'],
    typicalTone: 'casual-enthusiastic',
    avgResponseTime: 1,
    commonGoals: ['purchase', 'upsell', 'cart-recovery', 'repeat-purchase'],
  },

  consulting: {
    preferredChannels: ['email', 'linkedin'],
    typicalTone: 'professional-authoritative',
    avgResponseTime: 4,
    commonGoals: ['discovery-call', 'proposal-review', 'engagement'],
  },
};

// =====================================================
// CHANNEL MIX STRATEGIES
// =====================================================

/**
 * Recommended channel sequences based on campaign type
 */
export function getChannelSequence(
  numTouches: number,
  channels: CampaignChannel[],
  campaignType: string = 'cold-outreach',
): CampaignChannel[] {
  // Single channel - just repeat it
  if (channels.length === 1) {
    return Array(numTouches).fill(channels[0]);
  }

  // Multi-channel strategies
  const sequence: CampaignChannel[] = [];

  // Email + LinkedIn strategy
  if (channels.includes('email') && channels.includes('linkedin')) {
    // Pattern: E, E, L, E, L, E, L (alternating after initial emails)
    for (let i = 0; i < numTouches; i++) {
      if (i < 2) {
        sequence.push('email'); // Start with email
      } else if (i % 2 === 0) {
        sequence.push('linkedin'); // Alternate LinkedIn
      } else {
        sequence.push('email');
      }
    }
    return sequence;
  }

  // Email + SMS strategy
  if (channels.includes('email') && channels.includes('sms')) {
    // Pattern: E, E, E, SMS, E, SMS (SMS for urgency)
    for (let i = 0; i < numTouches; i++) {
      if (i < 3) {
        sequence.push('email'); // Start with emails
      } else if (i === numTouches - 1) {
        sequence.push('sms'); // Final touch via SMS
      } else if (i % 3 === 0) {
        sequence.push('sms'); // Strategic SMS touches
      } else {
        sequence.push('email');
      }
    }
    return sequence;
  }

  // All three channels
  if (channels.length === 3) {
    // Pattern: E, E, L, E, SMS, L, E
    const pattern: CampaignChannel[] = ['email', 'email', 'linkedin', 'email', 'sms', 'linkedin', 'email'];
    for (let i = 0; i < numTouches; i++) {
      sequence.push(pattern[i % pattern.length]);
    }
    return sequence;
  }

  // Default: use first channel
  return Array(numTouches).fill(channels[0]);
}

// =====================================================
// TIMING HEURISTICS
// =====================================================

/**
 * Generate delay sequence based on cadence and number of touches
 */
export function generateDelaySequence(
  numTouches: number,
  cadence: CampaignCadence,
  totalDays?: number,
): number[] {
  const pattern = CADENCE_PATTERNS[cadence];
  const delays: number[] = [0]; // First touch is day 0

  // If totalDays is specified, distribute evenly
  if (totalDays) {
    const avgDelay = totalDays / (numTouches - 1);
    for (let i = 1; i < numTouches; i++) {
      delays.push(Math.round(avgDelay * i));
    }
    return delays;
  }

  // Otherwise, use cadence pattern with some variation
  let currentDay = 0;
  for (let i = 1; i < numTouches; i++) {
    // Vary delays slightly for natural feel
    const delay = pattern.avgDelay + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2);
    const clampedDelay = Math.max(pattern.minDelay, Math.min(pattern.maxDelay, delay));

    currentDay += clampedDelay;
    delays.push(currentDay);
  }

  return delays;
}

// =====================================================
// SMART DEFAULT GENERATOR
// =====================================================

/**
 * Generate intelligent defaults for a campaign based on intake
 */
export function generateCampaignDefaults(intake: CampaignIntake): {
  numTouches: number;
  totalDays: number;
  cadence: CampaignCadence;
  channels: CampaignChannel[];
  tone: string;
  steps: Pick<CampaignStep, 'channel' | 'delay' | 'purpose'>[];
} {
  // Infer campaign type from goal or request
  const campaignType = inferCampaignType(intake.goal || intake.request);

  // Get defaults from campaign type
  const typeDefaults = CAMPAIGN_TYPE_DEFAULTS[campaignType] || CAMPAIGN_TYPE_DEFAULTS['cold-outreach'];

  // Get vertical defaults if available
  const verticalDefaults = intake.vertical
    ? VERTICAL_DEFAULTS[intake.vertical.toLowerCase()]
    : null;

  // Override with user preferences
  const numTouches = intake.numTouches || typeDefaults.numTouches;
  const totalDays = intake.totalDays || typeDefaults.totalDays;
  const cadence = intake.cadence || typeDefaults.cadence;
  const channels = intake.channels.length > 0
    ? intake.channels
    : verticalDefaults?.preferredChannels || typeDefaults.channels;
  const tone = intake.tone || verticalDefaults?.typicalTone || typeDefaults.tone;

  // Generate channel sequence
  const channelSequence = getChannelSequence(numTouches, channels, campaignType);

  // Generate delay sequence
  const delays = generateDelaySequence(numTouches, cadence, totalDays);

  // Generate steps
  const steps: Pick<CampaignStep, 'channel' | 'delay' | 'purpose'>[] = [];
  for (let i = 0; i < numTouches; i++) {
    steps.push({
      channel: channelSequence[i],
      delay: delays[i],
      purpose: typeDefaults.structure[i % typeDefaults.structure.length],
    });
  }

  return {
    numTouches,
    totalDays,
    cadence,
    channels,
    tone,
    steps,
  };
}

/**
 * Infer campaign type from goal or request text
 */
export function inferCampaignType(text: string): string {
  const lower = text.toLowerCase();

  // Check for keywords
  if (lower.includes('demo') || lower.includes('trial')) return 'demo-request';
  if (lower.includes('event') || lower.includes('webinar')) return 'event-promo';
  if (lower.includes('launch') || lower.includes('new product')) return 'product-launch';
  if (lower.includes('nurture') || lower.includes('educate')) return 'nurture';
  if (lower.includes('re-engage') || lower.includes('win back')) return 're-engagement';

  // Default to cold outreach
  return 'cold-outreach';
}

// =====================================================
// TONE SUGGESTIONS
// =====================================================

export const TONE_OPTIONS: Record<string, { description: string; examples: string[] }> = {
  'professional-friendly': {
    description: 'Balanced professional tone with warmth',
    examples: [
      "I hope this email finds you well",
      "I'd love to share a quick insight",
      "Would you be open to a brief conversation?",
    ],
  },
  'professional-consultative': {
    description: 'Expert advisor positioning',
    examples: [
      "Based on what I'm seeing in the market",
      "Here's what's working for similar businesses",
      "I've helped companies like yours achieve",
    ],
  },
  'casual-friendly': {
    description: 'Approachable and conversational',
    examples: [
      "Hey [Name], quick question for you",
      "Wanted to loop back around",
      "Just following up on my last note",
    ],
  },
  'professional-warm': {
    description: 'Professional with personal touch',
    examples: [
      "I've been thinking about your situation",
      "Your recent post about X really resonated",
      "I appreciate your time in considering this",
    ],
  },
  'enthusiastic-professional': {
    description: 'Excited but still professional',
    examples: [
      "I'm excited to share",
      "This is a game-changer for",
      "You won't want to miss this",
    ],
  },
  'professional-empathetic': {
    description: 'Understanding and compassionate',
    examples: [
      "I understand how challenging this can be",
      "Many people in your situation feel",
      "You're not alone in facing this",
    ],
  },
};

// =====================================================
// PURPOSE TEMPLATES
// =====================================================

/**
 * Description of each step purpose
 */
export const PURPOSE_DESCRIPTIONS: Record<string, string> = {
  'set-expectations': 'Introduce yourself and set the stage for the conversation',
  'deliver-value': 'Provide actionable insight or valuable information',
  'social-proof': 'Share case study, testimonial, or success story',
  'overcome-objection': 'Address a common objection or concern',
  'create-urgency': 'Provide time-sensitive reason to act',
  'final-value': 'One last piece of value before exit',
  'breakup': 'Friendly exit with door left open',
  'welcome': 'Welcome and set expectations for the relationship',
  'educate': 'Educational content that helps the recipient',
  'case-study': 'Detailed success story',
  'resource': 'Valuable resource (guide, tool, template)',
  'check-in': 'Soft check-in with gentle CTA',
  'we-miss-you': 'Re-introduce value after absence',
  'whats-new': 'Show what has changed or improved',
  'special-offer': 'Incentive to re-engage',
  'last-chance': 'Final reminder before exit',
  'save-the-date': 'Event announcement',
  'event-value': 'Why attend the event',
  'agenda-speakers': 'Event details and speakers',
  'last-seats': 'Create urgency around event',
  'final-reminder': 'Last reminder before event',
  'intro-value-prop': 'Introduce solution and value proposition',
  'pain-point': 'Address specific pain point',
  'demo-invite': 'Invite to demo or call',
  'demo-reminder': 'Stronger demo CTA',
  'final-reach': 'Last attempt to connect',
  'teaser': 'Build anticipation',
  'announcement': 'Product launch announcement',
  'features-benefits': 'Deep dive into features and benefits',
  'use-cases': 'How to use the product',
  'early-adopter': 'Early bird or special offer',
  'reminder': 'Final push or reminder',
};
