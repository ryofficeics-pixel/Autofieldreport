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
- Offline queue supports `report.save`, `report.transition`, and `media.upload` actions with manual sync trigger.
- Manual token input was replaced with Supabase login/logout + persisted session + active-company selector.
- Project selector is loaded from backend per active company through `/api/projects-list`.
- Online event now triggers queue replay attempt in addition to manual sync button.

## Remaining work

1. Validate strict preview-vs-PDF parity with real multi-photo datasets.
2. Validate queued media upload replay with real online/offline transitions.
3. Integrate richer project/company pickers from live DB for field usability.
