/**
 * AI Enhancement utility for refining multi-sentence text inputs
 * Detects verbose text and offers AI-powered conciseness improvements
 */

export interface EnhanceRequest {
  text: string;
  context?: string; // e.g., 'mission', 'description', 'guideline'
}

export interface EnhanceResponse {
  original: string;
  enhanced: string;
  sentenceCount: number;
  charDifference: number;
}

/**
 * Detects if text contains multiple sentences (verbose)
 * Returns true if text has more than one sentence or is over 100 chars
 */
export function isMultiSentence(text: string): boolean {
  if (!text) return false;

  // Count sentences by looking for periods, question marks, or exclamation marks
  const sentenceCount = (text.match(/[.!?]+/g) || []).length;

  // Consider it multi-sentence if:
  // 1. More than one sentence marker, OR
  // 2. Over 100 characters (likely multiple thoughts)
  return sentenceCount > 1 || text.length > 100;
}

/**
 * Counts sentences in text
 */
export function countSentences(text: string): number {
  if (!text) return 0;
  return (text.match(/[.!?]+/g) || []).length || 1;
}

/**
 * Builds the prompt for Claude to enhance text
 */
export function buildEnhancePrompt(text: string, context?: string): string {
  let contextInfo = '';
  if (context === 'mission') {
    contextInfo = 'concise mission statement for a voice AI assistant';
  } else if (context === 'description') {
    contextInfo = 'brief tool description (one sentence)';
  } else if (context === 'guideline') {
    contextInfo = 'concise safety guideline or policy';
  } else {
    contextInfo = 'brief, impactful statement';
  }

  return `You are an expert at refining verbose text into concise, impactful statements.

The user has provided a ${contextInfo} that is too verbose or contains multiple sentences.

Original text:
"${text}"

Please refine this into a SINGLE, CONCISE sentence that captures the core meaning. The refined version should:
- Be clear and professional
- Convey the same meaning as the original
- Be as brief as possible while remaining meaningful
- Avoid redundancy

Return ONLY the refined text, nothing else. No quotes, no explanation.`;
}
