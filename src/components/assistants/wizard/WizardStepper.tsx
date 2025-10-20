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
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              {/* Step Circle */}
              <button
                onClick={() => handleStepClick(step.id)}
                className={`relative flex flex-col items-center transition-all duration-200 ${
                  step.id === currentStep ? 'scale-110' : ''
                }`}
                aria-current={step.id === currentStep ? 'step' : undefined}
                aria-label={`Step ${index + 1}: ${step.label}${step.completed ? ' (completed)' : ''}`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                    step.id === currentStep
                      ? 'bg-blue-600 text-white shadow-lg'
                      : step.completed
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.completed ? <span>✓</span> : index + 1}
                </div>
                <span className={`text-xs font-medium mt-2 text-center max-w-xs ${
                  step.id === currentStep ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {step.label}
                </span>
              </button>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 transition-colors duration-200 ${
                  steps.slice(0, index + 1).every(s => s.completed)
                    ? 'bg-green-500'
                    : index < currentIndex
                      ? 'bg-blue-600'
                      : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 justify-between pt-6 border-t border-gray-100">
        <button
          onClick={handlePrev}
          disabled={!canGoPrev}
          className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
            canGoPrev
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          }`}
        >
          ← Previous
        </button>

        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
            canGoNext
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-blue-300 text-white cursor-not-allowed'
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
