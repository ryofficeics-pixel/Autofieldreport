# Auto Field Report - Fixed Rule (Canonical)

This is the canonical instruction source for this repository.
If any other instruction document conflicts with this file, this file wins.

## Non regression rules

1. Do not change working parts unless directly required for a listed bug.
2. Preserve existing UI, UX, routes, forms, data flows, and module access.
3. Do not replace working modules with rewrites.
4. Do not rename keys/routes/functions/storage structures without backward compatibility.
5. Do not claim completion without verification evidence.

## Product and architecture rules

1. Build for production SaaS, not demo logic.
2. No hardcoded company/user/project/admin business data.
3. All business data must be scoped by `company_id`.
4. Backend and RLS enforce permissions; frontend checks are UX only.
5. No exposed service role keys or secrets in code or git.

## Security and data rules

1. No unscoped reads/writes for business data.
2. No client only authorization for sensitive actions.
3. No unsafe unsigned public upload flow for private files.
4. Offline sync status must be truthful; never mark synced before server confirmation.
5. No fake success messages for save/upload/export.

## Module specific constraints

1. Daily Report preview is considered correct baseline.
2. If Daily PDF differs from preview, fix export to match preview, not preview to match export.
3. ROI Simulator calculation logic is considered correct baseline.
4. ROI work should focus on performance, not changing result logic.

## Documentation and execution rules

1. Stage execution follows `prompt-pack/README.md` order unless explicitly overridden by the user.
2. Keep `PROJECT_STATUS.md` updated with `DONE`, `PARTIAL`, `BLOCKED`, or `NOT VERIFIED` based on evidence.
3. Keep `CODEX_RESUME.md` updated with exact next action.
4. Keep `docs/AUDIT_CURRENT_STATE.md` aligned with current verified repo state.
