# DEPLOYMENT

## Deployment policy

Production deploy is blocked unless required env variables are present and env preflight passes.

## Steps

1. Install dependencies:
   - `npm install`
2. Validate env:
   - `npm run check:env`
3. Apply Supabase migrations from `supabase/migrations`.
4. Bootstrap first admin if needed:
   - `npm run bootstrap:first-admin`
5. Deploy to Vercel production environment.
6. Verify:
   - auth works
   - company isolation works
   - report save works
   - media upload works
   - offline queue behavior is validated

## Current limitation

This repository currently contains foundational docs, SQL migrations, and UI shell.
Module runtime implementation and API handlers are still incomplete and require follow-up stages.
