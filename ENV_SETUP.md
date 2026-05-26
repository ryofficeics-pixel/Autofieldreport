# ENV_SETUP

## 1. Copy template

Copy `.env.example` to `.env` and fill values.

## 2. Required public variables

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_URL`
- `VITE_ENVIRONMENT`

## 3. Required server variables

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## 4. Optional bootstrap variables

- `FIRST_ADMIN_EMAIL`
- `FIRST_ADMIN_PASSWORD`
- `FIRST_COMPANY_NAME`
- `FIRST_COMPANY_SLUG`

## 5. Validate env

Run:

```bash
npm run check:env
```

If this fails, do not run production build/deploy.
