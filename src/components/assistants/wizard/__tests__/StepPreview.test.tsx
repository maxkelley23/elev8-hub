import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import StepPreview from '../StepPreview';
import type { AssistantBuilderInput } from '../../../lib/assistant/builders';

describe('StepPreview Component', () => {
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
      forbiddenTopics: ['Politics'],
      escalationTriggers: ['Customer anger'],
      handoffInstructions: 'Transfer to human politely',
      safetyGuidelines: 'Respect privacy',
    },
    capabilities: {
      tools: [],
      allowSmallTalk: true,
      collectEmail: true,
    },
    knowledgeBase: {
      faqs: [{ question: 'How?', answer: 'Like this' }],
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

  it('should render preview title', () => {
    render(
      <StepPreview
        data={mockData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    expect(screen.getByText(/preview/i)).toBeInTheDocument();
  });

  it('should display company information in preview', () => {
    render(
      <StepPreview
        data={mockData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('should display persona information in preview', () => {
    render(
      <StepPreview
        data={mockData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    expect(screen.getByText(/confident_warm/i)).toBeInTheDocument();
    expect(screen.getByText(/medium/i)).toBeInTheDocument();
  });

  it('should be read-only (no input fields)', () => {
    render(
      <StepPreview
        data={mockData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    const inputs = screen.queryAllByRole('textbox');
    expect(inputs.length).toBe(0);

    const buttons = screen.queryAllByRole('button');
    expect(buttons.length).toBe(0);
  });

  it('should display generated prompt preview', () => {
    render(
      <StepPreview
        data={mockData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    // Should show generated system prompt section
    expect(screen.getByText(/generated system prompt/i)).toBeInTheDocument();
  });
});
