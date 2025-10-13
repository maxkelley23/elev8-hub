-- =====================================================
-- SEED DATA FOR ELEV8 HUB
-- =====================================================
-- Populates initial data for AI learning system
-- Run this after migrations are complete
-- =====================================================

-- =====================================================
-- SNIPPETS - High-Performing Content
-- =====================================================

-- Subject Line Snippets (General)
INSERT INTO snippets (tag, segment, content, performance_score, usage_count, notes) VALUES
('subject', 'general', '{"text": "Quick question about {{company.name}}", "variables": ["company.name"]}', 0.85, 120, 'High-performing cold subject'),
('subject', 'general', '{"text": "{{recipient.f_name}}, following up", "variables": ["recipient.f_name"]}', 0.78, 95, 'Simple follow-up'),
('subject', 'general', '{"text": "Thoughts on [specific pain point]?", "variables": []}', 0.82, 87, 'Pain point focus'),
('subject', 'general', '{"text": "Re: {{recipient.f_name}}''s [relevant topic]", "variables": ["recipient.f_name"]}', 0.76, 63, 'Conversational thread'),
('subject', 'general', '{"text": "Saw your post about [topic]", "variables": []}', 0.88, 142, 'Social proof trigger');

-- Opener Snippets (General)
INSERT INTO snippets (tag, segment, content, performance_score, usage_count, notes) VALUES
('opener', 'general', '{"text": "Hi {{recipient.f_name}},\n\nI noticed [specific observation about their company/role].", "variables": ["recipient.f_name"]}', 0.81, 210, 'Personalized observation'),
('opener', 'general', '{"text": "{{recipient.f_name}},\n\nQuick question - are you currently [relevant activity]?", "variables": ["recipient.f_name"]}', 0.79, 178, 'Direct question'),
('opener', 'general', '{"text": "Hey {{recipient.f_name}},\n\nI saw {{company.name}} recently [achievement/news]. Congrats!", "variables": ["recipient.f_name", "company.name"]}', 0.86, 156, 'Congratulatory'),
('opener', 'general', '{"text": "{{recipient.f_name}},\n\nI help [similar companies] achieve [specific outcome].", "variables": ["recipient.f_name"]}', 0.74, 134, 'Value proposition');

-- CTA Snippets (General)
INSERT INTO snippets (tag, segment, content, performance_score, usage_count, notes) VALUES
('cta', 'general', '{"text": "Worth a quick 15-minute conversation?", "variables": []}', 0.77, 198, 'Time-bounded ask'),
('cta', 'general', '{"text": "Would you be open to a brief call this week?", "variables": []}', 0.75, 167, 'Soft ask'),
('cta', 'general', '{"text": "Can I send over a quick example of how we''ve helped [similar company]?", "variables": []}', 0.83, 189, 'Value-first CTA'),
('cta', 'general', '{"text": "If this sounds relevant, let me know and I''ll share more details.", "variables": []}', 0.71, 145, 'Low-pressure'),
('cta', 'general', '{"text": "Here''s a link to my calendar if you''d like to chat: [calendar_link]", "variables": ["calendar_link"]}', 0.69, 98, 'Direct booking');

-- Closer Snippets (General)
INSERT INTO snippets (tag, segment, content, performance_score, usage_count, notes) VALUES
('closer', 'general', '{"text": "Thanks,\n{{sender.name}}", "variables": ["sender.name"]}', 0.90, 450, 'Simple professional'),
('closer', 'general', '{"text": "Best,\n{{sender.name}}\n{{sender.title}}\n{{sender.company}}", "variables": ["sender.name", "sender.title", "sender.company"]}', 0.87, 389, 'Full signature'),
('closer', 'general', '{"text": "Looking forward to your thoughts!\n{{sender.name}}", "variables": ["sender.name"]}', 0.72, 234, 'Expectation setting'),
('closer', 'general', '{"text": "Cheers,\n{{sender.name}}", "variables": ["sender.name"]}', 0.81, 312, 'Casual friendly');

-- HVAC-Specific Snippets
INSERT INTO snippets (tag, segment, content, performance_score, usage_count, notes) VALUES
('subject', 'hvac', '{"text": "HVAC marketing that actually works", "variables": []}', 0.83, 56, 'Industry-specific'),
('opener', 'hvac', '{"text": "{{recipient.f_name}},\n\nMost HVAC companies struggle with [specific pain point]. Is this true for {{company.name}}?", "variables": ["recipient.f_name", "company.name"]}', 0.79, 67, 'Pain point focus'),
('value', 'hvac', '{"text": "We recently helped [HVAC Company] increase their booked calls by 40% using targeted email campaigns.", "variables": []}', 0.85, 43, 'Case study reference');

-- Real Estate Snippets
INSERT INTO snippets (tag, segment, content, performance_score, usage_count, notes) VALUES
('subject', 'realtor', '{"text": "Helping {{company.name}} stand out in [market]", "variables": ["company.name"]}', 0.81, 49, 'Market-specific'),
('opener', 'realtor', '{"text": "Hi {{recipient.f_name}},\n\nI work with realtors in [market] to generate qualified seller leads.", "variables": ["recipient.f_name"]}', 0.77, 52, 'Lead gen focus'),
('value', 'realtor', '{"text": "Our campaigns for real estate agents typically generate 15-25 qualified leads per month.", "variables": []}', 0.82, 38, 'Performance stat');

-- SaaS Snippets
INSERT INTO snippets (tag, segment, content, performance_score, usage_count, notes) VALUES
('subject', 'saas', '{"text": "Quick question about {{company.name}}''s growth plans", "variables": ["company.name"]}', 0.84, 71, 'Growth focus'),
('opener', 'saas', '{"text": "{{recipient.f_name}},\n\nI noticed {{company.name}} is [stage of growth]. Curious how you''re approaching [relevant challenge]?", "variables": ["recipient.f_name", "company.name"]}', 0.80, 68, 'Stage-aware'),
('value', 'saas', '{"text": "We helped [SaaS Company] reduce their CAC by 35% through more targeted outbound.", "variables": []}', 0.86, 54, 'Metric-driven');

-- =====================================================
-- COMPLIANCE RULES
-- =====================================================

-- Universal Compliance Rules
INSERT INTO compliance_rules (vertical, rule_type, name, description, rule_spec, auto_fix, active) VALUES
('general', 'banned-phrase', 'No Rate Guarantees', 'Cannot guarantee specific rates or pricing',
'{"pattern": "\\b(guarantee(d)?\\s+(rate|price|cost)|locked?\\s+rate|rate\\s+lock|best\\s+rate)\\b", "message": "Rate guarantees are not allowed", "severity": "high", "suggestion": "Use ''competitive rates'' or ''check current rates''", "autoFix": false, "appliesTo": ["email", "linkedin", "sms"], "fields": ["subject", "body"]}',
false, true),

('general', 'banned-phrase', 'No Unrealistic Promises', 'Avoid absolute guarantees',
'{"pattern": "\\b(100%\\s+guaranteed|always\\s+approved|never\\s+fail|instant\\s+approval|guaranteed\\s+results)\\b", "message": "Unrealistic promises detected", "severity": "high", "suggestion": "Use realistic language like ''often'', ''typically''", "autoFix": false, "appliesTo": ["email", "linkedin", "sms"], "fields": ["subject", "body"]}',
false, true),

('general', 'banned-phrase', 'Avoid Spam Triggers', 'Words that trigger spam filters',
'{"pattern": "\\b(click here now|act now|limited time|urgent|free money|winner|congratulations|prize)\\b", "message": "Spam trigger words detected", "severity": "medium", "suggestion": "Reword to avoid spam filters", "autoFix": false, "appliesTo": ["email", "linkedin", "sms"], "fields": ["subject", "body"]}',
false, true),

('general', 'format', 'No Excessive Punctuation', 'Multiple exclamation or question marks',
'{"pattern": "[!?]{2,}", "message": "Excessive punctuation detected", "severity": "low", "suggestion": "Use single punctuation marks", "autoFix": true, "appliesTo": ["email", "linkedin", "sms"], "fields": ["subject", "body"]}',
true, true),

('general', 'format', 'No ALL CAPS', 'Words in all capitals',
'{"pattern": "\\b[A-Z]{4,}\\b", "message": "All caps words detected", "severity": "low", "suggestion": "Convert to sentence case", "autoFix": true, "appliesTo": ["email", "linkedin", "sms"], "fields": ["subject", "body"]}',
true, true),

('general', 'format', 'Subject Line Length', 'Subject should be under 55 characters',
'{"pattern": ".{56,}", "message": "Subject line too long", "severity": "medium", "suggestion": "Shorten to 55 characters or less", "autoFix": false, "appliesTo": ["email"], "fields": ["subject"]}',
false, true),

('general', 'variable-restriction', 'Subject Variable Restriction', 'Only first name allowed in subject',
'{"pattern": "\\{\\{(?!recipient\\.f_name\\}\\})[^}]+\\}\\}", "message": "Invalid variable in subject line", "severity": "medium", "suggestion": "Only use {{recipient.f_name}} in subjects", "autoFix": false, "appliesTo": ["email"], "fields": ["subject"]}',
false, true);

-- HVAC Industry Rules
INSERT INTO compliance_rules (vertical, rule_type, name, description, rule_spec, auto_fix, active) VALUES
('hvac', 'required-disclosure', 'HVAC License Disclosure', 'Include license information',
'{"pattern": "\\b(license|lic\\.)\\s*#?\\s*\\d+", "message": "License number should be included", "severity": "high", "suggestion": "Include HVAC license number in footer", "autoFix": false, "appliesTo": ["email"], "fields": ["body"]}',
false, true);

-- Real Estate Industry Rules
INSERT INTO compliance_rules (vertical, rule_type, name, description, rule_spec, auto_fix, active) VALUES
('real-estate', 'banned-phrase', 'Fair Housing Compliance', 'Avoid discriminatory language',
'{"pattern": "\\b(family-oriented|perfect for families|adults only|no children|mature building)\\b", "message": "Fair Housing violation detected", "severity": "high", "suggestion": "Remove discriminatory language", "autoFix": false, "appliesTo": ["email", "linkedin", "sms"], "fields": ["body"]}',
false, true);

-- Healthcare Industry Rules
INSERT INTO compliance_rules (vertical, rule_type, name, description, rule_spec, auto_fix, active) VALUES
('healthcare', 'banned-phrase', 'HIPAA Compliance', 'No PHI in unsecured communications',
'{"pattern": "\\b(diagnosis|condition|treatment|medical record|patient)\\b", "message": "Possible PHI detected", "severity": "high", "suggestion": "Remove protected health information", "autoFix": false, "appliesTo": ["email", "linkedin", "sms"], "fields": ["body"]}',
false, true);

-- =====================================================
-- CAMPAIGN PATTERNS
-- =====================================================

-- Cold Outreach Pattern (General)
INSERT INTO campaign_patterns (vertical, campaign_type, pattern, performance_avg, usage_count, notes) VALUES
('general', 'cold-outreach',
'{"steps": [
  {"n": 1, "channel": "email", "delay": 0, "purpose": "set-expectations", "reasoning": "Introduce value and set stage"},
  {"n": 2, "channel": "email", "delay": 3, "purpose": "deliver-value", "reasoning": "Provide insight or resource"},
  {"n": 3, "channel": "linkedin", "delay": 6, "purpose": "social-proof", "reasoning": "Different channel, case study"},
  {"n": 4, "channel": "email", "delay": 9, "purpose": "overcome-objection", "reasoning": "Address common concern"},
  {"n": 5, "channel": "linkedin", "delay": 13, "purpose": "create-urgency", "reasoning": "Time-sensitive reason"},
  {"n": 6, "channel": "email", "delay": 17, "purpose": "final-value", "reasoning": "Last piece of value"},
  {"n": 7, "channel": "email", "delay": 21, "purpose": "breakup", "reasoning": "Friendly exit"}
], "avgDays": 21, "avgTouches": 7}',
0.2200, 45, 'Standard 7-touch cold sequence'),

-- Nurture Pattern (General)
('general', 'nurture',
'{"steps": [
  {"n": 1, "channel": "email", "delay": 0, "purpose": "welcome", "reasoning": "Set expectations for relationship"},
  {"n": 2, "channel": "email", "delay": 7, "purpose": "educate", "reasoning": "Educational content"},
  {"n": 3, "channel": "email", "delay": 14, "purpose": "case-study", "reasoning": "Success story"},
  {"n": 4, "channel": "email", "delay": 21, "purpose": "resource", "reasoning": "Valuable resource"},
  {"n": 5, "channel": "email", "delay": 35, "purpose": "check-in", "reasoning": "Soft CTA"}
], "avgDays": 35, "avgTouches": 5}',
0.1500, 28, 'Gentle nurture sequence'),

-- Demo Request Pattern (SaaS)
('saas', 'demo-request',
'{"steps": [
  {"n": 1, "channel": "email", "delay": 0, "purpose": "intro-value-prop", "reasoning": "Introduce solution"},
  {"n": 2, "channel": "email", "delay": 3, "purpose": "pain-point", "reasoning": "Address pain"},
  {"n": 3, "channel": "linkedin", "delay": 6, "purpose": "demo-invite", "reasoning": "Soft demo CTA"},
  {"n": 4, "channel": "email", "delay": 10, "purpose": "case-study", "reasoning": "Social proof"},
  {"n": 5, "channel": "linkedin", "delay": 14, "purpose": "demo-reminder", "reasoning": "Stronger CTA"},
  {"n": 6, "channel": "email", "delay": 18, "purpose": "final-reach", "reasoning": "Last attempt"}
], "avgDays": 18, "avgTouches": 6}',
0.2800, 37, 'SaaS demo request sequence');

-- =====================================================
-- KNOWLEDGE BASE
-- =====================================================

-- General Pain Points
INSERT INTO knowledge_base (category, vertical, tags, content, confidence_score, usage_count, source) VALUES
('pain-point', 'general', ARRAY['lead-gen', 'outreach'], 'Not getting enough qualified leads from current marketing efforts', 0.90, 145, 'Customer research'),
('pain-point', 'general', ARRAY['lead-gen', 'cost'], 'High cost per acquisition making growth unsustainable', 0.88, 132, 'Market analysis'),
('pain-point', 'general', ARRAY['time', 'efficiency'], 'Spending too much time on manual outreach without results', 0.85, 118, 'Customer interviews'),
('pain-point', 'general', ARRAY['response-rate'], 'Low email response rates and engagement', 0.92, 167, 'Industry benchmarks');

-- General Benefits
INSERT INTO knowledge_base (category, vertical, tags, content, confidence_score, usage_count, source) VALUES
('benefit', 'general', ARRAY['roi', 'efficiency'], 'Increase qualified lead flow by 40-60% within first quarter', 0.85, 98, 'Client results'),
('benefit', 'general', ARRAY['time-savings'], 'Save 10-15 hours per week on manual outreach tasks', 0.82, 87, 'Time tracking studies'),
('benefit', 'general', ARRAY['targeting'], 'Reach ideal customers with personalized messaging at scale', 0.88, 112, 'Platform capabilities'),
('benefit', 'general', ARRAY['measurability'], 'Track every metric and optimize campaigns in real-time', 0.80, 76, 'Product features');

-- General Objections
INSERT INTO knowledge_base (category, vertical, tags, content, confidence_score, usage_count, source) VALUES
('objection', 'general', ARRAY['cost', 'budget'], 'Too expensive / not in budget right now', 0.95, 203, 'Sales call analysis'),
('objection', 'general', ARRAY['timing'], 'Not the right time, maybe next quarter', 0.93, 189, 'Sales call analysis'),
('objection', 'general', ARRAY['internal-resources'], 'We handle marketing in-house already', 0.88, 156, 'Competitive research'),
('objection', 'general', ARRAY['risk', 'trust'], 'Concerned about quality and deliverability', 0.85, 134, 'Customer feedback'),
('objection', 'general', ARRAY['complexity'], 'Seems too complex to implement', 0.81, 98, 'User testing');

-- HVAC Industry Insights
INSERT INTO knowledge_base (category, vertical, tags, content, confidence_score, usage_count, source) VALUES
('pain-point', 'hvac', ARRAY['seasonality', 'revenue'], 'Seasonal revenue fluctuations make planning difficult', 0.87, 45, 'HVAC industry research'),
('pain-point', 'hvac', ARRAY['competition'], 'Intense local competition for service calls', 0.91, 52, 'Market analysis'),
('benefit', 'hvac', ARRAY['consistency'], 'Consistent lead flow during slow seasons', 0.84, 38, 'Client testimonials'),
('industry-insight', 'hvac', ARRAY['buying-behavior'], 'HVAC customers typically research 3-5 companies before deciding', 0.88, 29, 'Consumer study');

-- Real Estate Industry Insights
INSERT INTO knowledge_base (category, vertical, tags, content, confidence_score, usage_count, source) VALUES
('pain-point', 'real-estate', ARRAY['lead-quality'], 'Too many unqualified leads, not enough serious buyers/sellers', 0.92, 67, 'Realtor surveys'),
('pain-point', 'real-estate', ARRAY['market-changes'], 'Market shifts make it hard to maintain consistent business', 0.86, 54, 'Industry reports'),
('benefit', 'real-estate', ARRAY['listing'], 'Generate 15-25 qualified listing inquiries per month', 0.85, 41, 'Platform results'),
('industry-insight', 'real-estate', ARRAY['trust'], 'Realtors need to establish trust before clients engage', 0.89, 36, 'Psychology research');

-- SaaS Industry Insights
INSERT INTO knowledge_base (category, vertical, tags, content, confidence_score, usage_count, source) VALUES
('pain-point', 'saas', ARRAY['pipeline', 'sales'], 'Sales pipeline not converting fast enough', 0.90, 78, 'SaaS metrics research'),
('pain-point', 'saas', ARRAY['demo-shows'], 'High no-show rate for booked demos', 0.87, 65, 'Sales ops data'),
('benefit', 'saas', ARRAY['pipeline'], 'Fill pipeline with 20-30 qualified demos per month', 0.86, 59, 'Client case studies'),
('industry-insight', 'saas', ARRAY['buying-process'], 'B2B SaaS buying cycles average 3-6 months for mid-market', 0.91, 43, 'Sales cycle studies');

-- =====================================================
-- SEED COMPLETE
-- =====================================================
-- Database is now populated with initial learning data
-- AI agents can query these tables to generate campaigns
-- =====================================================
