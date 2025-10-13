'use client';

import { useState } from 'react';
import type { CampaignMessage, CampaignPlan } from '@/types/campaign';
import { Mail, Linkedin, MessageSquare, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import ExportModal from './ExportModal';

interface CampaignMessageEditorProps {
  messages: CampaignMessage[];
  plan: CampaignPlan;
  campaignTitle?: string;
  intake?: any;
  onSave?: (messages: CampaignMessage[]) => void;
  compliance?: {
    violations: any[];
    warnings: any[];
    status: string;
  };
}

export default function CampaignMessageEditor({
  messages,
  plan,
  campaignTitle,
  intake,
  onSave,
  compliance
}: CampaignMessageEditorProps) {
  const [editedMessages, setEditedMessages] = useState(messages);
  const [activeStep, setActiveStep] = useState(1);
  const [showExportModal, setShowExportModal] = useState(false);

  const activeMessage = editedMessages.find(m => m.step === activeStep);

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

  const updateMessage = (step: number, field: string, value: string) => {
    setEditedMessages(prev =>
      prev.map(msg =>
        msg.step === step ? { ...msg, [field]: value } : msg
      )
    );
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
      {/* Header with Compliance Status */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">Campaign Messages</h2>
            <p className="text-purple-100">
              Review and edit your campaign content
            </p>
          </div>
          {compliance && (
            <div className="flex items-center gap-2">
              {compliance.status === 'clean' ? (
                <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1.5 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Compliant</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1.5 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {compliance.violations.length} Issues
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 p-6">
        {/* Step Sidebar */}
        <div className="col-span-1 space-y-2">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-3">
            Steps
          </div>
          {editedMessages.map((msg, index) => (
            <button
              key={msg.step}
              onClick={() => setActiveStep(msg.step)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                activeStep === msg.step
                  ? 'bg-blue-50 border-2 border-blue-500'
                  : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  activeStep === msg.step
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {msg.step}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-xs">
                  {getChannelIcon(msg.channel)}
                  <span className="font-medium truncate">
                    {msg.channel.charAt(0).toUpperCase() + msg.channel.slice(1)}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Message Editor */}
        <div className="col-span-3">
          {activeMessage && (
            <div className="space-y-4">
              {/* Email Fields */}
              {activeMessage.channel === 'email' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject Line A
                    </label>
                    <input
                      type="text"
                      value={activeMessage.subjectA || ''}
                      onChange={(e) => updateMessage(activeMessage.step, 'subjectA', e.target.value)}
                      maxLength={55}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      {(activeMessage.subjectA?.length || 0)}/55 characters
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject Line B (A/B Test)
                    </label>
                    <input
                      type="text"
                      value={activeMessage.subjectB || ''}
                      onChange={(e) => updateMessage(activeMessage.step, 'subjectB', e.target.value)}
                      maxLength={55}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      {(activeMessage.subjectB?.length || 0)}/55 characters
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preheader Text
                    </label>
                    <input
                      type="text"
                      value={activeMessage.preheader || ''}
                      onChange={(e) => updateMessage(activeMessage.step, 'preheader', e.target.value)}
                      maxLength={90}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      {(activeMessage.preheader?.length || 0)}/90 characters
                    </div>
                  </div>
                </>
              )}

              {/* Body (all channels) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {activeMessage.channel === 'email' ? 'Email Body' :
                   activeMessage.channel === 'linkedin' ? 'LinkedIn Message' :
                   'SMS Message'}
                </label>
                <textarea
                  value={activeMessage.channel === 'sms' && activeMessage.smsBody
                    ? activeMessage.smsBody
                    : activeMessage.body}
                  onChange={(e) => {
                    const field = activeMessage.channel === 'sms' ? 'smsBody' : 'body';
                    updateMessage(activeMessage.step, field, e.target.value);
                  }}
                  rows={activeMessage.channel === 'email' ? 12 : 6}
                  maxLength={activeMessage.channel === 'sms' ? 160 : activeMessage.channel === 'linkedin' ? 300 : 3000}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
                />
                <div className="mt-1 text-xs text-gray-500">
                  {activeMessage.channel === 'sms' && activeMessage.smsBody
                    ? `${activeMessage.smsBody.length}/160 characters`
                    : activeMessage.channel === 'linkedin'
                    ? `${activeMessage.body.length}/300 characters`
                    : `${activeMessage.body.length} characters`}
                </div>
              </div>

              {/* Variables Help */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="text-sm font-medium text-blue-900 mb-2">
                  Available Variables
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-blue-700">
                  <code className="bg-white px-2 py-1 rounded">{'{{recipient.f_name}}'}</code>
                  <code className="bg-white px-2 py-1 rounded">{'{{company.name}}'}</code>
                  <code className="bg-white px-2 py-1 rounded">{'{{sender.name}}'}</code>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compliance Warnings */}
      {compliance && (compliance.violations.length > 0 || compliance.warnings.length > 0) && (
        <div className="p-6 bg-yellow-50 border-t-2 border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            Compliance Issues
          </h3>
          <div className="space-y-2">
            {compliance.violations.map((violation, i) => (
              <div key={i} className="bg-white border-2 border-red-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="text-xs font-semibold text-red-600 uppercase">
                    Step {violation.step}
                  </div>
                  <div className="flex-1 text-sm text-gray-700">{violation.issue}</div>
                </div>
              </div>
            ))}
            {compliance.warnings.map((warning, i) => (
              <div key={i} className="bg-white border-2 border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="text-xs font-semibold text-yellow-600 uppercase">
                    Step {warning.step}
                  </div>
                  <div className="flex-1 text-sm text-gray-700">{warning.issue}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center p-6 bg-gray-50 border-t-2 border-gray-200">
        <div className="text-sm text-gray-500">
          {editedMessages.length} messages ready
        </div>
        <div className="flex gap-3">
          {onSave && (
            <button
              onClick={() => onSave(editedMessages)}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-4 focus:ring-gray-200 font-medium transition-all"
            >
              Save Draft
            </button>
          )}
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-4 focus:ring-purple-200 font-medium transition-all"
          >
            <Download className="w-5 h-5" />
            Export Campaign
          </button>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        plan={plan}
        messages={editedMessages}
        campaignTitle={campaignTitle}
        intake={intake}
      />
    </div>
  );
}
