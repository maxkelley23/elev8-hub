'use client';

import React from 'react';

export interface StepDefinition {
  id: string;
  label: string;
  completed: boolean;
}

interface WizardStepperProps {
  steps: StepDefinition[];
  currentStep: string;
  onStepChange: (stepId: string) => void;
}

export default function WizardStepper({
  steps,
  currentStep,
  onStepChange,
}: WizardStepperProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < steps.length - 1;

  const handleStepClick = (stepId: string) => {
    onStepChange(stepId);
  };

  const handlePrev = () => {
    if (canGoPrev) {
      onStepChange(steps[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onStepChange(steps[currentIndex + 1].id);
    }
  };

  return (
    <div>
      {/* Step Indicators */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => handleStepClick(step.id)}
            className={`px-4 py-2 rounded font-medium text-sm ${
              step.id === currentStep
                ? 'bg-blue-600 text-white'
                : step.completed
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-200 text-gray-700'
            }`}
            aria-current={step.id === currentStep ? 'step' : undefined}
            aria-label={`Step ${index + 1}: ${step.label}${step.completed ? ' (completed)' : ''}`}
          >
            {step.completed && <span>✓ </span>}
            {step.label}
          </button>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 justify-between mt-6">
        <button
          onClick={handlePrev}
          disabled={!canGoPrev}
          className={`px-6 py-2 rounded font-medium ${
            canGoPrev
              ? 'bg-gray-600 text-white hover:bg-gray-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Previous
        </button>

        <div className="text-sm text-gray-600">
          Step {currentIndex + 1} of {steps.length}
        </div>

        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className={`px-6 py-2 rounded font-medium ${
            canGoNext
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-blue-300 text-white cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
