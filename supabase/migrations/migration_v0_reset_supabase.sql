-- Migration V0: Hard reset for Supabase public schema objects
-- WARNING: This drops app tables, policies, triggers, and helper functions.

-- Drop triggers on auth schema first
drop trigger if exists on_auth_user_created on auth.users;

-- Drop policies (safe if absent)
drop policy if exists "Users can view their own profile" on profiles;
drop policy if exists "Users can update their own profile" on profiles;
drop policy if exists "Managers can view all profiles in their org" on profiles;
drop policy if exists "Users can view projects in their organization" on projects;
drop policy if exists "Managers can insert projects in their organization" on projects;
drop policy if exists "Managers can update projects in their organization" on projects;
drop policy if exists "Users can view activity types in their organization" on activity_types;
drop policy if exists "Managers can manage activity types in their organization" on activity_types;
drop policy if exists "Super admins can view super admins table" on super_admins;
drop policy if exists "Super admins have full access to organizations" on organizations;
drop policy if exists "Super admins have full access to profiles" on profiles;
drop policy if exists "Super admins have full access to user_roles" on user_roles;
drop policy if exists "Super admins have full access to timesheet_entries" on timesheet_entries;
drop policy if exists "Super admins have full access to daily_logs" on daily_logs;
drop policy if exists "Super admins have full access to platform_settings" on platform_settings;
drop policy if exists "Super admins have full access to platform_audit_logs" on platform_audit_logs;

-- Drop application tables in dependency order
drop table if exists notifications cascade;
drop table if exists announcements cascade;
drop table if exists invites cascade;
drop table if exists breaks cascade;
drop table if exists daily_logs cascade;
drop table if exists timesheet_entries cascade;
drop table if exists sites cascade;
drop table if exists activity_types cascade;
drop table if exists projects cascade;
drop table if exists user_roles cascade;
drop table if exists profiles cascade;
drop table if exists super_admins cascade;
drop table if exists platform_audit_logs cascade;
drop table if exists platform_settings cascade;
drop table if exists organizations cascade;

-- Drop helper functions
drop function if exists public.handle_new_user() cascade;
drop function if exists update_updated_at_column() cascade;
drop function if exists get_org_dashboard_stats(uuid) cascade;
drop function if exists is_super_admin(uuid) cascade;
drop function if exists check_project_limit() cascade;
drop function if exists check_employee_limit() cascade;
