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
    <div>
      <h2>Preview</h2>

      {/* Company Summary */}
      <div className="mb-6 border rounded p-4">
        <h3>Company Information</h3>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="font-semibold">Name</dt>
            <dd>{data.company?.name || 'Not provided'}</dd>
          </div>
          <div>
            <dt className="font-semibold">Industry</dt>
            <dd>{data.company?.industry || 'Not provided'}</dd>
          </div>
          <div>
            <dt className="font-semibold">Value Proposition</dt>
            <dd>{data.company?.valueProposition || 'Not provided'}</dd>
          </div>
          <div>
            <dt className="font-semibold">Mission</dt>
            <dd>{data.company?.mission || 'Not provided'}</dd>
          </div>
        </dl>
      </div>

      {/* Persona Summary */}
      <div className="mb-6 border rounded p-4">
        <h3>Persona</h3>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="font-semibold">Voice</dt>
            <dd>{data.persona?.voice || 'Not provided'}</dd>
          </div>
          <div>
            <dt className="font-semibold">Energy</dt>
            <dd>{data.persona?.energy || 'Not provided'}</dd>
          </div>
          <div>
            <dt className="font-semibold">Pacing</dt>
            <dd>{data.persona?.pacing || 'Not provided'}</dd>
          </div>
          <div>
            <dt className="font-semibold">Languages</dt>
            <dd>{data.persona?.language?.join(', ') || 'Not provided'}</dd>
          </div>
        </dl>
      </div>

      {/* Capabilities Summary */}
      <div className="mb-6 border rounded p-4">
        <h3>Capabilities</h3>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="font-semibold">Small Talk</dt>
            <dd>{data.capabilities?.allowSmallTalk ? 'Enabled' : 'Disabled'}</dd>
          </div>
          <div>
            <dt className="font-semibold">Collect Email</dt>
            <dd>{data.capabilities?.collectEmail ? 'Enabled' : 'Disabled'}</dd>
          </div>
          <div>
            <dt className="font-semibold">Tools</dt>
            <dd>{data.capabilities?.tools?.length || 0} configured</dd>
          </div>
        </dl>
      </div>

      {/* Generated Prompt Preview */}
      <div className="mb-6 border rounded p-4 bg-gray-50">
        <h3>Generated System Prompt</h3>
        <pre className="text-xs whitespace-pre-wrap font-mono max-h-64 overflow-auto">
          {prompt}
        </pre>
      </div>
    </div>
  );
}
