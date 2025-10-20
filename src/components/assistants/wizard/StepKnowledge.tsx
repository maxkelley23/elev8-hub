'use client';

import React from 'react';
import type { AssistantBuilderInput } from '@/lib/assistant/builders';

interface StepKnowledgeProps {
  data: AssistantBuilderInput;
  onChange: (path: string, value: any) => void;
  errors: Record<string, string[]>;
}

export default function StepKnowledge({ data, onChange, errors }: StepKnowledgeProps) {
  const faqs = data.knowledgeBase?.faqs ?? [];
  const objectionHandling = data.knowledgeBase?.objectionHandling ?? [];
  const policies = data.knowledgeBase?.policies ?? [];

  const handleFaqQuestionChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], question: e.target.value };
    onChange('knowledgeBase.faqs', updated);
  };

  const handleFaqAnswerChange = (
    index: number,
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], answer: e.target.value };
    onChange('knowledgeBase.faqs', updated);
  };

  const handleObjectionChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updated = [...objectionHandling];
    updated[index] = { ...updated[index], objection: e.target.value };
    onChange('knowledgeBase.objectionHandling', updated);
  };

  const handleResponseChange = (
    index: number,
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const updated = [...objectionHandling];
    updated[index] = { ...updated[index], response: e.target.value };
    onChange('knowledgeBase.objectionHandling', updated);
  };

  const handlePoliciesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const lines = e.target.value
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => line.trim());
    onChange('knowledgeBase.policies', lines);
  };

  const addFaqItem = () => {
    const updated = [...faqs, { question: '', answer: '' }];
    onChange('knowledgeBase.faqs', updated);
  };

  const removeFaqItem = (index: number) => {
    const updated = faqs.filter((_, i) => i !== index);
    onChange('knowledgeBase.faqs', updated);
  };

  const addObjectionItem = () => {
    const updated = [...objectionHandling, { objection: '', response: '' }];
    onChange('knowledgeBase.objectionHandling', updated);
  };

  const removeObjectionItem = (index: number) => {
    const updated = objectionHandling.filter((_, i) => i !== index);
    onChange('knowledgeBase.objectionHandling', updated);
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Knowledge Base</h2>
        <p className="text-gray-600 mb-6">Add FAQs, objection handling, and company policies to your assistant's knowledge base.</p>
      </div>

      {/* FAQs Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h3>
          <button
            type="button"
            onClick={addFaqItem}
            className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200 transition-colors"
          >
            + Add FAQ
          </button>
        </div>
        {faqs.length === 0 ? (
          <div className="p-6 rounded-lg bg-gray-50 border border-dashed border-gray-300 text-center">
            <p className="text-gray-600 text-sm">No FAQs added yet. Start by adding common questions your customers ask.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="p-4 rounded-lg border border-gray-200 bg-white hover:border-blue-300 transition-colors">
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => handleFaqQuestionChange(index, e)}
                  placeholder="Question"
                  className="w-full mb-3 px-3 py-2 border border-gray-200 rounded focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                />
                <textarea
                  value={faq.answer}
                  onChange={(e) => handleFaqAnswerChange(index, e)}
                  placeholder="Answer"
                  rows={2}
                  className="w-full mb-3 px-3 py-2 border border-gray-200 rounded focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none"
                />
                <button
                  type="button"
                  onClick={() => removeFaqItem(index)}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  ✕ Remove
                </button>
              </div>
            ))}
          </div>
        )}
        {renderErrorMessages('knowledgeBase.faqs')}
      </div>

      {/* Objection Handling Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Objection Handling</h3>
          <button
            type="button"
            onClick={addObjectionItem}
            className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200 transition-colors"
          >
            + Add Objection
          </button>
        </div>
        {objectionHandling.length === 0 ? (
          <div className="p-6 rounded-lg bg-gray-50 border border-dashed border-gray-300 text-center">
            <p className="text-gray-600 text-sm">No objection handling added yet. Add common objections and how to respond.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {objectionHandling.map((item, index) => (
              <div key={index} className="p-4 rounded-lg border border-gray-200 bg-white hover:border-blue-300 transition-colors">
                <input
                  type="text"
                  value={item.objection}
                  onChange={(e) => handleObjectionChange(index, e)}
                  placeholder="Objection (e.g., 'It's too expensive')"
                  className="w-full mb-3 px-3 py-2 border border-gray-200 rounded focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                />
                <textarea
                  value={item.response}
                  onChange={(e) => handleResponseChange(index, e)}
                  placeholder="Response to objection"
                  rows={2}
                  className="w-full mb-3 px-3 py-2 border border-gray-200 rounded focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none"
                />
                <button
                  type="button"
                  onClick={() => removeObjectionItem(index)}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  ✕ Remove
                </button>
              </div>
            ))}
          </div>
        )}
        {renderErrorMessages('knowledgeBase.objectionHandling')}
      </div>

      {/* Policies Section */}
      <div className="flex flex-col">
        <label htmlFor="knowledge-policies" className="text-sm font-semibold text-gray-700 mb-2">
          Company Policies (one per line)
        </label>
        <textarea
          id="knowledge-policies"
          value={policies.join('\n')}
          onChange={handlePoliciesChange}
          placeholder="e.g., 'Refunds available within 30 days', 'Shipping is free over $50'"
          rows={4}
          className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none"
        />
        <p className="text-xs text-gray-500 mt-2">
          Enter one policy per line. These help guide your assistant's responses.
        </p>
        {renderErrorMessages('knowledgeBase.policies')}
      </div>
    </div>
  );
}
