'use client';

import React, { useMemo } from 'react';
import { useAssistantWizard } from '../../hooks/useAssistantWizard';
import WizardStepper from './wizard/WizardStepper';
import StepBasics from './wizard/StepBasics';
import StepCapabilities from './wizard/StepCapabilities';
import StepCompliance from './wizard/StepCompliance';
import StepPersona from './wizard/StepPersona';
import StepKnowledge from './wizard/StepKnowledge';
import StepPreview from './wizard/StepPreview';

export default function AssistantWizard() {
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

  const handleSubmit = () => {
    const result = wizard.submit();
    if (result.success) {
      console.log('Wizard completed with data:', result.data);
      // TODO: Handle successful submission (API call, redirect, etc.)
    } else {
      console.log('Validation errors:', wizard.errors);
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
            className="px-8 py-3 bg-green-600 text-white rounded font-medium hover:bg-green-700"
          >
            Create Assistant
          </button>
        )}
      </div>
    </div>
  );
}
