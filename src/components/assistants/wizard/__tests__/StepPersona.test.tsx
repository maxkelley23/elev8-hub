import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import StepPersona from '../StepPersona';
import type { AssistantBuilderInput } from '../../../lib/assistant/builders';

describe('StepPersona Component', () => {
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
      language: ['en-US', 'es-ES'],
      fillerPreference: 'brief',
    },
    compliance: {
      disclosures: [],
      forbiddenTopics: [],
      escalationTriggers: [],
      handoffInstructions: '',
      safetyGuidelines: '',
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

  it('should render all persona fields', () => {
    render(
      <StepPersona
        data={mockData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    expect(screen.getByLabelText(/voice/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/energy/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pacing/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/language/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filler preference/i)).toBeInTheDocument();
  });

  it('should display correct persona values from data', () => {
    render(
      <StepPersona
        data={mockData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    const voiceSelect = screen.getByLabelText(/voice/i) as HTMLSelectElement;
    expect(voiceSelect.value).toBe('confident_warm');

    const energySelect = screen.getByLabelText(/energy/i) as HTMLSelectElement;
    expect(energySelect.value).toBe('medium');
  });

  it('should have accessible select inputs with proper labels and IDs', () => {
    render(
      <StepPersona
        data={mockData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    const voiceSelect = screen.getByLabelText(/voice/i) as HTMLSelectElement;
    expect(voiceSelect.id).toBeDefined();
    expect(voiceSelect.id).not.toBe('');

    const energySelect = screen.getByLabelText(/energy/i) as HTMLSelectElement;
    expect(energySelect.id).toBeDefined();
  });

  it('should display validation error for language requirement', () => {
    const errorsWithIssues: Record<string, string[]> = {
      'persona.language': ['At least one language must be selected'],
    };

    render(
      <StepPersona
        data={mockData}
        onChange={mockOnChange}
        errors={errorsWithIssues}
      />
    );

    expect(screen.getByText('At least one language must be selected')).toBeInTheDocument();
  });

  it('should display available options for enum fields', () => {
    render(
      <StepPersona
        data={mockData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    const voiceSelect = screen.getByLabelText(/voice/i) as HTMLSelectElement;
    expect(voiceSelect.options.length).toBeGreaterThan(1);

    const energySelect = screen.getByLabelText(/energy/i) as HTMLSelectElement;
    expect(energySelect.options.length).toBeGreaterThan(1);
  });

  it('should handle all persona options correctly', () => {
    const dataWithDifferentOptions: AssistantBuilderInput = {
      ...mockData,
      persona: {
        voice: 'professional_formal',
        energy: 'high',
        pacing: 'fast',
        language: ['en-US', 'fr-FR'],
        fillerPreference: 'detailed',
      },
    };

    render(
      <StepPersona
        data={dataWithDifferentOptions}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    const voiceSelect = screen.getByLabelText(/voice/i) as HTMLSelectElement;
    const energySelect = screen.getByLabelText(/energy/i) as HTMLSelectElement;
    const pacingSelect = screen.getByLabelText(/pacing/i) as HTMLSelectElement;
    const fillerSelect = screen.getByLabelText(/filler preference/i) as HTMLSelectElement;

    expect(voiceSelect.value).toBe('professional_formal');
    expect(energySelect.value).toBe('high');
    expect(pacingSelect.value).toBe('fast');
    expect(fillerSelect.value).toBe('detailed');
  });
});
