# SECURITY + LOGIC AUDIT WITH SAFE AUTO-RESOLVE

Use this file as an instruction prompt for Codex / Claude / AI coding agent working inside the GitHub repository.

Project: **Auto Field Report**
Goal: perform a high-level security audit, logic audit, GitHub repository hygiene audit, and safe auto-resolution pass without breaking existing working features.

This is a production SaaS system, not a demo. Treat all data, users, companies, uploads, reports, permissions, and exports as real operational assets.

---

## 0. Operating Mode

You are acting as a senior security engineer, backend architect, SaaS auditor, and code reviewer.

Your tasks:

1. Audit the full repository.
2. Identify security risks.
3. Identify business logic flaws.
4. Identify multi-company isolation failures.
5. Identify GitHub exposure risks.
6. Identify unsafe upload/media flows.
7. Identify offline-sync risks.
8. Identify fake/demo/local-only logic.
9. Auto-resolve safe issues directly.
10. Document unresolved risks clearly.
11. Do not fake completion.

Do not ask unnecessary questions.
Make practical assumptions.
If a fix is safe and obvious, implement it.
If a fix may break production behavior, document it and create a minimal safe patch instead.

---

## 1. Non-Negotiable Rules

Do not:

- Delete working features.
- Rewrite unrelated modules.
- Hardcode admin emails.
- Hardcode company IDs.
- Hardcode project IDs.
- Hardcode business data.
- Expose service role keys.
- Commit real secrets.
- Trust frontend-only role checks.
- Use localStorage as production source of truth.
- Allow anonymous unsafe upload.
- Use public unrestricted storage for private company files.
- Bypass RLS without documented reason.
- Mark offline data as synced before backend confirmation.
- Claim complete unless verified.

Required production principles:

- Multi-company ready.
- Company-scoped data access.
- Role-based permissions.
- Backend/RLS enforcement.
- Audit logs for critical actions.
- Secure upload flow.
- Real database writes.
- Mobile-safe UI behavior.
- Safe offline queue where relevant.
- Docs aligned with actual code.

---

## 2. Required First Step: Repository Snapshot

Before editing anything:

1. Inspect repository structure.
2. Identify framework and runtime.
3. Identify frontend, backend, API, database, migration, storage, auth, and deployment files.
4. Identify current Git branch.
5. Create a safe branch if possible:

```bash
git checkout -b audit/security-logic-auto-resolve
```

If branch creation fails, continue but document the reason.

Run:

```bash
git status --short
git branch --show-current
find . -maxdepth 3 -type f | sed 's#^./##' | sort | head -300
```

If running on Windows PowerShell, use equivalent commands.

Create or update:

```text
AUDIT_SECURITY_LOGIC_REPORT.md
```

---

## 3. GitHub Exposure Audit

Audit all files that may be uploaded to GitHub.

Check for secrets in:

- `.env`
- `.env.local`
- `.env.production`
- `.env.development`
- `.vercel`
- `supabase/.temp`
- config files
- source files
- deployment files
- docs
- logs
- zip files
- screenshots
- exported reports
- test fixtures

Search patterns:

```bash
grep -RInE "(SUPABASE_SERVICE_ROLE|service_role|SECRET|PRIVATE_KEY|API_SECRET|CLOUDINARY_API_SECRET|DATABASE_URL|JWT_SECRET|TOKEN|PASSWORD|OPENAI_API_KEY|ANTHROPIC_API_KEY|TELEGRAM_BOT_TOKEN|VERCEL_TOKEN)" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=build
```

Also search for likely leaked key formats:

```bash
grep -RInE "(sk-[A-Za-z0-9_-]{20,}|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|postgres://|postgresql://|cloudinary://)" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=build
```

Auto-resolve safe issues:

- Add missing `.gitignore` entries.
- Create or update `.env.example` with placeholders only.
- Remove committed generated logs if safe.
- Remove committed zip/build artifacts if safe.
- Replace fake sample secrets in docs with placeholders.

Required `.gitignore` minimum:

```gitignore
.env
.env.*
!.env.example

node_modules/
dist/
build/
.next/
.vercel/

*.log
logs/

*.zip
*.rar
*.7z

.DS_Store
Thumbs.db

supabase/.temp/
```

Never delete real source code.
If a suspected secret is already committed, document:

- file path
- variable/key name
- risk level
- exact remediation needed

Do not print full secret values in the report.
Mask them.

---

## 4. Auth and Session Audit

Audit authentication implementation.

Check:

- Auth provider is configured correctly.
- Protected pages require authenticated session.
- API endpoints verify session server-side.
- User profile is loaded from backend, not trusted from localStorage.
- Session refresh failures are handled.
- Logout clears sensitive client state.
- No hardcoded demo user bypass exists.

Search for unsafe patterns:

```bash
grep -RInE "(demoUser|mockUser|fakeUser|isAdmin = true|admin@|localStorage.*user|role.*localStorage|bypassAuth|skipAuth|TODO.*auth|FIXME.*auth)" src app pages components lib server api supabase 2>/dev/null
```

Auto-resolve safe issues:

- Remove obvious demo bypasses.
- Add guards to protected routes.
- Add server-side session validation wrapper/helper if missing.
- Replace localStorage role/session source of truth with backend/session-derived value.
- Add structured unauthorized error response.

Required API unauthorized response:

```json
{
  "ok": false,
  "data": null,
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Authentication required"
  }
}
```

---

## 5. Multi-Company Isolation Audit

Every business record must be scoped by `company_id`.

Audit database schema, migrations, queries, API services, UI filters, and exports.

Required checks:

- Every business table has `company_id`.
- Every business table has `created_by`, `created_at`, `updated_at` where relevant.
- Soft delete exists where business deletion is needed.
- Queries include company scope.
- Mutations validate active company membership.
- User active company is explicit.
- Users can belong to multiple companies.
- No global reads unless reference data is intentionally public.

Search unsafe query patterns:

```bash
grep -RInE "\.select\(|\.insert\(|\.update\(|\.delete\(|from\(" src app pages components lib server api supabase 2>/dev/null
```

For every Supabase query, verify:

- `company_id` filter exists for business data.
- user has membership in company.
- project/location/team records belong to same company.
- no cross-company joins leak data.

Auto-resolve safe issues:

- Add `company_id` filters to clearly company-owned queries.
- Add active company requirement helper.
- Add company membership validation to API routes.
- Add missing indexes in migrations.

Required helper behavior:

```ts
requireActiveCompany(ctx): Promise<{ companyId: string; userId: string }>
requirePermission(ctx, companyId, permission): Promise<void>
```

If schema is missing `company_id`, do not blindly patch all code. Add migration only when ownership is clear. Otherwise document as blocker.

---

## 6. RLS / Authorization Audit

Audit Supabase Row Level Security and backend authorization.

Required checks:

- RLS enabled on business tables.
- Policies isolate by company membership.
- Policies do not recurse infinitely.
- Policies distinguish read/write/admin actions.
- Service role key is server-only.
- Frontend never uses service role key.
- Admin-only actions are enforced server-side.
- Permission model is capability-based, not only role-name UI hiding.

Look for:

- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- policies on all business tables
- helper SQL functions for membership/permissions
- SECURITY DEFINER functions with safe `search_path`
- recursive policy references

Auto-resolve safe issues:

- Add missing `ENABLE ROW LEVEL SECURITY` for obvious business tables.
- Add safer helper SQL functions if current policies recurse.
- Add missing server-side permission checks for sensitive API routes.
- Add tests or SQL verification scripts for isolation.

Minimum RLS test scenarios:

1. Unauthenticated user cannot read private business data.
2. User from Company A cannot read Company B data.
3. Staff cannot perform admin-only mutation.
4. Correct role can perform allowed action.
5. Project-scoped record cannot attach to project from another company.

If RLS is broken, mark production readiness as blocked.

---

## 7. Role and Permission Logic Audit

Audit roles and permissions.

Minimum roles:

- owner
- admin
- manager
- supervisor
- staff
- viewer

Minimum permission model:

- `project.create`
- `project.read`
- `project.update`
- `report.create`
- `report.read`
- `report.update`
- `report.approve`
- `report.export`
- `media.upload`
- `user.invite`
- `settings.manage`

Required checks:

- Backend enforces permissions.
- Frontend hiding buttons is not treated as security.
- Role changes are audited.
- Owner/admin escalation is protected.
- User cannot assign higher permissions than they possess.
- Viewer cannot mutate data.

Auto-resolve safe issues:

- Add permission constants.
- Add centralized `hasPermission` / `requirePermission` helper.
- Replace scattered role string checks with permission checks where safe.
- Add denial response for insufficient permission.

Required permission error:

```json
{
  "ok": false,
  "data": null,
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "User does not have permission for this action"
  }
}
```

---

## 8. Business Logic Audit

Audit critical flows:

- project creation
- project update
- report creation
- report approval/rejection
- media upload
- PDF/export generation
- offline queue sync
- user invitation
- role/permission update
- settings update
- delete/soft delete

For each flow verify:

- input validation exists
- user session is verified
- active company is verified
- permission is verified
- record ownership/scope is verified
- status transitions are valid
- audit log is written
- errors are not silent
- success only shown after backend confirmation

Status transition example:

```text
draft -> submitted -> approved
submitted -> rejected
rejected -> draft/resubmitted
approved must not be edited by staff unless reopen permission exists
```

Auto-resolve safe issues:

- Add validation schemas.
- Add status transition guards.
- Add missing audit log calls.
- Add structured error returns.
- Prevent updates to approved/locked records unless explicit permission exists.

Document any unclear business rule instead of guessing destructively.

---

## 9. File / Image Upload Security Audit

Audit all upload logic.

Required secure upload behavior:

- backend-signed upload or backend-mediated upload
- no anonymous upload
- no direct unsigned upload to private business storage
- metadata stored in database
- file linked to `company_id`
- file linked to `project_id` if applicable
- file linked to `module`
- file linked to `record_id`
- uploader tracked
- file type checked
- file size checked
- public/private access intentionally configured

Required metadata fields:

```text
id
company_id
project_id
module
record_id
storage_provider
storage_id
url
file_name
file_type
file_size
uploaded_by
created_at
deleted_at
```

Auto-resolve safe issues:

- Add backend signature endpoint.
- Add file size/type validation.
- Add media metadata insert after upload.
- Add company/project ownership validation before upload.
- Prevent upload success state unless metadata write succeeds.

If Cloudinary is used:

- API secret must stay server-only.
- client may receive short-lived signature only.
- folder/path should include environment + company/project scope.
- store `public_id`, not just URL.

---

## 10. Offline Queue / Sync Audit

Audit offline behavior where field usage exists.

Required:

- IndexedDB/local persistent queue
- pending/synced/failed status
- retry count
- last error
- created_at
- updated_at
- operation type
- payload
- idempotency key
- backend confirmation before marking synced
- queue survives refresh
- attachments queued safely
- sync log visible/debuggable

Auto-resolve safe issues:

- Add idempotency key to queued actions.
- Add retry limit and failed state.
- Prevent fake synced state.
- Add backend confirmation check.
- Add visible sync status.

Never claim offline works unless verified with:

1. Create item offline.
2. Refresh browser.
3. Item remains pending.
4. Reconnect.
5. Sync runs.
6. Backend confirms.
7. UI marks synced.
8. Duplicate record is not created.

---

## 11. API / Backend Audit

Audit API routes and server actions.

Every sensitive endpoint must:

1. validate request body
2. validate session
3. validate active company
4. validate permission
5. validate record scope
6. perform mutation
7. write audit log if critical
8. return structured response

Standard success:

```json
{
  "ok": true,
  "data": {},
  "error": null
}
```

Standard failure:

```json
{
  "ok": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable safe error"
  }
}
```

Auto-resolve safe issues:

- Add response helpers.
- Add validation helper.
- Add auth/company/permission middleware.
- Stop leaking raw stack traces to users.
- Log developer context server-side only.

---

## 12. PDF / Export Trust Audit

Audit report exports.

Required:

- PDF/export uses same source data as preview.
- Export is generated after backend save/confirmation.
- Export includes correct company/project/report identity.
- User has export permission.
- Export action is audited.
- Export file is linked to record metadata if stored.
- No fake/generated placeholder data.

Auto-resolve safe issues:

- Block export if report is unsaved or backend state is stale.
- Add export permission check.
- Add audit log.
- Add generated file metadata.

If preview and PDF use different templates, document as high-risk defect.

---

## 13. Input Validation and Data Integrity Audit

Audit all forms, API payloads, and database writes.

Required:

- schema validation using Zod/Yup/equivalent or explicit validation
- required fields enforced
- UUIDs validated
- dates validated
- status values constrained
- numeric ranges validated
- text length limits applied
- DB constraints exist for critical fields
- foreign keys exist where appropriate
- indexes exist for common queries

Auto-resolve safe issues:

- Add validation schemas.
- Add DB constraints in migration.
- Add missing indexes.
- Add defensive checks before mutation.

Suggested indexes:

```sql
(company_id)
(company_id, project_id)
(company_id, created_at)
(company_id, status)
(company_id, project_id, created_at)
(company_id, deleted_at)
```

---

## 14. Audit Log Requirement

Critical actions must write audit logs.

Critical actions:

- create project
- update project
- delete/soft delete project
- create report
- submit report
- approve report
- reject report
- upload media
- delete media
- export PDF
- invite user
- change role
- change permission
- change company settings
- offline sync commit

Required audit log fields:

```text
id
company_id
actor_user_id
action
target_type
target_id
before
after
metadata
created_at
```

Auto-resolve safe issues:

- Add `audit_logs` migration if missing.
- Add `writeAuditLog()` helper.
- Add calls in obvious critical flows.
- Do not block main operation on audit failure unless compliance requires it; log failure clearly.

---

## 15. Documentation Audit

Audit docs for accuracy.

Required docs:

- `README.md`
- `PROJECT_STATUS.md`
- `DEPLOYMENT.md`
- `CODEX_RESUME.md`
- `ENV_SETUP.md`
- `AUDIT_SECURITY_LOGIC_REPORT.md`

Auto-resolve safe issues:

- Mark obsolete docs as non-authoritative.
- Update status to match actual code.
- Add missing env setup.
- Add verification results.
- Add known blockers.
- Remove false production-ready claims.

Never claim production-ready unless verified.

Use these labels:

```text
VERIFIED
PARTIAL
BLOCKED
NOT VERIFIED
NOT IMPLEMENTED
```

---

## 16. Auto-Resolve Policy

Auto-resolve only when safe.

Safe to auto-resolve:

- `.gitignore` hardening
- `.env.example` placeholders
- obvious leaked placeholder cleanup
- response helper standardization
- missing validation on simple payloads
- missing permission helper wiring when existing model is clear
- missing company filter when query ownership is obvious
- missing indexes
- missing audit helper/calls in obvious flows
- docs/status alignment
- removing dead demo bypass code if not used by production

Do not auto-resolve blindly:

- database ownership changes without clear schema meaning
- destructive data migration
- auth provider replacement
- major UI rewrite
- module architecture rewrite
- RLS policy rewrite if not testable
- deleting old modules
- changing business workflow rules without evidence

When unsafe to auto-resolve, document:

```text
Issue:
Risk:
Affected files:
Why not auto-resolved:
Recommended fix:
Verification needed:
```

---

## 17. Required Commands

Run available checks. Use what exists in the repo.

Try:

```bash
npm install
npm run lint
npm run typecheck
npm run test
npm run build
npm run check:env
```

If scripts are missing, document as missing and add reasonable scripts only if framework is clear.

Also run repo searches:

```bash
grep -RInE "(TODO|FIXME|HACK|demo|mock|fake|bypass|skip|localStorage|service_role|SECRET|PASSWORD|TOKEN)" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=build
```

Document all failures exactly.

---

## 18. Output Files to Create / Update

Create or update these files:

### 1. `AUDIT_SECURITY_LOGIC_REPORT.md`

Must include:

```md
# Security + Logic Audit Report

## Audit Date

## Branch / Commit

## Summary Verdict
- Production ready: YES/NO
- Critical blockers:
- High risks:
- Auto-resolved items:
- Not verified items:

## Repository Exposure Audit

## Secrets Audit

## Auth Audit

## Multi-Company Isolation Audit

## RLS / Authorization Audit

## Role / Permission Audit

## Business Logic Audit

## Upload Security Audit

## Offline Sync Audit

## API Audit

## PDF / Export Audit

## Data Integrity Audit

## Audit Log Audit

## Documentation Audit

## Auto-Resolved Changes

## Remaining Blockers

## Verification Commands and Results

## Final Status
```

### 2. `SECURITY_FIX_SUMMARY.md`

Must include:

```md
# Security Fix Summary

## Files Changed

## Safe Auto-Fixes Applied

## Risky Issues Not Auto-Fixed

## Required Human Review

## Next Recommended Patch
```

### 3. `PROJECT_STATUS.md`

Update with current truthful status.

Required wording if not verified:

```text
Production readiness: NO
Reason: security and logic audit found unresolved or unverified items.
```

---

## 19. Severity Model

Use this severity scale:

### CRITICAL
Can expose secrets, leak cross-company data, bypass auth, allow unauthorized mutation, corrupt production data, or create false operational records.

### HIGH
Can break core workflow, cause wrong report/export, unsafe upload, missing audit trail for critical actions, or unreliable offline sync.

### MEDIUM
Weak validation, incomplete error handling, missing indexes, inconsistent docs, partial permission coverage.

### LOW
Code cleanup, naming, minor UX, non-blocking maintainability issues.

---

## 20. Final Response Required From Agent

At the end, respond with:

```md
# Audit Completed

## Verdict
Production ready: YES/NO

## Auto-resolved
- ...

## Critical blockers
- ...

## High-risk remaining issues
- ...

## Verification run
- command: result

## Files changed
- ...

## Next action
- ...
```

Do not say everything is complete if tests failed or were not run.
Do not hide failed checks.
Do not claim security is fixed unless verified.

---

## 21. Final Instruction

Be aggressive in finding risks.
Be conservative in changing production logic.
Fix root causes, not symptoms.
Prefer data integrity over speed.
Prefer backend enforcement over frontend trust.
Prefer explicit company scope over convenience.
Prefer documented blockers over fake completion.
