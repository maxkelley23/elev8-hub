'use client';

import React from 'react';
import type { AssistantBuilderInput } from '../../lib/assistant/builders';

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
    <div>
      {/* Disclosures */}
      <div>
        <label htmlFor="compliance-disclosures">Disclosures</label>
        <textarea
          id="compliance-disclosures"
          value={disclosures}
          onChange={handleDisclosuresChange}
          placeholder="Enter one disclosure per line"
        />
        <div className="text-gray-500 text-sm">
          One disclosure per line
        </div>
        {renderErrorMessages('compliance.disclosures')}
      </div>

      {/* Forbidden Topics */}
      <div>
        <label htmlFor="compliance-forbidden-topics">Forbidden Topics</label>
        <textarea
          id="compliance-forbidden-topics"
          value={forbiddenTopics}
          onChange={handleForbiddenTopicsChange}
          placeholder="Enter one topic per line"
        />
        <div className="text-gray-500 text-sm">
          Topics to avoid discussing (one per line)
        </div>
        {renderErrorMessages('compliance.forbiddenTopics')}
      </div>

      {/* Escalation Triggers */}
      <div>
        <label htmlFor="compliance-escalation-triggers">Escalation Triggers</label>
        <textarea
          id="compliance-escalation-triggers"
          value={escalationTriggers}
          onChange={handleEscalationTriggersChange}
          placeholder="Enter one trigger per line"
        />
        <div className="text-gray-500 text-sm">
          Situations requiring human intervention (one per line)
        </div>
        {renderErrorMessages('compliance.escalationTriggers')}
      </div>

      {/* Handoff Instructions */}
      <div>
        <label htmlFor="compliance-handoff">Handoff Instructions</label>
        <textarea
          id="compliance-handoff"
          value={handoffInstructions}
          onChange={handleHandoffChange}
          placeholder="Instructions for handing off to a human agent"
        />
        {renderErrorMessages('compliance.handoffInstructions')}
      </div>

      {/* Safety Guidelines */}
      <div>
        <label htmlFor="compliance-safety">Safety Guidelines</label>
        <textarea
          id="compliance-safety"
          value={safetyGuidelines}
          onChange={handleSafetyChange}
          placeholder="Safety and professionalism guidelines"
        />
        {renderErrorMessages('compliance.safetyGuidelines')}
      </div>
    </div>
  );
}
