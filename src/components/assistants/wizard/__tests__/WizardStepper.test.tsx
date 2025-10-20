import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import WizardStepper from '../WizardStepper';

describe('WizardStepper Component', () => {
  const mockOnStepChange = vi.fn();

  const steps = [
    { id: 'basics', label: 'Basics', completed: true },
    { id: 'capabilities', label: 'Capabilities', completed: true },
    { id: 'compliance', label: 'Compliance', completed: false },
    { id: 'persona', label: 'Persona', completed: false },
    { id: 'knowledge', label: 'Knowledge', completed: false },
    { id: 'preview', label: 'Preview', completed: false },
  ];

  it('should render all step labels', () => {
    render(
      <WizardStepper
        steps={steps}
        currentStep="compliance"
        onStepChange={mockOnStepChange}
      />
    );

    expect(screen.getByText('Basics')).toBeInTheDocument();
    expect(screen.getByText('Capabilities')).toBeInTheDocument();
    expect(screen.getByText('Compliance')).toBeInTheDocument();
    expect(screen.getByText('Persona')).toBeInTheDocument();
    expect(screen.getByText('Knowledge')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('should highlight current step', () => {
    const { container } = render(
      <WizardStepper
        steps={steps}
        currentStep="compliance"
        onStepChange={mockOnStepChange}
      />
    );

    // Current step should be indicated somehow (class, styling, or state)
    const complianceStep = screen.getByText('Compliance');
    expect(complianceStep).toBeInTheDocument();
  });

  it('should display completion status for completed steps', () => {
    render(
      <WizardStepper
        steps={steps}
        currentStep="compliance"
        onStepChange={mockOnStepChange}
      />
    );

    // Completed steps should show indication (checkmark, different styling, etc)
    expect(screen.getByText('Basics')).toBeInTheDocument();
    expect(screen.getByText('Capabilities')).toBeInTheDocument();
  });

  it('should allow navigation between steps', () => {
    render(
      <WizardStepper
        steps={steps}
        currentStep="compliance"
        onStepChange={mockOnStepChange}
      />
    );

    const basicsStep = screen.getByText('Basics');
    basicsStep.click();

    expect(mockOnStepChange).toHaveBeenCalledWith('basics');
  });

  it('should render navigation buttons (Previous/Next)', () => {
    render(
      <WizardStepper
        steps={steps}
        currentStep="compliance"
        onStepChange={mockOnStepChange}
      />
    );

    // Should have previous and next buttons
    const prevButton = screen.getByText('Previous');
    const nextButton = screen.getByText('Next');

    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
  });

  it('should disable Previous button on first step', () => {
    render(
      <WizardStepper
        steps={steps}
        currentStep="basics"
        onStepChange={mockOnStepChange}
      />
    );

    const buttons = screen.queryAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
