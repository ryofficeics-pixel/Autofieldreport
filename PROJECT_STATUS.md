# PROJECT_STATUS

Date: 2026-05-26  
Branch: `production-saas-rebuild`

## Stage summary

- Stage 1 Audit: `DONE`
- Stage 2 Backup/Branch/Doc authority: `DONE`
- Stage 3 Multi-company foundation + RLS baseline: `PARTIAL`
- Stage 4 Auth/RBAC bootstrap scaffolding: `PARTIAL`
- Stage 5 Secure media upload: `PARTIAL`
- Stage 6 Offline queue/sync: `PARTIAL`
- Stage 7 Report modules: `PARTIAL`
- Stage 8 Module contracts: `DONE`
- Stage 9 PDF parity: `PARTIAL`
- Stage 10 Mobile/performance: `PARTIAL` (UI shell responsiveness only)
- Stage 11 Env/deploy safety: `PARTIAL`
- Stage 12 Full verification: `NOT VERIFIED`

## Verification table

| Area | Status | Evidence | Notes |
|---|---|---|---|
| Auth | PARTIAL | `tools/auth-session.js`, `/api/public-config`, `/api/auth-context`, report pages auth UI | Real session flow implemented, live credential verification pending |
| Company isolation | NOT VERIFIED | RLS SQL written in migrations | Not applied/tested against live DB |
| RBAC/RLS | PARTIAL | `supabase/migrations/20260526162000_rls_and_permission_seed.sql` | Policy logic exists, runtime test pending |
| Reports | PARTIAL | `api/reports-save.js`, `api/reports-transition.js`, `api/reports-list.js`, `api/projects-list.js`, `tools/*` report pages | Core modules use session-based auth + active-company + project selector |
| Media upload | PARTIAL | `tools/report-form.js` + `tools/media-upload.js` calls secure media endpoints | Wired in core report pages, live token/env verification pending |
| Offline sync | PARTIAL | `ui/offline-queue.js` + queue sync button and `online` auto-sync trigger in report pages | Queue handles `report.save`, `report.transition`, and `media.upload`; live replay validation pending |
| PDF/export | PARTIAL | `tools/report-export.js` shared preview/print renderer | Print/PDF baseline exists, strict parity validation pending |
| Mobile UI | PARTIAL | `index.html`, `ui/styles.css` responsive layout | Real module forms not implemented |
| Build/deploy | BLOCKED | `npm run check:env` failed | Required env vars not set |

## Command evidence

- `npm.cmd install` -> success, 0 vulnerabilities
- `npm.cmd run verify:auth-flow` -> passed
- `npm.cmd run verify:baseline` -> passed
- `npm.cmd run verify:export-parity` -> passed (static parity guard)
- `npm.cmd run check:env` -> failed due missing required public/server env
- `npm.cmd run verify:rls-smoke` -> blocked (`SUPABASE_DB_URL` missing)

## Current blockers

1. Missing env values for Supabase/Cloudinary.
2. `SUPABASE_DB_URL` is missing, so live RLS smoke test cannot run.
3. Strict preview-vs-PDF parity is not yet validated with real report media sets.
4. Production deploy is not verified.

## Prepared but not executed

- `supabase/tests/rls_smoke_test.sql`
- `docs/RLS_TEST_RUNBOOK.md`

## CI baseline

- `.github/workflows/ci.yml` runs `verify:auth-flow` and `verify:baseline` on `main` and `production-saas-rebuild`.
