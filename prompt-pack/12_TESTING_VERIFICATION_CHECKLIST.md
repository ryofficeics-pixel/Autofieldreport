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


# Prompt 12 — Testing and Verification Checklist

## Goal
Create and run a minimum verification suite so completion claims are trustworthy.

## Required checks

### Auth

- unauthenticated access blocked
- login works
- logout works
- expired session handled

### Company isolation

- user can access own company data
- user cannot access another company data
- active company switching works
- every query is company-scoped

### RBAC

- viewer cannot write
- staff can create allowed reports
- supervisor/manager can approve if permission exists
- admin/owner can manage allowed settings
- frontend hidden buttons match backend errors but do not replace backend security

### CRUD

- create project
- update project
- soft delete project
- create report
- update draft report
- submit report
- approve/reject report

### Media

- upload allowed image
- reject invalid file
- reject wrong company project
- metadata saved correctly
- media visible in report

### Offline

- create report offline
- attach photo offline
- refresh while offline
- data remains pending
- reconnect sync succeeds
- queue marks synced only after backend confirms
- failure remains visible and retryable

### Export

- preview matches PDF
- photos match layout
- export failure is visible
- export audit log created if implemented

### Mobile

- report form usable on phone viewport
- large buttons
- no severe input lag
- upload works
- sync status visible

### Build/deploy

- lint/typecheck if available
- build passes
- env preflight passes
- production deploy only if safe

## Required output file

Create/update:

`PROJECT_STATUS.md`

Must include a verification table:

| Area | Status | Evidence | Notes |
|---|---|---|---|

Allowed status:

- DONE
- PARTIAL
- BLOCKED
- NOT VERIFIED

## Output

Report exact checks run and result.
Do not write `DONE` if not tested.
