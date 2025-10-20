import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import StepCapabilities from '../StepCapabilities';
import type { AssistantBuilderInput } from '../../../lib/assistant/builders';

describe('StepCapabilities Component', () => {
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

  it('should render capability toggles for allowSmallTalk and collectEmail', () => {
    render(
      <StepCapabilities
        data={mockData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    expect(screen.getByLabelText(/small talk/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/collect email/i)).toBeInTheDocument();
  });

  it('should display correct toggle states from data', () => {
    render(
      <StepCapabilities
        data={mockData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    const smallTalkToggle = screen.getByLabelText(/small talk/i) as HTMLInputElement;
    const collectEmailToggle = screen.getByLabelText(/collect email/i) as HTMLInputElement;

    expect(smallTalkToggle.checked).toBe(true);
    expect(collectEmailToggle.checked).toBe(true);
  });

  it('should render tools section with empty state message', () => {
    render(
      <StepCapabilities
        data={mockData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    expect(screen.getByText(/no tools configured/i)).toBeInTheDocument();
  });

  it('should display validation errors when at least one capability is required', () => {
    const errorsWithIssues: Record<string, string[]> = {
      'capabilities': ['At least one capability must be enabled'],
    };

    render(
      <StepCapabilities
        data={mockData}
        onChange={mockOnChange}
        errors={errorsWithIssues}
      />
    );

    expect(screen.getByText('At least one capability must be enabled')).toBeInTheDocument();
  });

  it('should have accessible toggle inputs with proper labels and IDs', () => {
    render(
      <StepCapabilities
        data={mockData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    const smallTalkToggle = screen.getByLabelText(/small talk/i) as HTMLInputElement;
    expect(smallTalkToggle).toHaveAttribute('type', 'checkbox');
    expect(smallTalkToggle.id).toBeDefined();
    expect(smallTalkToggle.id).not.toBe('');

    const collectEmailToggle = screen.getByLabelText(/collect email/i) as HTMLInputElement;
    expect(collectEmailToggle.id).toBeDefined();
  });

  it('should render with both toggles disabled', () => {
    const disabledData: AssistantBuilderInput = {
      ...mockData,
      capabilities: {
        tools: [],
        allowSmallTalk: false,
        collectEmail: false,
      },
    };

    render(
      <StepCapabilities
        data={disabledData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    const smallTalkToggle = screen.getByLabelText(/small talk/i) as HTMLInputElement;
    const collectEmailToggle = screen.getByLabelText(/collect email/i) as HTMLInputElement;

    expect(smallTalkToggle.checked).toBe(false);
    expect(collectEmailToggle.checked).toBe(false);
  });
});
