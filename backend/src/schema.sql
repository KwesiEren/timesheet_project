-- Run this in Supabase SQL editor for the Node backend schema.

create table if not exists roles (
    id serial primary key,
    name text not null unique
);

create table if not exists organizations (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    logo_url text,
    settings jsonb default '{}',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists users (
    id text primary key,
    name text not null,
    email text not null unique,
    password_hash text not null,
    avatar_url text,
    organization_id uuid references organizations(id),
    created_at timestamptz not null default now()
);

create table if not exists user_roles (
    user_id text not null references users(id) on delete cascade,
    organization_id uuid not null references organizations(id) on delete cascade,
    role_id integer not null references roles(id) on delete cascade,
    primary key (user_id, organization_id),
    constraint unique_user_per_org unique (user_id)
);

create table if not exists timesheet_entries (
    id text primary key,
    user_id text not null references users(id) on delete cascade,
    organization_id uuid not null references organizations(id) on delete cascade,
    project_id text,

    title text,
    details text,
    notes text,
    start_time timestamptz not null,
    end_time timestamptz,
    total_duration_seconds integer,
    is_completed boolean default false,
    is_flagged boolean default false,
    original_data jsonb,
    last_edited_by text references users(id),
    created_at timestamptz not null default now()
);

create table if not exists breaks (
    id text primary key,
    user_id text not null references users(id) on delete cascade,
    organization_id uuid not null references organizations(id) on delete cascade,
    timesheet_entry_id text references timesheet_entries(id) on delete cascade,
    start_time timestamptz not null,
    end_time timestamptz,
    created_at timestamptz not null default now()
);

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

create table if not exists daily_logs (
    id text primary key,
    user_id text not null references users(id) on delete cascade,
    organization_id uuid not null references organizations(id) on delete cascade,
    date date not null default current_date,
    arrival_time timestamptz,
    departure_time timestamptz,
    status text not null default 'pending' check (status in ('pending', 'present', 'late', 'absent', 'approved')),
    approved_by text references users(id),
    approved_at timestamptz,
    site_id text references sites(id),
    check_in_lat double precision,
    check_in_lng double precision,
    check_in_photo_url text,
    is_within_geofence boolean,
    created_at timestamptz not null default now(),
    unique(user_id, date)
);

create table if not exists announcements (
    id text primary key,
    organization_id uuid not null references organizations(id) on delete cascade,
    title text not null,
    content text not null,
    author_id text references users(id),
    created_at timestamptz not null default now()
);

create table if not exists notifications (
    id text primary key,
    user_id text not null references users(id) on delete cascade,
    organization_id uuid not null references organizations(id) on delete cascade,
    title text not null,
    message text not null,
    is_read boolean default false,
    created_at timestamptz not null default now()
);

create table if not exists invites (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    inviter_id text not null references users(id) on delete cascade,
    email text not null,
    role_id integer not null references roles(id) on delete cascade,
    token text not null unique,
    status text not null default 'pending' check (status in ('pending', 'accepted', 'expired', 'revoked')),
    expires_at timestamptz not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index if not exists idx_timesheet_entries_user_start
on timesheet_entries (user_id, start_time desc);

create index if not exists idx_notifications_user_unread
on notifications (user_id) where is_read = false;

