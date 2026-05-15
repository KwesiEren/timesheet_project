# Developer Guide (Current)

## Purpose

Worktivo is a multi-tenant workforce system with:
- Flutter mobile app for field workers
- React web portal for managers/owners/super-admins
- Node backend as API + static host + server-side operations

## Architecture Snapshot

- Mobile: Flutter + GetX
- Web: React + Vite + Tailwind + Zustand + TanStack Query
- Backend: Express 5
- Data/Auth: Supabase (`auth.users` + `profiles`)

## Repository Layout

- Root: Flutter app (`lib`, `assets`, `android`, `ios`, etc.)
- `backend/`: Node API + SQL migrations
- `backend/public/worktivo-manager-hub/`: Web portal source/build
- `docs/`: Product and technical docs

## Local Development

### Backend

```bash
cd backend
npm install
npm run dev
```

### Web portal (source)

```bash
cd backend/public/worktivo-manager-hub
npm install
npm run dev
```

### Web production build (served by backend)

```bash
cd backend/public/worktivo-manager-hub
npm run build
```

Then open:
- `http://localhost:3000/app/`

## Current Portal Paths

- Login: `/app/`
- Manager app: `/app/manager/*`
- Super admin app: `/app/admin/*`

## Database Setup (Supabase)

Recommended sequence:
1. Optional full reset: `backend/src/migration_v0_reset_supabase.sql`
2. Bootstrap schema: `backend/supabase_setup.sql`
3. Apply `migration_v1` through `migration_v8` in order

## Identity and Roles

- User identities come from `auth.users`
- App profile row in `profiles`
- Org roles in `user_roles` (`owner`, `manager`, `employee`)
- Platform admins in `super_admins`

Super admins do not require organization membership to access `/app/admin/`.

## Notes for Contributors

- Use `profiles`, not legacy `users`, in new queries.
- Use `timesheet_entries`, not `time_entries`.
- Prefer backend API routes for secured business logic.
- Keep web and mobile branding aligned with `assets/icons/worktivo.png` and mobile color palette.

