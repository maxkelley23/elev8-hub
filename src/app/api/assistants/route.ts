import { NextRequest, NextResponse } from 'next/server';
import {
  AssistantBuilderInputSchema,
  buildAssistantPrompt,
  buildVapiAssistantConfig,
} from '@/lib/assistant/builders';
import { z } from 'zod';
import { randomUUID } from 'crypto';

/**
 * POST /api/assistants
 * Creates a new voice assistant configuration
 *
 * NOTE: This endpoint validates and generates the Vapi configuration
 * but does NOT push to Vapi yet. When ready, uncomment the Vapi client
 * import and call createVapiAssistant(vapiConfig) to push to production.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input using Zod schema
    const validatedInput = AssistantBuilderInputSchema.parse(body);

    // Generate the system prompt
    const prompt = buildAssistantPrompt(validatedInput);

    // Build the Vapi configuration
    const vapiConfig = buildVapiAssistantConfig(validatedInput, prompt);

    // TODO: When ready to push to Vapi, uncomment the following:
    // const vapiResponse = await createVapiAssistant(vapiConfig);
    // return NextResponse.json({ success: true, id: vapiResponse.id, ... }, { status: 201 });

    // For now, generate a mock response
    const mockId = randomUUID();
    const assistantName = validatedInput.company.name
      ? `${validatedInput.company.name} Voice Assistant`
      : 'Customer Voice Assistant';

    return NextResponse.json(
      {
        success: true,
        id: mockId,
        name: assistantName,
        message: 'Assistant configuration created successfully (ready for Vapi)',
        config: {
          name: assistantName,
          prompt: prompt.substring(0, 100) + '...',
          language: validatedInput.persona.language[0],
          objective: validatedInput.objective,
        },
        notes: [
          'Configuration has been validated against Zod schema',
          'System prompt has been generated',
          'Vapi configuration has been built',
          'Ready to push to Vapi when VAPI_API_KEY is configured',
        ],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error validating assistant configuration:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle other errors
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to validate assistant configuration',
        message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/assistants
 * Lists all assistants (placeholder for future implementation)
 */
export async function GET() {
  return NextResponse.json(
    {
      message: 'List assistants endpoint - coming soon',
      note: 'Implement Vapi list assistants integration',
    },
    { status: 501 }
  );
}
