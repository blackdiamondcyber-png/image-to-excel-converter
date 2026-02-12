# CLAUDE.md — SnapSheet Project
## What is this?
SnapSheet is a mobile-first Next.js web app that lets field sales reps photograph documents and convert them to Excel using Claude Vision AI. Built with Next.js 14 (App Router), Firebase (auth + Firestore + storage), Anthropic Claude API (vision), and SheetJS.
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
- `/src/lib/` — Firebase clients, Claude helper, Excel utils
## Critical Rules
1. **Claude API key is SERVER-ONLY** — only use in `/src/app/api/` routes, never expose to client
2. **Firebase Admin credentials are SERVER-ONLY** — never expose `FIREBASE_PRIVATE_KEY` or `FIREBASE_CLIENT_EMAIL` to client
3. **Mobile-first** — all touch targets 44×44px minimum, test on iOS Safari + Android Chrome
4. **Dark theme** — use the `snap-*` Tailwind color palette defined in tailwind.config.js
5. **The extraction prompt in `/api/extract/route.js` is the most critical code** — it must return clean JSON with padded rows
## Core Workflow
capture images → POST each to /api/extract → get JSON tables back → user reviews/edits → POST to /api/export → download .xlsx + save to Firestore
## Env Vars Required
```
ANTHROPIC_API_KEY
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
```
