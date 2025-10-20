import { z } from 'zod';

// =====================================================
// Input Schema & Defaults
// =====================================================

const ToolParametersSchema = z.object({
  type: z.literal('object'),
  required: z.array(z.string()).default([]),
  properties: z.record(z.any()).default({}),
});

const ToolSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  parameters: ToolParametersSchema,
});

const CompanySchema = z.object({
  name: z.string().default(''),
  industry: z.string().default(''),
  valueProposition: z.string().default(''),
  mission: z.string().default(''),
});

const PersonaSchema = z.object({
  voice: z
    .enum(['confident_warm', 'friendly_casual', 'professional_formal', 'supportive_compassionate'])
    .default('confident_warm'),
  energy: z.enum(['low', 'medium', 'high']).default('medium'),
  pacing: z.enum(['slow', 'moderate', 'fast']).default('moderate'),
  language: z.array(z.string().min(2)).min(1).default(['en-US']),
  fillerPreference: z.enum(['none', 'brief', 'detailed']).default('brief'),
});

const ComplianceSchema = z.object({
  disclosures: z.array(z.string()).default([]),
  forbiddenTopics: z.array(z.string()).default([]),
  escalationTriggers: z.array(z.string()).default([]),
  handoffInstructions: z
    .string()
    .default('Warm transfer to a human teammate and summarize the conversation.'),
  safetyGuidelines: z
    .string()
    .default('Stay professional, respect caller privacy, and end the call if the caller becomes abusive.'),
});

const KnowledgeBaseSchema = z.object({
  faqs: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    )
    .default([]),
  objectionHandling: z
    .array(
      z.object({
        objection: z.string(),
        response: z.string(),
      })
    )
    .default([]),
  policies: z.array(z.string()).default([]),
});

const CapabilitiesSchema = z.object({
  tools: z.array(ToolSchema).default([]),
  allowSmallTalk: z.boolean().default(true),
  collectEmail: z.boolean().default(true),
});

const CallFlowSchema = z.object({
  type: z.enum(['structured', 'freeform']).default('structured'),
  outline: z.array(z.string()).default([]),
  description: z.string().default(''),
});

export const AssistantBuilderInputSchema = z.object({
  company: CompanySchema,
  objective: z.string().default('book_qualified_meeting'),
  persona: PersonaSchema,
  compliance: ComplianceSchema,
  capabilities: CapabilitiesSchema,
  knowledgeBase: KnowledgeBaseSchema,
  callFlow: CallFlowSchema.optional(),
  operations: z
    .object({
      hoursOfOperation: z.string().default('24/7'),
      timezone: z.string().default('UTC'),
    })
    .default({ hoursOfOperation: '24/7', timezone: 'UTC' }),
});

export type AssistantBuilderInput = z.infer<typeof AssistantBuilderInputSchema>;

export const defaultAssistantBuilderInput: AssistantBuilderInput = {
  company: {
    name: '',
    industry: '',
    valueProposition: '',
    mission: '',
  },
  objective: 'book_qualified_meeting',
  persona: {
    voice: 'confident_warm',
    energy: 'medium',
    pacing: 'moderate',
    language: ['en-US'],
    fillerPreference: 'brief',
  },
  compliance: {
    disclosures: [],
    forbiddenTopics: [],
    escalationTriggers: [],
    handoffInstructions: 'Warm transfer to a human teammate and summarize the conversation.',
    safetyGuidelines: 'Stay professional, respect caller privacy, and end the call if the caller becomes abusive.',
  },
  capabilities: {
    tools: [],
    allowSmallTalk: true,
    collectEmail: true,
  },
  knowledgeBase: {
    faqs: [],
    objectionHandling: [],
    policies: [],
  },
  callFlow: {
    type: 'structured',
    outline: [],
    description: '',
  },
  operations: {
    hoursOfOperation: '24/7',
    timezone: 'UTC',
  },
};

// =====================================================
// Prompt Generation
// =====================================================

function formatObjective(objective: string): string {
  return objective.replace(/[_-]+/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase());
}

function buildDisclosuresSection(disclosures: string[]): string {
  if (!disclosures.length) {
    return 'Disclosures:\n- When requested, disclose that you are an AI assistant on a recorded line.';
  }
  const items = disclosures.map((line) => `- ${line.trim()}`).join('\n');
  return `Disclosures:\n${items}`;
}

function buildForbiddenTopicsSection(forbiddenTopics: string[]): string {
  if (!forbiddenTopics.length) {
    return '';
  }
  const items = forbiddenTopics.map((topic) => `- Do not discuss ${topic.trim()}.`).join('\n');
  return `Forbidden Topics:\n${items}`;
}

function buildEscalationSection(triggers: string[], handoffInstructions: string): string {
  const triggerLines =
    triggers.length > 0
      ? triggers.map((trigger) => `- Escalate when ${trigger.trim()}.`).join('\n')
      : '- Escalate when the caller requests a human twice or expresses legal concerns.';
  return `Escalation Policy:\n${triggerLines}\n- ${handoffInstructions.trim()}`;
}

function buildKnowledgeSections(knowledge: AssistantBuilderInput['knowledgeBase'], maxChars?: number): string {
  const sections: string[] = [];
  let currentLength = 0;

  // FAQs (most important)
  if (knowledge.faqs.length > 0) {
    let faqsText = '';
    for (const faq of knowledge.faqs) {
      const faqLine = `- Q: ${faq.question}\n  A: ${faq.answer}\n`;
      const faqHeader = 'FAQ Reference:\n';
      const proposedLength = currentLength + faqHeader.length + faqsText.length + faqLine.length + 4; // +4 for section separator
      if (maxChars && proposedLength > maxChars) {
        break;
      }
      faqsText += faqLine;
    }
    if (faqsText) {
      const faqSection = `FAQ Reference:\n${faqsText}`;
      sections.push(faqSection);
      currentLength += faqSection.length + 4; // Add section separator
    }
  }

  // Objection handling (second)
  if (knowledge.objectionHandling.length > 0) {
    let objectionsText = '';
    for (const item of knowledge.objectionHandling) {
      const objLine = `- Objection: ${item.objection}\n  Response: ${item.response}\n`;
      const objHeader = 'Objection Handling:\n';
      const proposedLength = currentLength + objHeader.length + objectionsText.length + objLine.length + 4;
      if (maxChars && proposedLength > maxChars) {
        break;
      }
      objectionsText += objLine;
    }
    if (objectionsText) {
      const objSection = `Objection Handling:\n${objectionsText}`;
      sections.push(objSection);
      currentLength += objSection.length + 4;
    }
  }

  // Policies (last)
  if (knowledge.policies.length > 0) {
    let policiesText = '';
    for (const policy of knowledge.policies) {
      const policyLine = `- ${policy}\n`;
      const policyHeader = 'Policies:\n';
      const proposedLength = currentLength + policyHeader.length + policiesText.length + policyLine.length + 4;
      if (maxChars && proposedLength > maxChars) {
        break;
      }
      policiesText += policyLine;
    }
    if (policiesText) {
      const policySection = `Policies:\n${policiesText}`;
      sections.push(policySection);
      currentLength += policySection.length + 4;
    }
  }

  return sections.join('\n\n');
}

const PROMPT_MAX_LENGTH = 8000;
const PROMPT_TARGET_LENGTH = 7500; // Aim for this to leave buffer

export function buildAssistantPrompt(input: AssistantBuilderInput): string {
  const { company, objective, persona, compliance, capabilities, knowledgeBase, callFlow } = input;

  const companyName = company.name || 'Our team';
  const industry = company.industry ? ` serving the ${company.industry} space` : '';
  const valueProp = company.valueProposition ? `We help callers by ${company.valueProposition}.` : '';

  const toneDescription: Record<AssistantBuilderInput['persona']['voice'], string> = {
    confident_warm: 'confident yet warm',
    friendly_casual: 'friendly and casual',
    professional_formal: 'professional and formal',
    supportive_compassionate: 'supportive and compassionate',
  };

  let conversationFlow = [
    'Greet the caller, introduce yourself as an AI assistant, and confirm consent if required.',
    "Confirm the caller's name and relation to the business (if unknown).",
    `Clarify their needs and determine if they align with the objective: ${formatObjective(objective)}.`,
    capabilities.collectEmail
      ? 'Collect a reachable email and phone number if appropriate.'
      : 'Confirm existing contact details without collecting new personal data.',
    capabilities.tools.length
      ? 'Use available tools when the caller meets criteria, narrating actions clearly.'
      : 'Provide guidance and information without triggering automated workflows.',
    'Summarize the agreed plan, repeat the key details back to the caller, and confirm next steps.',
    'Close courteously and provide a path to reach a human if needed.',
  ];

  // Override with custom call flow if provided
  if (callFlow?.type === 'structured' && callFlow.outline && callFlow.outline.length > 0) {
    conversationFlow = callFlow.outline;
  }

  const flowTypeNote =
    callFlow?.type === 'freeform'
      ? 'Call Flow: You have flexibility to follow caller needs naturally, using these directions as guidelines rather than strict steps.'
      : '';

  const coreSections: string[] = [
    `Role: You are ${companyName}'s voice assistant${industry}.`,
    valueProp,
    `Objective: ${formatObjective(objective)}.`,
    `Style: Maintain a ${toneDescription[persona.voice]} tone, limit responses to under 20 seconds, and avoid jargon.`,
    `Language: Primary language is ${persona.language.join(', ')}. Use brief fillers (${persona.fillerPreference}) to manage latency.`,
    buildDisclosuresSection(compliance.disclosures),
    `Safety Guidelines:\n- ${compliance.safetyGuidelines}`,
    buildForbiddenTopicsSection(compliance.forbiddenTopics),
    flowTypeNote,
    `Conversation Flow:\n${conversationFlow.map((step, index) => `${index + 1}. ${step}`).join('\n')}`,
    buildEscalationSection(compliance.escalationTriggers, compliance.handoffInstructions),
  ];

  const closingText = 'If you are uncertain, ask clarifying questions or offer to connect the caller with a human team member.';
  const corePrompt = coreSections.filter(Boolean).join('\n\n');
  let currentLength = corePrompt.length;

  // Calculate available space for knowledge base
  // Account for: core prompt + closing text + section separators
  const availableForKnowledge = PROMPT_TARGET_LENGTH - currentLength - closingText.length - 10; // 10 for separators
  const knowledgeText = buildKnowledgeSections(knowledgeBase, Math.max(500, availableForKnowledge));

  const sections: string[] = [...coreSections];
  if (knowledgeText) {
    sections.push(knowledgeText);
  }

  sections.push(closingText);

  let prompt = sections.filter(Boolean).join('\n\n').trim();

  // Emergency truncation if still over limit (should rarely happen)
  if (prompt.length > PROMPT_MAX_LENGTH) {
    // Remove knowledge sections if needed
    const withoutKnowledge = coreSections.filter(Boolean).join('\n\n') + '\n\nIf you are uncertain, ask clarifying questions or offer to connect the caller with a human team member.';
    prompt = withoutKnowledge.length <= PROMPT_MAX_LENGTH ? withoutKnowledge : prompt.substring(0, PROMPT_MAX_LENGTH - 100) + '\n[truncated]';
  }

  return prompt;
}

// =====================================================
// Vapi Assistant Config
// =====================================================

export interface VapiFunctionDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface VapiAssistantConfig {
  assistant: {
    name: string;
    language: string;
    firstMessage: string;
    prompt: string;
    model: {
      provider: string;
      model: string;
      temperature: number;
    };
    voice: {
      provider: string;
      voiceId: string;
    };
    transcriber: {
      provider: string;
      model: string;
    };
    functions: VapiFunctionDefinition[];
    silenceTimeoutSeconds: number;
    maxDurationMinutes: number;
    metadata?: Record<string, unknown>;
  };
  webhook?: {
    url: string;
    events: string[];
  };
  metadata: Record<string, unknown>;
}

export function buildVapiAssistantConfig(
  input: AssistantBuilderInput,
  prompt: string
): VapiAssistantConfig {
  const primaryLanguage = input.persona.language[0] || 'en-US';
  const assistantName = input.company.name
    ? `${input.company.name} Voice Assistant`
    : 'Customer Voice Assistant';
  const firstMessage = `Hi, thanks for calling ${input.company.name || 'our team'}! How can I help you today?`;

  const functions = input.capabilities.tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
  }));

  return {
    assistant: {
      name: assistantName,
      language: primaryLanguage,
      firstMessage,
      prompt,
      model: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        temperature: 0.6,
      },
      voice: {
        provider: 'vapi',
        voiceId: 'alloy',
      },
      transcriber: {
        provider: 'deepgram',
        model: 'nova-2',
      },
      functions,
      silenceTimeoutSeconds: 15,
      maxDurationMinutes: 10,
      metadata: {
        objective: input.objective,
        industry: input.company.industry,
      },
    },
    metadata: {
      objective: input.objective,
      allowSmallTalk: input.capabilities.allowSmallTalk,
      operations: input.operations,
    },
  };
}
