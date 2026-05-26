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
- project must belong to company if provided

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
- project scope validation

Action:

- insert `media_files` row
- write `media.create` audit event through `insert_audit_log`
