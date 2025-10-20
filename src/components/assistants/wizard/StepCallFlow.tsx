'use client';

import React, { useState } from 'react';
import type { AssistantBuilderInput } from '@/lib/assistant/builders';

interface StepCallFlowProps {
  data: AssistantBuilderInput;
  onChange: (path: string, value: any) => void;
  errors: Record<string, string[]>;
}

export default function StepCallFlow({ data, onChange, errors }: StepCallFlowProps) {
  const callFlow = data.callFlow || { type: 'structured', outline: [], description: '' };
  const [showAddStep, setShowAddStep] = useState(false);
  const [newStep, setNewStep] = useState('');

  const handleTypeChange = (newType: 'structured' | 'freeform') => {
    onChange('callFlow.type', newType);
  };

  const handleAddStep = () => {
    if (newStep.trim()) {
      const updatedOutline = [...(callFlow.outline || []), newStep.trim()];
      onChange('callFlow.outline', updatedOutline);
      setNewStep('');
      setShowAddStep(false);
    }
  };

  const handleRemoveStep = (idx: number) => {
    const updatedOutline = callFlow.outline?.filter((_, i) => i !== idx) || [];
    onChange('callFlow.outline', updatedOutline);
  };

  const handleUpdateStep = (idx: number, value: string) => {
    const updatedOutline = [...(callFlow.outline || [])];
    updatedOutline[idx] = value;
    onChange('callFlow.outline', updatedOutline);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange('callFlow.description', e.target.value);
  };

  const getErrorsForField = (fieldPath: string): string[] => {
    return errors[fieldPath] || [];
  };

  const renderErrorMessages = (fieldPath: string) => {
    const fieldErrors = getErrorsForField(fieldPath);
    if (fieldErrors.length === 0) return null;

    return (
      <div className="space-y-1">
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Call Flow Configuration</h2>
        <p className="text-gray-600 mb-6">Choose whether your assistant should follow a strict outline or adapt naturally to each call.</p>
      </div>

      {/* Flow Type Selection */}
      <div className="space-y-4">
        {/* Structured Flow */}
        <div
          onClick={() => handleTypeChange('structured')}
          className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
            callFlow.type === 'structured'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              callFlow.type === 'structured' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
            }`}>
              {callFlow.type === 'structured' && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Structured Flow</h3>
              <p className="text-sm text-gray-600">
                The assistant follows a strict outline of steps, keeping conversations on track and ensuring all key points are covered.
              </p>
            </div>
          </div>
        </div>

        {/* Freeform Flow */}
        <div
          onClick={() => handleTypeChange('freeform')}
          className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
            callFlow.type === 'freeform'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              callFlow.type === 'freeform' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
            }`}>
              {callFlow.type === 'freeform' && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Freeform Flow</h3>
              <p className="text-sm text-gray-600">
                The assistant follows general directions naturally, adapting to each caller's needs and conversational style for a more human-like experience.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Flow Details */}
      {callFlow.type === 'structured' && (
        <div className="space-y-4 p-6 rounded-lg bg-blue-50 border border-blue-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Define Call Steps</h3>
            <p className="text-sm text-gray-600 mb-4">
              Add the steps the assistant should follow in order. Leave empty to use default steps.
            </p>
          </div>

          {/* Steps List */}
          {callFlow.outline && callFlow.outline.length > 0 && (
            <div className="space-y-3 mb-4">
              {callFlow.outline.map((step, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-white border border-gray-200 hover:border-blue-300 transition-colors">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={step}
                        onChange={(e) => handleUpdateStep(idx, e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none text-sm"
                        rows={2}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      className="px-3 py-2 rounded text-sm bg-red-100 text-red-700 hover:bg-red-200 transition-colors font-medium flex-shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Step Form */}
          {showAddStep && (
            <div className="p-4 rounded-lg bg-white border border-blue-300 space-y-3">
              <textarea
                value={newStep}
                onChange={(e) => setNewStep(e.target.value)}
                placeholder="Describe what the assistant should do in this step..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                  Add Step
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddStep(false);
                    setNewStep('');
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!showAddStep && (
            <button
              type="button"
              onClick={() => setShowAddStep(true)}
              className="w-full px-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 transition-colors"
            >
              + Add Step
            </button>
          )}
        </div>
      )}

      {callFlow.type === 'freeform' && (
        <div className="space-y-4 p-6 rounded-lg bg-green-50 border border-green-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">General Directions</h3>
            <p className="text-sm text-gray-600 mb-4">
              Provide general guidance that the assistant should follow, but with flexibility to adapt to the conversation.
            </p>
          </div>

          <textarea
            value={callFlow.description || ''}
            onChange={handleDescriptionChange}
            placeholder="Example: 'Listen to what the customer needs, answer questions about our services, and try to schedule a demo if they're interested. Feel free to have a natural conversation.'"
            rows={5}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 transition-all duration-200 resize-none"
          />
          <p className="text-xs text-gray-600 italic">
            These directions will guide the assistant's behavior while maintaining natural conversation flow.
          </p>
        </div>
      )}

      {/* Error Messages */}
      {renderErrorMessages('callFlow')}
    </div>
  );
}
