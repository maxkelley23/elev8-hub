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
    <div>
      {/* Company Name Field */}
      <div>
        <label htmlFor="company-name">Company Name</label>
        <input
          id="company-name"
          type="text"
          value={companyName}
          onChange={handleNameChange}
        />
        {renderErrorMessages('company.name')}
      </div>

      {/* Industry Field */}
      <div>
        <label htmlFor="company-industry">Industry</label>
        <input
          id="company-industry"
          type="text"
          value={industry}
          onChange={handleIndustryChange}
        />
        {renderErrorMessages('company.industry')}
      </div>

      {/* Value Proposition Field */}
      <div>
        <label htmlFor="company-value-prop">Value Proposition</label>
        <input
          id="company-value-prop"
          type="text"
          value={valueProposition}
          onChange={handleValuePropChange}
        />
        <div className="text-gray-500 text-sm">
          {charCount} characters
        </div>
        {renderErrorMessages('company.valueProposition')}
      </div>

      {/* Mission Field */}
      <div>
        <label htmlFor="company-mission">Mission</label>
        <textarea
          id="company-mission"
          value={mission}
          onChange={handleMissionChange}
        />
        {renderErrorMessages('company.mission')}
      </div>
    </div>
  );
}
