'use client';

import { useState } from 'react';
import { X, Download, FileText, Linkedin, FileJson, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { CampaignPlan, CampaignMessage } from '@/types/campaign';
import {
  generateInstantlyCSV,
  generateLinkedInCSV,
  generateJSONBackup,
  downloadFile,
  generateFilename,
  validateForExport,
  extractVariables,
} from '@/lib/campaign/export';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: CampaignPlan;
  messages: CampaignMessage[];
  campaignTitle?: string;
  intake?: any;
}

export default function ExportModal({
  isOpen,
  onClose,
  plan,
  messages,
  campaignTitle = 'campaign',
  intake,
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'instantly' | 'linkedin' | 'json'>('instantly');

  if (!isOpen) return null;

  const handleExport = () => {
    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      if (selectedFormat === 'instantly') {
        // Validate
        const validation = validateForExport(messages, 'instantly');
        if (!validation.valid) {
          toast.error(`Export validation failed: ${validation.errors[0]}`);
          return;
        }

        content = generateInstantlyCSV(messages);
        filename = generateFilename(`instantly-${campaignTitle}`, 'csv');
        mimeType = 'text/csv';
      } else if (selectedFormat === 'linkedin') {
        // Validate
        const validation = validateForExport(messages, 'linkedin');
        if (!validation.valid) {
          toast.error(`Export validation failed: ${validation.errors[0]}`);
          return;
        }

        content = generateLinkedInCSV(messages, plan);
        filename = generateFilename(`linkedin-${campaignTitle}`, 'csv');
        mimeType = 'text/csv';
      } else {
        // JSON backup
        content = generateJSONBackup({
          plan,
          messages,
          intake,
          metadata: {
            title: campaignTitle,
            exportedAt: new Date().toISOString(),
          },
        });
        filename = generateFilename(`backup-${campaignTitle}`, 'json');
        mimeType = 'application/json';
      }

      downloadFile(content, filename, mimeType);
      toast.success(`Campaign exported as ${filename}`);
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to export campaign');
    }
  };

  // Get variables used in campaign
  const variables = extractVariables(messages);

  // Count messages by channel
  const emailCount = messages.filter(m => m.channel === 'email').length;
  const linkedinCount = messages.filter(m => m.channel === 'linkedin').length;
  const smsCount = messages.filter(m => m.channel === 'sms').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b-2 border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Export Campaign</h2>
                <p className="text-sm text-gray-600">Choose your export format</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Campaign Summary */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="text-sm font-medium text-blue-900 mb-2">Campaign Summary</div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-blue-600 font-medium">Email Steps</div>
                  <div className="text-blue-900 font-bold">{emailCount}</div>
                </div>
                <div>
                  <div className="text-blue-600 font-medium">LinkedIn Steps</div>
                  <div className="text-blue-900 font-bold">{linkedinCount}</div>
                </div>
                <div>
                  <div className="text-blue-600 font-medium">SMS Steps</div>
                  <div className="text-blue-900 font-bold">{smsCount}</div>
                </div>
              </div>
            </div>

            {/* Export Format Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Export Format
              </label>

              {/* Instantly.ai */}
              <button
                onClick={() => setSelectedFormat('instantly')}
                disabled={emailCount === 0}
                className={`w-full flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left ${
                  selectedFormat === 'instantly'
                    ? 'border-blue-500 bg-blue-50'
                    : emailCount === 0
                    ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  selectedFormat === 'instantly' ? 'bg-blue-500' : 'bg-gray-200'
                }`}>
                  <FileText className={`w-5 h-5 ${
                    selectedFormat === 'instantly' ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Instantly.ai CSV</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Ready-to-import format for Instantly.ai with email sequences
                  </div>
                  {emailCount === 0 && (
                    <div className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      No email messages in campaign
                    </div>
                  )}
                </div>
              </button>

              {/* LinkedIn */}
              <button
                onClick={() => setSelectedFormat('linkedin')}
                disabled={linkedinCount === 0}
                className={`w-full flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left ${
                  selectedFormat === 'linkedin'
                    ? 'border-blue-500 bg-blue-50'
                    : linkedinCount === 0
                    ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  selectedFormat === 'linkedin' ? 'bg-blue-500' : 'bg-gray-200'
                }`}>
                  <Linkedin className={`w-5 h-5 ${
                    selectedFormat === 'linkedin' ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">LinkedIn CSV</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Compatible with LinkedIn Sales Navigator, Expandi, or Dripify
                  </div>
                  {linkedinCount === 0 && (
                    <div className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      No LinkedIn messages in campaign
                    </div>
                  )}
                </div>
              </button>

              {/* JSON Backup */}
              <button
                onClick={() => setSelectedFormat('json')}
                className={`w-full flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left ${
                  selectedFormat === 'json'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  selectedFormat === 'json' ? 'bg-blue-500' : 'bg-gray-200'
                }`}>
                  <FileJson className={`w-5 h-5 ${
                    selectedFormat === 'json' ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">JSON Backup</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Complete campaign backup including plan, messages, and metadata
                  </div>
                </div>
              </button>
            </div>

            {/* Variables Info */}
            {variables.length > 0 && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                <div className="text-sm font-medium text-yellow-900 mb-2">
                  Variables in Campaign
                </div>
                <div className="flex flex-wrap gap-2">
                  {variables.map((variable) => (
                    <code
                      key={variable}
                      className="px-2 py-1 bg-white border border-yellow-300 rounded text-xs text-yellow-900"
                    >
                      {'{{'}{variable}{'}}'}
                    </code>
                  ))}
                </div>
                <div className="text-xs text-yellow-700 mt-2">
                  Make sure your CSV includes columns for these variables
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t-2 border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={
                (selectedFormat === 'instantly' && emailCount === 0) ||
                (selectedFormat === 'linkedin' && linkedinCount === 0)
              }
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-4 focus:ring-purple-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
            >
              <Download className="w-5 h-5" />
              Export Campaign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
