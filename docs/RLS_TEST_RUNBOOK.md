# RLS_TEST_RUNBOOK

## Purpose

Quick smoke verification for migration and policy baseline before deeper scenario tests.
This smoke is read-only and checks RLS posture, policy presence, and function grants.

## Inputs required

- Supabase database connection string for test/staging project.
- Migrations applied successfully.
- PostgreSQL client (`psql`) installed on runner machine.

## Run

```bash
psql "$SUPABASE_DB_URL" -f supabase/tests/rls_smoke_test.sql
```

or via project script:

```bash
npm.cmd run verify:rls-smoke
```

## Expected checks

1. Core helper functions exist (`is_company_member`, `has_company_role`, `has_permission`, `insert_audit_log`, `ensure_company_roles`).
2. Security-definer posture is present for helper functions.
3. Core multi-company tables exist.
4. `rls_enabled` is true for key business tables.
5. Critical policies exist for reports/media/offline sync.
6. No anonymous/public unrestricted write grants on key tables.
7. `ensure_company_roles(uuid, uuid)` is executable by `service_role` only.
8. Authenticated role can execute permission helper needed by app flow.

## Status interpretation

- If `SUPABASE_DB_URL` is missing, mark status as `BLOCKED` (external env blocker), not code regression.
- If SQL assertions fail, mark status as `FAIL` and inspect assertion rows from script output.
- If all assertions pass, mark status as `PASS`.

## Follow-up manual tests

After smoke pass, run real auth-scoped tests:

1. user cannot read another company's reports
2. user without `report.create` cannot create report
3. user with `media.upload` can upload/register media only in same company/project scope
