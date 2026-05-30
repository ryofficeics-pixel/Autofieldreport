# CONNECTED SERVICES

Date checked: 2026-05-30

This file records the external projects visible through the connected Supabase and Vercel app integrations. It does not contain secrets.

## GitHub

- Repository: `ryofficeics-pixel/Autofieldreport`
- URL: `https://github.com/ryofficeics-pixel/Autofieldreport`
- Repository ID: `1249969899`
- Default branch: `main`
- Visibility: `public`
- Local remote `origin`: `https://github.com/ryofficeics-pixel/Autofieldreport.git`
- Current working branch: `audit/security-logic-auto-resolve`

## Supabase

- Organization: `ryofficeics-pixel's Org`
- Organization ID: `frmcynuupbdbjypqumxi`
- Project name: `ryofficeics-pixel's Project`
- Project ref: `crrtfddcnnqstxyoeoek`
- Region: `ap-southeast-1`
- Status: `ACTIVE_HEALTHY`
- Database host: `db.crrtfddcnnqstxyoeoek.supabase.co`
- Database version: Postgres `17.6.1.121`
- Edge Functions: none listed

Remote migrations currently listed by Supabase:

- `20260522081703_online_sync_schema`
- `20260523005107_harden_api_grants`
- `20260523064739_ics_hub_tools_registry`
- `20260525071002_online_backend_activation_compat_may_2026`
- `20260525071053_online_backend_security_hardening_may_2026`
- `20260525071116_tool_access_policy_hardening_may_2026`
- `20260525071313_user_profile_role_compatibility_may_2026`

Local migrations currently present in this repository:

- `20260526161000_multi_company_foundation.sql`
- `20260526162000_rls_and_permission_seed.sql`
- `20260529100000_lockdown_ensure_company_roles_execute.sql`

Note: local migrations are newer/different than the remote migration list. Do not claim the database is fully synced until migrations are applied and `npm.cmd run verify:rls-smoke` passes against `SUPABASE_DB_URL`.

## Vercel

- Team: `Estora v1`
- Team slug: `estora-v1`
- Team ID: `team_K09Ysw8cGS8K4P73TmuIqDpN`

Visible projects:

| Project | Project ID | Framework | Latest production state | Latest URL |
|---|---|---|---|---|
| `ics-tools-hub` | `prj_qKKPgqfb1vfUEeAlbtxW71aoM8Zt` | `vite` | `READY` | `ics-tools-dddnfi9qz-estora-v1.vercel.app` |
| `ics-office-tools` | `prj_5ntYDsBVKIQfkMpe3MAgMClO7Y3g` | none listed | `READY` | `ics-office-tools-n8b7ekc53-estora-v1.vercel.app` |
| `roi-simulator-by-hunios` | `prj_q6dMSMWFPP68T1NJA67eOqCVRpt6` | none listed | `READY` | `roi-simulator-by-hunios-4uhry2he1-estora-v1.vercel.app` |
| `ops-ics-v1` | `prj_xRTDwKkVMx0HxdSyMKhp6JnSap9U` | none listed | `READY` | `ops-ics-v1-cj0xdlncv-estora-v1.vercel.app` |

No local `.vercel/project.json` exists in this repository. None of the visible Vercel projects exactly match or report deployments from `ryofficeics-pixel/Autofieldreport`, so local Vercel linking was intentionally not created.

## Local CLI status

- Supabase CLI: not installed on PATH
- Vercel CLI: not installed on PATH

The connected app integrations can inspect projects, but local CLI workflows such as `supabase link`, `supabase db push`, `vercel link`, `vercel env pull`, and `vercel deploy` require installing and authenticating the corresponding CLI tools.
