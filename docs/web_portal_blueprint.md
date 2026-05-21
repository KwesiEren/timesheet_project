# Worktivo Web Portal Blueprint (Current)

## Overview

The web portal is a React SPA located in the `web_portal/` directory.

## Runtime Paths

- Login: `/`
- Manager app: `/manager/*`
- Super admin app: `/admin/*`

Server-side static routing uses:
- Vite for development
- Standard static hosting for production builds

## Frontend Stack

- Vite + React + TypeScript
- Tailwind CSS
- Zustand (auth/session state)
- TanStack Query (data layer)
- Supabase JS (auth + all data reads/writes)

## Auth and Access Flow

1. User signs in via Supabase Auth (`supabase.auth.signInWithPassword`).
2. Access token is stored in auth store.
3. Supabase client fetches profile + role + org context from `profiles` and `user_roles`.
4. Post-login redirect:
   - super admin -> `/admin/`
   - manager/owner -> `/manager/`
5. Employee users are blocked from the manager portal.

Super admin login is allowed even without organization membership.

## Design and Branding

- Theme tokens synced with Flutter palette in `src/index.css`.
- Shared logo loaded from root app assets or web portal assets.

## Integration Notes

- Supabase-native schema is used (`profiles`, `timesheet_entries`, `user_roles`, etc.).
- Legacy table references (`users`, `time_entries`) have been removed from active web code.
- No Node.js Express backend exists anymore. All logic executes directly via Supabase Postgres RLS, RPCs, or the Supabase JS Client.

## Build and Serve

```bash
cd web_portal
npm run build
```

Then run frontend for development:

```bash
cd web_portal
npm run dev
```

Open:
- `http://localhost:8080/` (or port specified by Vite)

## Known Next Improvements

- Add CI for portal build + smoke tests.
- Improve chunk splitting to reduce large main bundle warning.
