'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { Phone } from 'lucide-react';

/**
 * Voice Assistant Builder Wizard Page
 * Multi-step wizard for creating a new voice assistant configuration.
 *
 * Steps:
 * 1. Basics - Company name, industry, value proposition
 * 2. Capabilities - Tools, small talk, email collection
 * 3. Compliance - Disclosures, forbidden topics, escalation
 * 4. Persona - Voice tone, energy, pacing, language
 * 5. Knowledge - FAQs, objection handling, policies
 * 6. Preview - Live prompt and Vapi config preview
 *
 * State Management:
 * - useAssistantWizard hook manages form state and navigation
 * - Live preview updates as user types (via useMemo)
 * - Validates before allowing step advancement
 * - Auto-saves to localStorage for draft persistence
 */
export default function AssistantWizardPage() {
  // TODO: Initialize useAssistantWizard hook
  // const wizard = useAssistantWizard();

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Build Voice Assistant"
        description="Configure your AI voice assistant step by step"
        icon={Phone}
      />

      <div className="mt-8">
        {/* TODO: Render WizardStepper component */}
        {/* <WizardStepper currentStep={wizard.currentStep} completedSteps={wizard.completedSteps} /> */}

        <div className="mt-8 space-y-6">
          {/* TODO: Conditional rendering based on currentStep
          {wizard.currentStep === 'basics' && <StepBasics {...stepProps} />}
          {wizard.currentStep === 'capabilities' && <StepCapabilities {...stepProps} />}
          {wizard.currentStep === 'compliance' && <StepCompliance {...stepProps} />}
          {wizard.currentStep === 'persona' && <StepPersona {...stepProps} />}
          {wizard.currentStep === 'knowledge' && <StepKnowledge {...stepProps} />}
          {wizard.currentStep === 'preview' && <StepPreview {...stepProps} />}
          */}

          {/* TODO: Step navigation buttons */}
          {/* <div className="flex justify-between">
            <Button
              onClick={wizard.goToPreviousStep}
              disabled={wizard.currentStep === 'basics'}
            >
              Previous
            </Button>
            <Button
              onClick={wizard.goToNextStep}
              disabled={wizard.currentStep === 'preview'}
            >
              Next
            </Button>
          </div> */}
        </div>

        {/* TODO: Right sidebar with live preview */}
        {/* <div className="mt-8 lg:mt-0">
          <PromptPreview prompt={wizard.livePreview.prompt} />
          <ConfigPreview config={wizard.livePreview.config} />
        </div> */}
      </div>
    </div>
  );
}
