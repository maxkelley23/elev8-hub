/**
 * POST /api/campaign/save
 *
 * Saves a complete campaign to the database
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CompleteCampaignSchema } from '@/types/campaign';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the campaign data
    let campaignData;
    try {
      // If it's a new campaign without an id, generate one
      if (!body.id) {
        body.id = crypto.randomUUID();
        body.created_at = new Date().toISOString();
      }
      body.updated_at = new Date().toISOString();

      campaignData = CompleteCampaignSchema.parse(body);
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Invalid campaign data',
          details: error instanceof Error ? error.message : 'Unknown validation error'
        },
        { status: 400 }
      );
    }

    // Prepare the database row
    const dbRow = {
      id: campaignData.id,
      title: campaignData.title,
      segment: campaignData.segment,
      status: campaignData.status,
      version: campaignData.version,
      created_by: campaignData.created_by,
      json_spec: {
        intake: campaignData.intake,
        analysis: campaignData.analysis,
        plan: campaignData.plan,
        messages: campaignData.messages,
        validation: campaignData.validation,
      },
      created_at: campaignData.created_at,
      updated_at: campaignData.updated_at,
    };

    // Upsert (insert or update) the campaign
    const { data, error } = await supabase
      .from('campaigns')
      .upsert(dbRow, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Error saving campaign:', error);
      return NextResponse.json(
        {
          error: 'Failed to save campaign',
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        campaign: data,
        message: 'Campaign saved successfully',
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in /api/campaign/save:', error);
    return NextResponse.json(
      {
        error: 'Failed to save campaign',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
