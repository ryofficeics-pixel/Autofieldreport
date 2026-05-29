# NEW COMPUTER HANDOFF

Use this when moving work to another computer. This keeps the app code, local setup, and verification steps aligned without changing working modules.

## Source of truth

- Repository branch: `audit/security-logic-auto-resolve`
- Current status: `PROJECT_STATUS.md`
- Resume notes: `CODEX_RESUME.md`
- Environment guide: `ENV_SETUP.md`
- Deployment guide: `DEPLOYMENT.md`

## What must move

1. Push or copy the committed repository state.
2. Move local secrets separately. Do not commit `.env`.
3. Recreate `.env` from `.env.example` on the new computer.
4. Run the workstation and project checks before continuing development.

## Fresh computer setup

```bash
git clone <repo-url>
cd "auto field report"
git checkout audit/security-logic-auto-resolve
npm.cmd install
npm.cmd run check:workstation
```

Then create `.env`:

```bash
copy .env.example .env
```

Fill the required values listed in `ENV_SETUP.md`, then run:

```bash
npm.cmd run check:env
npm.cmd run verify:baseline
npm.cmd run verify:auth-flow
npm.cmd run verify:export-parity
npm.cmd run verify:rls-smoke
```

## Expected current result

Until real environment values are configured, these checks are expected:

- `npm.cmd run verify:baseline` -> PASS
- `npm.cmd run verify:auth-flow` -> PASS
- `npm.cmd run verify:export-parity` -> PASS
- `npm.cmd run check:env` -> FAIL if env is missing
- `npm.cmd run verify:rls-smoke` -> BLOCKED if `SUPABASE_DB_URL` is missing

## Secret handling

- `.env` and `.env.*` are ignored by git.
- Keep Supabase, Cloudinary, and Vercel secrets in a password manager or deployment provider.
- Never paste service-role keys into docs, issues, commits, or chat logs.
- On the new computer, verify with `npm.cmd run check:env` instead of sharing secret values.

## Continue work safely

Before editing app behavior on a new computer, run:

```bash
git status --short --branch
npm.cmd run verify:baseline
npm.cmd run verify:auth-flow
npm.cmd run verify:export-parity
```

Do not mark production ready until live env-backed checks pass.
