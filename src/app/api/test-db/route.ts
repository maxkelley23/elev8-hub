import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Test database connection endpoint
 * GET /api/test-db
 */
export async function GET() {
  try {
    // Test 1: List tables
    const { data: tables, error: tablesError } = await supabase
      .from('campaigns')
      .select('count')
      .limit(0);

    if (tablesError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database connection failed',
          details: tablesError.message,
        },
        { status: 500 }
      );
    }

    // Test 2: Check each table exists
    const tableTests = await Promise.all([
      supabase.from('campaigns').select('count').limit(0),
      supabase.from('exports').select('count').limit(0),
      supabase.from('snippets').select('count').limit(0),
      supabase.from('campaign_versions').select('count').limit(0),
      supabase.from('api_logs').select('count').limit(0),
    ]);

    const tableStatus = {
      campaigns: !tableTests[0].error,
      exports: !tableTests[1].error,
      snippets: !tableTests[2].error,
      campaign_versions: !tableTests[3].error,
      api_logs: !tableTests[4].error,
    };

    const allTablesExist = Object.values(tableStatus).every((status) => status);

    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      tables: tableStatus,
      allTablesExist,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unexpected error',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
