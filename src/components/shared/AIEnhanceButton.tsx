'use client';

import React, { useState } from 'react';
import { isMultiSentence } from '@/lib/ai-enhance';

interface AIEnhanceButtonProps {
  text: string;
  onEnhance: (enhanced: string) => void;
  context?: 'mission' | 'description' | 'guideline';
  disabled?: boolean;
}

export default function AIEnhanceButton({
  text,
  onEnhance,
  context,
  disabled = false,
}: AIEnhanceButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shouldShow = isMultiSentence(text);

  const handleEnhance = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, context }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance text');
      }

      const result = await response.json();
      onEnhance(result.enhanced);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <button
        type="button"
        onClick={handleEnhance}
        disabled={isLoading || disabled}
        className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 hover:from-purple-200 hover:to-pink-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center gap-1"
      >
        {isLoading ? (
          <>
            <span className="animate-spin">✨</span>
            Enhancing...
          </>
        ) : (
          <>
            <span>✨</span>
            Improve with AI
          </>
        )}
      </button>
      {error && (
        <span className="text-xs text-red-600">{error}</span>
      )}
    </div>
  );
}
