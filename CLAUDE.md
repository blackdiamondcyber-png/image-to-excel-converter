# CLAUDE.md — SnapSheet Project
## What is this?
SnapSheet is a mobile-first Next.js web app that lets field sales reps photograph documents and convert them to Excel using Claude Vision AI. Built with Next.js 14 (App Router), Supabase (auth + storage + DB), Anthropic Claude API (vision), and SheetJS.
## Key Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Lint check
```
## Architecture
- `/src/app/` — Next.js App Router pages + API routes
- `/src/components/` — React components
- `/src/hooks/` — Custom hooks (useAuth, useScan, useScans)
- `/src/lib/` — Supabase clients, Claude helper, Excel utils
- `/supabase/schema.sql` — Full database schema
## Critical Rules
1. **Claude API key is SERVER-ONLY** — only use in `/src/app/api/` routes, never expose to client
2. **All Supabase queries use RLS** — never use service role key on client side
3. **Mobile-first** — all touch targets 44×44px minimum, test on iOS Safari + Android Chrome
4. **Dark theme** — use the `snap-*` Tailwind color palette defined in tailwind.config.js
5. **The extraction prompt in `/api/extract/route.js` is the most critical code** — it must return clean JSON with padded rows
## Core Workflow
capture images → POST each to /api/extract → get JSON tables back → user reviews/edits → POST to /api/export → download .xlsx + save to Supabase
## Env Vars Required
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
```
