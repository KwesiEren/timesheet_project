# Developer Guide (Current)

## Purpose

Worktivo is a multi-tenant workforce system with:
- Flutter mobile app for field workers
- React web portal for managers/owners/super-admins
- Pure Supabase Backend for APIs, data storage, and authentication

## Architecture Snapshot

- Mobile: Flutter + GetX
- Web: React + Vite + Tailwind + Zustand + TanStack Query
- Data/Auth/Backend: Supabase (`auth.users`, `profiles`, `timesheet_entries`, etc.)

## Repository Layout

- Root: Flutter app (`lib`, `assets`, `android`, `ios`, etc.)
- `web_portal/`: React web portal source and configuration
- `supabase/`: Supabase SQL migrations and configuration
- `docs/`: Product and technical docs

## Local Development

### Web portal (source)

```bash
cd web_portal
npm install
npm run dev
```

### Web production build

```bash
cd web_portal
npm run build
```

Then open:
- `http://localhost:8080/` (or whatever port Vite uses)

## Current Portal Paths

- Login: `/`
- Manager app: `/manager/*`
- Super admin app: `/admin/*`

## Database Setup (Supabase)

Recommended sequence:
1. Optional full reset: `supabase/migrations/migration_v0_reset_supabase.sql`
2. Bootstrap schema: `supabase/migrations/supabase_setup.sql`
3. Apply `migration_v1` through `migration_v8` in order

## Identity and Roles

- User identities come from `auth.users`
- App profile row in `profiles`
- Org roles in `user_roles` (`owner`, `manager`, `employee`)
- Platform admins in `super_admins`

Super admins do not require organization membership to access the `/admin/` routes.

## Notes for Contributors

- Use `profiles`, not legacy `users`, in new queries.
- Use `timesheet_entries`, not `time_entries`.
- Rely entirely on the Supabase Javascript/Dart clients for data fetching. There is no Node.js Express backend.
- Keep web and mobile branding aligned with `assets/icons/worktivo.png` and mobile color palette.
