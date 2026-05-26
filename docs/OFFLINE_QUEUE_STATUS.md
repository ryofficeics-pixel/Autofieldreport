# OFFLINE_QUEUE_STATUS

## Current implementation (baseline)

- File: `ui/offline-queue.js`
- Storage: IndexedDB database `auto-field-report-offline`, store `sync_jobs`
- Status values: `pending | syncing | synced | failed | conflict`
- Tries handling: incremented on failure
- Sync rule: set `synced` only after sync handler resolves

## UI visibility

- File: `index.html` + `ui/app.js`
- Shows queue summary counts and demo controls.
- Demo sync path proves pending -> syncing -> synced transition.

## Current limitations

1. Demo-only sync handler is currently local and does not call backend report APIs.
2. No conflict resolver UI yet.
3. No authenticated upload/report sync wiring yet.

## Next upgrade

Wire `syncPending()` to real module API endpoints and preserve per-record error diagnostics.
