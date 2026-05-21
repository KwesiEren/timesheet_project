# Supabase Architecture (Current)

Worktivo uses a pure Supabase-native architecture for both the web portal and the mobile app. All business logic, data access, and security rules are enforced directly at the database layer using Postgres Row Level Security (RLS) and Supabase Auth.

## Stack

- Data/Auth: Supabase (`@supabase/supabase-js`)
- Auth guard: Supabase Auth Session
- Storage: Supabase Storage
- API: Direct Supabase JS Client integration

## Auth and Identity Model

- Identity source: `auth.users`
- App user profile: `public.profiles`
- Org/role: `public.user_roles` + `organization_id`
- Super admins: `public.super_admins`

Authentication is handled natively via Supabase. Upon login, the client retrieves the user's `profiles` row to determine their `user_roles`, `organization_id`, and `is_super_admin` status.

Super admins can access the admin portal even without organization membership.

## Main Data Entities

- **Organizations**: Managed by Super Admins. Contains plan limits and status.
- **Profiles**: Base user identity.
- **User Roles**: Links a profile to an organization with a specific role (`owner`, `manager`, `employee`).
- **Timesheets (`timesheet_entries`)**: Time tracking data.
- **Activity Types**: Categories of work.
- **Projects**: Tracked projects within an organization.
- **Sites**: Geofencing configuration.
- **Notifications**: Internal alerts.

## Web Portal Usage

The web portal (`web_portal/`) queries Supabase directly.
- SPA base path: `/`
- Login: `/`
- Manager portal: `/manager/*`
- Super admin portal: `/admin/*`

## Environment Variables

Required in `web_portal/.env`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Database Setup and Migrations

Canonical setup file:
- `supabase/migrations/supabase_setup.sql`

Migration chain (Supabase-native):
- `migration_v0_reset_supabase.sql` (optional reset)
- `migration_v1_multitenant.sql`
- `migration_v2_roles_invites.sql`
- `migration_v3_approvals_audit.sql`
- `migration_v4_sites_geofencing.sql`
- `migration_v5_cleanup_push.sql`
- `migration_v6_super_admin.sql`
- `migration_v7_subscriptions.sql`
- `migration_v8_projects_activities.sql`

Legacy `backend/` routes and Node API endpoints have been completely deprecated and removed.
