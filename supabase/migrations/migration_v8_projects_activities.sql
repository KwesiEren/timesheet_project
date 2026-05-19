-- Migration V8: Projects & Activity Types (REVISED)

-- 1. Create Projects table
create table if not exists projects (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    name text not null,
    description text,
    is_active boolean not null default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Index for projects
create index if not exists idx_projects_org on projects(organization_id);

-- 2. Create Activity Types table
create table if not exists activity_types (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    name text not null,
    is_active boolean not null default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Index for activity types
create index if not exists idx_activity_types_org on activity_types(organization_id);

-- 3. Update Sites table to reference Projects correctly
alter table sites add column if not exists project_uuid uuid references projects(id) on delete set null;

-- 4. Update Profiles table for workforce metadata
alter table profiles add column if not exists department text;
alter table profiles add column if not exists primary_site_id text references sites(id) on delete set null;

-- 5. Update Timesheet Entries for approval status
alter table timesheet_entries add column if not exists status text not null default 'pending' check (status in ('pending', 'approved', 'rejected'));
alter table timesheet_entries add column if not exists approved_by uuid references profiles(id);
alter table timesheet_entries add column if not exists approved_at timestamptz;

-- 6. Add updated_at triggers
-- Note: Ensure update_updated_at_column() function exists from previous setups
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_projects_updated_at
before update on projects
for each row
execute function update_updated_at_column();

drop trigger if exists update_activity_types_updated_at on activity_types;
create trigger update_activity_types_updated_at
before update on activity_types
for each row
execute function update_updated_at_column();

-- 7. RLS Policies

-- Projects
alter table projects enable row level security;

drop policy if exists "Users can view projects in their organization" on projects;
create policy "Users can view projects in their organization"
on projects for select
using (organization_id = (select organization_id from profiles where id = auth.uid()));

drop policy if exists "Managers can insert projects in their organization" on projects;
create policy "Managers can insert projects in their organization"
on projects for insert
with check (
    organization_id = (select organization_id from profiles where id = auth.uid())
    and exists (
        select 1 from user_roles 
        where user_id = auth.uid() 
        and organization_id = projects.organization_id 
        and role in ('owner', 'manager')
    )
);

drop policy if exists "Managers can update projects in their organization" on projects;
create policy "Managers can update projects in their organization"
on projects for update
using (
    organization_id = (select organization_id from profiles where id = auth.uid())
    and exists (
        select 1 from user_roles 
        where user_id = auth.uid() 
        and organization_id = projects.organization_id 
        and role in ('owner', 'manager')
    )
);

-- Activity Types
alter table activity_types enable row level security;

drop policy if exists "Users can view activity types in their organization" on activity_types;
create policy "Users can view activity types in their organization"
on activity_types for select
using (organization_id = (select organization_id from profiles where id = auth.uid()));

drop policy if exists "Managers can manage activity types in their organization" on activity_types;
create policy "Managers can manage activity types in their organization"
on activity_types for all
using (
    organization_id = (select organization_id from profiles where id = auth.uid())
    and exists (
        select 1 from user_roles 
        where user_id = auth.uid() 
        and organization_id = activity_types.organization_id 
        and role in ('owner', 'manager')
    )
);
