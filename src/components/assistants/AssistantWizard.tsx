'use client';

import React, { useMemo } from 'react';
import type { AssistantBuilderInput } from '../../lib/assistant/builders';
import { useAssistantWizard } from '../../hooks/useAssistantWizard';
import WizardStepper from './wizard/WizardStepper';
import StepBasics from './wizard/StepBasics';
import StepCapabilities from './wizard/StepCapabilities';
import StepCompliance from './wizard/StepCompliance';
import StepPersona from './wizard/StepPersona';
import StepKnowledge from './wizard/StepKnowledge';
import StepCallFlow from './wizard/StepCallFlow';
import StepPreview from './wizard/StepPreview';

interface AssistantWizardProps {
  onSubmit?: (data: AssistantBuilderInput) => Promise<void>;
  isSubmitting?: boolean;
}

export default function AssistantWizard({ onSubmit, isSubmitting = false }: AssistantWizardProps) {
  const wizard = useAssistantWizard();

  const stepComponents: Record<string, React.ReactNode> = useMemo(
    () => ({
      basics: (
        <StepBasics
          data={wizard.formData}
          onChange={wizard.updateField}
          errors={wizard.errors}
        />
      ),
      capabilities: (
        <StepCapabilities
          data={wizard.formData}
          onChange={wizard.updateField}
          errors={wizard.errors}
        />
      ),
      compliance: (
        <StepCompliance
          data={wizard.formData}
          onChange={wizard.updateField}
          errors={wizard.errors}
        />
      ),
      persona: (
        <StepPersona
          data={wizard.formData}
          onChange={wizard.updateField}
          errors={wizard.errors}
        />
      ),
      knowledge: (
        <StepKnowledge
          data={wizard.formData}
          onChange={wizard.updateField}
          errors={wizard.errors}
        />
      ),
      callflow: (
        <StepCallFlow
          data={wizard.formData}
          onChange={wizard.updateField}
          errors={wizard.errors}
        />
      ),
      preview: (
        <StepPreview
          data={wizard.formData}
          onChange={wizard.updateField}
          errors={wizard.errors}
        />
      ),
    }),
    [wizard.formData, wizard.updateField, wizard.errors]
  );

  const handleSubmit = async () => {
    const result = wizard.submit();
    if (result.success && result.data) {
      if (onSubmit) {
        await onSubmit(result.data);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Build Your Voice Assistant</h1>
          <p className="text-lg text-gray-600">Configure your AI voice assistant step by step. Each section builds on the last to create a complete assistant configuration.</p>
        </div>

        {/* Stepper */}
        <div className="mb-12 bg-white rounded-xl shadow-sm p-8">
          <WizardStepper
            steps={wizard.steps}
            currentStep={wizard.currentStep}
            onStepChange={wizard.goToStep}
          />
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 min-h-[500px] animate-fadeIn">
          {stepComponents[wizard.currentStep]}
        </div>

        {/* Footer with CTA */}
        <div className="flex gap-4 justify-between items-center">
          <div className="text-sm text-gray-600">
            Step {wizard.steps.findIndex(s => s.id === wizard.currentStep) + 1} of {wizard.steps.length}
          </div>
          {wizard.currentStep === 'preview' && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform ${
                isSubmitting
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-lg hover:scale-105'
              }`}
            >
              {isSubmitting ? 'Creating Assistant...' : '✓ Create Assistant'}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
