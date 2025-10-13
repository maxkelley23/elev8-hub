# 🚀 Supabase Database Setup Guide

This guide will walk you through setting up your Supabase database for the Elev8 Hub.

---

## 📋 Prerequisites

- A Supabase account (free tier works fine)
- An Anthropic API key for Campaign Generator features

---

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: `elev8-hub` (or whatever you prefer)
   - **Database Password**: Choose a strong password and **save it somewhere safe**
   - **Region**: Choose the closest region to you
   - **Pricing Plan**: Free tier is perfect for development
4. Click **"Create new project"**
5. Wait 2-3 minutes for the project to initialize

---

## Step 2: Run the Database Schema

Once your project is ready:

### Option A: Using SQL Editor (Recommended)

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the file `db/schema.sql` from this project
4. **Copy the ENTIRE contents** of `schema.sql`
5. **Paste it** into the SQL Editor
6. Click **"Run"** (or press Ctrl+Enter)
7. You should see a success message and "Rows returned: 0"

### Option B: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### ✅ Verify Schema Creation

After running the schema, check that tables were created:

1. Click **"Table Editor"** in the left sidebar
2. You should see these tables:
   - ✅ `campaigns`
   - ✅ `exports`
   - ✅ `snippets`
   - ✅ `campaign_versions`
   - ✅ `api_logs`

---

## Step 3: Seed the Database (Optional)

To add sample data for testing:

1. Go back to **"SQL Editor"**
2. Click **"New query"**
3. Open the file `db/seed.sql` from this project
4. **Copy the ENTIRE contents** of `seed.sql`
5. **Paste it** into the SQL Editor
6. Click **"Run"**
7. You should see a results table showing row counts:
   ```
   table_name         | row_count
   -------------------|----------
   campaigns          | 2
   snippets           | 11
   exports            | 2
   campaign_versions  | 1
   api_logs           | 2
   ```

### ✅ Verify Seed Data

1. Click **"Table Editor"** → **"campaigns"**
2. You should see 2 sample campaigns:
   - "HVAC Owner Cold Outreach - Q1 2025"
   - "Realtor Listing Boost - Spring Campaign"

---

## Step 4: Get Your Supabase Credentials

1. In your Supabase dashboard, click **"Settings"** (gear icon in bottom left)
2. Click **"API"** in the settings menu
3. You'll see two important values:

### 📝 Copy These Values:

- **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
- **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (very long string)

**⚠️ DO NOT copy the `service_role` key** - only use it for server-side operations if absolutely necessary.

---

## Step 5: Configure Environment Variables

1. Open the file `.env.local` in your project root
2. Replace the placeholder values with your actual credentials:

```env
# Replace these with your actual values from Step 4
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your.actual.key

# Get this from https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=sk-ant-your-actual-api-key

# App URL (use this for local development)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Save the file**

---

## Step 6: Restart Your Dev Server

After updating `.env.local`, restart your Next.js dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

---

## Step 7: Test the Database Connection

Create a simple test to verify your database is connected:

1. Go to [http://localhost:3000](http://localhost:3000)
2. Open your browser's Developer Console (F12)
3. You should NOT see any Supabase connection errors

### Test with a Simple Query (Optional)

You can test by adding this to any page temporarily:

```typescript
import { supabase } from '@/lib/supabase';

// Test query
const { data, error } = await supabase
  .from('campaigns')
  .select('*')
  .limit(5);

console.log('Campaigns:', data);
console.log('Error:', error);
```

If `data` shows campaigns and `error` is null, you're connected! 🎉

---

## 📊 Understanding the Database Schema

### Table Overview

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **campaigns** | Stores complete campaign data | `id`, `title`, `segment`, `json_spec` |
| **exports** | Export history (CSV files for Instantly/LinkedIn) | `campaign_id`, `target`, `file_content` |
| **snippets** | Reusable content snippets | `tag`, `segment`, `content`, `performance_score` |
| **campaign_versions** | Version history for campaigns | `campaign_id`, `version`, `json_spec` |
| **api_logs** | AI API call tracking for cost monitoring | `provider`, `total_tokens`, `estimated_cost_cents` |

### Views (Convenience Queries)

- **active_campaigns**: See all draft/active campaigns with summary stats
- **export_summary**: Export counts per campaign
- **api_cost_summary**: Daily API usage and costs

### Functions

- **archive_old_campaigns(days)**: Archive campaigns older than X days
- **cleanup_old_api_logs(days)**: Delete old API logs

---

## 🔒 Security Notes

### Row Level Security (RLS)

RLS is currently **disabled** for Phase 1 (no authentication).

When you add authentication later, you'll need to:

1. Enable RLS on tables:
   ```sql
   ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
   ```

2. Create policies:
   ```sql
   CREATE POLICY "Users can view their own campaigns"
     ON campaigns FOR SELECT
     USING (auth.uid() = created_by);
   ```

### API Keys

- **anon/public key**: Safe to expose in browser (limited permissions)
- **service_role key**: ⚠️ NEVER expose in browser (full admin access)
- **ANTHROPIC_API_KEY**: Server-side only (Next.js API routes)

---

## 🧪 Sample Queries

### Get All Campaigns

```sql
SELECT id, title, segment, status, created_at
FROM campaigns
ORDER BY created_at DESC;
```

### Get Campaign with Export Count

```sql
SELECT
  c.title,
  c.segment,
  COUNT(e.id) AS total_exports
FROM campaigns c
LEFT JOIN exports e ON c.id = e.campaign_id
GROUP BY c.id, c.title, c.segment;
```

### Check API Usage This Month

```sql
SELECT
  provider,
  COUNT(*) AS requests,
  SUM(total_tokens) AS total_tokens,
  SUM(estimated_cost_cents) / 100.0 AS cost_dollars
FROM api_logs
WHERE created_at >= DATE_TRUNC('month', NOW())
GROUP BY provider;
```

---

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"

- Check that `.env.local` exists and has the correct values
- Restart your dev server after updating `.env.local`
- Make sure you're using `NEXT_PUBLIC_SUPABASE_URL` (with `NEXT_PUBLIC_` prefix)

### Error: "relation does not exist"

- You need to run `db/schema.sql` in your Supabase SQL Editor
- Check that you're connected to the correct project

### Error: "invalid JWT"

- Your `NEXT_PUBLIC_SUPABASE_ANON_KEY` is incorrect
- Copy it again from Settings → API in Supabase dashboard
- Make sure you copied the **anon** key, not the service_role key

### Tables not showing in Table Editor

- Refresh your browser
- Check the SQL Editor for any error messages when you ran schema.sql
- Make sure you ran the ENTIRE schema.sql file, not just part of it

---

## 📚 Next Steps

After completing the database setup:

1. ✅ Your database schema is created
2. ✅ Sample data is seeded (optional)
3. ✅ Environment variables are configured
4. ✅ Supabase client is ready to use

**You're ready to build Sprint 4: Campaign Generator!** 🎉

---

## 🔗 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)
- [Anthropic API Docs](https://docs.anthropic.com/)

---

## 💡 Tips

1. **Backup your database**: Use Supabase's backup feature or pg_dump
2. **Monitor your API usage**: Check the `api_logs` table regularly
3. **Archive old campaigns**: Run `SELECT archive_old_campaigns(90);` monthly
4. **Clean up logs**: Run `SELECT cleanup_old_api_logs(30);` to save space
5. **Use views**: The predefined views make common queries easier

---

**Need help?** Check the main implementation plan or create an issue in the repo.
