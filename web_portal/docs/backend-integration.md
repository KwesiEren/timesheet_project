# Backend Integration

This portal speaks to **two** backends:

1. **Supabase** — authentication, plus direct table reads/writes for things
   that have RLS-protected schemas (projects, activity_types, organizations,
   profiles, audit logs, platform settings).
2. **Express REST API** — workforce-specific endpoints that need server-side
   business logic (dashboard rollups, timesheet approval, PDF generation,
   notifications).

## Environment variables

Put these in `.env` (Vite exposes only `VITE_*`):

```bash
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
VITE_API_URL=http://localhost:3000          # Express base URL
```

The Supabase URL and anon key come from your Lovable Cloud / Supabase project.
The Express base URL is whatever serves the `/auth/me`, `/dashboard/*`,
`/timesheets`, `/sites`, `/employees/*`, `/notifications`, `/reports/*` routes.

## HTTP client (`src/lib/api.ts`)

- Adds `Authorization: Bearer <supabase access token>` to every request.
- Adds `X-Organization-Id: <user.organizationId>` when present.
- On `401`, signs the user out and redirects to `/`.

## Auth flow

```text
Login.tsx
  └─ supabase.auth.signInWithPassword
       └─ store session in Zustand (token, user)
            └─ GET /auth/me  → { profile, role, organizationId, isSuperAdmin }
                 └─ redirect:
                      super_admin            → /admin
                      owner | manager         → /manager
                      employee                → blocked screen ("mobile app only")
```

`onAuthStateChange` rehydrates the session on hard refresh.

## REST endpoints (Express)

| Method | Path | Used by | Notes |
|---|---|---|---|
| GET | `/auth/me` | login | resolves profile + role + org + isSuperAdmin |
| POST | `/auth/invite` | Team page | invites employee, takes `{email, role, department?, primary_site_id?}` |
| GET | `/dashboard/kpis` | Manager Dashboard | `{clocked_in_now, late_today, pending_approvals, open_alerts}` |
| GET | `/dashboard/employees` | Manager Dashboard | live employee snapshot |
| GET | `/employees/history` | History page | params: `from, to, site_id, status` |
| POST | `/employees/approve` | History page | body: `{ ids: string[] }` |
| PATCH | `/employees/status/:id` | Team page | body: `{ status }` |
| GET | `/sites` | Sites page | list |
| POST | `/sites` | Sites page | create |
| PUT | `/sites/:id` | Sites page | update |
| DELETE | `/sites/:id` | Sites page | delete |
| GET | `/timesheets` | Timesheets page | params: `from, to` |
| PATCH | `/timesheets/:id` | Timesheets page | edit (preserves `original`) |
| PATCH | `/timesheets/:id/approve` | Timesheets page | |
| PATCH | `/timesheets/:id/reject` | Timesheets page | |
| GET | `/reports/payroll` | Payroll page | returns `application/pdf` blob |
| GET | `/notifications` | Notifications + sidebar badge | |
| PUT | `/notifications/:id/read` | Notifications | |
| POST | `/notifications/missing-logs` | Notifications | returns `{ created }` |

## Supabase tables (read directly)

| Table | Purpose | Accessed by |
|---|---|---|
| `auth.users` | Supabase-managed | login |
| `profiles` | display name, email | admin Users page |
| `user_roles` | role per (user, organization) | admin Users page |
| `organizations` | name, plan, status, settings | admin Organizations, Settings |
| `projects` | per-org project list | manager Projects |
| `activity_types` | per-org activity vocab | manager Activity Types |
| `platform_audit_logs` | platform-wide audit trail | admin Audit Logs |
| `platform_settings` | feature flags, free-tier caps | admin Settings |
| `sites` | (read via REST, not direct) | counted in admin Organizations |
| `timesheet_entries` | (read via REST, not direct) | counted in admin Dashboard |

### RLS expectations

- `projects` and `activity_types` — read/write requires `user_roles.organization_id`
  to match the row's `organization_id`. Manager + owner only.
- `organizations`, `profiles`, `user_roles` — readable by super-admins only
  for cross-tenant rows; tenant users see their own org/profile only.
- `platform_audit_logs`, `platform_settings` — super-admin only.
- Always use a `has_role(uid, role)` SECURITY DEFINER function (see project
  user-roles guidance) — never check roles by joining inside an RLS policy.

## Adding a new backend endpoint

1. Add the function to `src/lib/services.ts` (use `api` for REST or `supabase`
   for direct table access).
2. Add types to `src/types/api.ts` or `src/types/admin.ts`.
3. Wrap calls in `useQuery` (for reads) or `useMutation` (for writes) in the
   page; invalidate the right query keys on success.
4. Surface a toast on error via `useToast`.

## Local dev quickstart

```bash
bun install
cp .env.example .env   # fill in VITE_* values
bun dev                # http://localhost:8080
```

The Express backend is a separate repo; point `VITE_API_URL` at wherever it
runs (e.g. `http://localhost:3000`).
