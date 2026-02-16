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

- **Extraction:** Client compresses image (1024px max, JPEG 0.7) → sends base64 + Firebase ID token to `/api/extract` → server verifies auth, checks rate limit, calls Claude Haiku → returns `{ tables, remaining }`
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
2. **The extraction prompt in `/src/lib/claude.js` is the most critical code** — it must return clean JSON with rows padded to match header count. The prompt includes strict transcription fidelity rules to prevent phantom punctuation (added dots, periods, slashes). When modifying the prompt, always preserve the "CRITICAL — Transcription fidelity" section.
3. **Dark theme only** — use the `snap-*` Tailwind color palette from `tailwind.config.js`. Never use hardcoded colors outside this palette.
4. **Mobile-first** — all touch targets 44×44px minimum. Use `min-h-[100dvh]` (not `min-h-screen`) for proper mobile viewport. Use `overscroll-behavior-y: contain` to prevent pull-to-refresh. Test on iOS Safari + Android Chrome.
5. **Cost control** — Model is `claude-haiku-4-5-20251001` (cheapest). Images are compressed client-side. Rate limits: 50 extractions/user/day, 500 global/day. Don't switch to a more expensive model without discussing cost.
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

## Key Implementation Details

- **Rate limiting** is in-memory (`/src/lib/rate-limit.js`) using atomic `checkAndRecordExtraction()` — resets on serverless cold starts. Acceptable for <50 users. Would need Redis for multi-instance.
- **Auth fallback** — Extract API tries Firebase Admin SDK first, falls back to REST API verification (`identitytoolkit.googleapis.com`) when Admin SDK is unavailable. REST fallback validates JWT claims (exp, aud).
- **Image compression** targets 1024px max dimension at JPEG 0.7 quality. If OCR accuracy drops, increase quality or resolution.
- **Service worker** (`/public/sw.js`) uses network-first for navigation with offline fallback, cache-first for static assets, and never caches API routes or Firebase calls. Cache version is `"rohan-v2"` — bump when changing caching strategy.
- **PWA install prompt** (`InstallPrompt.js`) uses `beforeinstallprompt` for Android/Chrome and shows manual instructions for iOS Safari. Dismissal is persisted to localStorage.
- **EditableTable** allows inline cell editing, add/delete rows and columns. State flows up through `setTables` callback to `ReviewStep` → `SnapSheetApp`.
- **Export API** sanitizes all table data (title, headers, cells) with length limits before generating Excel. Max: 100 tables, 10K rows/table, 100 columns.
- **localStorage validation** in `useScans.js` filters out malformed entries and rejects prototype pollution attempts via `Object.prototype.hasOwnProperty.call(scan, "__proto__")`.
- **Cloud save pattern** (`/src/lib/cloud-save.js`): All three cloud buttons (Drive, OneDrive, Dropbox) share the same pattern — try `navigator.share()` first (works on mobile), fall back to blob download + open cloud URL. `URL.revokeObjectURL` is delayed 5s for mobile compatibility. The "Share to Other Apps" button is conditionally rendered via `canShareFiles()` check.
- **`next build` kills the running dev server** — always restart `npm run dev` after building.
