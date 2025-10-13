/**
 * GET /api/campaign/[id]
 *
 * Retrieves a single campaign by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          {
            error: 'Campaign not found',
          },
          { status: 404 }
        );
      }

      console.error('Error fetching campaign:', error);
      return NextResponse.json(
        {
          error: 'Failed to fetch campaign',
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        campaign: data,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in /api/campaign/[id]:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch campaign',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/campaign/[id]
 *
 * Soft-deletes a campaign (sets status to 'deleted')
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .update({
        status: 'deleted',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error deleting campaign:', error);
      return NextResponse.json(
        {
          error: 'Failed to delete campaign',
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Campaign deleted successfully',
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in /api/campaign/[id] DELETE:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete campaign',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
