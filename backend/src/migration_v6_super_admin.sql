-- Migration V6: Super Admin Infrastructure

-- 1. Create super_admins table
create table if not exists super_admins (
    user_id uuid primary key references auth.users(id) on delete cascade,
    created_at timestamptz default now()
);

-- Enable RLS on super_admins
alter table super_admins enable row level security;

-- Only super admins can see who else is a super admin
drop policy if exists "Super admins can view super admins table" on super_admins;
create policy "Super admins can view super admins table"
on super_admins for select
using (
    exists (select 1 from super_admins where user_id = auth.uid())
);

-- 2. Create platform_settings table
create table if not exists platform_settings (
    key text primary key,
    value jsonb not null,
    updated_at timestamptz default now()
);

-- Seed default settings
insert into platform_settings (key, value) values 
('global_limits', '{"max_users_free": 10, "max_projects_free": 5}'),
('feature_toggles', '{"geofencing": true, "photo_verification": true}')
on conflict (key) do nothing;

-- 3. Create platform_audit_logs for system-wide tracking
create table if not exists platform_audit_logs (
    id uuid primary key default gen_random_uuid(),
    actor_id uuid references auth.users(id),
    organization_id uuid references organizations(id),
    action text not null,
    entity_type text not null, -- 'organization', 'user', 'setting', etc.
    entity_id text,
    changes jsonb,
    ip_address text,
    user_agent text,
    created_at timestamptz default now()
);

-- Index for performance
create index if not exists idx_platform_audit_actor on platform_audit_logs(actor_id);
create index if not exists idx_platform_audit_org on platform_audit_logs(organization_id);
create index if not exists idx_platform_audit_action on platform_audit_logs(action);

-- 4. Add soft delete support to organizations if not already there
do $$ 
begin
    if not exists (select 1 from information_schema.columns where table_name='organizations' and column_name='deleted_at') then
        alter table organizations add column deleted_at timestamptz;
    end if;
end $$;

-- 5. Helper function to check if a user is a super admin
create or replace function is_super_admin(user_id uuid)
returns boolean as $$
begin
    return exists (select 1 from super_admins where user_id = $1);
end;
$$ language plpgsql security definer;

-- 6. Global RLS Policies for Super Admins

-- Organizations
alter table organizations enable row level security;
drop policy if exists "Super admins have full access to organizations" on organizations;
create policy "Super admins have full access to organizations"
on organizations for all
using (is_super_admin(auth.uid()));

-- Profiles
alter table profiles enable row level security;
drop policy if exists "Super admins have full access to profiles" on profiles;
create policy "Super admins have full access to profiles"
on profiles for all
using (is_super_admin(auth.uid()));

-- User Roles
alter table user_roles enable row level security;
drop policy if exists "Super admins have full access to user_roles" on user_roles;
create policy "Super admins have full access to user_roles"
on user_roles for all
using (is_super_admin(auth.uid()));

-- Timesheet Entries
alter table timesheet_entries enable row level security;
drop policy if exists "Super admins have full access to timesheet_entries" on timesheet_entries;
create policy "Super admins have full access to timesheet_entries"
on timesheet_entries for all
using (is_super_admin(auth.uid()));

-- Daily Logs
alter table daily_logs enable row level security;
drop policy if exists "Super admins have full access to daily_logs" on daily_logs;
create policy "Super admins have full access to daily_logs"
on daily_logs for all
using (is_super_admin(auth.uid()));

-- Platform Settings
alter table platform_settings enable row level security;
drop policy if exists "Super admins have full access to platform_settings" on platform_settings;
create policy "Super admins have full access to platform_settings"
on platform_settings for all
using (is_super_admin(auth.uid()));

-- Platform Audit Logs
alter table platform_audit_logs enable row level security;
drop policy if exists "Super admins have full access to platform_audit_logs" on platform_audit_logs;
create policy "Super admins have full access to platform_audit_logs"
on platform_audit_logs for all
using (is_super_admin(auth.uid()));
