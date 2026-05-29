# VERCEL_PRODUCTION_ENV_SETUP

## Required production env in Vercel

Set all of these in Project Settings -> Environment Variables:

### Public

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_URL`
- `VITE_ENVIRONMENT=production`

### Server-only

- `SUPABASE_SERVICE_ROLE_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `SUPABASE_DB_URL` (required for `verify:rls-smoke` in CI/manual verification)

## Safety rules

- Never put `SUPABASE_SERVICE_ROLE_KEY` in client bundle variables.
- Never log secrets in API responses or frontend console.
- Do not deploy if server-only env variables are missing.

## Pre-deploy checklist

1. Confirm Vercel env values are set for Production.
2. Run `npm.cmd run check:env` in deployment pipeline or prebuild step.
3. Run bootstrap only in secure server context:
   - `npm.cmd run bootstrap:first-admin`
4. Verify auth, company scope, media upload, and report write after deploy.
