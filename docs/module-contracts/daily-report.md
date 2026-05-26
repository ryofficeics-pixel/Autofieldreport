# Daily Report Contract

- route/path: $(System.Collections.Hashtable.Route)
- module owner/status: product-team / baseline-integrated
- auth/session handoff method: shared session from host app
- active company requirement: required
- project requirement: required where workflow is project-bound
- required permissions: report.create, report.read, report.update, report.export, media.upload
- report-save schema: writes company-scoped record and audit log
- media upload protocol: backend-mediated/signed upload only
- offline sync protocol: queue pending actions in IndexedDB then sync with server confirmation
- export/PDF protocol: export allowed only after source record exists and permission check passes
- error response shape: { code, message, details? }
- audit log actions: create, update, delete, approve/reject, export, upload
- production readiness status: PARTIAL