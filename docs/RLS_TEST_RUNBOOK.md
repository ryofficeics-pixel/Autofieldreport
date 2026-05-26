# RLS_TEST_RUNBOOK

## Purpose

Quick smoke verification for migration and policy baseline before deeper scenario tests.

## Inputs required

- Supabase database connection string for test/staging project.
- Migrations applied successfully.

## Run

```bash
psql "$SUPABASE_DB_URL" -f supabase/tests/rls_smoke_test.sql
```

## Expected

1. Core helper functions are listed.
2. Core multi-company tables are listed.
3. `rls_enabled` is `t` for key business tables.

## Follow-up manual tests

After smoke pass, run real auth-scoped tests:

1. user cannot read another company's reports
2. user without `report.create` cannot create report
3. user with `media.upload` can upload/register media only in same company/project scope
