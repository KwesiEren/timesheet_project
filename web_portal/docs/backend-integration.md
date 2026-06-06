# Backend Integration (Pure Supabase)

This portal speaks entirely to **Supabase** for all authentication, data storage, and business logic. There is no legacy Node.js Express backend.

## Environment variables

Put these in `.env` (Vite exposes only `VITE_*`):

```bash
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

The Supabase URL and anon key come from your Supabase project.

## Supabase Client (`src/lib/supabase.ts`)

- Configured using the environment variables.
- Manages authentication state automatically.
- All database queries go through the strongly-typed Supabase JS client.
- RLS (Row Level Security) ensures that users can only access data they are authorized to see based on their `organization_id` and role in the `user_roles` table.

## Auth flow

```text
Login.tsx
  └─ supabase.auth.signInWithPassword
       └─ store session in Zustand (token, user)
            └─ getMe() in services.ts:
                 1. profiles (id, name, email, organization_id)
                 2. user_roles (role, organization_id) for same user
                 3. organizations (plan, status, name) — fallback query if join empty
                 └─ redirect:
                      super_admin            → /admin/
                      owner | manager        → /manager/
                      employee               → blocked screen ("mobile app only")
```

**Important:** `user_roles` and `organizations` must have tenant `SELECT` RLS
policies (see `migration_v9_tenant_auth_rls.sql`). Without them, login fails with
"No organization assigned" even when DB rows exist. Details: [`auth-login-fix.md`](./auth-login-fix.md).

`onAuthStateChange` rehydrates the session on hard refresh.

## Data Access (Supabase Tables & RPCs)

All data access is handled in `src/lib/services.ts` directly via Supabase.

| Entity | Handled via | Notes |
|---|---|---|
| Authentication | `supabase.auth.*` | Login, logout, session management |
| Profile / Org Context | `profiles`, `user_roles`, `organizations` | Fetches current user context |
| Dashboard KPIs | `timesheet_entries`, `user_roles` | Direct count queries and status checks |
| Employees / Team | `profiles`, `user_roles` | Invites via `supabase.auth.admin.inviteUserByEmail` (Edge Function/Admin Client) or direct inserts if handled via triggers |
| Sites & Geofencing | `sites` | Direct CRUD |
| Timesheets & Approvals | `timesheet_entries` | Direct CRUD, bulk status updates via `.update().in('id', ids)` |
| Projects & Activities | `projects`, `activity_types` | Direct CRUD |
| Notifications | `notifications` | Direct CRUD, missing log scans via edge functions/RPCs |
| Admin Portals | `organizations`, `profiles`, `platform_settings` | Accessed by users with `super_admins` entry |
| Audit Logs | `platform_audit_logs` | Written via Postgres functions/triggers or direct insert |

### RLS expectations

- `profiles` — users can read/update their own row; managers can read org members (see `supabase_setup.sql`).
- `user_roles` — users can read **own** roles; managers can read roles in their org (`migration_v9_tenant_auth_rls.sql`). Required for login.
- `organizations` — members can read their org row (`migration_v9_tenant_auth_rls.sql`). Required for login plan/status.
- `projects`, `activity_types`, `sites`, `timesheet_entries` — read/write requires matching `organization_id` and manager/owner role.
- `platform_audit_logs`, `platform_settings` — super-admin only.

## Adding a new data fetching endpoint

1. Add the function to `src/lib/services.ts` using the `supabase` client.
2. Add types to `src/types/api.ts` or `src/types/admin.ts`.
3. Wrap calls in `useQuery` (for reads) or `useMutation` (for writes) in the page; invalidate the right query keys on success.
4. Surface a toast on error via `useToast`.
