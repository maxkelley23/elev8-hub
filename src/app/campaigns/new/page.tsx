'use client';

import { useState } from 'react';
import { Megaphone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/shared/PageHeader';
import CampaignIntakeForm from '@/components/campaigns/CampaignIntakeForm';
import CampaignPlanPreview from '@/components/campaigns/CampaignPlanPreview';
import CampaignMessageEditor from '@/components/campaigns/CampaignMessageEditor';
import type { CampaignIntake, CampaignPlan, CampaignMessage } from '@/types/campaign';

type WorkflowStep = 'intake' | 'plan' | 'messages' | 'export';

export default function NewCampaignPage() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('intake');
  const [intake, setIntake] = useState<CampaignIntake | null>(null);
  const [plan, setPlan] = useState<CampaignPlan | null>(null);
  const [messages, setMessages] = useState<CampaignMessage[]>([]);
  const [compliance, setCompliance] = useState<any>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isGeneratingMessages, setIsGeneratingMessages] = useState(false);

  // =====================================================
  // Step 1: Generate Plan from Intake
  // =====================================================
  const handleIntakeSubmit = async (intakeData: CampaignIntake) => {
    setIntake(intakeData);
    setIsGeneratingPlan(true);

    try {
      const response = await fetch('/api/campaign/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(intakeData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate plan');
      }

      setPlan(data.plan);
      setCurrentStep('plan');
      toast.success('Campaign plan generated!');
    } catch (error) {
      console.error('Error generating plan:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate plan');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // =====================================================
  // Step 2: Generate Messages from Plan
  // =====================================================
  const handleContinueToMessages = async () => {
    if (!plan || !intake) return;

    setIsGeneratingMessages(true);
    setCurrentStep('messages');

    try {
      const response = await fetch('/api/campaign/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          context: {
            targetAudience: intake.audience,
            emphasize: intake.emphasize,
            avoid: intake.avoid,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate messages');
      }

      setMessages(data.messages);
      setCompliance(data.compliance);
      toast.success('Campaign messages generated!');
    } catch (error) {
      console.error('Error generating messages:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate messages');
    } finally {
      setIsGeneratingMessages(false);
    }
  };

  // =====================================================
  // Step 3: Save Campaign
  // =====================================================
  const handleSaveDraft = async (editedMessages: CampaignMessage[]) => {
    try {
      // TODO: Save to Supabase
      setMessages(editedMessages);
      toast.success('Campaign saved as draft');
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast.error('Failed to save campaign');
    }
  };

  // =====================================================
  // Step 4: Export Campaign
  // =====================================================
  const handleExport = () => {
    if (!messages || messages.length === 0 || !plan) {
      toast.error('No campaign to export');
      return;
    }

    // Create export data
    const exportData = {
      plan,
      messages,
      metadata: {
        generatedAt: new Date().toISOString(),
        vertical: intake?.vertical,
        campaignType: plan.campaignType,
      },
    };

    // Download as JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Campaign exported!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="AI Campaign Generator"
        description="Create personalized multi-touch campaigns in minutes"
        icon={Megaphone}
        iconColor="bg-blue-500"
      />

      {/* Workflow Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {/* Step 1: Intake */}
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              currentStep === 'intake'
                ? 'bg-blue-500 text-white'
                : 'bg-green-500 text-white'
            }`}>
              1
            </div>
            <div className="ml-3 text-sm">
              <div className="font-medium">Campaign Request</div>
            </div>
          </div>

          <div className="flex-1 h-1 mx-4 bg-gray-200">
            <div className={`h-full bg-blue-500 transition-all ${
              currentStep !== 'intake' ? 'w-full' : 'w-0'
            }`} />
          </div>

          {/* Step 2: Plan */}
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              currentStep === 'plan'
                ? 'bg-blue-500 text-white'
                : currentStep === 'messages' || currentStep === 'export'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-400'
            }`}>
              {isGeneratingPlan ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                '2'
              )}
            </div>
            <div className="ml-3 text-sm">
              <div className="font-medium">Review Plan</div>
            </div>
          </div>

          <div className="flex-1 h-1 mx-4 bg-gray-200">
            <div className={`h-full bg-blue-500 transition-all ${
              currentStep === 'messages' || currentStep === 'export' ? 'w-full' : 'w-0'
            }`} />
          </div>

          {/* Step 3: Messages */}
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              currentStep === 'messages' || currentStep === 'export'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-400'
            }`}>
              {isGeneratingMessages ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                '3'
              )}
            </div>
            <div className="ml-3 text-sm">
              <div className="font-medium">Edit Messages</div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Step Content */}
      <div className="mt-8">
        {currentStep === 'intake' && (
          <div className="max-w-3xl mx-auto bg-white rounded-xl border-2 border-gray-200 p-8">
            <CampaignIntakeForm
              onSubmit={handleIntakeSubmit}
              isLoading={isGeneratingPlan}
            />
          </div>
        )}

        {currentStep === 'plan' && plan && (
          <CampaignPlanPreview
            plan={plan}
            onEdit={() => setCurrentStep('intake')}
            onContinue={handleContinueToMessages}
            isGenerating={isGeneratingMessages}
          />
        )}

        {currentStep === 'messages' && messages.length > 0 && (
          <CampaignMessageEditor
            messages={messages}
            onSave={handleSaveDraft}
            onExport={handleExport}
            compliance={compliance}
          />
        )}

        {currentStep === 'messages' && messages.length === 0 && isGeneratingMessages && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <div className="text-lg font-medium text-gray-900">
              Generating campaign messages...
            </div>
            <div className="text-sm text-gray-500 mt-2">
              This may take 15-30 seconds
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
