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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Assistant Capabilities</h2>
        <p className="text-gray-600 mb-6">Select which features your assistant should have.</p>
      </div>

      {/* Capability Toggles */}
      <div className="space-y-4">
        {/* Small Talk Toggle */}
        <div className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
          <input
            id="allow-small-talk"
            type="checkbox"
            checked={allowSmallTalk}
            onChange={handleSmallTalkChange}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
          <div className="ml-4 flex-1">
            <label htmlFor="allow-small-talk" className="text-sm font-semibold text-gray-900 cursor-pointer">
              Allow Small Talk
            </label>
            <p className="text-xs text-gray-600 mt-1">
              Enable conversational interactions beyond the primary task
            </p>
          </div>
        </div>

        {/* Email Collection Toggle */}
        <div className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
          <input
            id="collect-email"
            type="checkbox"
            checked={collectEmail}
            onChange={handleCollectEmailChange}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
          <div className="ml-4 flex-1">
            <label htmlFor="collect-email" className="text-sm font-semibold text-gray-900 cursor-pointer">
              Collect Email Addresses
            </label>
            <p className="text-xs text-gray-600 mt-1">
              Allow the assistant to request and collect email addresses
            </p>
          </div>
        </div>
      </div>

      {/* Tools Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Connected Tools</h3>
        {tools.length === 0 ? (
          <div className="p-4 rounded-lg bg-gray-50 border border-dashed border-gray-300">
            <p className="text-gray-600 text-sm">No tools configured yet</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {tools.map((tool, idx) => (
              <li key={idx} className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-sm font-medium text-gray-900">
                {tool.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Error Messages */}
      {renderErrorMessages('capabilities') && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          {renderErrorMessages('capabilities')}
        </div>
      )}
    </div>
  );
}
