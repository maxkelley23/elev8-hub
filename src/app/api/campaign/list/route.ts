/**
 * GET /api/campaign/list
 *
 * Retrieves all campaigns from the database
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // Filter by status (draft, active, archived)
    const segment = searchParams.get('segment'); // Filter by segment/vertical
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('campaigns')
      .select('*', { count: 'exact' })
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (segment) {
      query = query.eq('segment', segment);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching campaigns:', error);
      return NextResponse.json(
        {
          error: 'Failed to fetch campaigns',
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        campaigns: data || [],
        total: count || 0,
        limit,
        offset,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in /api/campaign/list:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch campaigns',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
