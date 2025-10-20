'use client';

import React, { useState } from 'react';
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

  const [showAddTool, setShowAddTool] = useState(false);
  const [editingToolIndex, setEditingToolIndex] = useState<number | null>(null);
  const [toolForm, setToolForm] = useState({
    name: '',
    description: '',
  });

  const handleSmallTalkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('capabilities.allowSmallTalk', e.target.checked);
  };

  const handleCollectEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('capabilities.collectEmail', e.target.checked);
  };

  const handleAddTool = () => {
    if (toolForm.name.trim() && toolForm.description.trim()) {
      if (editingToolIndex !== null) {
        // Edit existing tool
        const updatedTools = [...tools];
        updatedTools[editingToolIndex] = {
          name: toolForm.name,
          description: toolForm.description,
          parameters: {
            type: 'object',
            required: [],
            properties: {},
          },
        };
        onChange('capabilities.tools', updatedTools);
        setEditingToolIndex(null);
      } else {
        // Add new tool
        const newTool = {
          name: toolForm.name,
          description: toolForm.description,
          parameters: {
            type: 'object',
            required: [],
            properties: {},
          },
        };
        onChange('capabilities.tools', [...tools, newTool]);
      }
      setToolForm({ name: '', description: '' });
      setShowAddTool(false);
    }
  };

  const handleEditTool = (idx: number) => {
    setToolForm({
      name: tools[idx].name,
      description: tools[idx].description,
    });
    setEditingToolIndex(idx);
    setShowAddTool(true);
  };

  const handleRemoveTool = (idx: number) => {
    onChange('capabilities.tools', tools.filter((_, i) => i !== idx));
  };

  const handleCancelEdit = () => {
    setShowAddTool(false);
    setEditingToolIndex(null);
    setToolForm({ name: '', description: '' });
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Custom Tools & Integrations</h3>
          {!showAddTool && (
            <button
              type="button"
              onClick={() => setShowAddTool(true)}
              className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200 transition-colors"
            >
              + Add Tool
            </button>
          )}
        </div>

        {showAddTool && (
          <div className="p-6 rounded-lg border border-blue-300 bg-blue-50 mb-4 space-y-4">
            <div>
              <label htmlFor="tool-name" className="text-sm font-semibold text-gray-700 block mb-2">
                Tool Name *
              </label>
              <input
                id="tool-name"
                type="text"
                placeholder="e.g., 'Schedule Meeting', 'Look Up Account'"
                value={toolForm.name}
                onChange={(e) => setToolForm({ ...toolForm, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="tool-description" className="text-sm font-semibold text-gray-700 block mb-2">
                Description *
              </label>
              <textarea
                id="tool-description"
                placeholder="What does this tool do? Be concise."
                value={toolForm.description}
                onChange={(e) => setToolForm({ ...toolForm, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddTool}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                {editingToolIndex !== null ? 'Update Tool' : 'Add Tool'}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {tools.length === 0 && !showAddTool ? (
          <div className="p-6 rounded-lg bg-gray-50 border border-dashed border-gray-300 text-center">
            <p className="text-gray-600 text-sm mb-3">No tools configured yet</p>
            <p className="text-gray-500 text-xs">Add custom tools to extend your assistant's capabilities</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tools.map((tool, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-gray-200 bg-white hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900">{tool.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{tool.description}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      type="button"
                      onClick={() => handleEditTool(idx)}
                      className="px-3 py-1 rounded text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveTool(idx)}
                      className="px-3 py-1 rounded text-xs bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
