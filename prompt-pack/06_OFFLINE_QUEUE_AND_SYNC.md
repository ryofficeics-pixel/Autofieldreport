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


# Prompt 06 — Offline Queue and Reconnect Sync

## Goal
Make field workflows reliable with unstable internet.

## Required behavior

- Offline-created items survive page refresh.
- Each pending action has visible status.
- Reconnect triggers sync.
- Server confirmation required before marking synced.
- Failed sync shows cause and retry action.
- Attachments are queued safely.
- Conflict handling is explicit.

## IndexedDB structure

Implement a durable queue with fields:

- `id`
- `company_id`
- `project_id`
- `module`
- `action_type`
- `payload`
- `attachment_refs`
- `status`: pending | syncing | synced | failed | conflict
- `tries`
- `last_error`
- `created_at`
- `updated_at`
- `synced_at`

## Sync engine rules

- Queue writes are atomic.
- Do not delete pending queue entries prematurely.
- Mark as syncing only while actively sending.
- On success, store server record ID/response.
- On failure, increment tries and preserve data.
- Backoff retry.
- Network online event triggers sync, but do not rely only on online event.
- Provide manual retry button.

## Conflict rules

Handle:

- duplicate submission
- stale update
- deleted server record
- wrong company/project scope
- expired auth session
- media upload succeeds but metadata insert fails

## UI requirements

Show:

- pending count
- syncing state
- failed count
- per-record sync badge
- sync log/debug view for admin/dev

## Known blocker to verify

Prior production test showed pending item remained pending with tries 0 after reconnect while UI stayed syncing. Reproduce and fix.

## Verification

Test manually and with scripts if possible:

1. Login.
2. Create report online.
3. Go offline.
4. Create report with photo.
5. Refresh browser while offline.
6. Confirm pending data still exists.
7. Reconnect.
8. Trigger sync.
9. Confirm backend contains report/media.
10. Confirm queue status becomes synced.
11. Confirm UI exits syncing state.

## Output

Report:

- files changed
- IndexedDB schema changed
- sync algorithm summary
- reproduction result
- verification result
