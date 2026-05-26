# MASTER PROJECT INSTRUCTIONS

Use this as permanent instruction for all AI agents, Codex, Claude, or contributors working on this project.

You are working on a production-grade business SaaS system.

Primary goal:
Build a scalable, secure, multi-company, multi-user, trustable, maintainable system that can evolve from internal tool into commercial SaaS.

Do not build demo logic.
Do not hardcode business data.
Do not fake working features.
Do not break existing working features.
Do not over-engineer before core flows work.

## Core principles

Every feature must be:

- scalable
- multi-company ready
- role-based
- secure by default
- audit-friendly
- offline-tolerant where field usage requires it
- mobile-first
- maintainable
- cost-efficient
- easy to debug
- ready for real operational use

If there is conflict between speed and data integrity, choose data integrity.
If there is conflict between UI polish and core reliability, choose reliability.
If there is conflict between automation and manual control, keep manual override.

## Multi-company architecture

Required model:

- `companies`
- `company_members`
- `users/profiles`
- `projects`
- `locations/sites`
- `teams`
- `roles`
- `permissions`
- module-specific records

Every business record must include:

- `company_id`
- `created_by`
- `created_at`
- `updated_at`
- status field where relevant
- soft delete field where relevant

Never assume one company only.
Never use global data access unless explicitly intended.
All queries must be scoped by `company_id`.
Users may belong to multiple companies.
A user's active company must be explicit in session/context.

## Security rules

Implement:

- Supabase Auth or equivalent secure authentication
- Row Level Security / server-side authorization
- role-based access control
- company-level data isolation
- project-level access where relevant
- secure file upload flow
- signed upload or backend-mediated upload
- input validation
- server-side checks for sensitive actions
- no client-only security assumptions
- no exposed service role keys
- no secrets committed to GitHub
- no public unrestricted storage bucket for private company files

Forbidden:

- trusting frontend role checks only
- using localStorage as source of truth for production data
- public write access to database/storage
- hardcoded admin emails
- hardcoded company IDs
- hardcoded project IDs
- unscoped SELECT/UPDATE/DELETE queries
- bypassing RLS without documented reason

## Audit and trust

Every critical action must be traceable:

- create
- update
- delete
- approve
- reject
- upload
- export
- sync
- role change
- permission change

Audit log minimum fields:

- `company_id`
- `actor_user_id`
- `action`
- `target_type`
- `target_id`
- `before`
- `after`
- `created_at`
- IP/device info if available

For reports, generated PDF/export must match preview.
No fake status.
No silent failure.
No success message unless backend write/export actually succeeded.

## Offline-first

Required:

- IndexedDB/local queue for offline actions
- clear pending/synced/failed status
- retry mechanism
- conflict handling
- no data loss on refresh
- attachments queued safely
- sync log visible for debugging
- backend confirmation before marking synced

Never mark item synced before server confirms.
Offline queue must survive browser reload.

## File upload

Use secure cloud storage flow.
Preferred: Cloudinary via backend-signed upload.

Required metadata:

- file URL
- public/storage ID
- uploader ID
- company ID
- project ID if applicable
- module name
- record ID
- file type
- file size
- created_at

Never allow anonymous unsafe upload.
Never store only image URL without ownership metadata.

## Definition of done

A feature is done only when:

- works in UI
- writes backend correctly
- respects company scope
- respects permissions
- handles errors
- works on mobile
- has schema/migration if needed
- has secure file handling if needed
- has audit log if critical
- has basic verification
- docs updated
- no regression to existing features

Otherwise status is prototype, partial, blocked, or not verified.
