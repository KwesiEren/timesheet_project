-- Phase 3: Sites, Geofencing & Photo Proofs Migration
-- Target: Supabase SQL Editor

-- 1. Create sites table
create table if not exists sites (
    id text primary key,
    organization_id uuid not null references organizations(id) on delete cascade,
    project_id text references projects(id) on delete set null,
    name text not null,
    latitude double precision not null,
    longitude double precision not null,
    radius_meters integer not null default 100,
    photo_required boolean not null default false,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Index for organization and project lookups
create index if not exists idx_sites_organization on sites(organization_id);
create index if not exists idx_sites_project on sites(project_id);

-- 2. Update daily_logs table for location tracking
alter table daily_logs add column if not exists site_id text references sites(id) on delete set null;
alter table daily_logs add column if not exists check_in_lat double precision;
alter table daily_logs add column if not exists check_in_lng double precision;
alter table daily_logs add column if not exists check_in_photo_url text;
alter table daily_logs add column if not exists is_within_geofence boolean;

-- 3. Trigger for updated_at on sites
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_sites_updated_at
before update on sites
for each row
execute function update_updated_at_column();
