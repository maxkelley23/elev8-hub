'use client';

import React from 'react';
import type { AssistantBuilderInput } from '@/lib/assistant/builders';

interface StepBasicsProps {
  data: AssistantBuilderInput;
  onChange: (path: string, value: string) => void;
  errors: Record<string, string[]>;
}

export default function StepBasics({ data, onChange, errors }: StepBasicsProps) {
  const companyName = data.company?.name || '';
  const industry = data.company?.industry || '';
  const valueProposition = data.company?.valueProposition || '';
  const mission = data.company?.mission || '';

  const charCount = valueProposition.length;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('company.name', e.target.value);
  };

  const handleIndustryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('company.industry', e.target.value);
  };

  const handleValuePropChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('company.valueProposition', e.target.value);
  };

  const handleMissionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange('company.mission', e.target.value);
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Information</h2>
        <p className="text-gray-600 mb-6">Tell us about your company and what makes it unique.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Name Field */}
        <div className="flex flex-col">
          <label htmlFor="company-name" className="text-sm font-semibold text-gray-700 mb-2">
            Company Name *
          </label>
          <input
            id="company-name"
            type="text"
            placeholder="e.g., Acme Corp"
            value={companyName}
            onChange={handleNameChange}
            className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200"
          />
          {renderErrorMessages('company.name') && (
            <div className="mt-2 space-y-1">
              {renderErrorMessages('company.name')}
            </div>
          )}
        </div>

        {/* Industry Field */}
        <div className="flex flex-col">
          <label htmlFor="company-industry" className="text-sm font-semibold text-gray-700 mb-2">
            Industry *
          </label>
          <input
            id="company-industry"
            type="text"
            placeholder="e.g., Technology, Finance, Healthcare"
            value={industry}
            onChange={handleIndustryChange}
            className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200"
          />
          {renderErrorMessages('company.industry') && (
            <div className="mt-2 space-y-1">
              {renderErrorMessages('company.industry')}
            </div>
          )}
        </div>
      </div>

      {/* Value Proposition Field */}
      <div className="flex flex-col">
        <label htmlFor="company-value-prop" className="text-sm font-semibold text-gray-700 mb-2">
          Value Proposition *
        </label>
        <input
          id="company-value-prop"
          type="text"
          placeholder="What unique value do you provide to customers?"
          value={valueProposition}
          onChange={handleValuePropChange}
          className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200"
        />
        <div className="flex justify-between items-center mt-2">
          <span className={`text-xs font-medium ${charCount > 200 ? 'text-orange-600' : 'text-gray-500'}`}>
            {charCount} characters
          </span>
        </div>
        {renderErrorMessages('company.valueProposition') && (
          <div className="mt-2 space-y-1">
            {renderErrorMessages('company.valueProposition')}
          </div>
        )}
      </div>

      {/* Mission Field */}
      <div className="flex flex-col">
        <label htmlFor="company-mission" className="text-sm font-semibold text-gray-700 mb-2">
          Mission Statement *
        </label>
        <textarea
          id="company-mission"
          placeholder="Describe your company's mission and long-term goals..."
          value={mission}
          onChange={handleMissionChange}
          rows={4}
          className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none"
        />
        {renderErrorMessages('company.mission') && (
          <div className="mt-2 space-y-1">
            {renderErrorMessages('company.mission')}
          </div>
        )}
      </div>
    </div>
  );
}
