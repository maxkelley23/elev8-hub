'use client';

import React from 'react';
import { buildAssistantPrompt } from '@/lib/assistant/builders';
import type { AssistantBuilderInput } from '@/lib/assistant/builders';

interface StepPreviewProps {
  data: AssistantBuilderInput;
  onChange: (path: string, value: any) => void;
  errors: Record<string, string[]>;
}

export default function StepPreview({ data, onChange, errors }: StepPreviewProps) {
  const prompt = buildAssistantPrompt(data);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Create</h2>
        <p className="text-gray-600 mb-6">Review your assistant configuration and the generated system prompt below.</p>
      </div>

      {/* Company Summary */}
      <div className="rounded-lg border border-gray-200 p-6 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Name</dt>
            <dd className="mt-1 text-gray-900">{data.company?.name || <span className="text-gray-400 italic">Not provided</span>}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Industry</dt>
            <dd className="mt-1 text-gray-900">{data.company?.industry || <span className="text-gray-400 italic">Not provided</span>}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Value Proposition</dt>
            <dd className="mt-1 text-gray-900">{data.company?.valueProposition || <span className="text-gray-400 italic">Not provided</span>}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Mission</dt>
            <dd className="mt-1 text-gray-900">{data.company?.mission || <span className="text-gray-400 italic">Not provided</span>}</dd>
          </div>
        </dl>
      </div>

      {/* Persona Summary */}
      <div className="rounded-lg border border-gray-200 p-6 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice & Personality</h3>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Voice</dt>
            <dd className="mt-1 text-gray-900">{data.persona?.voice?.replace(/_/g, ' ') || 'Not provided'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Energy</dt>
            <dd className="mt-1 text-gray-900 capitalize">{data.persona?.energy || 'Not provided'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Pacing</dt>
            <dd className="mt-1 text-gray-900 capitalize">{data.persona?.pacing || 'Not provided'}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Languages</dt>
            <dd className="mt-1 text-gray-900">{data.persona?.language?.join(', ') || 'Not provided'}</dd>
          </div>
        </dl>
      </div>

      {/* Capabilities Summary */}
      <div className="rounded-lg border border-gray-200 p-6 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Capabilities</h3>
        <dl className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Small Talk</dt>
            <dd className="mt-1">
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                data.capabilities?.allowSmallTalk
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {data.capabilities?.allowSmallTalk ? '✓ Enabled' : '✗ Disabled'}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email Collection</dt>
            <dd className="mt-1">
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                data.capabilities?.collectEmail
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {data.capabilities?.collectEmail ? '✓ Enabled' : '✗ Disabled'}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Tools</dt>
            <dd className="mt-1 text-gray-900 font-semibold">{data.capabilities?.tools?.length || 0}</dd>
          </div>
        </dl>
      </div>

      {/* Generated Prompt Preview */}
      <div className="rounded-lg border border-gray-200 p-6 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated System Prompt</h3>
        <div className="bg-white rounded border border-gray-200 p-4 overflow-auto max-h-80">
          <pre className="text-xs whitespace-pre-wrap font-mono text-gray-700 leading-relaxed">
            {prompt}
          </pre>
        </div>
      </div>
    </div>
  );
}
