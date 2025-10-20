import { Anthropic } from '@anthropic-ai/sdk';
import { buildEnhancePrompt, EnhanceResponse } from '@/lib/ai-enhance';

const client = new Anthropic();

export async function POST(request: Request) {
  try {
    const { text, context } = await request.json() as { text: string; context?: string };

    if (!text || text.trim().length === 0) {
      return Response.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const originalLength = text.length;
    const prompt = buildEnhancePrompt(text, context);

    // Call Claude to enhance the text
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const enhanced = (message.content[0]?.type === 'text' ? message.content[0].text : text).trim();
    const enhancedLength = enhanced.length;

    const response: EnhanceResponse = {
      original: text,
      enhanced: enhanced.replace(/^["']|["']$/g, ''), // Remove any quotes Claude might add
      sentenceCount: (text.match(/[.!?]+/g) || []).length || 1,
      charDifference: enhancedLength - originalLength,
    };

    return Response.json(response);
  } catch (error) {
    console.error('Error enhancing text:', error);
    return Response.json(
      { error: 'Failed to enhance text' },
      { status: 500 }
    );
  }
}
