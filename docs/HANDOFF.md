# HANDOFF: SnapSheet (Image to Excel)

Updated 2026-09-25 by Claude Code.

## Current state

- Production: https://image-to-excel-convertor.vercel.app serves a production build of `main` at `bd638f3` (deployment `dpl_2WBF4JDQG1LMR4z8SdbprBkiu9Sh`, created through the Vercel API on 2026-09-25). The public address and the team production alias point at it. The `git-main` alias follows the newest `main` build, which stays a preview until the branch setting below is fixed.
- Model: `claude-sonnet-5` with default adaptive thinking, `max_tokens: 16000`, no `temperature` (Sonnet 5 rejects it with a 400).
- `src/lib/claude.js`: `assertCompleteResponse()` turns `stop_reason` `max_tokens` or `refusal` into an `ExtractionError`, which `/api/extract` returns as a 422 with a readable message. `maxDuration` is 300, the Hobby maximum.
- Verified 2026-09-25: unit tests 26/26; a live extraction of `test-invoice.png` through the shipped extractor returned 6 of 6 rows, $244.62 total, in 2.5 s; `/api/extract` returns 401 to anyone not signed in.

## Status and optional checks

- Erik does not use SnapSheet day to day but keeps it live as a possible portfolio showcase (decided 2026-09-25). Sign-up is open to anyone, with 50 extractions per user per day on Erik's Anthropic key; the limits are in memory and reset on cold starts. Pausing the Vercel project (`pause_project`, reversible) is the fallback if that ever matters.
- Before any demo: one real signed-in upload. It confirms the stored `ANTHROPIC_API_KEY` (added 13 Mar), untested since the model change.
- Vercel's production branch still tracks the deleted `claude/build-phase-1-4ZlxJ`, and the API cannot change it. Until Erik sets it to `main` (Settings > Environments > Production > Branch Tracking), a push to `main` builds a preview only. A session can still ship production with `create_deployment` from `main` (`gitSource`, target production), as on 2026-09-25.

## Gotchas

- An env var change needs a fresh build. Redeploying an old deployment keeps its old env snapshot.
- The Vercel free plan caps deploys at 100 a day across the whole account.
