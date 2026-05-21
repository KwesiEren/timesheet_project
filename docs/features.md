# Feature Status (Current)

## Core Platform

- [x] Multi-tenant organization model (`organization_id` scoped records)
- [x] Supabase-native identity model (`auth.users` + `profiles`)
- [x] Role model: `owner`, `manager`, `employee`
- [x] Invite + accept flow (`invites`, `user_roles`)
- [x] Super admin capability via `super_admins`

## Mobile App (Flutter)

- [x] Login and authenticated app shell
- [x] Timesheet create/update/delete flow against Supabase backend
- [x] Local cache support (`get_storage`)
- [x] Geolocation and map-related dependencies integrated
- [x] Shared branding assets (`assets/icons/worktivo.png`)

## Web Portal (React)

- [x] Served via standard web hosting (Vite build)
- [x] Login at `/`
- [x] Manager routes under `/manager/*`
- [x] Super admin routes under `/admin/*`
- [x] Super admin access works without org membership
- [x] Theme aligned to mobile color palette
- [x] Shared logo uses root `assets/icons/worktivo.png`

## Backend Data Access (Supabase)

- [x] Profile/Role resolution via `profiles` + `user_roles`
- [x] Dashboard rollups using Supabase count queries
- [x] Timesheet direct CRUD with RLS
- [x] Employee management direct CRUD
- [x] Notifications system
- [x] Role checks and org scoping via RLS and DB triggers

## Database & Migrations

- [x] `supabase_setup.sql` for baseline schema + profile trigger
- [x] Reset migration (`migration_v0_reset_supabase.sql`)
- [x] Supabase-native migration chain `v1` to `v8`
- [x] Legacy `users` table references removed from active app/web flows

## In Progress / Next

- [ ] Full automated test suite (backend + web)
- [ ] CI checks for migrations and API health
- [x] Final cleanup of legacy docs/comments completed
- [ ] Billing/payment provider integration for paid upgrade flow
