# Auto Field Report — Prompt Pack

Generated: 2026-05-26

Use this zip as the staged instruction set for Codex / Claude / any AI agent working on Auto Field Report.

## Purpose
Build Auto Field Report as a real SaaS operating system for field reports, project evidence, secure media, offline sync, approvals, exports, and admin control.

Do not treat this as static HTML final product. Static/offline HTML is allowed only for review or prototype.

## Recommended execution order

1. `00_MASTER_PROJECT_INSTRUCTIONS.md`
2. `01_AGENT_START_AND_REPO_AUDIT.md`
3. `02_BACKUP_BRANCH_AND_DOC_AUTHORITY.md`
4. `03_ARCHITECTURE_MULTI_COMPANY_SUPABASE.md`
5. `04_AUTH_COMPANY_RBAC_RLS.md`
6. `05_SECURE_MEDIA_UPLOAD_CLOUDINARY.md`
7. `06_OFFLINE_QUEUE_AND_SYNC.md`
8. `07_REPORT_MODULES_DAILY_WEEKLY_SURVEY.md`
9. `08_EXTERNAL_MODULE_CONTRACTS.md`
10. `09_PDF_EXPORT_PREVIEW_MATCH.md`
11. `10_MOBILE_UI_PERFORMANCE.md`
12. `11_ENV_VERCEL_DEPLOYMENT.md`
13. `12_TESTING_VERIFICATION_CHECKLIST.md`
14. `13_CODEX_RESUME_TEMPLATE.md`
15. `14_SINGLE_MASSIVE_AGENTIC_PROMPT.md`

## Current known context to preserve

- Project name: **Auto Field Report**.
- Prior naming variants are obsolete if they conflict.
- Target stack: Vercel + Supabase Auth/Postgres/RLS + Cloudinary signed/backend-mediated upload + IndexedDB offline queue.
- Latest known blockers from prior checkpoints:
  - Missing production Vercel envs: `SUPABASE_SERVICE_ROLE_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
  - First admin bootstrap may still be required.
  - RLS recursion / stack depth issue must be tested and fixed if present.
  - Offline reconnect sync must be verified with real pending → synced transition.
  - External modules need explicit backend integration contracts.

## How to use

For staged execution, paste one file at a time into Codex.
For full autonomous run, paste `14_SINGLE_MASSIVE_AGENTIC_PROMPT.md`.

## Non-negotiable status language

- `DONE` only after verified UI + backend + permissions + mobile + build.
- `PARTIAL` if implemented but not fully verified.
- `BLOCKED` if a specific external issue prevents completion.
- `NOT VERIFIED` if not tested.

## Output required from agent after each stage

Agent must report:
- files changed
- migrations added/applied
- env vars required
- tests/checks run
- results
- remaining blockers
- exact next step
