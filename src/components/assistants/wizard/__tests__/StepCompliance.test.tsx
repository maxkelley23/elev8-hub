import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import StepCompliance from '../StepCompliance';
import type { AssistantBuilderInput } from '../../../lib/assistant/builders';

describe('StepCompliance Component', () => {
  const mockData: AssistantBuilderInput = {
    company: {
      name: 'Acme Corp',
      industry: 'Technology',
      valueProposition: 'We build amazing products',
      mission: 'To revolutionize the industry',
    },
    persona: {
      voice: 'confident_warm',
      energy: 'medium',
      pacing: 'moderate',
      language: ['en-US'],
      fillerPreference: 'brief',
    },
    compliance: {
      disclosures: ['This is an AI assistant'],
      forbiddenTopics: ['Politics', 'Religion'],
      escalationTriggers: ['Customer anger', 'Complex issue'],
      handoffInstructions: 'Transfer to human agent politely',
      safetyGuidelines: 'Respect privacy and professionalism',
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
    objective: 'book_qualified_meeting',
    operations: {
      hoursOfOperation: '24/7',
      timezone: 'UTC',
    },
  };

  const mockOnChange = vi.fn();
  const mockErrors: Record<string, string[]> = {};

  it('should render all compliance fields', () => {
    render(
      <StepCompliance
        data={mockData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    expect(screen.getByLabelText(/disclosures/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/forbidden topics/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/escalation triggers/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/handoff instructions/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/safety guidelines/i)).toBeInTheDocument();
  });

  it('should populate fields with provided compliance data', () => {
    render(
      <StepCompliance
        data={mockData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    expect(screen.getByDisplayValue('This is an AI assistant')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Transfer to human agent politely')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Respect privacy and professionalism')).toBeInTheDocument();
  });

  it('should display at least one disclosure requirement error', () => {
    const errorsWithIssues: Record<string, string[]> = {
      'compliance.disclosures': ['At least one disclosure is required'],
    };

    render(
      <StepCompliance
        data={mockData}
        onChange={mockOnChange}
        errors={errorsWithIssues}
      />
    );

    expect(screen.getByText('At least one disclosure is required')).toBeInTheDocument();
  });

  it('should have accessible textarea inputs with proper labels and IDs', () => {
    render(
      <StepCompliance
        data={mockData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    const disclosuresInput = screen.getByLabelText(/disclosures/i) as HTMLTextAreaElement;
    expect(disclosuresInput.id).toBeDefined();
    expect(disclosuresInput.id).not.toBe('');

    const forbiddenTopicsInput = screen.getByLabelText(/forbidden topics/i) as HTMLTextAreaElement;
    expect(forbiddenTopicsInput.id).toBeDefined();
    expect(forbiddenTopicsInput.id).not.toBe('');

    const escalationTriggersInput = screen.getByLabelText(/escalation triggers/i) as HTMLTextAreaElement;
    expect(escalationTriggersInput.id).toBeDefined();
    expect(escalationTriggersInput.id).not.toBe('');

    const handoffInput = screen.getByLabelText(/handoff instructions/i) as HTMLTextAreaElement;
    expect(handoffInput.id).toBeDefined();
    expect(handoffInput.id).not.toBe('');

    const safetyInput = screen.getByLabelText(/safety guidelines/i) as HTMLTextAreaElement;
    expect(safetyInput.id).toBeDefined();
    expect(safetyInput.id).not.toBe('');
  });

  it('should render with empty compliance data', () => {
    const emptyData: AssistantBuilderInput = {
      ...mockData,
      compliance: {
        disclosures: [],
        forbiddenTopics: [],
        escalationTriggers: [],
        handoffInstructions: '',
        safetyGuidelines: '',
      },
    };

    render(
      <StepCompliance
        data={emptyData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    expect((screen.getByLabelText(/handoff instructions/i) as HTMLTextAreaElement).value).toBe('');
    expect((screen.getByLabelText(/safety guidelines/i) as HTMLTextAreaElement).value).toBe('');
  });

  it('should display default values for handoff and safety guidelines', () => {
    const defaultData: AssistantBuilderInput = {
      ...mockData,
      compliance: {
        disclosures: [],
        forbiddenTopics: [],
        escalationTriggers: [],
        handoffInstructions: 'Warm transfer to a human teammate and summarize the conversation.',
        safetyGuidelines: 'Stay professional, respect caller privacy, and end the call if the caller becomes abusive.',
      },
    };

    render(
      <StepCompliance
        data={defaultData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    expect(screen.getByDisplayValue('Warm transfer to a human teammate and summarize the conversation.')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Stay professional, respect caller privacy, and end the call if the caller becomes abusive.')).toBeInTheDocument();
  });
});
