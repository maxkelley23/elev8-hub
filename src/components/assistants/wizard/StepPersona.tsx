'use client';

import React from 'react';
import type { AssistantBuilderInput } from '../../lib/assistant/builders';

interface StepPersonaProps {
  data: AssistantBuilderInput;
  onChange: (path: string, value: any) => void;
  errors: Record<string, string[]>;
}

export default function StepPersona({ data, onChange, errors }: StepPersonaProps) {
  const voice = data.persona?.voice ?? 'confident_warm';
  const energy = data.persona?.energy ?? 'medium';
  const pacing = data.persona?.pacing ?? 'moderate';
  const language = data.persona?.language ?? ['en-US'];
  const fillerPreference = data.persona?.fillerPreference ?? 'brief';

  const voiceOptions = ['confident_warm', 'friendly_casual', 'professional_formal', 'supportive_compassionate'];
  const energyOptions = ['low', 'medium', 'high'];
  const pacingOptions = ['slow', 'moderate', 'fast'];
  const fillerOptions = ['none', 'brief', 'detailed'];

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange('persona.voice', e.target.value);
  };

  const handleEnergyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange('persona.energy', e.target.value);
  };

  const handlePacingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange('persona.pacing', e.target.value);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const languages = e.target.value.split('\n').filter(lang => lang.trim());
    onChange('persona.language', languages.length > 0 ? languages : ['en-US']);
  };

  const handleFillerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange('persona.fillerPreference', e.target.value);
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
      {/* Voice */}
      <div>
        <label htmlFor="persona-voice">Voice</label>
        <select id="persona-voice" value={voice} onChange={handleVoiceChange}>
          {voiceOptions.map((option) => (
            <option key={option} value={option}>
              {option.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        {renderErrorMessages('persona.voice')}
      </div>

      {/* Energy */}
      <div>
        <label htmlFor="persona-energy">Energy</label>
        <select id="persona-energy" value={energy} onChange={handleEnergyChange}>
          {energyOptions.map((option) => (
            <option key={option} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>
        {renderErrorMessages('persona.energy')}
      </div>

      {/* Pacing */}
      <div>
        <label htmlFor="persona-pacing">Pacing</label>
        <select id="persona-pacing" value={pacing} onChange={handlePacingChange}>
          {pacingOptions.map((option) => (
            <option key={option} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>
        {renderErrorMessages('persona.pacing')}
      </div>

      {/* Language */}
      <div>
        <label htmlFor="persona-language">Language</label>
        <textarea
          id="persona-language"
          value={language.join('\n')}
          onChange={handleLanguageChange}
          placeholder="Enter language codes (e.g., en-US, es-ES) one per line"
        />
        <div className="text-gray-500 text-sm">
          Language codes (one per line, e.g., en-US, es-ES)
        </div>
        {renderErrorMessages('persona.language')}
      </div>

      {/* Filler Preference */}
      <div>
        <label htmlFor="persona-filler">Filler Preference</label>
        <select id="persona-filler" value={fillerPreference} onChange={handleFillerChange}>
          {fillerOptions.map((option) => (
            <option key={option} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>
        {renderErrorMessages('persona.fillerPreference')}
      </div>
    </div>
  );
}
