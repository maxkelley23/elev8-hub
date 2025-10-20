import { useState, useCallback } from 'react';
import {
  AssistantBuilderInputSchema,
  defaultAssistantBuilderInput,
  type AssistantBuilderInput,
} from '@/lib/assistant/builders';
import { z } from 'zod';

interface WizardStep {
  id: string;
  label: string;
  completed: boolean;
}

interface ValidationErrors {
  [key: string]: string[];
}

const WIZARD_STEPS: WizardStep[] = [
  { id: 'basics', label: 'Basics', completed: false },
  { id: 'capabilities', label: 'Capabilities', completed: false },
  { id: 'compliance', label: 'Compliance', completed: false },
  { id: 'persona', label: 'Persona', completed: false },
  { id: 'knowledge', label: 'Knowledge', completed: false },
  { id: 'preview', label: 'Preview', completed: false },
];

export function useAssistantWizard(initialData?: Partial<AssistantBuilderInput>) {
  const [formData, setFormData] = useState<AssistantBuilderInput>(
    initialData ? { ...defaultAssistantBuilderInput, ...initialData } : defaultAssistantBuilderInput
  );
  const [currentStep, setCurrentStep] = useState<string>('basics');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [steps, setSteps] = useState<WizardStep[]>(WIZARD_STEPS);

  const updateField = useCallback((path: string, value: any) => {
    setFormData((prev) => {
      const keys = path.split('.');
      const updated = { ...prev };
      let current: any = updated;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        current[key] = { ...current[key] };
        current = current[key];
      }

      current[keys[keys.length - 1]] = value;
      return updated;
    });

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[path];
      return newErrors;
    });
  }, []);

  const validateAll = useCallback((): boolean => {
    try {
      AssistantBuilderInputSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: ValidationErrors = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!newErrors[path]) {
            newErrors[path] = [];
          }
          newErrors[path].push(err.message);
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [formData]);

  const validateStep = useCallback((stepId: string): boolean => {
    const isValid = validateAll();
    return isValid;
  }, [validateAll]);

  const goToStep = useCallback((stepId: string) => {
    if (validateStep(currentStep)) {
      setCurrentStep(stepId);
    }
  }, [currentStep, validateStep]);

  const markStepCompleted = useCallback((stepId: string) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === stepId ? { ...step, completed: true } : step))
    );
  }, []);

  const goNext = useCallback(() => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    if (currentIndex < steps.length - 1) {
      markStepCompleted(currentStep);
      setCurrentStep(steps[currentIndex + 1].id);
    }
  }, [currentStep, steps, markStepCompleted]);

  const goPrev = useCallback(() => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  }, [currentStep, steps]);

  const submit = useCallback((): { success: boolean; data?: AssistantBuilderInput } => {
    if (validateAll()) {
      return { success: true, data: formData };
    }
    return { success: false };
  }, [formData, validateAll]);

  const reset = useCallback(() => {
    setFormData(defaultAssistantBuilderInput);
    setCurrentStep('basics');
    setErrors({});
    setSteps(WIZARD_STEPS);
  }, []);

  return {
    formData,
    currentStep,
    errors,
    steps,
    updateField,
    validateStep,
    validateAll,
    goToStep,
    goNext,
    goPrev,
    markStepCompleted,
    submit,
    reset,
  };
}
