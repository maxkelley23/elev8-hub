/**
 * POST /api/campaign/plan
 *
 * Generates a campaign plan structure based on user intake
 * Uses Claude Haiku (cost-effective) to create the campaign outline
 *
 * Flow:
 * 1. Validate intake with Zod
 * 2. Generate smart defaults using heuristics
 * 3. Query database for similar patterns
 * 4. Use AI to refine and create final plan
 * 5. Return CampaignPlan
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import {
  CampaignIntakeSchema,
  CampaignPlanSchema,
  type CampaignIntake,
  type CampaignPlan
} from '@/types/campaign';
import { generateCampaignDefaults } from '@/lib/campaign/heuristics';

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
    // STEP 1: Parse and validate intake
    // =====================================================
    const body = await request.json();

    let intake: CampaignIntake;
    try {
      intake = CampaignIntakeSchema.parse(body);
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Invalid intake data',
          details: error instanceof Error ? error.message : 'Unknown validation error'
        },
        { status: 400 }
      );
    }

    // =====================================================
    // STEP 2: Generate smart defaults
    // =====================================================
    const defaults = generateCampaignDefaults(intake);

    // =====================================================
    // STEP 3: Query database for similar patterns
    // =====================================================
    const vertical = intake.vertical?.toLowerCase() || 'general';

    // Infer campaign type from goal/request
    const campaignType = inferCampaignType(intake.goal || intake.request);

    // Get best patterns for this vertical + campaign type
    const { data: patterns, error: patternsError } = await supabase
      .rpc('get_best_patterns', {
        p_vertical: vertical,
        p_campaign_type: campaignType,
        p_limit: 3,
      });

    // Get knowledge base entries for context
    const { data: knowledge, error: knowledgeError } = await supabase
      .from('knowledge_base')
      .select('category, content, confidence_score')
      .eq('vertical', vertical)
      .gte('confidence_score', 0.70)
      .limit(10);

    // =====================================================
    // STEP 4: Build AI prompt with context
    // =====================================================
    const systemPrompt = `You are a campaign strategist helping to create a multi-touch outreach campaign.

Your task is to create a campaign PLAN (structure only, not the actual message content).

Return a JSON object with this structure:
{
  "vertical": "the industry/vertical",
  "campaignType": "the type of campaign",
  "totalTouches": number,
  "totalDays": number,
  "cadence": "aggressive|balanced|gentle",
  "tone": "the recommended tone",
  "steps": [
    {
      "n": 1,
      "channel": "email|linkedin|sms",
      "delay": 0,
      "purpose": "what this step accomplishes",
      "reasoning": "why this step is here"
    }
  ],
  "reasoning": "overall strategy explanation"
}

Important:
- Use the provided defaults as a starting point
- Consider the patterns from successful campaigns
- Adapt based on the specific request
- Keep it realistic and achievable`;

    const userPrompt = `Create a campaign plan based on this request:

USER REQUEST:
${intake.request}

${intake.vertical ? `VERTICAL: ${intake.vertical}` : ''}
${intake.goal ? `GOAL: ${intake.goal}` : ''}
${intake.audience ? `AUDIENCE: ${intake.audience}` : ''}
${intake.tone ? `PREFERRED TONE: ${intake.tone}` : ''}

SMART DEFAULTS GENERATED:
- Touches: ${defaults.numTouches}
- Days: ${defaults.totalDays}
- Cadence: ${defaults.cadence}
- Channels: ${defaults.channels.join(', ')}
- Tone: ${defaults.tone}
- Suggested steps: ${JSON.stringify(defaults.steps, null, 2)}

${patterns && patterns.length > 0 ? `
SUCCESSFUL PATTERNS FROM DATABASE:
${patterns.map((p: any, i: number) => `
Pattern ${i + 1} (${(p.performance_avg * 100).toFixed(1)}% success rate, used ${p.usage_count} times):
${JSON.stringify(p.pattern, null, 2)}
`).join('\n')}
` : ''}

${knowledge && knowledge.length > 0 ? `
KNOWLEDGE BASE FOR ${vertical.toUpperCase()}:
${knowledge.map((k: any) => `- [${k.category}] ${k.content} (confidence: ${k.confidence_score})`).join('\n')}
` : ''}

USER PREFERENCES:
${intake.numTouches ? `- Requested ${intake.numTouches} touches` : ''}
${intake.totalDays ? `- Campaign length: ${intake.totalDays} days` : ''}
${intake.cadence ? `- Cadence preference: ${intake.cadence}` : ''}

Create the optimal campaign plan. You can adjust the defaults based on the context.`;

    // =====================================================
    // STEP 5: Call Claude Haiku for planning
    // =====================================================
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2000,
      temperature: 0.7,
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
    let aiPlan: any;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.text.match(/```json\n([\s\S]*?)\n```/) ||
                        content.text.match(/```\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : content.text;
      aiPlan = JSON.parse(jsonText);
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', content.text);
      throw new Error('AI response was not valid JSON');
    }

    // =====================================================
    // STEP 6: Validate and return plan
    // =====================================================
    const plan: CampaignPlan = CampaignPlanSchema.parse({
      vertical: aiPlan.vertical || vertical,
      campaignType: aiPlan.campaignType || campaignType,
      totalTouches: aiPlan.totalTouches,
      totalDays: aiPlan.totalDays,
      cadence: aiPlan.cadence,
      tone: aiPlan.tone,
      steps: aiPlan.steps,
      reasoning: aiPlan.reasoning,
    });

    // =====================================================
    // STEP 7: Log API usage for cost tracking
    // =====================================================
    const latency = Date.now() - startTime;

    await supabase.from('api_logs').insert({
      provider: 'anthropic',
      model: 'claude-3-5-haiku-20241022',
      endpoint: '/api/campaign/plan',
      prompt_tokens: response.usage.input_tokens,
      completion_tokens: response.usage.output_tokens,
      total_tokens: response.usage.input_tokens + response.usage.output_tokens,
      estimated_cost_cents: calculateCost(
        response.usage.input_tokens,
        response.usage.output_tokens,
        'haiku'
      ),
      latency_ms: latency,
      status: 'success',
      request_type: 'campaign_plan',
    });

    return NextResponse.json(
      {
        success: true,
        plan,
        metadata: {
          model: 'claude-3-5-haiku-20241022',
          tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
          estimatedCostCents: calculateCost(
            response.usage.input_tokens,
            response.usage.output_tokens,
            'haiku'
          ),
          latencyMs: latency,
          patternsUsed: patterns?.length || 0,
          knowledgeEntriesUsed: knowledge?.length || 0,
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in /api/campaign/plan:', error);

    // Log error to database
    const latency = Date.now() - startTime;
    await supabase.from('api_logs').insert({
      provider: 'anthropic',
      model: 'claude-3-5-haiku-20241022',
      endpoint: '/api/campaign/plan',
      status: 'error',
      error_message: error instanceof Error ? error.message : 'Unknown error',
      latency_ms: latency,
      request_type: 'campaign_plan',
    });

    return NextResponse.json(
      {
        error: 'Failed to generate campaign plan',
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
 * Infer campaign type from goal or request text
 */
function inferCampaignType(text: string): string {
  const lower = text.toLowerCase();

  if (lower.includes('demo') || lower.includes('trial')) return 'demo-request';
  if (lower.includes('event') || lower.includes('webinar')) return 'event-promo';
  if (lower.includes('launch') || lower.includes('new product')) return 'product-launch';
  if (lower.includes('nurture') || lower.includes('educate')) return 'nurture';
  if (lower.includes('re-engage') || lower.includes('win back')) return 're-engagement';

  return 'cold-outreach';
}

/**
 * Calculate cost in cents based on token usage
 * Haiku pricing (as of Oct 2024):
 * - Input: $0.80 per million tokens
 * - Output: $4.00 per million tokens
 */
function calculateCost(
  inputTokens: number,
  outputTokens: number,
  model: 'haiku' | 'sonnet'
): number {
  if (model === 'haiku') {
    const inputCost = (inputTokens / 1_000_000) * 0.80;
    const outputCost = (outputTokens / 1_000_000) * 4.00;
    return Number(((inputCost + outputCost) * 100).toFixed(2)); // Convert to cents
  } else {
    // Sonnet pricing:
    // - Input: $3.00 per million tokens
    // - Output: $15.00 per million tokens
    const inputCost = (inputTokens / 1_000_000) * 3.00;
    const outputCost = (outputTokens / 1_000_000) * 15.00;
    return Number(((inputCost + outputCost) * 100).toFixed(2));
  }
}
