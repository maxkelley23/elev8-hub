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
    const now = new Date().toISOString();

    // Ensure we always have IDs/timestamps in a consistent way
    if (!body.id) {
      body.id = crypto.randomUUID();
      body.created_at = now;
    } else {
      // Preserve existing created_at when updating
      if (!body.created_at) {
        const { data: existingCampaign, error: fetchError } = await supabase
          .from('campaigns')
          .select('created_at')
          .eq('id', body.id)
          .single();

        if (fetchError) {
          console.error('Error fetching existing campaign for timestamps:', fetchError);
        }

        body.created_at = existingCampaign?.created_at || now;
      }
    }

    body.updated_at = now;

    // Clean up optional fields that might come through as null
    if (body.validation === null) {
      delete body.validation;
    }
    if (body.analysis === null) {
      delete body.analysis;
    }

    // Validate the campaign data
    let campaignData;
    try {
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
