# Auto Field Report — Codex Prompt Pack

Project target: production-grade, scalable, secure, multi-company field reporting SaaS.

Global rules for every prompt:
- Audit repo first.
- Backup before major edits.
- Preserve existing working features.
- No demo-only logic in production path.
- No hardcoded company/user/project/business data.
- All business data must be scoped by company_id.
- Backend/RLS/API must enforce permissions. Frontend checks are UX only.
- Do not expose service role keys or secrets.
- If unverified, mark `NOT VERIFIED`.
- If blocked, state exact blocker.


# Single Massive Agentic Prompt — Auto Field Report Production SaaS Rebuild

You are Codex with full repo access. Work autonomously. Do not ask unnecessary questions. Make safe practical assumptions and document them.

## Mission
Upgrade Auto Field Report into a real production-grade, scalable, secure, multi-company SaaS for field reporting, media evidence, offline sync, approvals, PDF/export, and modular tools.

## Hard constraints

- Backup before major edits.
- Preserve working features.
- No demo-only logic in production path.
- No hardcoded company/user/project IDs.
- No hardcoded admin emails.
- No unscoped database queries.
- No client-only authorization.
- No exposed service role keys.
- No unsafe unsigned public upload flow.
- No fake success status.
- Do not claim complete unless verified.

## Execution order

### Stage 1 — Audit

- Inspect repo structure.
- Detect stack.
- Identify working features and blockers.
- Create/update `docs/AUDIT_CURRENT_STATE.md`.

### Stage 2 — Backup + docs authority

- Create full backup named `Auto Field Report backup before production SaaS rebuild May 2026`.
- Create branch `production-saas-rebuild`.
- Update `.gitignore`.
- Make `fixed rule.md` canonical.
- Mark conflicting obsolete docs as non-authoritative.

### Stage 3 — Supabase multi-company foundation

Implement/repair migrations for:

- profiles
- companies
- company_members
- roles
- permissions
- role_permissions
- projects
- locations
- teams
- audit_logs
- media_files
- offline_sync_jobs/sync logs
- report module tables if missing

Add company-scoped indexes, constraints, triggers, and RLS.
Fix any RLS recursion/stack depth issues.

### Stage 4 — Auth + active company + RBAC

- Load user profile and company memberships.
- Require explicit active company.
- Implement capability permissions.
- Backend/RLS/API enforces permissions.
- Add safe first-admin bootstrap script.
- No hardcoded admin email.

### Stage 5 — Secure Cloudinary media

- Implement signed/backend-mediated upload.
- Validate session, company, project, permission, file type/size.
- Store media metadata in DB.
- Link media to reports by media ID.
- Queue media safely offline.

### Stage 6 — Offline queue/sync

- IndexedDB persistent queue.
- Pending/syncing/synced/failed/conflict statuses.
- Reconnect/manual retry.
- Backend confirmation before synced.
- Fix known issue: pending item stays pending tries 0 after reconnect.

### Stage 7 — Report modules

Repair/wire:

- Daily Report
- Weekly Report
- Survey Report
- Progress Report if present

Each must have schema/API/UI/validation/permissions/audit/offline/export/docs.

### Stage 8 — External module contracts

Create `docs/module-contracts/` for:

- daily-report
- progress-report
- survey-report
- absensi-karyawan
- absensi-admin
- module-generator
- roi-simulator
- estimator
- RAB Otomatis if present/planned

Define auth/session/company/project/permission/media/offline/export contracts.

### Stage 9 — PDF/export match preview

- Shared template or strict equivalent.
- Fix daily report photo layout mismatch.
- Fix weekly report export errors.
- No export success unless file generated.
- Audit export action where relevant.

### Stage 10 — Mobile performance

- Mobile-first UI.
- Large tap targets.
- No laggy input.
- Fix ROI simulator mobile input lag if present.
- Paginate/lazy load large data.
- Avoid loading all company data.

### Stage 11 — Env/deploy safety

Create/update:

- `.env.example`
- `ENV_SETUP.md`
- `VERCEL_PRODUCTION_ENV_SETUP.md`
- `DEPLOYMENT.md`
- env preflight script

Required envs:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_URL`
- `VITE_ENVIRONMENT`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Do not deploy production if required server envs missing.

### Stage 12 — Verification

Run/check:

- auth block unauthenticated
- company isolation
- RBAC allow/deny
- CRUD reports/projects
- media upload
- offline create/refresh/reconnect sync
- PDF preview/output match
- mobile layout
- build
- env preflight

Update `PROJECT_STATUS.md` with statuses only from evidence:

- DONE
- PARTIAL
- BLOCKED
- NOT VERIFIED

Update `CODEX_RESUME.md` with exact next action.

## Final response required

Report:

- backup location
- branch name
- files changed
- migrations changed
- tests run
- exact verification table
- production deploy status
- blockers
- next action

Never pretend completion.
