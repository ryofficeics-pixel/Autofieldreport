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


# Prompt 03 — Multi-Company Supabase Architecture

## Goal
Build/repair the backend foundation for multi-company SaaS.

## Required tables

Create migrations for:

- `profiles`
- `companies`
- `company_members`
- `roles`
- `permissions`
- `role_permissions`
- `projects`
- `locations`
- `teams`
- `audit_logs`
- `media_files`
- `offline_sync_jobs` or equivalent sync log

Every business table must include:

- `id uuid primary key default gen_random_uuid()`
- `company_id uuid not null references companies(id)` where relevant
- `created_by uuid references auth.users(id)` where relevant
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`
- `deleted_at timestamptz null` where soft delete applies
- status field where relevant

## Indexes

Add indexes for:

- `company_id`
- `company_id, project_id`
- `company_id, created_at`
- `company_id, status`
- `project_id, date/report_date` where relevant
- media ownership queries

## Constraints

Add constraints to prevent:

- duplicate company membership
- invalid role
- orphan project/media records
- unscoped business records

## RLS

Enable RLS on all business tables.

Rules:

- users only access rows for companies they belong to
- role/permission checks must be enforced by SQL helper functions or policies
- avoid recursive RLS policies causing stack depth errors
- use SECURITY DEFINER helper functions carefully with fixed search_path
- service role bypass only in backend/server tasks, never frontend

## Required helper functions

Implement or repair:

- `auth.uid()` based active user helpers
- `is_company_member(company_id)`
- `has_company_role(company_id, roles[])`
- `has_permission(company_id, permission_key)`
- `touch_updated_at()` trigger
- audit insertion helper if useful

## Must fix if present

Known risk: RLS recursion / stack depth limit exceeded during admin-only flow or media insert with project_id.

Fix root cause, not symptoms.

## Verification

Test SQL/policies with:

- unauthenticated access blocked
- staff cannot create admin-only project
- admin/owner can create project
- user cannot read another company's project
- media insert with project_id succeeds only if project belongs to same company and user has access

## Output

Report:

- migrations created
- RLS functions changed
- policies changed
- tests run
- exact pass/fail
- remaining blockers
