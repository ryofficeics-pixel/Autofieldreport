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


# Prompt 01 — Agent Start + Repo Audit

You are Codex working inside the Auto Field Report repo.

## Goal
Audit the current repo before editing anything. Identify actual architecture, working features, blockers, and unsafe assumptions.

## Required actions

1. Print current working directory and repo status.
2. List top-level files/folders.
3. Detect framework/build system:
   - Vite/React/Next/static HTML/other
   - package manager
   - API/serverless structure
   - Supabase client/server usage
   - Cloudinary usage
   - IndexedDB/offline logic
4. Find current docs:
   - README
   - PROJECT_STATUS
   - DEPLOYMENT
   - CODEX_RESUME
   - ENV docs
   - obsolete handoff docs
5. Identify current modules:
   - daily report
   - weekly report
   - survey report
   - progress report
   - absensi admin/karyawan
   - ROI simulator
   - estimator/RAB tools
   - module generator
   - launcher/hub pages
6. Identify production blockers:
   - missing env vars
   - RLS recursion or policy issue
   - auth/bootstrap issue
   - media upload issue
   - offline sync issue
   - module contract gaps
7. Do not edit code yet except creating an audit report file.

## Create file
Create or update:

`docs/AUDIT_CURRENT_STATE.md`

Must include:

- repo structure summary
- detected stack
- working features
- risky/demo/local-only features
- security gaps
- data persistence gaps
- deployment gaps
- exact recommended next step

## Output format

Report:

- `AUDIT COMPLETE`
- files inspected
- risks found
- blockers found
- suggested execution order

Do not claim anything is working unless verified from code/build/test.
