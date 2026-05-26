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


# Prompt 08 — External Module Integration Contracts

## Goal
Define and implement clean backend contracts for linked/external modules so the launcher app and tools work as one SaaS system.

## External modules to cover

- `/tools/daily-report`
- `/tools/progress-report`
- `/tools/survey-report`
- `/tools/absensi-karyawan`
- `/tools/absensi-admin`
- `/tools/module-generator`
- `/tools/roi-simulator`
- `/tools/estimator`
- RAB Otomatis if already present or planned

## Contract required for each module

Create `docs/module-contracts/<module>.md` with:

- route/path
- module owner/status
- auth/session handoff method
- active company requirement
- project requirement
- required permissions
- report-save schema if applicable
- media upload protocol
- offline sync protocol
- export/PDF protocol
- error response shape
- audit log actions
- production readiness status

## Shared app contract

Create:

`docs/module-contracts/SHARED_CONTRACT.md`

Must define:

- how module receives session
- how module reads active company
- how module requests project context
- how module calls backend APIs
- how module uploads media
- how module queues offline actions
- how module reports sync status
- how module handles permission errors

## Do not

- duplicate auth logic per module
- let modules bypass company scope
- allow tools to write localStorage only for production
- hardcode module URLs if routing config exists
- silently fail if session/company missing

## Verification

For each module:

- open route
- verify auth requirement
- verify active company requirement
- verify permission behavior
- verify backend write or explicitly mark NOT IMPLEMENTED

## Output

Report:

- contracts created
- modules integrated
- modules still external-only
- blockers
