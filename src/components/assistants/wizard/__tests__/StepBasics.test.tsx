import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import StepBasics from '../StepBasics';
import type { AssistantBuilderInput } from '../../../lib/assistant/builders';

describe('StepBasics Component', () => {
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

  it('should render all 4 company fields with labels', () => {
    render(
      <StepBasics
        data={mockData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/industry/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/value proposition/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mission/i)).toBeInTheDocument();
  });

  it('should populate fields with provided data', () => {
    render(
      <StepBasics
        data={mockData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    expect(screen.getByDisplayValue('Acme Corp')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Technology')).toBeInTheDocument();
    expect(screen.getByDisplayValue('We build amazing products')).toBeInTheDocument();
    expect(screen.getByDisplayValue('To revolutionize the industry')).toBeInTheDocument();
  });

  it('should display character count for value proposition field', () => {
    render(
      <StepBasics
        data={mockData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    // "We build amazing products" is 25 characters
    expect(screen.getByText(/25\s*characters/i)).toBeInTheDocument();
  });

  it('should display validation errors when provided', () => {
    const errorsWithIssues: Record<string, string[]> = {
      'company.name': ['Company name is required'],
      'company.industry': ['Industry is required'],
    };

    render(
      <StepBasics
        data={mockData}
        onChange={mockOnChange}
        errors={errorsWithIssues}
      />
    );

    expect(screen.getByText('Company name is required')).toBeInTheDocument();
    expect(screen.getByText('Industry is required')).toBeInTheDocument();
  });

  it('should have accessible form inputs with proper labels and IDs', () => {
    render(
      <StepBasics
        data={mockData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    const nameInput = screen.getByLabelText(/company name/i) as HTMLInputElement;
    expect(nameInput).toHaveAttribute('type', 'text');
    expect(nameInput.id).toBeDefined();
    expect(nameInput.id).not.toBe('');

    const industryInput = screen.getByLabelText(/industry/i) as HTMLInputElement;
    expect(industryInput.id).toBeDefined();

    const missionInput = screen.getByLabelText(/mission/i) as HTMLTextAreaElement;
    expect(missionInput.id).toBeDefined();
  });

  it('should render field hints or descriptions', () => {
    render(
      <StepBasics
        data={mockData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    // Check for helper text/hints that guide users
    expect(screen.getByText(/company name/i)).toBeInTheDocument();
  });

  it('should have empty fields when data is empty', () => {
    const emptyData: AssistantBuilderInput = {
      ...mockData,
      company: {
        name: '',
        industry: '',
        valueProposition: '',
        mission: '',
      },
    };

    render(
      <StepBasics
        data={emptyData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    expect((screen.getByLabelText(/company name/i) as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText(/industry/i) as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText(/value proposition/i) as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText(/mission/i) as HTMLTextAreaElement).value).toBe('');
  });

  it('should display multiple errors for the same field', () => {
    const multiErrors: Record<string, string[]> = {
      'company.name': ['Company name is required', 'Company name must be at least 2 characters'],
    };

    render(
      <StepBasics
        data={mockData}
        onChange={mockOnChange}
        errors={multiErrors}
      />
    );

    expect(screen.getByText('Company name is required')).toBeInTheDocument();
    expect(screen.getByText('Company name must be at least 2 characters')).toBeInTheDocument();
  });
});
