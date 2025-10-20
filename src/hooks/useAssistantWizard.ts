'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { AssistantBuilderInput, AssistantWizardStep, defaultAssistantBuilderInput } from '@/lib/assistant/builders';
import { buildAssistantPrompt, buildVapiAssistantConfig, AssistantBuilderInputSchema } from '@/lib/assistant/builders';
import { VapiAssistantCreatePayload } from '@/types/assistant';

const STEP_ORDER: AssistantWizardStep[] = ['basics', 'capabilities', 'compliance', 'persona', 'knowledge', 'preview'];
const STORAGE_KEY = 'assistant-wizard-draft';

export interface AssistantWizardState {
  currentStep: AssistantWizardStep;
  completedSteps: AssistantWizardStep[];
  formData: AssistantBuilderInput;
  isDirty: boolean;
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

export function useAssistantWizard(): AssistantWizardState & AssistantWizardActions {
  // Load initial state from localStorage or use defaults
  const [currentStep, setCurrentStep] = useState<AssistantWizardStep>('basics');
  const [completedSteps, setCompletedSteps] = useState<AssistantWizardStep[]>([]);
  const [formData, setFormData] = useState<AssistantBuilderInput>(defaultAssistantBuilderInput);
  const [isDirty, setIsDirty] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // Load draft from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        setCurrentStep(draft.currentStep || 'basics');
        setCompletedSteps(draft.completedSteps || []);
        setFormData(draft.formData || defaultAssistantBuilderInput);
        setIsDirty(draft.isDirty || false);
      } catch (err) {
        console.error('Failed to load draft:', err);
      }
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
      // If validation fails, return empty preview
      return { prompt: '', config: {} as VapiAssistantCreatePayload };
    }
  }, [formData]);

  // Update a field using dot notation (e.g., 'company.name')
  const updateField = useCallback((path: string, value: any) => {
    setFormData((prev) => {
      const keys = path.split('.');
      const newData = structuredClone(prev);
      let current: any = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;

      return newData;
    });
    setIsDirty(true);
  }, []);

  // Validate a specific step
  const validateStep = useCallback(
    (step: AssistantWizardStep): boolean => {
      try {
        // Per-step validation logic
        if (step === 'basics') {
          const { company } = formData;
          if (!company.name || company.name.trim().length < 1) {
            setValidationErrors({ basics: ['Company name is required'] });
            return false;
          }
        }

        // Add more step validations as needed
        setValidationErrors((prev) => {
          const next = { ...prev };
          delete next[step];
          return next;
        });
        return true;
      } catch (err) {
        setValidationErrors({ [step]: [(err as Error).message] });
        return false;
      }
    },
    [formData]
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
