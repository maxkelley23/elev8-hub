'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { AssistantBuilderInput, AssistantWizardStep, defaultAssistantBuilderInput } from '@/lib/assistant/builders';
import { buildAssistantPrompt, buildVapiAssistantConfig, AssistantBuilderInputSchema } from '@/lib/assistant/builders';
import { VapiAssistantCreatePayload } from '@/types/assistant';

const STEP_ORDER: AssistantWizardStep[] = ['basics', 'capabilities', 'compliance', 'persona', 'knowledge', 'preview'];
const STORAGE_KEY = 'assistant-wizard-draft';

/**
 * Creates a valid empty Vapi config when validation fails
 * Prevents unsafe type casting of empty objects
 */
function createEmptyVapiConfig(): VapiAssistantCreatePayload {
  return {
    assistant: {
      name: 'Incomplete Configuration',
      firstMessage: '',
      model: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        temperature: 0.6,
      },
      voice: {
        provider: 'vapi',
        voiceId: 'alloy',
      },
      transcriber: {
        provider: 'deepgram',
        model: 'nova-2',
      },
      functions: [],
      silenceTimeoutSeconds: 15,
      maxDurationSeconds: 600,
    },
    metadata: {},
  };
}

export interface AssistantWizardState {
  currentStep: AssistantWizardStep;
  completedSteps: AssistantWizardStep[];
  formData: AssistantBuilderInput;
  isDirty: boolean;
  isHydrated: boolean; // Indicates if localStorage has been loaded
  validationErrors: Record<string, string[]>;
  livePreview: {
    prompt: string;
    config: VapiAssistantCreatePayload;
  };
}

export interface AssistantWizardActions {
  updateField: (path: string, value: any) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: AssistantWizardStep) => void;
  validateStep: (step: AssistantWizardStep) => boolean;
  resetForm: () => void;
  clearDraft: () => void;
  exportConfig: () => {
    builderInput: AssistantBuilderInput;
    generatedPrompt: string;
    vapiConfig: VapiAssistantCreatePayload;
    exportedAt: string;
  };
  isComplete: () => boolean;
  getProgressPercentage: () => number;
}

/**
 * useAssistantWizard - Complete state management for the 6-step wizard
 *
 * Features:
 * - Form state with nested field updates via dot notation
 * - Per-step validation with error tracking
 * - localStorage persistence for draft auto-save
 * - Live preview generation (prompt + Vapi config) via useMemo
 * - Step navigation with completion tracking
 *
 * Hydration:
 * - isHydrated flag indicates localStorage has loaded
 * - Prevents render flash when loading saved draft
 *
 * Note: For lazy initialization optimization, remove localStorage loading
 * from useEffect and defer to first field update instead.
 */
export function useAssistantWizard(): AssistantWizardState & AssistantWizardActions {
  // Load initial state from localStorage or use defaults
  const [currentStep, setCurrentStep] = useState<AssistantWizardStep>('basics');
  const [completedSteps, setCompletedSteps] = useState<AssistantWizardStep[]>([]);
  const [formData, setFormData] = useState<AssistantBuilderInput>(defaultAssistantBuilderInput);
  const [isDirty, setIsDirty] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false); // Track if localStorage loaded
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const hasLoadedDraft = useRef(false); // Prevent multiple loads

  // Load draft from localStorage on mount (once only)
  useEffect(() => {
    if (hasLoadedDraft.current) return; // Prevent double-loading
    hasLoadedDraft.current = true;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        setCurrentStep(draft.currentStep || 'basics');
        setCompletedSteps(draft.completedSteps || []);
        setFormData(draft.formData || defaultAssistantBuilderInput);
        setIsDirty(draft.isDirty || false);
      }
    } catch (err) {
      console.error('Failed to load draft:', err);
    } finally {
      setIsHydrated(true); // Mark as ready, even if load failed
    }
  }, []);

  // Save draft to localStorage whenever state changes
  useEffect(() => {
    if (isDirty) {
      const draft = {
        currentStep,
        completedSteps,
        formData,
        isDirty,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    }
  }, [currentStep, completedSteps, formData, isDirty]);

  // Live preview generation (memoized for performance)
  const livePreview = useMemo(() => {
    try {
      const validated = AssistantBuilderInputSchema.parse(formData);
      const prompt = buildAssistantPrompt(validated);
      const config = buildVapiAssistantConfig(validated, prompt);
      return { prompt, config };
    } catch (err) {
      // If validation fails, return safe empty preview
      return { prompt: '', config: createEmptyVapiConfig() };
    }
  }, [formData]);

  // Update a field using dot notation (e.g., 'company.name')
  // Safely creates intermediate objects if they don't exist
  const updateField = useCallback((path: string, value: any) => {
    setFormData((prev) => {
      const keys = path.split('.');
      const newData = structuredClone(prev);
      let current: any = newData;

      // Safely traverse/create path
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        // Create intermediate object if it doesn't exist or is null/undefined
        if (!(key in current) || current[key] === null || current[key] === undefined) {
          current[key] = {};
        }
        current = current[key];
      }

      // Set final value
      current[keys[keys.length - 1]] = value;
      return newData;
    });
    setIsDirty(true);
  }, []);

  // Validate a specific step - implements validation for all 6 steps
  const validateStep = useCallback(
    (step: AssistantWizardStep): boolean => {
      const errors: string[] = [];

      try {
        if (step === 'basics') {
          if (!formData.company.name || formData.company.name.trim().length === 0) {
            errors.push('Company name is required');
          }
        }

        if (step === 'capabilities') {
          // At least one tool or capability should be defined
          if (
            formData.capabilities.tools.length === 0 &&
            !formData.capabilities.allowSmallTalk &&
            !formData.capabilities.collectEmail
          ) {
            errors.push('At least one capability must be enabled (tools, small talk, or email collection)');
          }
        }

        if (step === 'compliance') {
          // At least one disclosure should be present
          if (formData.compliance.disclosures.length === 0) {
            errors.push('At least one disclosure is required');
          }
        }

        if (step === 'persona') {
          // Persona is always valid (has defaults)
          if (formData.persona.language.length === 0) {
            errors.push('At least one language must be selected');
          }
        }

        if (step === 'knowledge') {
          // Knowledge base is optional but if FAQs exist, they must be valid
          if (formData.knowledgeBase.faqs.length > 0) {
            const invalidFaq = formData.knowledgeBase.faqs.some((faq) => !faq.question || !faq.answer);
            if (invalidFaq) {
              errors.push('All FAQs must have both question and answer');
            }
          }
        }

        if (step === 'preview') {
          // Preview is valid if we have generated valid prompt and config
          if (livePreview.prompt.length === 0) {
            errors.push('Unable to generate preview. Check form for errors.');
          }
        }

        // Update errors or clear them
        if (errors.length > 0) {
          setValidationErrors((prev) => ({ ...prev, [step]: errors }));
          return false;
        } else {
          setValidationErrors((prev) => {
            const next = { ...prev };
            delete next[step];
            return next;
          });
          return true;
        }
      } catch (err) {
        setValidationErrors({ [step]: [(err as Error).message] });
        return false;
      }
    },
    [formData, livePreview]
  );

  // Navigate to next step
  const goToNextStep = useCallback(() => {
    if (!validateStep(currentStep)) return;

    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex < STEP_ORDER.length - 1) {
      setCompletedSteps((prev) => [...new Set([...prev, currentStep])]);
      setCurrentStep(STEP_ORDER[currentIndex + 1]);
    }
  }, [currentStep, validateStep]);

  // Navigate to previous step
  const goToPreviousStep = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEP_ORDER[currentIndex - 1]);
    }
  }, [currentStep]);

  // Jump to a specific step (only if completed or current)
  const goToStep = useCallback(
    (step: AssistantWizardStep) => {
      if (completedSteps.includes(step) || step === currentStep) {
        setCurrentStep(step);
      }
    },
    [completedSteps, currentStep]
  );

  // Reset form to defaults
  const resetForm = useCallback(() => {
    setCurrentStep('basics');
    setCompletedSteps([]);
    setFormData(defaultAssistantBuilderInput);
    setIsDirty(false);
    setValidationErrors({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Clear draft without resetting
  const clearDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setIsDirty(false);
  }, []);

  // Export current configuration
  const exportConfig = useCallback(() => {
    const prompt = livePreview.prompt;
    const config = livePreview.config;
    return {
      builderInput: formData,
      generatedPrompt: prompt,
      vapiConfig: config,
      exportedAt: new Date().toISOString(),
    };
  }, [formData, livePreview]);

  // Check if wizard is complete
  const isComplete = useCallback(() => {
    // Wizard is complete if user is on preview step and preview is valid
    return currentStep === 'preview' && livePreview.prompt.length > 0;
  }, [currentStep, livePreview]);

  // Calculate progress percentage
  const getProgressPercentage = useCallback(() => {
    const stepsCompleted = completedSteps.length;
    return Math.round((stepsCompleted / STEP_ORDER.length) * 100);
  }, [completedSteps]);

  return {
    // State
    currentStep,
    completedSteps,
    formData,
    isDirty,
    isHydrated, // Indicates localStorage has been loaded
    validationErrors,
    livePreview,

    // Actions
    updateField,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    validateStep,
    resetForm,
    clearDraft,
    exportConfig,
    isComplete,
    getProgressPercentage,
  };
}
