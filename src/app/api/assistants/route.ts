import { NextRequest, NextResponse } from 'next/server';
import {
  AssistantBuilderInputSchema,
  buildAssistantPrompt,
  buildVapiAssistantConfig,
} from '@/lib/assistant/builders';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/assistants
 * Creates a new voice assistant configuration and saves payload to database
 *
 * Process:
 * 1. Validates input against Zod schema
 * 2. Generates system prompt for AI assistant
 * 3. Builds complete Vapi configuration payload
 * 4. Saves payload to Supabase 'assistant_payloads' table
 * 5. Returns created assistant with ID
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

    // Save payload to Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create record in assistant_payloads table
    const { data, error } = await supabase
      .from('assistant_payloads')
      .insert({
        name: validatedInput.company.name || 'Untitled Assistant',
        config_input: validatedInput,
        system_prompt: prompt,
        vapi_payload: vapiConfig,
        created_at: new Date().toISOString(),
        status: 'created',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json(
      {
        success: true,
        id: data.id,
        name: data.name,
        message: 'Assistant payload created and saved successfully',
        payload: {
          configInput: validatedInput,
          systemPrompt: prompt.substring(0, 200) + '...',
          vapiPayload: vapiConfig,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating assistant payload:', error);

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
        error: 'Failed to create assistant payload',
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
