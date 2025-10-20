'use client';

import React from 'react';
import type { AssistantBuilderInput } from '@/lib/assistant/builders';

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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Voice & Personality</h2>
        <p className="text-gray-600 mb-6">Define the voice characteristics and personality of your assistant.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Voice */}
        <div className="flex flex-col">
          <label htmlFor="persona-voice" className="text-sm font-semibold text-gray-700 mb-2">
            Voice Type *
          </label>
          <select id="persona-voice" value={voice} onChange={handleVoiceChange} className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200">
            {voiceOptions.map((option) => (
              <option key={option} value={option}>
                {option.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </option>
            ))}
          </select>
          {renderErrorMessages('persona.voice')}
        </div>

        {/* Energy */}
        <div className="flex flex-col">
          <label htmlFor="persona-energy" className="text-sm font-semibold text-gray-700 mb-2">
            Energy Level *
          </label>
          <select id="persona-energy" value={energy} onChange={handleEnergyChange} className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200">
            {energyOptions.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
          {renderErrorMessages('persona.energy')}
        </div>

        {/* Pacing */}
        <div className="flex flex-col">
          <label htmlFor="persona-pacing" className="text-sm font-semibold text-gray-700 mb-2">
            Speaking Pace *
          </label>
          <select id="persona-pacing" value={pacing} onChange={handlePacingChange} className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200">
            {pacingOptions.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
          {renderErrorMessages('persona.pacing')}
        </div>

        {/* Filler Preference */}
        <div className="flex flex-col">
          <label htmlFor="persona-filler" className="text-sm font-semibold text-gray-700 mb-2">
            Filler Words *
          </label>
          <select id="persona-filler" value={fillerPreference} onChange={handleFillerChange} className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200">
            {fillerOptions.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
          {renderErrorMessages('persona.fillerPreference')}
        </div>
      </div>

      {/* Language */}
      <div className="flex flex-col">
        <label htmlFor="persona-language" className="text-sm font-semibold text-gray-700 mb-2">
          Languages (one per line) *
        </label>
        <textarea
          id="persona-language"
          value={language.join('\n')}
          onChange={handleLanguageChange}
          placeholder="e.g., en-US, es-ES, fr-FR"
          rows={3}
          className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none"
        />
        <p className="text-xs text-gray-500 mt-2">
          Use standard language codes (e.g., en-US for English, es-ES for Spanish)
        </p>
        {renderErrorMessages('persona.language')}
      </div>
    </div>
  );
}
