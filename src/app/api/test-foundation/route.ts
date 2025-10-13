/**
 * Test endpoint to verify Sprint 4 foundation
 * Tests: types, validation, heuristics, database queries
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  CampaignIntakeSchema,
  CampaignMessageSchema,
  type CampaignMessage
} from '@/types/campaign';
import {
  validateMessage,
  validateCampaign,
  getRulesForVertical
} from '@/lib/campaign/validation';
import {
  generateCampaignDefaults,
  CAMPAIGN_TYPE_DEFAULTS,
  VERTICAL_DEFAULTS
} from '@/lib/campaign/heuristics';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const results: Record<string, any> = {};

  try {
    // =====================================================
    // TEST 1: Zod Schema Validation
    // =====================================================
    results.test1_zod_validation = { name: 'Zod Schema Validation' };

    try {
      // Test valid intake
      const validIntake = CampaignIntakeSchema.parse({
        request: 'I need a cold outreach campaign for HVAC companies',
        vertical: 'hvac',
        goal: 'book service calls',
        numTouches: 7,
        cadence: 'balanced',
        channels: ['email', 'linkedin'],
      });

      results.test1_zod_validation.validIntake = 'PASS';

      // Test invalid intake (should fail)
      try {
        CampaignIntakeSchema.parse({
          request: 'short', // Too short (min 10 chars)
        });
        results.test1_zod_validation.invalidIntake = 'FAIL - Should have rejected';
      } catch (e) {
        results.test1_zod_validation.invalidIntake = 'PASS - Correctly rejected';
      }

      // Test message validation
      const validMessage: CampaignMessage = {
        step: 1,
        channel: 'email',
        subjectA: 'Quick question',
        body: 'Hi there, just reaching out...',
      };

      const parsedMessage = CampaignMessageSchema.parse(validMessage);
      results.test1_zod_validation.validMessage = 'PASS';

    } catch (error) {
      results.test1_zod_validation.error = error instanceof Error ? error.message : 'Unknown error';
      results.test1_zod_validation.status = 'FAIL';
    }

    // =====================================================
    // TEST 2: Compliance Validation
    // =====================================================
    results.test2_compliance = { name: 'Compliance Validation' };

    try {
      // Test message with violations
      const badMessage: CampaignMessage = {
        step: 1,
        channel: 'email',
        subjectA: 'GUARANTEED BEST RATE!!!', // Multiple violations
        body: 'Click here now for 100% guaranteed results!!!',
      };

      const { violations, warnings } = validateMessage(badMessage, 'general');

      results.test2_compliance.violations = {
        count: violations.length,
        found: violations.map(v => v.rule),
      };

      results.test2_compliance.warnings = {
        count: warnings.length,
        found: warnings.map(w => w.rule),
      };

      results.test2_compliance.status = violations.length > 0 ? 'PASS - Found violations' : 'FAIL - Should have found violations';

      // Test clean message
      const cleanMessage: CampaignMessage = {
        step: 1,
        channel: 'email',
        subjectA: 'Quick question',
        body: 'Hi there, I wanted to reach out about your business.',
      };

      const cleanResult = validateMessage(cleanMessage, 'general');
      results.test2_compliance.cleanMessage = cleanResult.violations.length === 0 ? 'PASS' : 'FAIL';

      // Test vertical-specific rules
      const hvacRules = getRulesForVertical('hvac');
      results.test2_compliance.hvacRules = {
        count: hvacRules.length,
        hasUniversal: hvacRules.some(r => r.id.includes('rate-guarantees')),
        hasVerticalSpecific: hvacRules.some(r => r.id.includes('hvac')),
      };

    } catch (error) {
      results.test2_compliance.error = error instanceof Error ? error.message : 'Unknown error';
      results.test2_compliance.status = 'FAIL';
    }

    // =====================================================
    // TEST 3: Heuristics & Smart Defaults
    // =====================================================
    results.test3_heuristics = { name: 'Heuristics & Smart Defaults' };

    try {
      // Test campaign defaults generation
      const testIntake = CampaignIntakeSchema.parse({
        request: 'Create a demo request campaign for SaaS companies',
        vertical: 'saas',
        goal: 'book demos',
      });

      const defaults = generateCampaignDefaults(testIntake);

      results.test3_heuristics.generated = {
        numTouches: defaults.numTouches,
        totalDays: defaults.totalDays,
        cadence: defaults.cadence,
        channels: defaults.channels,
        tone: defaults.tone,
        stepsCount: defaults.steps.length,
        firstStepPurpose: defaults.steps[0]?.purpose,
        lastStepPurpose: defaults.steps[defaults.steps.length - 1]?.purpose,
      };

      // Verify it generated reasonable defaults
      const isValid =
        defaults.numTouches >= 3 &&
        defaults.numTouches <= 15 &&
        defaults.totalDays >= 7 &&
        defaults.steps.length === defaults.numTouches;

      results.test3_heuristics.status = isValid ? 'PASS' : 'FAIL';

      // Test campaign type defaults
      results.test3_heuristics.campaignTypes = {
        available: Object.keys(CAMPAIGN_TYPE_DEFAULTS),
        count: Object.keys(CAMPAIGN_TYPE_DEFAULTS).length,
      };

      // Test vertical defaults
      results.test3_heuristics.verticals = {
        available: Object.keys(VERTICAL_DEFAULTS),
        count: Object.keys(VERTICAL_DEFAULTS).length,
      };

    } catch (error) {
      results.test3_heuristics.error = error instanceof Error ? error.message : 'Unknown error';
      results.test3_heuristics.status = 'FAIL';
    }

    // =====================================================
    // TEST 4: Database Queries
    // =====================================================
    results.test4_database = { name: 'Database Queries' };

    try {
      // Test snippets query
      const { data: snippets, error: snippetsError } = await supabase
        .from('snippets')
        .select('*')
        .eq('segment', 'general')
        .limit(5);

      if (snippetsError) throw snippetsError;

      results.test4_database.snippets = {
        count: snippets?.length || 0,
        hasPerformanceScore: snippets?.[0]?.performance_score !== null,
        sample: snippets?.[0] ? {
          tag: snippets[0].tag,
          segment: snippets[0].segment,
          hasContent: !!snippets[0].content,
        } : null,
      };

      // Test compliance rules query
      const { data: rules, error: rulesError } = await supabase
        .from('compliance_rules')
        .select('*')
        .eq('active', true)
        .limit(5);

      if (rulesError) throw rulesError;

      results.test4_database.complianceRules = {
        count: rules?.length || 0,
        sample: rules?.[0] ? {
          vertical: rules[0].vertical,
          ruleType: rules[0].rule_type,
          name: rules[0].name,
        } : null,
      };

      // Test campaign patterns query
      const { data: patterns, error: patternsError } = await supabase
        .from('campaign_patterns')
        .select('*')
        .eq('vertical', 'general')
        .limit(3);

      if (patternsError) throw patternsError;

      results.test4_database.campaignPatterns = {
        count: patterns?.length || 0,
        sample: patterns?.[0] ? {
          vertical: patterns[0].vertical,
          campaignType: patterns[0].campaign_type,
          performanceAvg: patterns[0].performance_avg,
          hasSteps: !!patterns[0].pattern?.steps,
        } : null,
      };

      // Test knowledge base query
      const { data: knowledge, error: knowledgeError } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('vertical', 'general')
        .gte('confidence_score', 0.80)
        .limit(5);

      if (knowledgeError) throw knowledgeError;

      results.test4_database.knowledgeBase = {
        count: knowledge?.length || 0,
        categories: [...new Set(knowledge?.map(k => k.category) || [])],
        sample: knowledge?.[0] ? {
          category: knowledge[0].category,
          confidenceScore: knowledge[0].confidence_score,
          hasTags: knowledge[0].tags?.length > 0,
        } : null,
      };

      // Test database functions
      const { data: bestPatterns, error: funcError } = await supabase
        .rpc('get_best_patterns', {
          p_vertical: 'general',
          p_campaign_type: 'cold-outreach',
          p_limit: 3,
        });

      if (funcError) throw funcError;

      results.test4_database.databaseFunctions = {
        getBestPatterns: {
          works: !funcError,
          returned: bestPatterns?.length || 0,
        },
      };

      results.test4_database.status = 'PASS';

    } catch (error) {
      results.test4_database.error = error instanceof Error ? error.message : 'Unknown error';
      results.test4_database.status = 'FAIL';
    }

    // =====================================================
    // SUMMARY
    // =====================================================
    const allTests = [
      results.test1_zod_validation,
      results.test2_compliance,
      results.test3_heuristics,
      results.test4_database,
    ];

    const passedTests = allTests.filter(t =>
      t.status === 'PASS' ||
      (t.validIntake === 'PASS' && t.validMessage === 'PASS')
    ).length;

    results.summary = {
      total: allTests.length,
      passed: passedTests,
      failed: allTests.length - passedTests,
      status: passedTests === allTests.length ? 'ALL TESTS PASSED ✅' : `${passedTests}/${allTests.length} PASSED`,
    };

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      {
        error: 'Test suite failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        results,
      },
      { status: 500 }
    );
  }
}
