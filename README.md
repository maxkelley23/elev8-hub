# Elev8 Hub

**AI-Powered Marketing Operations Platform**

Elev8 Hub is a comprehensive marketing operations platform that combines AI-powered campaign generation with business intelligence tools. Built for modern marketing teams who need intelligent automation without sacrificing control.

## Features

### 1. AI Campaign Generator
Create personalized multi-touch email and LinkedIn campaigns in minutes:
- **Natural Language Input** - Describe your campaign in plain English
- **Smart Planning** - AI generates optimal touch sequence, timing, and channels
- **High-Quality Content** - Claude Sonnet writes compelling copy
- **Compliance Checking** - Built-in validation for spam triggers and best practices
- **Multi-Channel** - Email, LinkedIn, and SMS support
- **A/B Testing** - Automatic subject line variations

### 2. Expense Tracker
Track marketing spend with AI-powered categorization:
- Quick expense entry
- Auto-categorization
- Monthly/Yearly summaries
- Export to CSV

### 3. Coming Soon
- Campaign analytics dashboard
- Snippet library management
- Performance tracking & learning loop
- Team collaboration features

## Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude (Haiku for planning, Sonnet for content)
- **Types**: TypeScript + Zod validation
- **Forms**: React Hook Form

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Anthropic API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd elev8-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.local` and fill in your credentials:
   ```bash
   cp .env.local .env.local
   ```

   Required environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

4. **Set up Supabase database**

   Run the migrations in `supabase/migrations/` to create:
   - campaigns table
   - snippets table
   - knowledge_base table
   - campaign_patterns table
   - compliance_rules table
   - api_logs table

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
elev8-hub/
├── src/
│   ├── app/                  # Next.js 14 app directory
│   │   ├── api/              # API routes
│   │   │   └── campaign/     # Campaign generation endpoints
│   │   ├── campaigns/        # Campaign pages
│   │   ├── expenses/         # Expense tracker
│   │   └── layout.tsx        # Root layout
│   ├── components/           # React components
│   │   ├── campaigns/        # Campaign-specific components
│   │   ├── expenses/         # Expense tracker components
│   │   └── shared/           # Shared UI components
│   ├── lib/                  # Utility functions
│   │   └── campaign/         # Campaign heuristics & validation
│   └── types/                # TypeScript type definitions
├── public/                   # Static assets
├── supabase/                 # Database migrations
└── MCP_SETUP.md             # Supabase MCP setup guide
```

## How It Works

### Campaign Generation Flow

```
1. User Input (Natural Language)
   ↓
2. AI Planning (Claude Haiku)
   - Analyzes request
   - Queries similar patterns from database
   - Generates campaign structure
   ↓
3. User Reviews Plan
   - See touchpoints, timing, channels
   - Edit if needed
   ↓
4. AI Content Generation (Claude Sonnet)
   - Queries high-performing snippets
   - Generates personalized messages
   - Validates compliance
   ↓
5. User Edits Messages
   - Review all messages
   - Edit as needed
   - Export to Instantly/LinkedIn
```

### AI Architecture

- **Two-Stage Generation**: Fast planning (Haiku) + High-quality content (Sonnet)
- **Database-Backed Intelligence**: Learns from past campaigns
- **Heuristic Defaults**: Smart starting points based on industry patterns
- **Compliance Validation**: Automated checking for spam triggers

## API Endpoints

### POST /api/campaign/plan
Generate a campaign structure from intake data.

**Request:**
```json
{
  "request": "Cold outreach for HVAC companies",
  "vertical": "hvac",
  "goal": "book-demo",
  "cadence": "balanced"
}
```

**Response:**
```json
{
  "plan": {
    "vertical": "hvac",
    "campaignType": "cold-outreach",
    "totalTouches": 7,
    "totalDays": 21,
    "cadence": "balanced",
    "tone": "professional-friendly",
    "steps": [...]
  },
  "metadata": {
    "model": "claude-3-5-haiku-20241022",
    "tokensUsed": 1234,
    "latencyMs": 987
  }
}
```

### POST /api/campaign/write
Generate message content for a campaign plan.

**Request:**
```json
{
  "plan": { ... },
  "context": {
    "targetAudience": "HVAC business owners...",
    "emphasize": "ROI and efficiency",
    "avoid": "Hard sales tactics"
  }
}
```

**Response:**
```json
{
  "messages": [
    {
      "step": 1,
      "channel": "email",
      "subjectA": "Quick question",
      "subjectB": "Thought you'd like this",
      "preheader": "...",
      "body": "..."
    }
  ],
  "compliance": {
    "violations": [],
    "warnings": [],
    "status": "clean"
  }
}
```

## Database Schema

### campaigns
```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY,
  title TEXT,
  segment TEXT,
  status TEXT,
  json_spec JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### snippets
High-performing message components that the AI references:
```sql
CREATE TABLE snippets (
  id UUID PRIMARY KEY,
  tag TEXT,          -- 'subject', 'opener', 'cta', etc.
  segment TEXT,      -- 'hvac', 'saas', 'general'
  content JSONB,
  performance_score FLOAT,
  usage_count INT
);
```

### campaign_patterns
Successful campaign structures for different use cases:
```sql
CREATE TABLE campaign_patterns (
  id UUID PRIMARY KEY,
  vertical TEXT,
  campaign_type TEXT,
  pattern JSONB,
  performance_avg FLOAT,
  usage_count INT
);
```

## Configuration

### Cadence Patterns
- **Aggressive**: Touch every 1-3 days (re-engagement campaigns)
- **Balanced**: Touch every 2-5 days (cold outreach)
- **Gentle**: Touch every 4-7 days (nurture campaigns)

### Campaign Types
- `cold-outreach` - Initial contact campaigns
- `nurture` - Educational drip campaigns
- `re-engagement` - Win-back campaigns
- `event-promo` - Event invitation sequences
- `demo-request` - Product demo campaigns
- `product-launch` - New feature announcements

### Supported Verticals
- HVAC
- Real Estate
- SaaS
- Healthcare
- Financial Services
- E-commerce
- Consulting
- General B2B

## Development

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `ANTHROPIC_API_KEY` | Anthropic API key | Yes |
| `NEXT_PUBLIC_APP_URL` | App URL for callbacks | No |

## Cost Estimates

### AI Usage
- **Campaign Planning** (Haiku): ~$0.001 per campaign
- **Content Generation** (Sonnet): ~$0.03 per campaign
- **Average Total**: ~$0.031 per complete campaign

### Database
- Supabase Free Tier: Good for 10,000+ campaigns/month
- Recommended: Pro tier ($25/mo) for production use

## Roadmap

### Phase 2 (Current)
- [x] Complete campaign generator UI
- [x] Multi-step workflow
- [x] Message editing interface
- [ ] Campaign persistence to database
- [ ] Export to Instantly format
- [ ] Export to LinkedIn CSV

### Phase 3
- [ ] Campaign library/management
- [ ] Snippet management interface
- [ ] Performance tracking
- [ ] A/B test results

### Phase 4
- [ ] Analytics dashboard
- [ ] Learning loop (AI improves from results)
- [ ] Team collaboration
- [ ] Template marketplace

## Contributing

This is a proprietary project. Internal contributions welcome.

## Support

For questions or issues:
- Check the MCP_SETUP.md for Supabase configuration
- Review API logs in the Supabase dashboard
- Check browser console for client-side errors

## License

Proprietary - All Rights Reserved

---

**Built with Claude Code** - An AI-first approach to marketing automation.
