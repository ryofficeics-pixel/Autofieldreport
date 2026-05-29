# AUTO_CONTINUE_NEXT_RUN

Date: 2026-05-29
Repository: `ryofficeics-pixel/Autofieldreport`
Branch: `audit/security-logic-auto-resolve`
Mode: continue execution without unnecessary checkpoint pauses.

## Current verified checkpoint

Use this as the current source of truth:

- `npm.cmd run verify:baseline` -> PASS
- `npm.cmd run verify:auth-flow` -> PASS
- `npm.cmd run verify:export-parity` -> PASS
- Security + logic audit safe auto-resolve scope already executed.
- Minimal hardening already applied:
  - `.gitignore` expanded for artifact/secret hygiene.
  - `api/reports-list.js` enforces `report.read` permission.
  - `api/media-register.js` validates `secureUrl` as valid `https://` URL.
  - Migration added: `supabase/migrations/20260529100000_lockdown_ensure_company_roles_execute.sql`
  - Restricts `public.ensure_company_roles(uuid, uuid)` execution to `service_role`.

## Non-negotiable operating rules

- Do not redesign.
- Do not replace modules.
- Do not change ROI simulator logic.
- Do not change Daily Report preview/export rendering unless fixing verified parity bug.
- Do not remove working flows.
- Do not hardcode company/user/project data.
- Do not claim production readiness unless live checks actually pass.
- If env is missing, document exact missing env and continue with all safe local/static production-hardening work.

## Immediate execution sequence

Run in order:

```bash
npm.cmd install
npm.cmd run check:env
npm.cmd run verify:baseline
npm.cmd run verify:auth-flow
npm.cmd run verify:export-parity
npm.cmd run verify:rls-smoke
```
