'use client';

import React from 'react';
import type { AssistantBuilderInput } from '@/lib/assistant/builders';

interface StepCapabilitiesProps {
  data: AssistantBuilderInput;
  onChange: (path: string, value: any) => void;
  errors: Record<string, string[]>;
}

export default function StepCapabilities({ data, onChange, errors }: StepCapabilitiesProps) {
  const allowSmallTalk = data.capabilities?.allowSmallTalk ?? true;
  const collectEmail = data.capabilities?.collectEmail ?? true;
  const tools = data.capabilities?.tools ?? [];

  const handleSmallTalkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('capabilities.allowSmallTalk', e.target.checked);
  };

  const handleCollectEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('capabilities.collectEmail', e.target.checked);
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
      {/* Capability Toggles */}
      <div>
        <label htmlFor="allow-small-talk">
          <input
            id="allow-small-talk"
            type="checkbox"
            checked={allowSmallTalk}
            onChange={handleSmallTalkChange}
          />
          Allow Small Talk
        </label>
      </div>

      <div>
        <label htmlFor="collect-email">
          <input
            id="collect-email"
            type="checkbox"
            checked={collectEmail}
            onChange={handleCollectEmailChange}
          />
          Collect Email
        </label>
      </div>

      {/* Tools Section */}
      <div>
        <label>Tools</label>
        {tools.length === 0 ? (
          <div className="text-gray-500 text-sm">
            No tools configured yet
          </div>
        ) : (
          <ul>
            {tools.map((tool, idx) => (
              <li key={idx}>{tool.name}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Error Messages */}
      {renderErrorMessages('capabilities')}
    </div>
  );
}
