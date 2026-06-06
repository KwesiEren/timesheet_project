# Login fix: "No organization assigned"

## Symptom

Manager or owner sign-in fails with:

```text
Login failed — No organization assigned. Please contact your administrator.
```

…even though Supabase shows valid rows in `profiles` and `user_roles` for that user.

## Root cause

Two issues combined:

### 1. Missing tenant RLS policies (database)

`migration_v6_super_admin.sql` turned on Row Level Security for `user_roles` and
`organizations` but only added **super-admin** policies. Regular users could not
`SELECT` their own `user_roles` row or their `organizations` row via the anon
client.

The portal login flow calls `getMe()`, which reads role and org context from those
tables. With RLS blocking reads, nested joins returned empty results.

### 2. `getMe()` did not fall back to `profiles.organization_id` (app)

`profiles.organization_id` was already set and readable (existing profile RLS),
but `getMe()` only resolved the org from an embedded `user_roles(...)` join. When
that join returned nothing, `organizationId` was empty and login aborted.

## Fix

### A. Apply database migration (required)

Run the SQL in:

`supabase/migrations/migration_v9_tenant_auth_rls.sql`

In the Supabase dashboard: **SQL Editor → New query → paste → Run**.

This adds:

| Policy | Table | Effect |
|--------|-------|--------|
| `Users can view own roles` | `user_roles` | User can read their own role row(s) |
| `Org managers can view member roles` | `user_roles` | Owners/managers can read roles in their org (Team page) |
| `Members can view their organization` | `organizations` | Members can read their org's plan/status/name |

Super-admin policies from v6 remain unchanged.

### B. App changes (already in repo)

`src/lib/services.ts`:

- **`getMe()`** — loads `profiles.organization_id` directly, queries `user_roles`
  separately, falls back to profile org when needed, fetches `organizations` in a
  second query if the join is empty.
- **`getCurrentOrgId()`** — prefers `profiles.organization_id`, then `user_roles`.

After deploying the migration, managers with rows like:

```json
profiles.organization_id = "ffeb092d-e2fc-48c6-bf85-a0cb60a94f43"
user_roles.role = "manager"
```

can sign in and land on `/manager/`.

## Verify

1. Apply `migration_v9_tenant_auth_rls.sql` in Supabase.
2. Sign in as the manager user.
3. Confirm redirect to `/manager/` and header shows the organization name.

Optional SQL check (run as that user via Supabase SQL with `set request.jwt.claim.sub` or test in app):

```sql
select p.organization_id, ur.role
from profiles p
left join user_roles ur on ur.user_id = p.id
where p.id = '<user-uuid>';
```

Both columns should be non-null for portal access.

## Blank dashboard after login (react-leaflet)

**Symptom:** Login succeeds but the manager dashboard is blank. Console shows:

```text
Uncaught TypeError: render2 is not a function
Rendering <Context> directly is not supported
```

Stack trace points at `MapContainer` in `Dashboard.tsx`.

**Cause:** `react-leaflet` **v5.x requires React 19**. This portal uses **React 18**.
Using v5 on React 18 breaks Leaflet's context consumer and crashes the whole page.

**Fix (already in repo):**

1. Pin `react-leaflet` to `^4.2.1` in `package.json`
2. Run `npm install`
3. Restart the dev server (`npm run dev`)

The dashboard map is lazy-loaded via `src/components/DashboardMap.tsx` so a map
failure is less likely to take down the entire shell in future.

Do **not** upgrade to `react-leaflet@5` until the project moves to React 19.

## "Infinite recursion detected in policy for relation profiles"

This happens when RLS policies on `profiles` and `user_roles` reference each other
in subqueries (e.g. v9's `"Org managers can view member roles"` reading `profiles`
while `"Managers can view all profiles in their org"` reads `user_roles`).

**Fix:** run `supabase/migrations/migration_v10_rls_recursion_fix.sql` in the SQL
Editor. It adds `SECURITY DEFINER` helpers (`is_org_manager`, `is_org_member`,
`get_my_organization_id`) and rewrites the circular policies to use them instead
of cross-table subqueries.

## Related files

- `src/pages/Login.tsx` — throws when `userProfile.organizationId` is empty
- `src/lib/services.ts` — `getMe()`, `getCurrentOrgId()`
- `supabase/migrations/migration_v6_super_admin.sql` — original RLS that omitted tenant read policies
- `supabase/migrations/migration_v9_tenant_auth_rls.sql` — tenant read policies
- `supabase/migrations/migration_v10_rls_recursion_fix.sql` — recursion fix (run if you see infinite recursion on profiles)

## Prevention

When enabling RLS on a table used at login time, always add a **tenant/user read
policy** in the same migration, not only super-admin access. Login depends on:

- `profiles` (own row)
- `user_roles` (own row)
- `organizations` (member org)
