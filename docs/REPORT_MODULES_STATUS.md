# REPORT_MODULES_STATUS

## Implemented baseline

- API:
  - `POST /api/reports-save`
  - `POST /api/reports-transition`
  - `GET /api/reports-list`
- UI routes:
  - `/tools/daily-report/`
  - `/tools/weekly-report/`
  - `/tools/survey-report/`
  - `/tools/progress-report/`

## Current behavior

- Save/update draft report records in `reports` table.
- Transition status to submitted/approved/rejected with permission checks.
- List recent records by company and report type.
- Audit log write attempted for create/update/transition.
- Shared preview and print/PDF renderer used by all core report pages.
- Secure photo upload path wired from report pages through signed upload and metadata registration APIs.
- Offline queue fallback for report save is wired with manual sync action.

## Remaining work

1. Validate strict preview-vs-PDF parity with real multi-photo datasets.
2. Extend offline queue to media operations and status-transition operations.
3. Replace manual token input with real authenticated app session flow.
