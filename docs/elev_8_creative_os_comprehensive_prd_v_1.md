# ELEV8 Creative OS — Comprehensive Product Requirements Document (PRD)

**Version:** 1.0  
**Owners:** Max Kelley (PM), Business Partner (PM), Engineering (to assign)  
**Date:** Oct 9, 2025  
**Stack:** Next.js (App Router) on Vercel, Supabase (Postgres + Storage + optional Auth), OpenAI/Anthropic model adapters  

---

## 0) Executive Summary
A web app that lets non-technical users generate:
- **Video Prompt Packs** for Veo 3 / Sora 2 (multi-clip plan + per-clip prompts + AI reference stills + VO mini-scripts + shot list + one-click packaging)
- **Email Campaigns:** intake → plan → write → export with compliance rules
- **Blogs:** intake → outline → draft → polish (headlines / meta / CTA)
- **Newsletters:** intake → sections → draft → repurpose pack

**Shared foundations:** Brand Kit Lite, Negative Prompt Library, Continuity Anchors, Knowledge Base, Packaging/Zips.

**Guiding principles:** non-technical UX, deterministic outputs, model-agnostic adapters, stateless API contracts.

---

## 1) Goals, Non‑Goals, Success Metrics
### Goals
1) Ship Video Prompt Lab MVP with high-quality outputs in ≤5 min from new project.
2) Provide simple writers for Email, Blog, Newsletter with shared brand/tone.
3) Create reusable libraries (prompts, rules, anchors, negatives) and exports.

### Non-Goals (v1)
- Multi-tenant org permissions beyond a single org (optional).  
- Push to CRMs or ESPs (copy/export only).  
- Rich WYSIWYG editors (simple text + copy buttons).

### Success Metrics
- **Adoption:** ≥10 video projects used in first 2 weeks.  
- **Quality:** ≥90% outputs used without rewrites.  
- **Speed:** First packaged prompt pack in ≤5 minutes (median).

---

## 2) Users & Use Cases
**Primary users:** Max, Partner, future teammates.  
**Use cases:**
- Produce 6–10 clip Veo/Sora sequences with continuity.
- Generate reference stills per clip to lock look.
- Create short VO lines with beat cues.
- Export shot list + full package for handoff.
- Spin quick 8-email nurture; write a 900–1200 word blog; draft a 5-section newsletter.

---

## 3) Functional Requirements
### 3.1 Video Prompt Lab
**Intake (form or chat):**
- Project name, platform, audience, objective
- Total duration (sec), #clips, per‑clip duration (auto-compute rules)
- Continuity Anchors (pick 3–5 chips) — see Library
- Style attributes (2–4), camera/shot language, lighting notes
- Negative Prompt toggles (from Library)
- VO mode: per-clip (2–3 lines) or single 15–30s read
- Presets: HVAC owner-operator, Realtor nurture (prefill anchors/negatives)

**Plan generation:**
- Split total duration into N clips (defaults: 7s clips, max 12)
- Produce clip skeletons with: title, duration_sec, shot_description, subject_action, env_lighting, style_attributes, continuity_anchors, negatives

**Reference Stills (AI-only):**
- Generate one 16:9 still per clip (webp). Buttons: Regenerate, Replace (re-run), Download. Store prompt used + optional seed.

**Prompt Writer:**
- Per-clip prompt with framing, motion, lighting, style, anchors, negatives; cap to **≤600 chars** default (configurable). Provide an alt take.

**Voiceover Mini:**
- Mode A (per clip): 2–3 lines with beat ranges per 7s.  
- Mode B (single): 15–30s coherent read aligned to overall story.

**Shot List Export:**
- CSV + JSON with columns: clip_index, duration_sec, shot_intent, motion, anchors, vo_beat, still_url.

**One‑Click Package:**
- Zip structure (predictable names):
```
/project_{slug}/
  /prompts/c01.txt ...
  /prompts/c01_alt.txt ...
  /stills/c01.webp ...
  /vo/vo_per_clip.txt  (or vo_single_read.txt)
  shotlist.csv
  shotlist.json
  project_summary.txt
```

**Validation & Safeguards:**
- Prompt length caps; ban list enforced; anchors present in each prompt; fail soft with suggestions.

### 3.2 Email Campaign Builder
- Intake: goal, audience, cadence (default 8 emails/45 days), include SMS? (defer), emphasize/avoid topics, A/B subjects?, tone.
- Plan: steps array with delays/purposes.
- Write: Preheader, Subject (A/B optional), Body. Compliance: no rates/APR figures, no “guaranteed/approved,” only `{{recipient.f_name}}` in body.
- Export: combined text; optional zip `/email/step01.txt ...`.

### 3.3 Blog Studio
- Intake: topic, persona, target length, SEO keyword, sources (KB or URLs), examples to emulate, tone, CTA.
- Write: outline → draft → headline options → meta description → CTA block → 2–3 social snippets.
- Export: `/blog/draft.md`, `/social/snippets.txt`.

### 3.4 Newsletter Studio
- Intake: theme, sections (news/feature/story/tip/promo), assets, cadence, layout name, tone/CTA.
- Write: sectioned newsletter + repurpose pack (subjects, preview text, social snippets).
- Export: `/newsletter/issue.md`, `/social/snippets.txt`.

---

## 4) Libraries & Business Rules
### 4.1 Brand Kit Lite
```json
{
  "colors": {"primary": "#000000", "secondary": "#FFFFFF"},
  "tone": ["clear", "helpful", "no fluff"],
  "default_cta": "Book a quick call"
}
```

### 4.2 Negative Prompt Library (seed v1)
```
logos; extra people; text artifacts; brand names; gore; weaponry; distorted hands; watermark; UI elements; emoji; cartoonish faces; overexposed glare; blown highlights; lens dirt; misspelled text; jitter; excessive motion blur
```

### 4.3 Continuity Anchors (chips, examples)
```
orange safety gloves; blue service van; 7am warm light; navy blazer; same wooden workbench; white ceramic mug; shop bay door with window; name patch on jacket; grey concrete floor; yellow tape measure
```

### 4.4 Knowledge Base (KB)
- Stored as rows containing `source_url`, `content_md`, `tags[]`, `notes`.  
- Editors paste clean markdown extracts (no PDFs needed).

---

## 5) Information Architecture (Pages)
1) **Dashboard**: project list, search/filter, New Project.  
2) **Project (Video)**: tabs Intake • Clips • Stills • Prompts • VO • Export.  
3) **Email / Blog / Newsletter**: Intake → Results (single page).  
4) **Library**: Brand Kit, Negatives, Anchors, KB entries.

---

## 6) Data Model (Supabase) — SQL Migrations
> _Run in order. Adjust schema names if needed._

```sql
create extension if not exists pgcrypto;

create table if not exists orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete set null,
  name text not null,
  type text not null check (type in ('video','email','blog','newsletter')),
  tags text[] default '{}',
  brand_kit jsonb default '{}',
  negative_overrides jsonb default '{}',
  anchors text[] default '{}',
  intake jsonb not null,
  status text default 'draft',
  created_at timestamptz default now()
);

create table if not exists video_clips (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  index_num int not null,
  duration_sec int not null,
  title text,
  shot_description text,
  subject_action text,
  env_lighting text,
  style_attributes text[],
  continuity_anchors text[],
  negatives text[],
  prompt text,
  alt_prompt text,
  vo_text text,
  still_url text,
  still_prompt text,
  still_seed text,
  created_at timestamptz default now()
);

create table if not exists knowledge_base (
  id uuid primary key default gen_random_uuid(),
  source_url text,
  content_md text not null,
  tags text[] default '{}',
  notes text,
  created_at timestamptz default now()
);

create table if not exists negative_prompts (
  id serial primary key,
  token text unique not null,
  default_on boolean default true
);

create table if not exists usage_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  module text not null,
  action text not null,
  meta jsonb,
  created_at timestamptz default now()
);
```

**Storage:** bucket `project-assets`  
Paths: `/org_{id}/project_{id}/stills/c01.webp`, `/exports/project_{id}.zip`

**RLS (optional v1)**: If single org, can defer. Otherwise add org_id scoping policies.

---

## 7) API Contracts (Next.js API Routes)
_All endpoints stateless: they receive the full intake + selections and return deterministic JSON._

### 7.1 Video
**POST** `/api/video/plan`
```json
{
  "projectId":"uuid",
  "intake":{
    "totalDurationSec":42,
    "numClips":6,
    "perClipSec":7,
    "anchors":["orange gloves","7am light"],
    "negatives":["logos","extra people"],
    "style":["naturalistic","shallow DOF"],
    "camera":"close-up, slight dolly-in",
    "lighting":"warm key, soft fill"
  }
}
```
**Response**
```json
{
  "clips":[
    {"id":"c1","index":1,"duration_sec":7,
     "title":"Prep the Workpiece",
     "shot_description":"close-up, gentle dolly-in",
     "subject_action":"owner sanding cabinet door",
     "env_lighting":"workshop, warm key, soft fill",
     "style_attributes":["naturalistic","shallow DOF"],
     "continuity_anchors":["orange gloves","7am light"],
     "negatives":["logos","extra people"]}
  ]
}
```

**POST** `/api/video/stills`
```json
{
  "projectId":"uuid",
  "clips":[{"id":"c1","shot_description":"close-up, gentle dolly-in",
  "env_lighting":"workshop, warm key, soft fill",
  "style_attributes":["naturalistic"],
  "continuity_anchors":["orange gloves"],
  "negatives":["logos"]}]
}
```
**Response**
```json
{"stills":[{"clipId":"c1","imageUrl":"https://.../c1.webp","still_prompt":"…","seed":"1234"}]}
```

**POST** `/api/video/write`
```json
{
  "projectId":"uuid",
  "clips":[{"id":"c1","shot_description":"…","env_lighting":"…","style_attributes":["…"],"continuity_anchors":["…"],"negatives":["…"]}],
  "length_caps":{"prompt_chars":600}
}
```
**Response**
```json
{"prompts":[{"clipId":"c1","prompt":"…","alt_prompt":"…"}]}
```

**POST** `/api/video/voiceover`
```json
{"projectId":"uuid","mode":"per-clip","clips":[{"id":"c1","duration_sec":7,"title":"Prep the Workpiece"}]}
```
**Response**
```json
{"voiceover":[{"clipId":"c1","lines":[{"start":0,"end":3,"text":"…"},{"start":3,"end":7,"text":"…"}]}]}
```

**POST** `/api/video/package`
```json
{"projectId":"uuid","include":{"prompts":true,"stills":true,"vo":true,"shotlist":true}}
```
**Response**
```json
{"zipUrl":"https://.../project_abc123.zip"}
```

### 7.2 Email
**POST** `/api/email/plan`
```json
{"intake":{"goal":"nurture fthb","audience":"first-time homebuyers","cadence":"default","includeSms":false,"abSubjects":true}}
```
**Response**
```json
{"steps":[{"n":1,"type":"email","delay":1,"purpose":"set-expectations"},{"n":2,"type":"email","delay":4,"purpose":"deliver-value"}]}
```

**POST** `/api/email/write`
```json
{"intake":{...},"plan":{"steps":[...]},"brandKit":{"tone":["friendly","clear"],"default_cta":"Book a quick call"},"compliance":{"ban_numbers":true,"allow_rate_words":true}}
```
**Response**
```json
{"emails":[{"step":1,"preheader":"…","subjectA":"…","subjectB":"…","body":"…"}]}
```

### 7.3 Blog
**POST** `/api/blog/write`
```json
{"intake":{"topic":"AI voicemail for HVAC","length_words":1000,"persona":"owner-operator","seo_keyword":"HVAC missed calls","sources":[{"kbId":"uuid"}],"tone":"helpful","cta":"Get a demo"}}
```
**Response**
```json
{"outline":["…"],"draft_md":"# …","headlines":["…"],"meta_description":"…","cta_block":"…"}
```

### 7.4 Newsletter
**POST** `/api/newsletter/write`
```json
{"intake":{"theme":"September update","sections":["news","tip","promo"],"assets":[{"kbId":"uuid"}],"tone":"friendly"}}
```
**Response**
```json
{"sections":[{"type":"news","title":"…","body":"…"}],"repurpose":{"subject_options":["…"],"preview_text":["…"],"social_snippets":["…","…"]}}
```

---

## 8) Prompt Library (Files)
```
/prompt-library/
  video.json       # 10 commandments, caps, template strings
  email.json       # compliance guardrails + templates (planner/writer)
  blog.json        # outline→draft→polish templates
  newsletter.json  # section + repurpose templates
```

**video.json — Draft content**
```json
{
  "caps": {"prompt_chars": 600, "max_clips": 12, "default_clip_sec": 7},
  "negatives_default": ["logos","extra people","text artifacts", "brand names","distorted hands"],
  "commandments": [
    "Lock 3–5 anchors (identity/prop/time/color/location)",
    "Describe shot language (framing/lens/motion)",
    "Continuity rules across clips",
    "Separate composition, action, texture",
    "Avoid vague adjectives unless defined",
    "Add negatives (no logos, no extra people, no text artifacts)",
    "Realistic lighting notes (key/fill/back)",
    "<= 2 style attributes; describe attributes, not brands",
    "Safety/compliance line",
    "Version tags"
  ],
  "clip_template": "<shot>\nSubject: <subject_action>\nEnvironment/Light: <env_lighting>\nStyle: <style_attributes>\nContinuity: <anchors>\nAvoid: <negatives>"
}
```

---

## 9) UX & Interaction Details
### Global
- Copy buttons for every block; toast confirmation.
- Loading spinners; retry on failure; last-inputs cache.
- Error copy uses friendly language + suggestion.

### Video Project Tabs
- **Intake:** form with presets, anchors chips, negatives toggles.
- **Clips:** list of clip cards (editable titles, durations). Button: **Plan**.
- **Stills:** per-clip preview grid with **Regenerate**. Button: **Generate Stills**.
- **Prompts:** per-clip prompt + alt. Button: **Write Prompts**. Char counter.
- **VO:** preview lines; toggle per-clip vs. single read. Button: **Generate VO**.
- **Export:** buttons: **Download Shot List (CSV/JSON)**, **One‑Click Package**.

### Writers (Email/Blog/Newsletter)
- Unified intake form → **Generate** → results pane with **Regenerate w/ tweaks** sidebar and **Copy All**.

---

## 10) Non‑Functional Requirements
- **Performance:** sub-second UI; server actions are model-bound.  
- **Reliability:** retries for Storage/DB; idempotent packaging route.  
- **Security:** secrets server-side; optional Supabase Auth later.  
- **Privacy:** no PII v1; document any future PII retention.  
- **Observability:** Supabase + Vercel logs; `usage_events` for metrics.

---

## 11) Testing Plan
- **Unit:** clip planner (splits), email compliance regex, schema zod validators.  
- **Integration:** stills → Storage write → URL returns; package route produces valid zip; writers accept KB entries and apply brand kit/tone.  
- **Snapshots:** prompt shapes for regression.  
- **Manual QA:** run the HVAC preset end-to-end; verify zip contents and file names.

---

## 12) Delivery Plan (Milestones)
1) **A — Foundation (1–2 days):** Pages/tabs, Library screens, fake API responses.  
2) **B — Video Core:** real plan, stills, prompts, shot list.  
3) **C — VO + Package:** per-clip/single VO + zip export.  
4) **D — Writers:** Email, Blog, Newsletter functional.  
5) **E — Polish:** Presets, error UX, performance, docs.

---

## 13) Risks & Mitigations
- **Model artifacts/drift:** strong negatives; caps; quick regeneration UX.  
- **Cost variance:** cheap planner vs. premium writer; config switch.  
- **Vendor lock:** adapters per provider; prompt library external JSON.  
- **Storage bloat:** lifecycle policy or Archive toggle.

---

## 14) Runbook (Dev Setup & Ops)
**Local:**
- `pnpm i`; create `.env.local` with `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.  
- Run Supabase migrations; create Storage bucket `project-assets`.  
- `pnpm dev`.

**Vercel:**
- Import repo; set env vars; link Supabase; deploy.  
- Create Storage bucket; set CORS for signed URLs.

**Packaging:**
- Use `archiver` (Node) in server route; stream zip; upload to Storage; return signed URL.

---

## 15) What We Need From Max/Partner (to unblock build)
1) **Brand Kit Lite:** primary/secondary hex, 3–5 tone bullets, default CTA.  
2) **Negative Prompt v1:** 10–20 items (edit the seed above as needed).  
3) **Continuity Anchors list:** 8–12 chips you’ll reuse.  
4) **Knowledge Base seed:** 5–10 markdown entries (prompting rules, style notes, niche facts).  
5) **Presets (2):** name + short description + default anchors + default negatives.  
6) **Model choices:** planner vs. writer, stills model; or allow me to pick defaults.  
7) **Auth decision:** single-org no-auth vs. Supabase email/password.

---

## 16) Step‑By‑Step Build Checklist (Copy to Issues)
**Milestone A**
- [ ] Scaffold pages/tabs; global layout; Tailwind.
- [ ] Library: Brand Kit form; Negatives list; Anchors chips; KB CRUD (basic).
- [ ] API shells return mock data for `/video/*` and writers.

**Milestone B**
- [ ] Implement `/api/video/plan` planner (zod-validated; deterministic defaults).  
- [ ] Implement `/api/video/stills` (call image model, store to Storage, return signed URLs).  
- [ ] Implement `/api/video/write` (compose from template + anchors + negatives; enforce caps).  
- [ ] Shot list CSV/JSON download.

**Milestone C**
- [ ] `/api/video/voiceover` (per-clip and single-read modes).  
- [ ] `/api/video/package` (create zip; upload; return signed URL).  
- [ ] Usage events logging.

**Milestone D**
- [ ] `/api/email/plan`, `/api/email/write` with compliance validators.  
- [ ] `/api/blog/write` outline→draft→polish.  
- [ ] `/api/newsletter/write` sections + repurpose pack.

**Milestone E**
- [ ] Presets; error UX; polish; docs; sample projects.

---

## 17) Appendix
### 17.1 Zod Schema Sketches (for Cursor/Claude)
```ts
// video intake
const VideoIntake = z.object({
  totalDurationSec: z.number().int().min(7).max(600).optional(),
  numClips: z.number().int().min(1).max(12).optional(),
  perClipSec: z.number().int().min(3).max(15).optional(),
  anchors: z.array(z.string()).max(5).default([]),
  negatives: z.array(z.string()).default([]),
  style: z.array(z.string()).max(4).default([]),
  camera: z.string().max(120).optional(),
  lighting: z.string().max(120).optional(),
  voMode: z.enum(["per-clip","single","none"]).default("per-clip")
});

// video clip
const VideoClip = z.object({
  id: z.string(), index: z.number().int().min(1), duration_sec: z.number().int(),
  title: z.string().optional(), shot_description: z.string(), subject_action: z.string().optional(),
  env_lighting: z.string().optional(), style_attributes: z.array(z.string()).default([]),
  continuity_anchors: z.array(z.string()).default([]), negatives: z.array(z.string()).default([])
});
```

### 17.2 Knowledge Base CSV Template
```
source_url,content_md,tags,notes
https://example.com/article-1,"## Key takeaways...",video;prompting,"great for shot language"
```

### 17.3 Email Compliance Regex (examples)
- Ban numeric rates: `/\b\d{1,2}(\.\d{1,3})?\s?%\b/i`  
- Ban “guaranteed|approved”: case-insensitive terms.  
- Only allow `{{recipient.f_name}}` in body: scan template vars and reject others.

### 17.4 Packaging Filenames (deterministic)
```
c{index:02}.txt, c{index:02}_alt.txt, c{index:02}.webp
```

### 17.5 Error Messages (examples)
- **Too long prompt:** “That was getting wordy. I tightened framing & lighting; try again.”  
- **Still generation failure:** “The still didn’t save. I’ll retry once; otherwise click Regenerate.”

---

**End of PRD v1.0**

