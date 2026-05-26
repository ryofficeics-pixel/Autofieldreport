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

## Remaining work

1. Wire media upload flow from report pages to `/api/cloudinary-signature` and `/api/media-register`.
2. Connect report save flow to offline queue actions.
3. Validate strict preview-vs-PDF parity with real multi-photo datasets.
4. Replace manual token input with real authenticated app session flow.
