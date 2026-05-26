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


# Prompt 09 — PDF Export Must Match Preview

## Goal
Ensure generated PDF/export matches the preview exactly enough for operational trust.

## Core rule
Preview and PDF must use the same source data and layout contract.

## Required fixes

- Do not have separate divergent preview and PDF templates unless tested equivalent.
- Use a shared render component/template for preview and export where possible.
- Photo layout must match preview:
  - photo left
  - caption/description right
  - consistent spacing
  - no image overflow/cropping mismatch
- Weekly report export must not fail silently.
- Export must fail clearly if images are not loaded or media URLs unavailable.

## Export data requirements

PDF/export must include:

- company name
- project name
- report type
- report date
- creator/submitted/approved info where applicable
- status
- report content
- linked photos and captions
- generated timestamp
- export ID/version if implemented

## Trust rules

- No generated PDF if source record failed to save.
- No success toast unless export file exists.
- Export should log audit action.
- Export should reference report ID and company ID.

## Verification

Test:

- Daily report with multiple photos.
- Long captions.
- Missing photo URL.
- Mobile preview.
- PDF output.
- Weekly report export.
- Approved report export.

Compare preview screenshot and PDF output manually or with automated visual check if feasible.

## Output

Report:

- export files changed
- shared template strategy
- known mismatches fixed
- verification result
