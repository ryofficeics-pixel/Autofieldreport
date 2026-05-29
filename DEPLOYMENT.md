# DEPLOYMENT

## Deployment policy

Production deploy is blocked unless required env variables are present and env preflight passes.

## Steps

1. Install dependencies:
   - `npm.cmd install`
2. Validate env:
   - `npm.cmd run check:env`
3. Run RLS smoke readiness check (staging/test DB):
   - `npm.cmd run verify:rls-smoke`
4. Apply Supabase migrations from `supabase/migrations`.
5. Bootstrap first admin if needed:
   - `npm.cmd run bootstrap:first-admin`
6. Deploy to Vercel production environment.
7. Verify:
   - auth works
   - company isolation works
   - report save works
   - media upload works
   - offline queue behavior is validated

## Current limitation

Live deployment verification remains blocked until required env values are configured.
Do not mark production as ready unless `check:env` and `verify:rls-smoke` pass with real environment values.
