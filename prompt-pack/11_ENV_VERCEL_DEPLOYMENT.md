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


# Prompt 11 — Environment, Vercel, Deployment Safety

## Goal
Make deployment safe, reproducible, and blocked when secrets/env are missing.

## Required env categories

Public frontend:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_URL`
- `VITE_ENVIRONMENT`

Server-only:

- `SUPABASE_SERVICE_ROLE_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Optional:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- webhook/API keys if modules need them

## Required files

Create/update:

- `.env.example`
- `ENV_SETUP.md`
- `VERCEL_PRODUCTION_ENV_SETUP.md`
- `DEPLOYMENT.md`
- `scripts/check-env.*`
- `scripts/check-online-env.*` if already present

## Safety rules

- Never commit real `.env` values.
- Production build/deploy must fail if required env vars are missing.
- Service role key only server-side.
- Do not log secrets.
- Add clear local setup instructions.

## Vercel deployment flow

Document:

1. Set env vars in Vercel project settings.
2. Set Supabase URL/anon key.
3. Set Supabase service role key only as server env.
4. Set Cloudinary envs.
5. Run env preflight.
6. Run build.
7. Bootstrap first admin if required.
8. Deploy production.
9. Verify auth, company, upload, report save, offline sync.

## Known blocker

Prior production blocker: only public `VITE_*` envs were set; server-only envs missing.

Do not deploy production if server-only envs are missing.

## Output

Report:

- env files changed
- required envs
- missing envs
- deployment attempted or deliberately withheld
- reason
