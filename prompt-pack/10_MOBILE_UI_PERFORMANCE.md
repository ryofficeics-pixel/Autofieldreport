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


# Prompt 10 — Mobile UI and Performance

## Goal
Make field usage smooth on mid-range Android devices.

## Required standards

- mobile-first layout
- large tap targets
- simple forms
- no tiny controls
- no desktop-only tables on phone
- clear loading/error/empty states
- visible save/sync status
- confirmation for destructive actions
- no heavy computation blocking input

## Performance targets

Fix or prevent:

- laggy input fields
- huge bundle loading everything at once
- unpaginated large lists
- loading all company data
- repeated expensive renders
- full-page recompute on every keystroke
- uncompressed images

## Known issue

ROI simulator had mobile lag during number input. Audit and fix using:

- debounced expensive calculations
- memoization
- virtualized/heavily reduced rendering if needed
- split state so typing remains instant
- web worker if calculation is heavy
- avoid unnecessary chart recalculation

## UI requirements by module

For each field module:

- project selector usable on phone
- date input usable on phone
- photo capture/upload usable on phone
- offline/sync status visible
- validation shown before submit
- submit/save buttons fixed or easy to reach

## Verification

Test with browser responsive mode and, if possible, real Android:

- report creation
- photo attach
- offline pending state
- sync retry
- ROI simulator input
- long report preview
- export action

## Output

Report:

- performance bottlenecks found
- files changed
- before/after behavior
- mobile verification status
