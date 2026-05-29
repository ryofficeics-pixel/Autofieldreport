# MEDIA_UPLOAD_API

## Endpoints

- `POST /api/cloudinary-signature`
- `POST /api/media-register`

## `/api/cloudinary-signature`

Request body:

- `companyId` (required)
- `projectId` (optional)
- `module` (required)
- `recordId` (optional)
- `fileType` (required, `image/*`)
- `fileSize` (required, max 10 MB baseline)

Checks:

- bearer token required
- authenticated user required
- `media.upload` permission required
- `companyId` must be valid UUID
- `projectId` and `recordId` must be valid UUID when provided
- project must belong to company if provided
- module must be slug-safe
- image-only upload (`image/*`) with max 10 MB baseline

Response:

- `cloudName`
- `apiKey`
- `timestamp`
- `folder`
- `context`
- `signature`

## `/api/media-register`

Request body:

- `companyId` (required)
- `projectId` (optional)
- `module` (required)
- `recordId` (optional)
- `cloudinaryPublicId` (required)
- `secureUrl` (required)
- `resourceType`, `format`, `bytes`, `width`, `height`, `caption`, `takenAt` (optional)

Checks:

- bearer token required
- authenticated user required
- `media.upload` permission required
- `companyId` must be valid UUID
- `projectId` and `recordId` must be valid UUID when provided
- module must be slug-safe
- `secureUrl` must be valid `https://` URL
- project scope validation

Action:

- insert `media_files` row
- write `media.create` audit event through `insert_audit_log`

Metadata written through API:

- `company_id`
- `project_id` (nullable)
- `module`
- `record_id` (nullable)
- `uploaded_by`
- `cloudinary_public_id`
- `secure_url`
- `resource_type`
- `format`
- `bytes`
- `width`
- `height`
- `caption`
- `taken_at`
- `created_at` (database-managed)
