# Feature Status (Current)

## Core Platform

- [x] Multi-tenant organization model (`organization_id` scoped records)
- [x] Supabase-native identity model (`auth.users` + `profiles`)
- [x] Role model: `owner`, `manager`, `employee`
- [x] Invite + accept flow (`invites`, `user_roles`)
- [x] Super admin capability via `super_admins`

## Mobile App (Flutter)

- [x] Login and authenticated app shell
- [x] Timesheet create/update/delete flow against Node backend
- [x] Local cache support (`get_storage`)
- [x] Geolocation and map-related dependencies integrated
- [x] Shared branding assets (`assets/icons/worktivo.png`)

## Web Portal (React)

- [x] Served by backend as SPA under `/app`
- [x] Login at `/app/`
- [x] Manager routes under `/app/manager/*`
- [x] Super admin routes under `/app/admin/*`
- [x] Super admin access works without org membership
- [x] Theme aligned to mobile color palette
- [x] Shared logo uses root `assets/icons/worktivo.png`

## Backend APIs

- [x] Auth context endpoint (`/auth/me`)
- [x] Dashboard endpoints (`/dashboard/kpis`, `/dashboard/employees`)
- [x] Timesheet routes (`/timesheets`, `/activities`)
- [x] Employee routes (`/employees/*`)
- [x] Notifications and missing-log scan
- [x] Payroll PDF report route
- [x] Role checks and org scoping middleware

## Database & Migrations

- [x] `supabase_setup.sql` for baseline schema + profile trigger
- [x] Reset migration (`migration_v0_reset_supabase.sql`)
- [x] Supabase-native migration chain `v1` to `v8`
- [x] Legacy `users` table references removed from active app/web flows

## In Progress / Next

- [ ] Full automated test suite (backend + web)
- [ ] CI checks for migrations and API health
- [ ] Final cleanup of any remaining legacy docs/comments referencing `/manager` or `users`
- [ ] Billing/payment provider integration for paid upgrade flow
