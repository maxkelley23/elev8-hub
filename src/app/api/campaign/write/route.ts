/**
 * POST /api/campaign/write
 *
 * Generates actual message content for a campaign plan
 * Uses Claude Sonnet (high quality) to write compelling copy
 *
 * Flow:
 * 1. Receive campaign plan from /plan endpoint
 * 2. Query database for high-performing snippets
 * 3. Use AI to write message content for each step
 * 4. Validate compliance
 * 5. Return full campaign with messages
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import {
  CampaignPlanSchema,
  CampaignMessageSchema,
  type CampaignPlan,
  type CampaignMessage
} from '@/types/campaign';
import { validateCampaign } from '@/lib/campaign/validation';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // =====================================================
    // STEP 1: Parse and validate plan
    // =====================================================
    const body = await request.json();

    let plan: CampaignPlan;
    let context: any;

    try {
      plan = CampaignPlanSchema.parse(body.plan);
      context = body.context || {}; // Additional context from user
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Invalid plan data',
          details: error instanceof Error ? error.message : 'Unknown validation error'
        },
        { status: 400 }
      );
    }

    // =====================================================
    // STEP 2: Query database for snippets
    // =====================================================
    const vertical = plan.vertical || 'general';

    // Get high-performing snippets for this vertical
    const { data: snippets, error: snippetsError } = await supabase
      .from('snippets')
      .select('*')
      .or(`segment.eq.${vertical},segment.eq.general`)
      .gte('performance_score', 0.70)
      .order('performance_score', { ascending: false })
      .limit(20);

    if (snippetsError) {
      console.error('Error fetching snippets:', snippetsError);
    }

    // Organize snippets by tag
    const snippetsByTag: Record<string, any[]> = {};
    snippets?.forEach(snippet => {
      if (!snippetsByTag[snippet.tag]) {
        snippetsByTag[snippet.tag] = [];
      }
      snippetsByTag[snippet.tag].push(snippet);
    });

    // Get knowledge base for context
    const { data: knowledge, error: knowledgeError } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('vertical', vertical)
      .gte('confidence_score', 0.75)
      .limit(15);

    // =====================================================
    // STEP 3: Build AI prompt for content generation
    // =====================================================
    const systemPrompt = `You are an expert copywriter creating personalized outreach campaigns.

Your task is to write compelling message content for each step in the campaign plan.

CRITICAL: You MUST return ONLY a valid JSON array. No markdown, no explanation, just the JSON.

For EMAIL messages, each object must have:
{
  "step": 1,
  "channel": "email",
  "subjectA": "primary subject line (max 55 chars)",
  "subjectB": "alternative subject line (max 55 chars)",
  "preheader": "preheader text (max 90 chars)",
  "body": "email body with variables like {{recipient.f_name}}, {{company.name}}, etc."
}

For LINKEDIN messages, each object must have:
{
  "step": 2,
  "channel": "linkedin",
  "body": "LinkedIn message (max 300 chars total)"
}

For SMS messages, each object must have:
{
  "step": 3,
  "channel": "sms",
  "body": "SMS text placeholder",
  "smsBody": "SMS text (max 160 chars)"
}

IMPORTANT RULES:
1. Use variables: {{recipient.f_name}}, {{company.name}}, {{sender.name}}
2. Only {{recipient.f_name}} allowed in subject lines
3. Keep it conversational and natural
4. Avoid spam triggers (GUARANTEED, FREE, URGENT, etc.)
5. No excessive punctuation (!!!, ???)
6. Use snippets as inspiration but adapt for context
7. Make each message unique and valuable
8. ALL channels need a "body" field
9. Subject lines MUST be under 55 characters
10. Return ONLY the JSON array, no other text

Example response format:
[
  {"step": 1, "channel": "email", "subjectA": "Quick question", "subjectB": "Reaching out", "preheader": "Thought you'd find this interesting", "body": "Hi {{recipient.f_name}},\n\nMessage here..."},
  {"step": 2, "channel": "linkedin", "body": "Following up on my email..."}
]`;

    const userPrompt = `Write message content for this campaign:

CAMPAIGN PLAN:
Vertical: ${plan.vertical}
Type: ${plan.campaignType}
Tone: ${plan.tone}
Total touches: ${plan.totalTouches} over ${plan.totalDays} days
Cadence: ${plan.cadence}

STEPS:
${plan.steps.map(s => `
Step ${s.n} (Day ${s.delay}, ${s.channel}):
- Purpose: ${s.purpose}
- Reasoning: ${s.reasoning}
`).join('\n')}

${context.companyInfo ? `
SENDER COMPANY INFO:
${JSON.stringify(context.companyInfo, null, 2)}
` : ''}

${context.targetAudience ? `
TARGET AUDIENCE:
${context.targetAudience}
` : ''}

${snippets && snippets.length > 0 ? `
HIGH-PERFORMING SNIPPETS TO REFERENCE:
${Object.entries(snippetsByTag).map(([tag, snips]) => `
${tag.toUpperCase()}:
${snips.slice(0, 3).map((s: any) => `- ${JSON.stringify(s.content)} (score: ${s.performance_score})`).join('\n')}
`).join('\n')}
` : ''}

${knowledge && knowledge.length > 0 ? `
KNOWLEDGE BASE FOR ${vertical.toUpperCase()}:
Pain Points:
${knowledge.filter(k => k.category === 'pain-point').map(k => `- ${k.content}`).join('\n')}

Benefits:
${knowledge.filter(k => k.category === 'benefit').map(k => `- ${k.content}`).join('\n')}

Objections:
${knowledge.filter(k => k.category === 'objection').map(k => `- ${k.content}`).join('\n')}
` : ''}

Write compelling, compliant message content for all ${plan.totalTouches} steps.`;

    // =====================================================
    // STEP 4: Call Claude Sonnet for content generation
    // =====================================================
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.8, // Higher temperature for more creative copy
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    // Extract JSON from response
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse the JSON response
    let messages: CampaignMessage[];
    try {
      // Try multiple extraction strategies
      let jsonText = content.text.trim();

      // Strategy 1: Check if it starts with [ (pure JSON)
      if (jsonText.startsWith('[')) {
        // Already JSON, use as-is
      } else {
        // Strategy 2: Look for ```json blocks
        let jsonMatch = content.text.match(/```json\s*\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1].trim();
        } else {
          // Strategy 3: Look for plain ``` blocks
          jsonMatch = content.text.match(/```\s*\n([\s\S]*?)\n```/);
          if (jsonMatch) {
            jsonText = jsonMatch[1].trim();
          } else {
            // Strategy 4: Look for JSON array in text
            jsonMatch = content.text.match(/(\[\s*\{[\s\S]*\}\s*\])/);
            if (jsonMatch) {
              jsonText = jsonMatch[1].trim();
            }
          }
        }
      }

      // Try to parse JSON
      const parsed = JSON.parse(jsonText);

      if (!Array.isArray(parsed)) {
        throw new Error('Response is not an array');
      }

      // Validate and normalize each message
      messages = parsed.map((msg: any, index: number) => {
        try {
          // Normalize the message before validation
          const normalized = {
            step: msg.step || index + 1,
            channel: msg.channel,
            body: msg.body || msg.smsBody || '',
            ...(msg.subjectA && { subjectA: msg.subjectA }),
            ...(msg.subjectB && { subjectB: msg.subjectB }),
            ...(msg.preheader && { preheader: msg.preheader }),
            ...(msg.smsBody && { smsBody: msg.smsBody }),
          };

          return CampaignMessageSchema.parse(normalized);
        } catch (validationError) {
          console.error(`Message ${index + 1} validation failed:`, msg);
          console.error('Validation error:', validationError);
          throw validationError;
        }
      });
    } catch (error) {
      console.error('Failed to parse AI response as JSON');
      console.error('Full response (first 1000 chars):', content.text.substring(0, 1000));
      console.error('Parse error:', error);
      throw new Error(`AI response was not valid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // =====================================================
    // STEP 5: Validate compliance
    // =====================================================
    const { violations, warnings, fixes } = validateCampaign(messages, vertical);

    // =====================================================
    // STEP 6: Track snippet usage
    // =====================================================
    // In production, you would track which snippets were actually used
    // For now, just record that we queried them
    if (snippets && snippets.length > 0) {
      const usageUpdates = snippets.slice(0, 5).map(snippet =>
        supabase
          .from('snippets')
          .update({ usage_count: snippet.usage_count + 1 })
          .eq('id', snippet.id)
      );
      await Promise.all(usageUpdates);
    }

    // =====================================================
    // STEP 7: Log API usage for cost tracking
    // =====================================================
    const latency = Date.now() - startTime;

    await supabase.from('api_logs').insert({
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      endpoint: '/api/campaign/write',
      prompt_tokens: response.usage.input_tokens,
      completion_tokens: response.usage.output_tokens,
      total_tokens: response.usage.input_tokens + response.usage.output_tokens,
      estimated_cost_cents: calculateCost(
        response.usage.input_tokens,
        response.usage.output_tokens,
        'sonnet'
      ),
      latency_ms: latency,
      status: 'success',
      request_type: 'campaign_write',
    });

    return NextResponse.json(
      {
        success: true,
        messages,
        compliance: {
          violations,
          warnings,
          fixes,
          status: violations.length === 0 ? 'clean' : 'has_violations',
        },
        metadata: {
          model: 'claude-3-5-sonnet-20241022',
          tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
          estimatedCostCents: calculateCost(
            response.usage.input_tokens,
            response.usage.output_tokens,
            'sonnet'
          ),
          latencyMs: latency,
          snippetsUsed: snippets?.length || 0,
          knowledgeEntriesUsed: knowledge?.length || 0,
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in /api/campaign/write:', error);

    // Log error to database
    const latency = Date.now() - startTime;
    await supabase.from('api_logs').insert({
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      endpoint: '/api/campaign/write',
      status: 'error',
      error_message: error instanceof Error ? error.message : 'Unknown error',
      latency_ms: latency,
      request_type: 'campaign_write',
    });

    return NextResponse.json(
      {
        error: 'Failed to generate campaign content',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Calculate cost in cents based on token usage
 */
function calculateCost(
  inputTokens: number,
  outputTokens: number,
  model: 'haiku' | 'sonnet'
): number {
  if (model === 'haiku') {
    const inputCost = (inputTokens / 1_000_000) * 0.80;
    const outputCost = (outputTokens / 1_000_000) * 4.00;
    return Number(((inputCost + outputCost) * 100).toFixed(2));
  } else {
    // Sonnet pricing:
    // - Input: $3.00 per million tokens
    // - Output: $15.00 per million tokens
    const inputCost = (inputTokens / 1_000_000) * 3.00;
    const outputCost = (outputTokens / 1_000_000) * 15.00;
    return Number(((inputCost + outputCost) * 100).toFixed(2));
  }
}
