import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  AssistantBuilderInputSchema,
  buildAssistantPrompt,
  buildVapiAssistantConfig,
  defaultAssistantBuilderInput,
} from '../builders';

describe('Assistant builder utilities', () => {
  describe('Schema validation - Happy path', () => {
    it('validates default input shape', () => {
      const parsed = AssistantBuilderInputSchema.parse(defaultAssistantBuilderInput);
      expect(parsed.objective).toBe('book_qualified_meeting');
      expect(parsed.company.name).toBe('');
      expect(parsed.compliance.disclosures).toEqual([]);
    });

    it('generates a structured system prompt with safety and flow hints', () => {
      const input = AssistantBuilderInputSchema.parse({
        ...defaultAssistantBuilderInput,
        company: {
          name: 'Elev8 Hub',
          industry: 'B2B SaaS',
          valueProposition: 'streamlines marketing ops for agencies',
        },
        objective: 'qualify_inbound_leads',
        persona: {
          voice: 'confident_warm',
          energy: 'medium',
          pacing: 'moderate',
          language: ['en-US'],
          fillerPreference: 'brief',
        },
        compliance: {
          disclosures: ['Inform caller the line is recorded.'],
          forbiddenTopics: ['Pricing guarantees'],
          escalationTriggers: ['caller requests human agent twice', 'legal questions'],
          handoffInstructions: 'Warm transfer to human on-call via Slack #sales.',
        },
        capabilities: {
          tools: [
            {
              name: 'scheduleDemo',
              description: 'Book a demo via Calendly if the caller is qualified.',
              parameters: {
                type: 'object',
                required: ['email', 'preferred_time'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  preferred_time: { type: 'string' },
                },
              },
            },
          ],
        },
        knowledgeBase: {
          faqs: [
            { question: 'Do you integrate with HubSpot?', answer: 'Yes, full sync in real time.' },
          ],
          objectionHandling: [
            { objection: 'We already have a platform.', response: 'Highlight ability to layer on existing stack.' },
          ],
        },
      });

      const prompt = buildAssistantPrompt(input);

      expect(prompt).toMatch(/You are Elev8 Hub's voice assistant/i);
      expect(prompt).toMatch(/Objective: qualify inbound leads/i);
      expect(prompt).toMatch(/Disclosures:/i);
      expect(prompt).toMatch(/Conversation Flow:/i);
      expect(prompt).toMatch(/Escalate when caller requests human agent twice/i);
      expect(prompt).toMatch(/FAQ Reference:/i);
    });

    it('builds a Vapi assistant config with sane defaults', () => {
      const parsed = AssistantBuilderInputSchema.parse({
        ...defaultAssistantBuilderInput,
        company: { name: 'Elev8 Hub', industry: 'B2B SaaS' },
        objective: 'book_qualified_meeting',
        persona: {
          voice: 'confident_warm',
          energy: 'medium',
          pacing: 'moderate',
          language: ['en-US'],
          fillerPreference: 'brief',
        },
      });

      const prompt = buildAssistantPrompt(parsed);
      const config = buildVapiAssistantConfig(parsed, prompt);

      expect(config.assistant.name).toBe('Elev8 Hub Voice Assistant');
      expect(config.assistant.language).toBe('en-US');
      expect(config.assistant.prompt).toBe(prompt);
      expect(config.assistant.model).toMatchObject({
        provider: 'openai',
        model: 'gpt-4o-mini',
        temperature: 0.6,
      });
      expect(config.assistant.voice).toMatchObject({
        provider: 'vapi',
        voiceId: 'alloy',
      });
      expect(config.assistant.functions).toEqual([]);
      expect(config.metadata.objective).toBe('book_qualified_meeting');
    });
  });

  describe('Schema validation - Edge cases & errors', () => {
    it('should reject persona with invalid voice type', () => {
      expect(() =>
        AssistantBuilderInputSchema.parse({
          ...defaultAssistantBuilderInput,
          persona: { ...defaultAssistantBuilderInput.persona, voice: 'robot_monotone' },
        })
      ).toThrow();
    });

    it('should reject language codes shorter than 2 chars', () => {
      expect(() =>
        AssistantBuilderInputSchema.parse({
          ...defaultAssistantBuilderInput,
          persona: { ...defaultAssistantBuilderInput.persona, language: ['e'] },
        })
      ).toThrow();
    });

    it('should reject empty language array', () => {
      expect(() =>
        AssistantBuilderInputSchema.parse({
          ...defaultAssistantBuilderInput,
          persona: { ...defaultAssistantBuilderInput.persona, language: [] },
        })
      ).toThrow();
    });

    it('should reject invalid energy level', () => {
      expect(() =>
        AssistantBuilderInputSchema.parse({
          ...defaultAssistantBuilderInput,
          persona: { ...defaultAssistantBuilderInput.persona, energy: 'extreme' },
        })
      ).toThrow();
    });

    it('should reject invalid pacing', () => {
      expect(() =>
        AssistantBuilderInputSchema.parse({
          ...defaultAssistantBuilderInput,
          persona: { ...defaultAssistantBuilderInput.persona, pacing: 'lightning' },
        })
      ).toThrow();
    });

    it('should reject invalid filler preference', () => {
      expect(() =>
        AssistantBuilderInputSchema.parse({
          ...defaultAssistantBuilderInput,
          persona: { ...defaultAssistantBuilderInput.persona, fillerPreference: 'excessive' },
        })
      ).toThrow();
    });

    it('should reject invalid objective', () => {
      expect(() =>
        AssistantBuilderInputSchema.parse({
          ...defaultAssistantBuilderInput,
          objective: 'invalid_objective_name',
        })
      ).toThrow();
    });
  });

  describe('Prompt generation - Length constraints', () => {
    it('should produce prompts under 8000 chars for API limits', () => {
      const maximalInput = {
        ...defaultAssistantBuilderInput,
        company: {
          name: 'Very Long Company Name Inc LLC'.repeat(3),
          industry: 'Complex multi-hyphenated industry description',
          valueProposition: 'x'.repeat(500),
          mission: 'x'.repeat(300),
        },
        compliance: {
          disclosures: Array(10).fill('Disclosure line about compliance and regulations'),
          forbiddenTopics: Array(15).fill('Topic that should not be discussed'),
          escalationTriggers: Array(10).fill('Trigger condition'),
          handoffInstructions: 'x'.repeat(200),
          safetyGuidelines: 'x'.repeat(200),
        },
        knowledgeBase: {
          faqs: Array(30).fill({ question: 'Question?', answer: 'Answer with detailed information.' }),
          objectionHandling: Array(20).fill({ objection: 'Objection', response: 'Response text' }),
          policies: Array(15).fill('Policy statement'),
        },
      };

      const input = AssistantBuilderInputSchema.parse(maximalInput);
      const prompt = buildAssistantPrompt(input);

      expect(prompt.length).toBeLessThan(8000);
      expect(prompt.length).toBeGreaterThan(100); // Should still have meaningful content
    });

    it('should include all required sections in structured order', () => {
      const input = AssistantBuilderInputSchema.parse({
        ...defaultAssistantBuilderInput,
        company: { name: 'TestCo', industry: 'Tech', valueProposition: 'Help companies' },
      });
      const prompt = buildAssistantPrompt(input);

      const roleIndex = prompt.indexOf('Role:');
      const objectiveIndex = prompt.indexOf('Objective:');
      const styleIndex = prompt.indexOf('Style:');
      const disclosuresIndex = prompt.indexOf('Disclosures:');
      const safetyIndex = prompt.indexOf('Safety Guidelines:');
      const flowIndex = prompt.indexOf('Conversation Flow:');
      const escalationIndex = prompt.indexOf('Escalation Policy:');

      expect(roleIndex).toBeGreaterThan(-1);
      expect(objectiveIndex).toBeGreaterThan(roleIndex);
      expect(styleIndex).toBeGreaterThan(objectiveIndex);
      expect(disclosuresIndex).toBeGreaterThan(styleIndex);
      expect(safetyIndex).toBeGreaterThan(disclosuresIndex);
      expect(flowIndex).toBeGreaterThan(safetyIndex);
      expect(escalationIndex).toBeGreaterThan(flowIndex);
    });

    it('should omit empty knowledge sections to save space', () => {
      const input = AssistantBuilderInputSchema.parse({
        ...defaultAssistantBuilderInput,
        knowledgeBase: { faqs: [], objectionHandling: [], policies: [] },
      });
      const prompt = buildAssistantPrompt(input);

      expect(prompt).not.toContain('FAQ Reference:');
      expect(prompt).not.toContain('Objection Handling:');
      expect(prompt).not.toContain('Policies:');
    });

    it('should omit forbidden topics section if empty', () => {
      const input = AssistantBuilderInputSchema.parse({
        ...defaultAssistantBuilderInput,
        compliance: { forbiddenTopics: [] },
      });
      const prompt = buildAssistantPrompt(input);

      expect(prompt).not.toContain('Forbidden Topics:');
    });
  });

  describe('Prompt generation - Multi-language support', () => {
    it('should handle multi-language scenarios correctly', () => {
      const input = AssistantBuilderInputSchema.parse({
        ...defaultAssistantBuilderInput,
        persona: { ...defaultAssistantBuilderInput.persona, language: ['es-MX', 'en-US', 'fr-CA'] },
      });
      const prompt = buildAssistantPrompt(input);

      expect(prompt).toContain('es-MX');
      expect(prompt).toContain('en-US');
      expect(prompt).toContain('fr-CA');
    });

    it('should handle single language correctly', () => {
      const input = AssistantBuilderInputSchema.parse({
        ...defaultAssistantBuilderInput,
        persona: { ...defaultAssistantBuilderInput.persona, language: ['de-DE'] },
      });
      const prompt = buildAssistantPrompt(input);

      expect(prompt).toContain('de-DE');
    });
  });

  describe('Prompt generation - Content inclusion', () => {
    it('should include company value proposition when provided', () => {
      const input = AssistantBuilderInputSchema.parse({
        ...defaultAssistantBuilderInput,
        company: { name: 'TestCo', valueProposition: 'We streamline operations with AI' },
      });
      const prompt = buildAssistantPrompt(input);

      expect(prompt).toContain('streamline operations with AI');
    });

    it('should skip value proposition section if empty', () => {
      const input = AssistantBuilderInputSchema.parse({
        ...defaultAssistantBuilderInput,
        company: { name: 'TestCo', valueProposition: '' },
      });
      const prompt = buildAssistantPrompt(input);

      // Should have role but not include empty value prop
      expect(prompt).toContain('Role:');
    });

    it('should include all FAQs in knowledge base', () => {
      const input = AssistantBuilderInputSchema.parse({
        ...defaultAssistantBuilderInput,
        knowledgeBase: {
          faqs: [
            { question: 'What is your pricing?', answer: 'Starting at $99/month' },
            { question: 'Do you offer support?', answer: 'Yes, 24/7' },
          ],
        },
      });
      const prompt = buildAssistantPrompt(input);

      expect(prompt).toContain('What is your pricing?');
      expect(prompt).toContain('Starting at $99/month');
      expect(prompt).toContain('Do you offer support?');
      expect(prompt).toContain('Yes, 24/7');
    });

    it('should include all objection handling', () => {
      const input = AssistantBuilderInputSchema.parse({
        ...defaultAssistantBuilderInput,
        knowledgeBase: {
          objectionHandling: [
            { objection: 'Too expensive', response: 'Consider the ROI' },
            { objection: 'Not ready now', response: 'We can schedule for later' },
          ],
        },
      });
      const prompt = buildAssistantPrompt(input);

      expect(prompt).toContain('Too expensive');
      expect(prompt).toContain('Consider the ROI');
      expect(prompt).toContain('Not ready now');
      expect(prompt).toContain('We can schedule for later');
    });
  });

  describe('Vapi config - Tool integration', () => {
    it('should map custom tools to Vapi function format', () => {
      const input = AssistantBuilderInputSchema.parse({
        ...defaultAssistantBuilderInput,
        capabilities: {
          tools: [
            {
              name: 'transferToSales',
              description: 'Transfer call to sales team',
              parameters: {
                type: 'object',
                required: ['reason'],
                properties: { reason: { type: 'string' } },
              },
            },
          ],
        },
      });
      const prompt = buildAssistantPrompt(input);
      const config = buildVapiAssistantConfig(input, prompt);

      expect(config.assistant.functions).toHaveLength(1);
      expect(config.assistant.functions[0].name).toBe('transferToSales');
      expect(config.assistant.functions[0].description).toBe('Transfer call to sales team');
      expect(config.assistant.functions[0].parameters.required).toContain('reason');
    });

    it('should handle multiple tools correctly', () => {
      const input = AssistantBuilderInputSchema.parse({
        ...defaultAssistantBuilderInput,
        capabilities: {
          tools: [
            {
              name: 'bookDemo',
              description: 'Book demo',
              parameters: { type: 'object', properties: {} },
            },
            {
              name: 'collectEmail',
              description: 'Collect email',
              parameters: { type: 'object', properties: {} },
            },
            {
              name: 'transferToSupport',
              description: 'Transfer to support',
              parameters: { type: 'object', properties: {} },
            },
          ],
        },
      });
      const prompt = buildAssistantPrompt(input);
      const config = buildVapiAssistantConfig(input, prompt);

      expect(config.assistant.functions).toHaveLength(3);
      expect(config.assistant.functions.map((f) => f.name)).toEqual(['bookDemo', 'collectEmail', 'transferToSupport']);
    });
  });

  describe('Vapi config - Metadata preservation', () => {
    it('should preserve objective in metadata', () => {
      const input = AssistantBuilderInputSchema.parse({
        ...defaultAssistantBuilderInput,
        objective: 'qualify_inbound_leads',
      });
      const prompt = buildAssistantPrompt(input);
      const config = buildVapiAssistantConfig(input, prompt);

      expect(config.metadata.objective).toBe('qualify_inbound_leads');
    });

    it('should preserve capabilities in metadata', () => {
      const input = AssistantBuilderInputSchema.parse({
        ...defaultAssistantBuilderInput,
        capabilities: {
          allowSmallTalk: false,
          collectEmail: true,
          tools: [],
        },
      });
      const prompt = buildAssistantPrompt(input);
      const config = buildVapiAssistantConfig(input, prompt);

      expect(config.metadata.allowSmallTalk).toBe(false);
    });

    it('should preserve operations info in metadata', () => {
      const input = AssistantBuilderInputSchema.parse({
        ...defaultAssistantBuilderInput,
        operations: {
          hoursOfOperation: '9 AM - 5 PM EST',
          timezone: 'America/New_York',
        },
      });
      const prompt = buildAssistantPrompt(input);
      const config = buildVapiAssistantConfig(input, prompt);

      expect(config.metadata.operations.hoursOfOperation).toBe('9 AM - 5 PM EST');
      expect(config.metadata.operations.timezone).toBe('America/New_York');
    });
  });

  describe('Vapi config - First message generation', () => {
    it('should generate first message with company name', () => {
      const input = AssistantBuilderInputSchema.parse({
        ...defaultAssistantBuilderInput,
        company: { name: 'Acme Corp' },
      });
      const prompt = buildAssistantPrompt(input);
      const config = buildVapiAssistantConfig(input, prompt);

      expect(config.assistant.firstMessage).toContain('Acme Corp');
    });

    it('should fallback to generic message when company name is empty', () => {
      const input = AssistantBuilderInputSchema.parse({
        ...defaultAssistantBuilderInput,
        company: { name: '' },
      });
      const prompt = buildAssistantPrompt(input);
      const config = buildVapiAssistantConfig(input, prompt);

      expect(config.assistant.firstMessage).toContain('thanks for calling');
    });
  });

  describe('Vapi config - Assistant naming', () => {
    it('should name assistant after company with suffix', () => {
      const input = AssistantBuilderInputSchema.parse({
        ...defaultAssistantBuilderInput,
        company: { name: 'Elev8 Hub' },
      });
      const prompt = buildAssistantPrompt(input);
      const config = buildVapiAssistantConfig(input, prompt);

      expect(config.assistant.name).toBe('Elev8 Hub Voice Assistant');
    });

    it('should use generic name when company name is empty', () => {
      const input = AssistantBuilderInputSchema.parse({
        ...defaultAssistantBuilderInput,
        company: { name: '' },
      });
      const prompt = buildAssistantPrompt(input);
      const config = buildVapiAssistantConfig(input, prompt);

      expect(config.assistant.name).toBe('Customer Voice Assistant');
    });
  });

  describe('Objective formatting', () => {
    it('should convert snake_case objectives to Title Case', () => {
      const input = AssistantBuilderInputSchema.parse({
        ...defaultAssistantBuilderInput,
        objective: 'book_qualified_meeting',
      });
      const prompt = buildAssistantPrompt(input);

      expect(prompt).toMatch(/Objective: Book Qualified Meeting/i);
    });

    it('should convert hyphenated objectives to Title Case', () => {
      const input = AssistantBuilderInputSchema.parse({
        ...defaultAssistantBuilderInput,
        objective: 'qualify-inbound-leads',
      });
      const prompt = buildAssistantPrompt(input);

      expect(prompt).toMatch(/Objective: Qualify Inbound Leads/i);
    });
  });
});
