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


# Prompt 07 — Report Modules: Daily, Weekly, Survey

## Goal
Make core report modules real backend modules, not fake local-only forms.

## Modules

Implement or repair:

- Daily Report / Laporan Harian
- Weekly Report / Laporan Mingguan
- Survey Report
- Progress Report if already present

## Required module structure

Each module must have:

- database schema/migration
- API/service layer
- UI page/component
- validation
- permissions
- audit logs for critical actions
- offline queue behavior if field-used
- media link handling
- PDF/export behavior
- tests/checklist
- module documentation

## Required report fields

Minimum shared report fields:

- `id`
- `company_id`
- `project_id`
- `location_id` if relevant
- `report_type`
- `report_date`
- `status`: draft | submitted | approved | rejected | archived
- `data jsonb`
- `created_by`
- `submitted_by`
- `approved_by`
- `created_at`
- `updated_at`
- `submitted_at`
- `approved_at`
- `deleted_at`

Media linked through `media_files`, not raw URL only.

## Permissions

Use capability checks:

- `report.create`
- `report.read`
- `report.update`
- `report.approve`
- `report.reject`
- `report.export`
- `media.upload`

## Status logic

- Draft can be edited by creator or authorized role.
- Submitted can be reviewed.
- Approved becomes official.
- Rejected requires reason.
- Soft-delete only unless admin purge explicitly implemented.
- Every status change writes audit log.

## Known issues to check

- Daily report preview correct but PDF output may differ especially photo layout.
- Weekly report may have error preventing preview/export.
- Survey and weekly save links may need backend wiring.
- Old localStorage-only logic must not be production source of truth.

## Output required

- list of modules repaired
- schema/migrations added
- API routes/services added
- frontend forms changed
- offline support status
- export status
- verification status
