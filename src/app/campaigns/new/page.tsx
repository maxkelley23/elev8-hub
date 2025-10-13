'use client';

import { useState } from 'react';
import { Megaphone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/shared/PageHeader';
import CampaignIntakeForm from '@/components/campaigns/CampaignIntakeForm';
import CampaignPlanPreview from '@/components/campaigns/CampaignPlanPreview';
import CampaignMessageEditor from '@/components/campaigns/CampaignMessageEditor';
import AIGenerationProgress from '@/components/campaigns/AIGenerationProgress';
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
    if (!plan || !intake) {
      toast.error('No campaign data to save');
      return;
    }

    try {
      // Generate a title from the intake request (first 50 chars)
      const title = intake.request.substring(0, 50) + (intake.request.length > 50 ? '...' : '');

      // Create the complete campaign object
      const campaignData = {
        title,
        segment: intake.vertical || plan.vertical || 'general',
        status: 'draft' as const,
        intake,
        plan,
        messages: editedMessages,
        validation: compliance,
      };

      const response = await fetch('/api/campaign/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save campaign');
      }

      setMessages(editedMessages);
      toast.success('Campaign saved to database!');
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save campaign');
    }
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
              <div className="font-medium text-gray-900">Campaign Request</div>
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
              <div className="font-medium text-gray-900">Review Plan</div>
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
              <div className="font-medium text-gray-900">Edit Messages</div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Step Content */}
      <div className="mt-8">
        {currentStep === 'intake' && !isGeneratingPlan && (
          <div className="max-w-3xl mx-auto bg-white rounded-xl border-2 border-gray-200 p-8">
            <CampaignIntakeForm
              onSubmit={handleIntakeSubmit}
              isLoading={isGeneratingPlan}
            />
          </div>
        )}

        {currentStep === 'intake' && isGeneratingPlan && (
          <AIGenerationProgress type="plan" />
        )}

        {currentStep === 'plan' && plan && !isGeneratingMessages && (
          <CampaignPlanPreview
            plan={plan}
            onEdit={() => setCurrentStep('intake')}
            onContinue={handleContinueToMessages}
            isGenerating={isGeneratingMessages}
          />
        )}

        {currentStep === 'messages' && messages.length > 0 && plan && intake && (
          <CampaignMessageEditor
            messages={messages}
            plan={plan}
            campaignTitle={intake.request.substring(0, 50) + (intake.request.length > 50 ? '...' : '')}
            intake={intake}
            onSave={handleSaveDraft}
            compliance={compliance}
          />
        )}

        {currentStep === 'messages' && messages.length === 0 && isGeneratingMessages && (
          <AIGenerationProgress type="messages" />
        )}
      </div>
    </div>
  );
}
