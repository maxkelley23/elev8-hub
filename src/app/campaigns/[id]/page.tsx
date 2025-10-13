'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Megaphone, ArrowLeft, Edit, Trash2, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import PageHeader from '@/components/shared/PageHeader';
import CampaignPlanPreview from '@/components/campaigns/CampaignPlanPreview';
import CampaignMessageEditor from '@/components/campaigns/CampaignMessageEditor';
import type { CampaignPlan, CampaignMessage } from '@/types/campaign';

interface Campaign {
  id: string;
  title: string;
  segment: string;
  status: string;
  json_spec: {
    intake: any;
    plan: CampaignPlan;
    messages: CampaignMessage[];
    validation?: any;
  };
  created_at: string;
  updated_at: string;
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [view, setView] = useState<'plan' | 'messages'>('plan');

  useEffect(() => {
    loadCampaign();
  }, [campaignId]);

  const loadCampaign = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/campaign/${campaignId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load campaign');
      }

      setCampaign(data.campaign);
    } catch (error) {
      console.error('Error loading campaign:', error);
      toast.error('Failed to load campaign');
      router.push('/campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this campaign? This cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/campaign/${campaignId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete campaign');
      }

      toast.success('Campaign deleted');
      router.push('/campaigns');
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
      setIsDeleting(false);
    }
  };

  const handleSaveMessages = async (editedMessages: CampaignMessage[]) => {
    if (!campaign) return;

    try {
      const updatedCampaign = {
        ...campaign,
        json_spec: {
          ...campaign.json_spec,
          messages: editedMessages,
        },
      };

      const campaignData = {
        id: campaign.id,
        title: campaign.title,
        segment: campaign.segment,
        status: campaign.status,
        intake: campaign.json_spec.intake,
        plan: campaign.json_spec.plan,
        messages: editedMessages,
        validation: campaign.json_spec.validation,
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

      setCampaign(updatedCampaign);
      toast.success('Campaign updated!');
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast.error('Failed to save changes');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'archived':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <div className="text-lg font-medium text-gray-900">Loading campaign...</div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Campaigns
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{campaign.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
                {campaign.status}
              </span>
            </div>
            <div className="text-gray-600">
              {campaign.json_spec.plan.vertical || campaign.segment} • {campaign.json_spec.plan.campaignType?.replace(/-/g, ' ')}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Created {formatDate(campaign.created_at)} • Updated {formatDate(campaign.updated_at)}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 focus:ring-4 focus:ring-red-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
            >
              {isDeleting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 mb-6 border-b-2 border-gray-200">
        <button
          onClick={() => setView('plan')}
          className={`px-4 py-2 font-medium transition-all border-b-2 ${
            view === 'plan'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Campaign Plan
        </button>
        <button
          onClick={() => setView('messages')}
          className={`px-4 py-2 font-medium transition-all border-b-2 ${
            view === 'messages'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Messages ({campaign.json_spec.messages.length})
        </button>
      </div>

      {/* Content */}
      <div>
        {view === 'plan' && (
          <CampaignPlanPreview
            plan={campaign.json_spec.plan}
            onEdit={() => router.push('/campaigns/new')}
            onContinue={() => setView('messages')}
            isGenerating={false}
          />
        )}

        {view === 'messages' && (
          <CampaignMessageEditor
            messages={campaign.json_spec.messages}
            plan={campaign.json_spec.plan}
            campaignTitle={campaign.title}
            intake={campaign.json_spec.intake}
            onSave={handleSaveMessages}
            compliance={campaign.json_spec.validation}
          />
        )}
      </div>
    </div>
  );
}
