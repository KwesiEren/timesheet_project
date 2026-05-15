# Worktivo Web Portal Blueprint (Current)

## Overview

The web portal is a React SPA in `backend/public/worktivo-manager-hub`, served by the Node backend.

## Runtime Paths

- Login: `/app/`
- Manager app: `/app/manager/*`
- Super admin app: `/app/admin/*`

Server-side static routing uses:
- explicit static for `/app/assets/*`
- SPA fallback for non-file `/app` routes

## Frontend Stack

- Vite + React + TypeScript
- Tailwind CSS
- Zustand (auth/session state)
- TanStack Query (data layer)
- Supabase JS (auth + selected direct data reads)

## Auth and Access Flow

1. User signs in via Supabase Auth.
2. Access token is stored in auth store.
3. `/auth/me` is called on backend to resolve profile + role + org context.
4. Post-login redirect:
   - super admin -> `/app/admin/`
   - manager/owner -> `/app/manager/`
5. Employee users are blocked from the manager portal.

Super admin login is allowed even without organization membership.

## Design and Branding

- Theme tokens synced with Flutter palette in `src/index.css`.
- Shared logo loaded from root app assets:
  - `/assets/icons/worktivo.png`

## Integration Notes

- Supabase-native schema is used (`profiles`, `timesheet_entries`, `user_roles`, etc.).
- Legacy table references (`users`, `time_entries`) have been removed from active web code.

## Build and Serve

```bash
cd backend/public/worktivo-manager-hub
npm run build
```

Then run backend:

```bash
cd backend
npm run dev
```

Open:
- `http://localhost:3000/app/`

## Known Next Improvements

- Add CI for portal build + smoke tests.
- Improve chunk splitting to reduce large main bundle warning.
