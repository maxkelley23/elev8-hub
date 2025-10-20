'use client';

import React from 'react';
import type { AssistantBuilderInput } from '@/lib/assistant/builders';

interface StepComplianceProps {
  data: AssistantBuilderInput;
  onChange: (path: string, value: any) => void;
  errors: Record<string, string[]>;
}

export default function StepCompliance({ data, onChange, errors }: StepComplianceProps) {
  const disclosures = data.compliance?.disclosures?.join('\n') ?? '';
  const forbiddenTopics = data.compliance?.forbiddenTopics?.join('\n') ?? '';
  const escalationTriggers = data.compliance?.escalationTriggers?.join('\n') ?? '';
  const handoffInstructions = data.compliance?.handoffInstructions ?? '';
  const safetyGuidelines = data.compliance?.safetyGuidelines ?? '';

  const handleDisclosuresChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const lines = e.target.value
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => line.trim());
    onChange('compliance.disclosures', lines);
  };

  const handleForbiddenTopicsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const lines = e.target.value
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => line.trim());
    onChange('compliance.forbiddenTopics', lines);
  };

  const handleEscalationTriggersChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const lines = e.target.value
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => line.trim());
    onChange('compliance.escalationTriggers', lines);
  };

  const handleHandoffChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange('compliance.handoffInstructions', e.target.value);
  };

  const handleSafetyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange('compliance.safetyGuidelines', e.target.value);
  };

  const getErrorsForField = (fieldPath: string): string[] => {
    return errors[fieldPath] || [];
  };

  const renderErrorMessages = (fieldPath: string) => {
    const fieldErrors = getErrorsForField(fieldPath);
    if (fieldErrors.length === 0) return null;

    return (
      <div>
        {fieldErrors.map((error, idx) => (
          <div key={idx} className="text-red-600 text-sm">
            {error}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Compliance & Safety</h2>
        <p className="text-gray-600 mb-6">Define guardrails, disclosures, and safety guidelines for your assistant.</p>
      </div>

      {/* Disclosures */}
      <div className="flex flex-col">
        <label htmlFor="compliance-disclosures" className="text-sm font-semibold text-gray-700 mb-2">
          Required Disclosures
        </label>
        <textarea
          id="compliance-disclosures"
          value={disclosures}
          onChange={handleDisclosuresChange}
          placeholder="Enter one disclosure per line (e.g., 'This is an AI assistant')"
          rows={3}
          className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none"
        />
        <p className="text-xs text-gray-500 mt-2">
          One disclosure per line - statements that must be shared with callers
        </p>
        {renderErrorMessages('compliance.disclosures')}
      </div>

      {/* Forbidden Topics */}
      <div className="flex flex-col">
        <label htmlFor="compliance-forbidden-topics" className="text-sm font-semibold text-gray-700 mb-2">
          Forbidden Topics
        </label>
        <textarea
          id="compliance-forbidden-topics"
          value={forbiddenTopics}
          onChange={handleForbiddenTopicsChange}
          placeholder="Enter one topic per line (e.g., 'Legal advice', 'Medical diagnosis')"
          rows={3}
          className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none"
        />
        <p className="text-xs text-gray-500 mt-2">
          Topics the assistant should decline to discuss
        </p>
        {renderErrorMessages('compliance.forbiddenTopics')}
      </div>

      {/* Escalation Triggers */}
      <div className="flex flex-col">
        <label htmlFor="compliance-escalation-triggers" className="text-sm font-semibold text-gray-700 mb-2">
          Escalation Triggers
        </label>
        <textarea
          id="compliance-escalation-triggers"
          value={escalationTriggers}
          onChange={handleEscalationTriggersChange}
          placeholder="Enter one trigger per line (e.g., 'Customer asks to speak to human', 'Complaint detected')"
          rows={3}
          className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none"
        />
        <p className="text-xs text-gray-500 mt-2">
          Situations that should trigger escalation to a human
        </p>
        {renderErrorMessages('compliance.escalationTriggers')}
      </div>

      {/* Handoff Instructions */}
      <div className="flex flex-col">
        <label htmlFor="compliance-handoff" className="text-sm font-semibold text-gray-700 mb-2">
          Handoff Instructions
        </label>
        <textarea
          id="compliance-handoff"
          value={handoffInstructions}
          onChange={handleHandoffChange}
          placeholder="How should the assistant hand off to a human agent? Be specific about tone and context."
          rows={3}
          className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none"
        />
        {renderErrorMessages('compliance.handoffInstructions')}
      </div>

      {/* Safety Guidelines */}
      <div className="flex flex-col">
        <label htmlFor="compliance-safety" className="text-sm font-semibold text-gray-700 mb-2">
          Safety Guidelines
        </label>
        <textarea
          id="compliance-safety"
          value={safetyGuidelines}
          onChange={handleSafetyChange}
          placeholder="General safety and professionalism guidelines for your assistant behavior"
          rows={4}
          className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none"
        />
        {renderErrorMessages('compliance.safetyGuidelines')}
      </div>
    </div>
  );
}
