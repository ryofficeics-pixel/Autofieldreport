# CODEX_RESUME

Date: 2026-05-26  
Current project: Auto Field Report  
Current branch: `production-saas-rebuild`

## Last completed stage

`09_PDF_EXPORT_PREVIEW_MATCH` baseline plus auth/session upgrade  
with partial progress in stages 03, 04, 05, 06, 07, 09, 10, and 11.

## What changed

- `index.html` - new UI shell using design system from `docs/DESIGN_SOURCE.md`
- `ui/styles.css`, `ui/app.js` - responsive design tokens and mobile nav behavior
- `supabase/migrations/20260526161000_multi_company_foundation.sql` - base schema/functions
- `supabase/migrations/20260526162000_rls_and_permission_seed.sql` - permissions and RLS policy baseline
- `scripts/check-env.mjs` - deployment env preflight
- `scripts/bootstrap-first-admin.mjs` - idempotent first-admin bootstrap scaffold
- `api/cloudinary-signature.js`, `api/media-register.js` - secure media API baseline
- `api/public-config.js`, `api/auth-context.js` - frontend-safe config and authenticated company/role/permission context endpoint
- `api/reports-save.js`, `api/reports-transition.js`, `api/reports-list.js`, `api/projects-list.js` - report/project APIs
- `ui/offline-queue.js` - IndexedDB queue baseline
- `tools/daily-report`, `tools/weekly-report`, `tools/survey-report`, `tools/progress-report` - module UI baseline pages
- `tools/report-export.js` - shared preview/print renderer used by all core report pages
- `tools/media-upload.js` + report-form wiring - signed upload and media metadata registration flow
- `tools/auth-session.js` + report-page auth UI wiring - Supabase login/logout/session persistence and active-company selector
- report pages now load projects per active company and persist project selection per company
- `supabase/tests/rls_smoke_test.sql`, `docs/RLS_TEST_RUNBOOK.md` - prepared DB policy smoke verification assets
- `.github/workflows/ci.yml` - repository CI for baseline/auth-flow regression checks
- `docs/module-contracts/*` - shared and per-module integration contracts
- `docs/MEDIA_UPLOAD_API.md`, `docs/OFFLINE_QUEUE_STATUS.md` - implementation notes
- `ENV_SETUP.md`, `VERCEL_PRODUCTION_ENV_SETUP.md`, `DEPLOYMENT.md`, `.env.example` - env/deploy safety docs

## Known blockers

1. No live Supabase project values configured in environment yet.
2. Supabase migrations and RLS policies are not yet verified on live project.
3. Report export exists as baseline print flow, but parity testing with real data/media is pending.
4. Production deployment is not yet validated end-to-end.

## Required env vars

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_URL`
- `VITE_ENVIRONMENT`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## Next exact action

Run live verification once env values are configured: apply/test RLS SQL, validate auth + company isolation + project selector + media upload + queued replay + export parity, then verify production deployment flow.

## Verification commands run

```bash
npm.cmd install
npm.cmd run verify:auth-flow
npm.cmd run verify:baseline
npm.cmd run verify:export-parity
npm.cmd run check:env
npm.cmd run verify:rls-smoke
```
