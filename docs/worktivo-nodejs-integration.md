# Worktivo Node + Supabase Integration (Current)

This project uses a hybrid model:
- Supabase Auth for identity/session
- Supabase Postgres for storage
- Node/Express for protected business endpoints and static app hosting

## Core Principles

- Use `auth.users` + `profiles` (not legacy `users` table).
- Use `timesheet_entries` (not `time_entries`).
- Use `user_roles` for role checks and employee counts.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only.

## Required Backend Env

```bash
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_JWT_SECRET=...
PORT=3000
```

## Current Auth Middleware Behavior

`requireAuth` now validates token in two steps:
1. Fast local JWT verify using `SUPABASE_JWT_SECRET`
2. Fallback verification via `adminClient.auth.getUser(token)` if local verify fails

This avoids false 401s if local JWT settings drift.

## Role and Org Guarding

- `X-Organization-Id` header carries active org context.
- `requireOrgRole` checks `user_roles` for org membership and role.
- Super admin detection is handled via `super_admins`.

## `/auth/me` behavior

- Reads from `profiles`
- Embeds org using explicit FK alias to avoid ambiguous PostgREST joins
- Returns role from `user_roles` (current org first, then default)

## Super Admin Notes

- Super admins can sign in and reach `/app/admin/` even without organization membership.
- `super_admins` RLS policy must be non-recursive:
  - `USING (user_id = auth.uid())`

## Migration/Schema Source of Truth

- Baseline schema and profile trigger: `backend/supabase_setup.sql`
- Incremental chain: `migration_v1` ... `migration_v8`
- Optional clean reset: `migration_v0_reset_supabase.sql`

## Common Issues and Fixes

- `401 /auth/me`:
  - usually token verification mismatch; fallback verify now handles this
- `PGRST201 embed ambiguity`:
  - fix with explicit FK embed (`organizations!profiles_organization_id_fkey(...)`)
- `infinite recursion detected in policy for relation "super_admins"`:
  - replace self-querying policy with direct `user_id = auth.uid()`
- Supabase `404` for `/rest/v1/users` or `/rest/v1/time_entries`:
  - indicates stale legacy table names in frontend code; use `profiles` and `timesheet_entries`
