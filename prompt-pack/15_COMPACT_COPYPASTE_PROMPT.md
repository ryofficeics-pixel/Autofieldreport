# Compact Copy-Paste Prompt

Audit repo, backup first, preserve working features, then upgrade Auto Field Report into production SaaS.

Rules: multi-company, company-scoped, secure, RBAC/RLS enforced server-side, no hardcoded IDs/admin emails, no exposed secrets, no unsafe public uploads, no fake success, no localStorage as production DB, mobile-first, offline-safe, PDF matches preview, docs must match code, if unverified write NOT VERIFIED.

Required stack: Vercel + Supabase Auth/Postgres/RLS + Cloudinary signed/backend upload + IndexedDB offline queue.

Execution:
1. Audit repo and write docs/AUDIT_CURRENT_STATE.md.
2. Backup named "Auto Field Report backup before production SaaS rebuild May 2026" and create branch production-saas-rebuild.
3. Make fixed rule.md canonical; mark obsolete docs non-authoritative.
4. Build/repair Supabase multi-company schema: profiles, companies, company_members, roles, permissions, role_permissions, projects, locations, teams, audit_logs, media_files, offline sync logs, report tables.
5. Add RLS without recursion; all data scoped by company_id.
6. Implement active company context and capability permissions.
7. Add safe first-admin bootstrap; no hardcoded admin email.
8. Implement secure Cloudinary signed/backend upload; store metadata with company/project/module/record/uploader.
9. Implement durable IndexedDB offline queue; reconnect sync must turn pending into synced only after backend confirms.
10. Wire Daily/Weekly/Survey/Progress reports to backend, permissions, audit, offline, media, export.
11. Create module contracts for daily, progress, survey, absensi, module-generator, ROI simulator, estimator, RAB.
12. Fix PDF/export to match preview, especially daily photo left + caption right; fix weekly export error.
13. Fix mobile performance, especially ROI simulator input lag if present.
14. Add env docs and preflight for Vercel/Supabase/Cloudinary. Required server envs: SUPABASE_SERVICE_ROLE_KEY, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.
15. Verify auth, company isolation, RBAC, CRUD, upload, offline sync, PDF, mobile, build. Update PROJECT_STATUS.md and CODEX_RESUME.md.

Final report must include files changed, migrations, tests, results, blockers, next exact action. Do not claim DONE without evidence.
