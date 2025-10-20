import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import StepKnowledge from '../StepKnowledge';
import type { AssistantBuilderInput } from '../../../lib/assistant/builders';

describe('StepKnowledge Component', () => {
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
      faqs: [
        { question: 'What is your name?', answer: 'I am an AI assistant' },
        { question: 'How can I help?', answer: 'I can answer questions' },
      ],
      objectionHandling: [
        { objection: 'Too expensive', response: 'Let me explain the value' },
      ],
      policies: ['Return within 30 days', 'Free shipping on orders over $50'],
    },
    objective: 'book_qualified_meeting',
    operations: {
      hoursOfOperation: '24/7',
      timezone: 'UTC',
    },
  };

  const mockOnChange = vi.fn();
  const mockErrors: Record<string, string[]> = {};

  it('should render all knowledge base sections', () => {
    render(
      <StepKnowledge
        data={mockData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    expect(screen.getByText(/faqs/i)).toBeInTheDocument();
    expect(screen.getByText(/objection handling/i)).toBeInTheDocument();
    expect(screen.getByText(/policies/i)).toBeInTheDocument();
  });

  it('should display FAQ items from data', () => {
    render(
      <StepKnowledge
        data={mockData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    expect(screen.getByDisplayValue('What is your name?')).toBeInTheDocument();
    expect(screen.getByDisplayValue('I am an AI assistant')).toBeInTheDocument();
  });

  it('should display objection handling items from data', () => {
    render(
      <StepKnowledge
        data={mockData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    expect(screen.getByDisplayValue('Too expensive')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Let me explain the value')).toBeInTheDocument();
  });

  it('should display validation errors for knowledge base', () => {
    const errorsWithIssues: Record<string, string[]> = {
      'knowledgeBase.faqs': ['At least one FAQ is recommended'],
    };

    render(
      <StepKnowledge
        data={mockData}
        onChange={mockOnChange}
        errors={errorsWithIssues}
      />
    );

    expect(screen.getByText('At least one FAQ is recommended')).toBeInTheDocument();
  });

  it('should handle empty knowledge base data', () => {
    const emptyData: AssistantBuilderInput = {
      ...mockData,
      knowledgeBase: {
        faqs: [],
        objectionHandling: [],
        policies: [],
      },
    };

    render(
      <StepKnowledge
        data={emptyData}
        onChange={mockOnChange}
        errors={mockErrors}
      />
    );

    expect(screen.getByText(/no faqs added yet/i)).toBeInTheDocument();
    expect(screen.getByText(/no objection handling added yet/i)).toBeInTheDocument();
  });
});
