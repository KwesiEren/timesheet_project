-- Phase 0: Multi-Tenant Refactor Migration
-- Target: Supabase SQL Editor

-- 1. Create Organizations table
create table if not exists organizations (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    logo_url text,
    settings jsonb default '{}',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 2. Add organization_id to all relevant tables
-- We use UUID for organization_id to match the organizations table
alter table users add column if not exists organization_id uuid references organizations(id) on delete set null;
alter table timesheet_entries add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table breaks add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table daily_logs add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table announcements add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table notifications add column if not exists organization_id uuid references organizations(id) on delete cascade;

-- 3. Create a Default Organization for existing data
insert into organizations (name) values ('Default Organization');

-- 4. Map existing data to the Default Organization
-- We take the ID of the first organization created (the default one)
do $$
declare
    default_org_id uuid;
begin
    select id into default_org_id from organizations limit 1;
    
    update users set organization_id = default_org_id where organization_id is null;
    update timesheet_entries set organization_id = default_org_id where organization_id is null;
    update breaks set organization_id = default_org_id where organization_id is null;
    update daily_logs set organization_id = default_org_id where organization_id is null;
    update announcements set organization_id = default_org_id where organization_id is null;
    update notifications set organization_id = default_org_id where organization_id is null;
end $$;

-- 5. Set organization_id to NOT NULL (after backfilling)
alter table users alter column organization_id set not null;
alter table timesheet_entries alter column organization_id set not null;
alter table breaks alter column organization_id set not null;
alter table daily_logs alter column organization_id set not null;
alter table announcements alter column organization_id set not null;
alter table notifications alter column organization_id set not null;

-- 6. Indices for better performance
create index if not exists idx_users_org on users(organization_id);
create index if not exists idx_timesheet_entries_org on timesheet_entries(organization_id);
create index if not exists idx_daily_logs_org on daily_logs(organization_id);
create index if not exists idx_notifications_org on notifications(organization_id);
