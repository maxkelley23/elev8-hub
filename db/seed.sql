-- =====================================================
-- ELEV8 HUB - SEED DATA
-- =====================================================
-- This file contains sample data for testing and development
-- Run this AFTER running schema.sql
-- =====================================================

-- =====================================================
-- SEED DATA: snippets
-- =====================================================
-- Sample reusable content snippets
-- =====================================================

INSERT INTO snippets (tag, segment, content, is_active, performance_score, notes) VALUES
  -- Subject lines
  (
    'subject-line',
    'hvac',
    '{"text": "Quick question about {{company_name}}''s HVAC marketing", "variables": ["company_name"]}',
    true,
    0.87,
    'High-performing subject line for HVAC cold outreach'
  ),
  (
    'subject-line',
    'realtor',
    '{"text": "Helping {{first_name}} close more deals in {{city}}", "variables": ["first_name", "city"]}',
    true,
    0.92,
    'Personalized subject line for realtors'
  ),
  (
    'subject-line',
    'general',
    '{"text": "{{first_name}}, noticed your work at {{company_name}}", "variables": ["first_name", "company_name"]}',
    true,
    0.78,
    'Generic high-engagement subject line'
  ),

  -- Call-to-actions
  (
    'cta',
    'general',
    '{"text": "Book a 12-minute demo", "url_pattern": "https://cal.com/{{booking_link}}"}',
    true,
    0.95,
    'Standard CTA for scheduling demos'
  ),
  (
    'cta',
    'hvac',
    '{"text": "See how we can get you 5+ qualified leads this week", "url_pattern": null}',
    true,
    0.89,
    'Results-focused CTA for HVAC segment'
  ),

  -- Email openers
  (
    'opener',
    'hvac',
    '{"text": "I help HVAC contractors like you dominate local search and generate consistent service calls without paying for expensive Google Ads."}',
    true,
    0.91,
    'Value proposition opener for HVAC'
  ),
  (
    'opener',
    'realtor',
    '{"text": "I noticed you''re crushing it in the {{city}} market. I specialize in helping top realtors like you generate more qualified buyer and seller leads through targeted campaigns."}',
    true,
    0.88,
    'Social proof opener for realtors'
  ),

  -- Pain point callouts
  (
    'pain-point',
    'hvac',
    '{"text": "Most HVAC businesses struggle with inconsistent lead flow and waste thousands on ads that don''t convert. Sound familiar?"}',
    true,
    0.85,
    'Common pain point for HVAC owners'
  ),
  (
    'pain-point',
    'realtor',
    '{"text": "The challenge most realtors face isn''t lack of effort—it''s finding the right buyers and sellers in an oversaturated market."}',
    true,
    0.83,
    'Relatable pain point for realtors'
  ),

  -- Social proof snippets
  (
    'social-proof',
    'hvac',
    '{"text": "We''ve helped 50+ HVAC contractors increase their service call volume by an average of 40% in the first 90 days.", "metric": "40% increase", "timeframe": "90 days"}',
    true,
    0.94,
    'Strong social proof with specific metrics'
  ),

  -- Objection handlers
  (
    'objection',
    'general',
    '{"objection": "Too expensive", "response": "I totally understand. Most clients felt the same way initially. But after seeing the ROI—typically 3-5x in the first quarter—they realized it was actually expensive NOT to invest in proven systems."}',
    true,
    0.86,
    'Price objection handler'
  ),
  (
    'objection',
    'general',
    '{"objection": "Already have someone", "response": "That''s great you''re already working with someone. Out of curiosity, are you hitting your growth targets? If there''s room for improvement, it might be worth a quick conversation to see if we can complement what you''re already doing."}',
    true,
    0.81,
    'Already have vendor objection'
  );

-- =====================================================
-- SEED DATA: campaigns (Sample Campaign)
-- =====================================================
-- One complete sample campaign for testing
-- =====================================================

INSERT INTO campaigns (title, segment, status, version, json_spec) VALUES
  (
    'HVAC Owner Cold Outreach - Q1 2025',
    'HVAC Contractors',
    'draft',
    1,
    '{
      "icp": {
        "title": "HVAC Business Owner",
        "revenue": "$500K-$2M annually",
        "geography": "Northeast US (NY, NJ, PA)",
        "painPoints": [
          "Inconsistent lead flow during off-season",
          "High cost per lead from Google Ads",
          "Difficulty standing out in saturated market",
          "Low conversion rate from website traffic"
        ],
        "goals": [
          "30% increase in service call volume",
          "Reduce customer acquisition cost",
          "Build predictable pipeline",
          "Dominate local search results"
        ]
      },
      "messages": [
        {
          "type": "email",
          "day": 1,
          "subject": "Quick question about {{company_name}}''s HVAC marketing",
          "body": "Hi {{first_name}},\n\nI help HVAC contractors like you dominate local search and generate consistent service calls without paying for expensive Google Ads.\n\nMost HVAC businesses struggle with inconsistent lead flow and waste thousands on ads that don''t convert. Sound familiar?\n\nWe''ve helped 50+ HVAC contractors increase their service call volume by an average of 40% in the first 90 days.\n\nWould you be open to a quick 12-minute call to see if we could do something similar for {{company_name}}?\n\nBest,\n{{sender_name}}"
        },
        {
          "type": "email",
          "day": 4,
          "subject": "Following up - {{company_name}}",
          "body": "Hi {{first_name}},\n\nJust wanted to follow up on my last email.\n\nI know you''re busy running {{company_name}}, so I''ll keep this brief:\n\n• We specialize in helping HVAC contractors get 5-10 qualified leads per week\n• Our clients typically see ROI within 60 days\n• No long-term contracts—just results\n\nWorth a 12-minute conversation?\n\nBest,\n{{sender_name}}"
        },
        {
          "type": "linkedin",
          "day": 2,
          "subject": null,
          "body": "Hey {{first_name}}, noticed {{company_name}} is doing great work in the {{city}} area. I help HVAC contractors like you generate consistent service calls through targeted campaigns. Would love to connect and share some insights. 🔧"
        },
        {
          "type": "email",
          "day": 7,
          "subject": "Last one - {{company_name}}",
          "body": "Hi {{first_name}},\n\nI know I''ve reached out a couple times, so this will be my last email.\n\nIf you''re ever looking to:\n→ Generate more qualified leads\n→ Reduce your ad spend\n→ Build a predictable sales pipeline\n\nI''d love to help.\n\nEither way, best of luck with {{company_name}}!\n\nBest,\n{{sender_name}}\n\nP.S. - Here''s my calendar if you change your mind: [calendar_link]"
        }
      ],
      "cadence": {
        "totalDays": 7,
        "totalTouches": 4,
        "channels": ["email", "linkedin"]
      },
      "objections": [
        {
          "objection": "Too expensive",
          "response": "I totally understand. Most clients felt the same way initially. But after seeing the ROI—typically 3-5x in the first quarter—they realized it was actually expensive NOT to invest in proven systems."
        },
        {
          "objection": "Not interested right now",
          "response": "No problem at all. When would be a better time? I can follow up in a month or two when it makes more sense for you."
        },
        {
          "objection": "Already working with someone",
          "response": "That''s great you''re already working with someone. Out of curiosity, are you hitting your growth targets? If there''s room for improvement, it might be worth a quick conversation."
        }
      ]
    }'::jsonb
  );

-- Get the campaign ID for reference
DO $$
DECLARE
  sample_campaign_id UUID;
BEGIN
  SELECT id INTO sample_campaign_id FROM campaigns WHERE title = 'HVAC Owner Cold Outreach - Q1 2025';

  -- =====================================================
  -- SEED DATA: exports (Sample Exports)
  -- =====================================================

  INSERT INTO exports (campaign_id, target, format, row_count, notes) VALUES
    (
      sample_campaign_id,
      'instantly',
      'csv',
      250,
      'Initial export for testing Instantly integration'
    ),
    (
      sample_campaign_id,
      'linkedin',
      'csv',
      250,
      'LinkedIn connection requests for same audience'
    );

  -- =====================================================
  -- SEED DATA: campaign_versions
  -- =====================================================

  INSERT INTO campaign_versions (campaign_id, version, json_spec, change_notes) VALUES
    (
      sample_campaign_id,
      1,
      (SELECT json_spec FROM campaigns WHERE id = sample_campaign_id),
      'Initial campaign creation'
    );

  -- =====================================================
  -- SEED DATA: api_logs (Sample API Calls)
  -- =====================================================

  INSERT INTO api_logs (
    provider,
    model,
    endpoint,
    prompt_tokens,
    completion_tokens,
    total_tokens,
    estimated_cost_cents,
    latency_ms,
    status,
    campaign_id,
    request_type
  ) VALUES
    (
      'anthropic',
      'claude-3-5-sonnet-20241022',
      '/v1/messages',
      1200,
      800,
      2000,
      6.00,
      2340,
      'success',
      sample_campaign_id,
      'campaign_generation'
    ),
    (
      'anthropic',
      'claude-3-5-sonnet-20241022',
      '/v1/messages',
      450,
      320,
      770,
      2.31,
      1890,
      'success',
      sample_campaign_id,
      'critique'
    );

END $$;

-- =====================================================
-- SEED DATA: Additional Sample Campaigns
-- =====================================================

INSERT INTO campaigns (title, segment, status, version, json_spec) VALUES
  (
    'Realtor Listing Boost - Spring Campaign',
    'Real Estate Agents',
    'active',
    1,
    '{
      "icp": {
        "title": "Residential Real Estate Agent",
        "revenue": "10+ listings per year",
        "geography": "Suburban markets (NJ, PA, CT)",
        "painPoints": [
          "Competition from Zillow/Redfin",
          "Difficulty standing out in crowded market",
          "Inconsistent buyer/seller pipeline",
          "Low social media engagement"
        ],
        "goals": [
          "Increase listing inventory",
          "Generate qualified buyer leads",
          "Build personal brand",
          "Close 20+ deals this year"
        ]
      },
      "messages": [
        {
          "type": "email",
          "day": 1,
          "subject": "Helping {{first_name}} close more deals in {{city}}",
          "body": "Hi {{first_name}},\n\nI noticed you''re crushing it in the {{city}} market.\n\nI specialize in helping top realtors like you generate more qualified buyer and seller leads through targeted campaigns.\n\nThe challenge most realtors face isn''t lack of effort—it''s finding the right buyers and sellers in an oversaturated market.\n\nWould you be open to a quick call to discuss how we can help you close more deals this year?\n\nBest,\n{{sender_name}}"
        },
        {
          "type": "linkedin",
          "day": 2,
          "subject": null,
          "body": "Hey {{first_name}}! Saw your recent listing in {{city}}—gorgeous property. I help realtors build their pipeline through targeted marketing. Would love to connect! 🏡"
        }
      ],
      "cadence": {
        "totalDays": 5,
        "totalTouches": 2,
        "channels": ["email", "linkedin"]
      },
      "objections": [
        {
          "objection": "Zillow is enough",
          "response": "Zillow''s great for exposure, but most top-producing realtors supplement it with direct outreach to build their own pipeline. Want to see how?"
        }
      ]
    }'::jsonb
  );

-- =====================================================
-- VERIFY SEED DATA
-- =====================================================

-- Check counts
SELECT 'campaigns' AS table_name, COUNT(*) AS row_count FROM campaigns
UNION ALL
SELECT 'snippets', COUNT(*) FROM snippets
UNION ALL
SELECT 'exports', COUNT(*) FROM exports
UNION ALL
SELECT 'campaign_versions', COUNT(*) FROM campaign_versions
UNION ALL
SELECT 'api_logs', COUNT(*) FROM api_logs;

-- =====================================================
-- SEED DATA COMPLETE
-- =====================================================
-- You should see:
-- - 2 campaigns
-- - 11 snippets
-- - 2 exports
-- - 1 campaign_version
-- - 2 api_logs
-- =====================================================
