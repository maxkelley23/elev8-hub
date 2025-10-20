'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/shared/PageHeader';
import { Phone } from 'lucide-react';
import AssistantWizard from '@/components/assistants/AssistantWizard';
import { toast } from 'sonner';

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
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWizardSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/assistants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create assistant');
      }

      const result = await response.json();
      toast.success('Assistant created successfully!');
      router.push(`/assistants/${result.id}`);
    } catch (error) {
      console.error('Error creating assistant:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create assistant');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Build Voice Assistant"
        description="Configure your AI voice assistant step by step"
        icon={Phone}
      />

      <div className="mt-8">
        <AssistantWizard onSubmit={handleWizardSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
