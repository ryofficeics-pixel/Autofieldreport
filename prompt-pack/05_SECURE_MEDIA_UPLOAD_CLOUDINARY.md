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


# Prompt 05 — Secure Media Upload with Cloudinary

## Goal
Replace unsafe unsigned/client-only media handling with secure backend-mediated or signed Cloudinary upload.

## Required architecture

Frontend must not expose Cloudinary API secret.

Flow:

1. User selects/captures image.
2. Frontend compresses image where safe.
3. Frontend requests signed upload params from backend.
4. Backend validates:
   - user session
   - active company
   - permission `media.upload`
   - project access if project-bound
   - module and record context
5. Backend returns signed upload params or uploads server-side.
6. Frontend uploads to Cloudinary.
7. Backend stores metadata in `media_files`.
8. Report record links to media IDs, not only raw URLs.

## Required metadata

`media_files` must store:

- `id`
- `company_id`
- `project_id`
- `module`
- `record_id`
- `uploaded_by`
- `cloudinary_public_id`
- `secure_url`
- `resource_type`
- `format`
- `bytes`
- `width`
- `height`
- `caption`
- `taken_at` if available
- `created_at`
- `deleted_at`

## Offline upload behavior

If offline:

- store file/blob safely in IndexedDB if possible
- queue upload action
- show pending media status
- upload only after reconnect
- store metadata only after backend confirms
- never mark media synced before backend confirms

## Security requirements

- no anonymous upload
- no public unrestricted write bucket
- no unsigned preset in production unless intentionally locked and documented
- validate file type and size
- strip/handle EXIF if privacy issue
- reject invalid module/record/project combinations

## Cost controls

- compress large images before upload
- set max dimensions for field photos
- avoid duplicate uploads
- use Cloudinary folders by company/project/module
- document transformation policy

## Verification

Test:

- unauthenticated upload blocked
- staff without permission blocked
- valid user upload succeeds
- media metadata stored with correct company/project/module/record
- wrong company project rejected
- offline queue upload retries after reconnect

## Output

Report:

- upload endpoints changed
- media schema changed
- Cloudinary env required
- tests run
- exact remaining blocker if any
