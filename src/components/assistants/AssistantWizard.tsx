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
    <div className="max-w-6xl mx-auto p-6">
      <h1>AI Assistant Configuration Wizard</h1>

      <div className="mt-8">
        <WizardStepper
          steps={wizard.steps}
          currentStep={wizard.currentStep}
          onStepChange={wizard.goToStep}
        />
      </div>

      <div className="mt-8 min-h-96">
        {stepComponents[wizard.currentStep]}
      </div>

      <div className="mt-8 flex gap-4 justify-end">
        {wizard.currentStep === 'preview' && (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-8 py-3 rounded font-medium transition-colors ${
              isSubmitting
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isSubmitting ? 'Creating...' : 'Create Assistant'}
          </button>
        )}
      </div>
    </div>
  );
}
