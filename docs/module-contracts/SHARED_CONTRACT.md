# SHARED_CONTRACT

## Session and auth

- Modules must require authenticated Supabase session.
- Module must block write actions when session is missing or expired.
- Frontend auth checks are UX only; backend and RLS are final authority.

## Active company

- Every module request includes explicit `company_id` context.
- Backend must verify current user is active member of `company_id`.
- Missing or invalid `company_id` returns scoped permission error.

## Project context

- Report modules require explicit `project_id`.
- Backend validates `project_id` belongs to `company_id`.
- Cross-company project references are rejected.

## Permission model

- Modules use capability keys (for example `report.create`, `report.export`, `media.upload`).
- Frontend can hide unavailable actions but must still handle backend deny responses.

## Media protocol

- Frontend requests signed/backend-mediated upload parameters.
- Backend validates session, company, permission, and project access.
- Metadata writes to `media_files` are required for upload completion.

## Offline protocol

- Offline actions are queued in IndexedDB with durable status.
- Queue status set to `synced` only after backend confirmation.
- Failed actions remain visible and retryable.

## Error shape

- Use predictable response format:
  - `code` (machine key)
  - `message` (user-safe summary)
  - `details` (optional debug context)

## Audit expectations

- Critical operations log audit events:
  - create/update/delete
  - approve/reject
  - upload
  - export
  - role and permission changes
