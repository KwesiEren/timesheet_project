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
            └─ GET profiles & user_roles via Supabase → { profile, role, organizationId, isSuperAdmin }
                 └─ redirect:
                      super_admin            → /admin/
                      owner | manager        → /manager/
                      employee               → blocked screen ("mobile app only")
```

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

- `projects`, `activity_types`, `sites`, `timesheet_entries` — read/write requires `user_roles.organization_id` to match the row's `organization_id`. Manager + owner only.
- `organizations`, `profiles`, `user_roles` — readable by super-admins globally; tenant users see their own org/profile only.
- `platform_audit_logs`, `platform_settings` — super-admin only.

## Adding a new data fetching endpoint

1. Add the function to `src/lib/services.ts` using the `supabase` client.
2. Add types to `src/types/api.ts` or `src/types/admin.ts`.
3. Wrap calls in `useQuery` (for reads) or `useMutation` (for writes) in the page; invalidate the right query keys on success.
4. Surface a toast on error via `useToast`.
