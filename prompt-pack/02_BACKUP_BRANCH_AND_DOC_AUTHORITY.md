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


# Prompt 02 — Backup, Branch, Documentation Authority

## Goal
Protect the existing project and stop obsolete docs from overriding current rules.

## Required actions

1. Create a full project backup before edits.
   - Backup folder name: `Auto Field Report backup before production SaaS rebuild May 2026`
   - Put it outside repo if possible.
   - If not possible, create a `.zip` backup outside tracked files.
2. Create a safe git branch:
   - `production-saas-rebuild`
3. Check `.gitignore` includes:
   - `.env`
   - `.env.*`
   - `!.env.example`
   - `node_modules/`
   - `.vercel/`
   - backup zips/folders
   - logs
4. Create docs authority hierarchy.

## Required doc hierarchy

Create/update:

- `fixed rule.md` as canonical master rules.
- `README.md` with clear statement: canonical rules are in `fixed rule.md`.
- `PROJECT_STATUS.md` with current real status.
- `CODEX_RESUME.md` with exact next step.
- `docs/DOC_AUTHORITY.md` explaining which docs are authoritative.

## Obsolete docs

Any old handover/status/resume file that conflicts must be marked:

`OBSOLETE / NON-AUTHORITATIVE — kept for history only.`

Do not delete old docs unless clearly redundant and safe.

## Verification

Run:

- git status
- package install check if needed
- docs check script if present

## Output

Report:

- backup location
- branch name
- docs updated
- obsolete docs marked
- remaining risks
