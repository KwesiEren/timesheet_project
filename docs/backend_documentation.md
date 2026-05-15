# Backend Documentation (Current)

Worktivo backend is an Express API over Supabase (Postgres + Auth + RLS), with the web portal served from the same Node process.

## Stack

- Runtime: Node.js
- API: Express 5
- Data/Auth: Supabase (`@supabase/supabase-js`)
- Reports: `pdfkit`
- Auth guard: Supabase JWT verification (local verify + Supabase Auth fallback)

## Project Structure

```text
backend/
├── src/
│   ├── index.js
│   ├── lib/supabase.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── rbac.js
│   ├── routes/
│   └── migration_v0...v8.sql
├── supabase_setup.sql
├── .env
└── public/worktivo-manager-hub/
```

## Auth and Identity Model

- Identity source: `auth.users`
- App user profile: `public.profiles`
- Org/role: `user_roles` + `organization_id`
- Super admins: `super_admins`

`/auth/me` reads from `profiles` and resolves:
- user profile
- active/default role
- organization details

Super admins can access the admin portal even without org membership.

## Main API Areas

- `/auth`: me, invite, onboarding/create-org, accept-invite
- `/dashboard`: KPIs and live employee snapshot
- `/timesheets` (+ `/activities` alias): user/org timesheet flows
- `/employees`: history, check-in/out, approvals, status updates
- `/sites`: site and geofence management
- `/notifications`: notifications + missing-log scan
- `/reports`: payroll PDF

## Web Portal Serving

- SPA base path: `/app`
- Login: `/app/`
- Manager portal: `/app/manager/*`
- Super admin portal: `/app/admin/*`

Express serves:
- static chunks at `/app/assets/*`
- SPA fallback for `/app` app routes
- shared Flutter assets at `/assets/*` (logo reuse)

## Environment Variables

Required in `backend/.env`:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET` (used for fast-path local verify)
- `PORT` (optional, default `3000`)

## Database Setup and Migrations

Canonical setup file:
- `backend/supabase_setup.sql`

Migration chain (Supabase-native):
- `migration_v0_reset_supabase.sql` (optional reset)
- `migration_v1_multitenant.sql`
- `migration_v2_roles_invites.sql`
- `migration_v3_approvals_audit.sql`
- `migration_v4_sites_geofencing.sql`
- `migration_v5_cleanup_push.sql`
- `migration_v6_super_admin.sql`
- `migration_v7_subscriptions.sql`
- `migration_v8_projects_activities.sql`

`backend/src/schema.sql` is legacy/deprecated for current installs.
