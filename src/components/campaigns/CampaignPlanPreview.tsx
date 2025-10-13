'use client';

import type { CampaignPlan } from '@/types/campaign';
import { Mail, Linkedin, MessageSquare, Clock, TrendingUp } from 'lucide-react';

interface CampaignPlanPreviewProps {
  plan: CampaignPlan;
  onEdit?: () => void;
  onContinue?: () => void;
  isGenerating?: boolean;
}

export default function CampaignPlanPreview({
  plan,
  onEdit,
  onContinue,
  isGenerating
}: CampaignPlanPreviewProps) {
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4" />;
      case 'sms':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'email':
        return 'bg-blue-100 text-blue-700';
      case 'linkedin':
        return 'bg-indigo-100 text-indigo-700';
      case 'sms':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Campaign Plan</h2>
        <p className="text-blue-100">
          {plan.totalTouches} touches over {plan.totalDays} days
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 border-b-2 border-gray-200">
        <div>
          <div className="text-xs text-gray-500 uppercase mb-1">Vertical</div>
          <div className="font-semibold text-gray-900">
            {plan.vertical || 'General'}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase mb-1">Type</div>
          <div className="font-semibold text-gray-900">
            {plan.campaignType?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Custom'}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase mb-1">Cadence</div>
          <div className="font-semibold text-gray-900">
            {plan.cadence ? plan.cadence.charAt(0).toUpperCase() + plan.cadence.slice(1) : 'Balanced'}
          </div>
        </div>
      </div>

      {/* Steps Timeline */}
      <div className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-500" />
          Campaign Timeline
        </h3>
        <div className="space-y-3">
          {plan.steps.map((step, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 rounded-lg border-2 border-gray-100 hover:border-blue-200 transition-colors"
            >
              {/* Step Number & Timing */}
              <div className="flex-shrink-0 w-16 text-center">
                <div className="text-2xl font-bold text-gray-300">{step.n}</div>
                <div className="text-xs text-gray-500">Day {step.delay}</div>
              </div>

              {/* Channel Badge */}
              <div className="flex-shrink-0">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${getChannelColor(step.channel)}`}>
                  {getChannelIcon(step.channel)}
                  {step.channel.charAt(0).toUpperCase() + step.channel.slice(1)}
                </span>
              </div>

              {/* Purpose & Reasoning */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 mb-1">
                  {step.purpose.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                {step.reasoning && (
                  <div className="text-sm text-gray-600">{step.reasoning}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reasoning */}
      {plan.reasoning && (
        <div className="p-6 bg-blue-50 border-t-2 border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Strategy Reasoning
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">{plan.reasoning}</p>
        </div>
      )}

      {/* Actions */}
      {(onEdit || onContinue) && (
        <div className="flex justify-between items-center p-6 bg-gray-50 border-t-2 border-gray-200">
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              disabled={isGenerating}
            >
              ← Edit Request
            </button>
          )}
          {onContinue && (
            <button
              onClick={onContinue}
              disabled={isGenerating}
              className="ml-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
            >
              {isGenerating ? 'Generating Messages...' : 'Continue to Messages →'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
