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
    <div>
      {/* FAQs Section */}
      <div>
        <label>FAQs</label>
        {faqs.length === 0 ? (
          <div className="text-gray-500 text-sm">No FAQs added yet</div>
        ) : (
          <div>
            {faqs.map((faq, index) => (
              <div key={index} className="border p-3 rounded mb-3">
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => handleFaqQuestionChange(index, e)}
                  placeholder="Question"
                  className="w-full mb-2"
                />
                <textarea
                  value={faq.answer}
                  onChange={(e) => handleFaqAnswerChange(index, e)}
                  placeholder="Answer"
                  className="w-full mb-2"
                />
                <button
                  type="button"
                  onClick={() => removeFaqItem(index)}
                  className="text-red-600 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        <button type="button" onClick={addFaqItem} className="text-blue-600 text-sm">
          Add FAQ
        </button>
        {renderErrorMessages('knowledgeBase.faqs')}
      </div>

      {/* Objection Handling Section */}
      <div>
        <label>Objection Handling</label>
        {objectionHandling.length === 0 ? (
          <div className="text-gray-500 text-sm">No objection handling added yet</div>
        ) : (
          <div>
            {objectionHandling.map((item, index) => (
              <div key={index} className="border p-3 rounded mb-3">
                <input
                  type="text"
                  value={item.objection}
                  onChange={(e) => handleObjectionChange(index, e)}
                  placeholder="Objection"
                  className="w-full mb-2"
                />
                <textarea
                  value={item.response}
                  onChange={(e) => handleResponseChange(index, e)}
                  placeholder="Response"
                  className="w-full mb-2"
                />
                <button
                  type="button"
                  onClick={() => removeObjectionItem(index)}
                  className="text-red-600 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={addObjectionItem}
          className="text-blue-600 text-sm"
        >
          Add Objection
        </button>
        {renderErrorMessages('knowledgeBase.objectionHandling')}
      </div>

      {/* Policies Section */}
      <div>
        <label htmlFor="knowledge-policies">Policies</label>
        <textarea
          id="knowledge-policies"
          value={policies.join('\n')}
          onChange={handlePoliciesChange}
          placeholder="Enter one policy per line"
        />
        <div className="text-gray-500 text-sm">
          One policy per line
        </div>
        {renderErrorMessages('knowledgeBase.policies')}
      </div>
    </div>
  );
}
