# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is this?

Rohan is a mobile-first PWA that lets field sales reps photograph documents (up to 40 pages) and convert them to Excel using Claude Vision AI. Users install it on their phone from the browser.

## Key Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build (also runs lint)
npm run lint         # ESLint check
node scripts/generate-icons.js  # Regenerate PWA icons from SVG template
```

## Architecture

### App Flow (step state machine)

```
Auth gate → CaptureStep → ProcessingStep → ReviewStep → ExportStep
                              ↓
                        POST /api/extract (per image, sequential)
                              ↓
                        Claude Vision → JSON tables
```

`SnapSheetApp.js` orchestrates everything via a `step` state (`"capture"` → `"processing"` → `"review"` → `"export"`). Each step is its own component.

### Directory Layout

- `/src/app/` — Next.js App Router pages + API routes
- `/src/app/api/extract/` — Claude Vision extraction (auth + rate-limited)
- `/src/app/api/export/` — Excel file generation
- `/src/components/` — React components (all `"use client"`)
- `/src/hooks/` — `useAuth` (Firebase auth), `useScan` (extraction workflow), `useScans` (localStorage CRUD)
- `/src/lib/` — Server & client utilities (Claude, Firebase, Excel, rate limiting)
- `/public/` — PWA manifest, service worker, icons, offline page

### Data Flow

- **Extraction:** Client compresses image (1568px max, PNG with JPEG 0.92 fallback) → sends base64 + Firebase ID token to `/api/extract` → server verifies auth, checks rate limit, calls Claude Sonnet 4.5 → returns `{ tables, remaining }`
- **Storage:** All scan history is saved to **localStorage** on the device (key: `"rohan_scans"`). No Firestore reads/writes for scans.
- **Export:** Excel generated client-side via SheetJS (`/src/lib/excel.js`). Export paths: `downloadExcel` (direct `<a>` download), `saveExcelAs` (File System Access API with download fallback), cloud saves via `/src/lib/cloud-save.js` (Web Share API on mobile, download + open cloud service on desktop), native share (`navigator.share`).

### Server/Client Boundary

Server-only (in `/src/app/api/` and `/src/lib/`):
- `claude.js` — Claude API calls with `CLAUDE_API_KEY`
- `firebase-admin.js` — Token verification with `FIREBASE_PRIVATE_KEY` (lazy-loaded)
- `rate-limit.js` — In-memory per-user rate limiting (atomic check+record to prevent race conditions)

Client-only (components/hooks):
- Firebase client SDK for auth state
- Image compression via canvas
- localStorage for scan history

## Critical Rules

1. **`CLAUDE_API_KEY` and Firebase Admin credentials are SERVER-ONLY** — only use in `/src/app/api/` routes, never import `claude.js` or `firebase-admin.js` from client components
2. **The extraction prompt in `/src/lib/claude.js` is the most critical code** — it must return clean JSON with rows padded to match header count. The prompt uses a structured 4-step process (survey → count → extract → self-check) with anti-hallucination rules and transcription fidelity rules. When modifying the prompt, preserve the step structure and the "anti-hallucination rules" and "Transcription fidelity" sections.
3. **Dark theme only** — use the `snap-*` Tailwind color palette from `tailwind.config.js`. Never use hardcoded colors outside this palette.
4. **Mobile-first** — all touch targets 44×44px minimum. Use `min-h-[100dvh]` (not `min-h-screen`) for proper mobile viewport. Use `overscroll-behavior-y: contain` to prevent pull-to-refresh. Test on iOS Safari + Android Chrome.
5. **Cost control** — Model is `claude-sonnet-4-5-20250514` (upgraded from Haiku for accuracy). ~$0.09/extraction. Images compressed client-side (1568px max, PNG). Rate limits: 50 extractions/user/day, 500 global/day. ~$4.30/day max at full usage.
6. **Auth required everywhere** — Both `SnapSheetApp` and `HistoryPage` redirect to `/login` if unauthenticated. The extract API verifies Firebase ID tokens server-side.
7. **All hooks must be called before early returns** — Several components have auth-gate early returns; all `useState`/`useCallback`/custom hooks must be declared above these to satisfy React's rules of hooks.

## Env Vars Required

```
CLAUDE_API_KEY                             # Server-only — Claude API
NEXT_PUBLIC_FIREBASE_API_KEY               # Client — Firebase public config
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_CLIENT_EMAIL                      # Server-only — Firebase Admin
FIREBASE_PRIVATE_KEY                       # Server-only — Firebase Admin
```

## Deployment (Vercel)

- Deployed to **Vercel** from branch `claude/build-phase-1-4ZlxJ` (currently treated as Production).
- **`NEXT_PUBLIC_*` vars are inlined at build time** — if you add/change them on Vercel, you must trigger a redeploy for the client bundle to pick up the new values. Server-only vars (`CLAUDE_API_KEY`, `FIREBASE_*`) take effect immediately on cold starts.
- **Vercel env var pitfalls**: When setting env vars via `vercel env add`, ensure values have NO trailing `\n`. The Vercel CLI can silently append newlines when piping values, which breaks Firebase Auth (e.g., `"image-to-excel-5cfd5\n"` causes audience mismatch). Use `--sensitive` for `FIREBASE_PRIVATE_KEY`.
- **`FIREBASE_PRIVATE_KEY` format**: On Vercel it should have real newlines (not `\\n` escape sequences). The `parsePrivateKey()` function in `firebase-admin.js` handles both formats. When uploading via CLI, pipe from a file to preserve newlines.
- Env vars must be set for **both Production and Preview** environments. Use `vercel env ls` to verify. Missing env vars in one environment causes silent auth failures.

## Key Implementation Details

- **Rate limiting** is in-memory (`/src/lib/rate-limit.js`) using atomic `checkAndRecordExtraction()` — resets on serverless cold starts. Acceptable for <50 users. Would need Redis for multi-instance.
- **Auth fallback** — Extract API tries Firebase Admin SDK first, falls back to REST API verification (`identitytoolkit.googleapis.com`) when Admin SDK is unavailable. REST fallback validates JWT claims (exp, aud).
- **Image compression** targets 1568px max dimension (Anthropic's internal max). Prefers PNG (lossless, best for tables/text). Falls back to JPEG 0.92 if PNG exceeds 4MB. The 1568px and PNG format are chosen because Anthropic's vision pipeline downscales anything above 1568px anyway, and PNG preserves text edges/gridlines that JPEG compression destroys.
- **Service worker** (`/public/sw.js`) uses network-first for navigation with offline fallback, cache-first for static assets, and never caches API routes or Firebase calls. Cache version is `"rohan-v3"` — bump when changing caching strategy.
- **PWA install prompt** (`InstallPrompt.js`) is mobile-only (touch device gate). Three prompt types: Android native (`beforeinstallprompt`), iOS Safari (manual share instructions), and Android fallback after 2s (manual "tap ⋮ → Add to Home screen"). Dismissal persisted to localStorage.
- **EditableTable** allows inline cell editing, add/delete rows and columns. State flows up through `setTables` callback to `ReviewStep` → `SnapSheetApp`.
- **Export API** sanitizes all table data (title, headers, cells) with length limits before generating Excel. Max: 100 tables, 10K rows/table, 100 columns.
- **localStorage validation** in `useScans.js` filters out malformed entries and rejects prototype pollution attempts via `Object.prototype.hasOwnProperty.call(scan, "__proto__")`.
- **Cloud save pattern** (`/src/lib/cloud-save.js`): All three cloud buttons (Drive, OneDrive, Dropbox) share the same pattern — try `navigator.share()` first (works on mobile), fall back to blob download + open cloud URL. `URL.revokeObjectURL` is delayed 5s for mobile compatibility. The "Share to Other Apps" button is conditionally rendered via `canShareFiles()` check.
- **CaptureStep has two distinct states**: Empty state shows a hero SVG illustration (document→spreadsheet), value proposition headline, feature pills, and a 2-column action card grid (From Gallery + Take Photo). Populated state collapses to a compact "Add More" upload box + camera button + image grid + process CTA. The `HeroIllustration` is an inline SVG component defined inside `CaptureStep.js`.
- **Icon system**: BottomNav and action cards use inline SVGs (stroke-based, 22–32px) instead of emojis. SVG icons dynamically change stroke color based on active state (#4F8EF7 active, #5A6178 inactive). ExportStep uses inline SVG brand logos (Google Drive, OneDrive, Dropbox).
- **BottomNav** uses a glass morphism effect (`backdrop-blur-xl` + semi-transparent background) with a blue active indicator bar (top accent line with glow shadow).
- **`next build` kills the running dev server** — always restart `npm run dev` after building.
- **Safe area CSS pattern**: `.safe-area-top` in `globals.css` uses `padding-top: calc(1rem + env(safe-area-inset-top, 0px))` — the base `1rem` ensures spacing on all devices, while `env()` adds extra on notched phones. Do NOT use a separate Tailwind `pt-*` class alongside `safe-area-top` — the CSS class will override it. Same pattern applies to `.safe-area-bottom`.
- **Header component** (`Header.js`) uses `safe-area-top` class and is `sticky top-0`. Do not add redundant Tailwind top-padding.

## Vercel Deployment Notes

- **Fluid Compute** is enabled via `vercel.json` (`"fluid": true`). This gives the Hobby plan up to 300s function timeout.
- The extract route has `maxDuration = 60` for Sonnet's longer response times.
- Production env vars were fixed (trailing `\n` issue from `echo` piping — use `printf '%s'` instead).
- Both `/api/extract` and `/api/export` have REST auth fallback, so they work even if Firebase Admin SDK fails to initialize.
