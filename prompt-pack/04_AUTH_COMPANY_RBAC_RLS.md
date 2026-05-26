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


# Prompt 04 — Auth, Active Company, RBAC, Permissions

## Goal
Make authentication, active company context, and role/permission enforcement production-safe.

## Required flow

1. User signs in via Supabase Auth.
2. App loads profile.
3. App loads companies where user is active member.
4. User selects active company if more than one.
5. Every query/API call uses explicit active company.
6. Backend verifies active company membership.
7. Permission checks happen server-side/RLS/API.

## Required roles

Minimum:

- owner
- admin
- manager
- supervisor
- staff
- viewer

## Required permissions

Seed capability-based permissions:

- `company.manage`
- `user.invite`
- `user.read`
- `role.manage`
- `project.create`
- `project.read`
- `project.update`
- `project.delete`
- `report.create`
- `report.read`
- `report.update`
- `report.approve`
- `report.reject`
- `report.export`
- `media.upload`
- `media.read`
- `media.delete`
- `settings.manage`
- `audit.read`

## Required UI behavior

- Hide unavailable actions in frontend.
- Still enforce all actions backend-side.
- Show clear permission error if user lacks access.
- No hardcoded admin email.
- No hardcoded company ID.

## First admin bootstrap

Implement safe first-admin bootstrap:

- local-only or server-only script
- requires env vars
- creates company if needed
- creates/links auth user if needed
- assigns owner role
- idempotent
- does not expose service role key

Required script name:

`scripts/bootstrap-first-admin.*`

Required docs:

`ENV_SETUP.md` and `DEPLOYMENT.md`

## Verification

Test:

- unauthenticated user blocked
- viewer cannot create report if not allowed
- staff can create daily report if allowed
- supervisor can approve if allowed
- wrong company access blocked
- owner can manage members

## Output

Report:

- auth files changed
- permission schema/migrations changed
- bootstrap status
- verification result
