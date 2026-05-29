# OFFLINE_QUEUE_STATUS

## Current implementation (baseline)

- File: `ui/offline-queue.js`
- Storage: IndexedDB database `auto-field-report-offline`, store `sync_jobs`
- Status values: `pending | syncing | synced | failed | conflict`
- Tries handling: incremented on failure
- Sync rule: set `synced` only after sync handler resolves

## UI visibility

- File: `index.html` + `ui/app.js`
- Shows queue summary counts (`pending`, `syncing`, `synced`, `failed`, `conflict`).
- Demo controls are now gated and hidden by default.
- Demo controls only appear with explicit `?demo=1` in non-production runtime.

## Current limitations

1. Demo-only sync handler is local simulation and should not be used as production validation.
2. No conflict resolver UI yet.
3. Offline replay still depends on current authenticated session token and API availability.

## Safety notes

- Queue replay writes `synced` only after backend handler resolves successfully.
- Failed items remain persisted with incremented `tries` and `last_error` for retry visibility.
- Concurrent `syncPending()` runs are blocked to avoid overlapping state updates.
- Queue storage remains IndexedDB (`auto-field-report-offline` / `sync_jobs`) so data survives reload.
