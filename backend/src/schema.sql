-- Run this in Supabase SQL editor for the Node backend schema.
create table if not exists users (
    id text primary key,
    name text not null,
    email text not null unique,
    password_hash text not null,
    avatar_url text,
    created_at timestamptz not null default now()
);

create table if not exists timesheet_entries (
    id text primary key,
    user_id text not null references users(id) on delete cascade,
    project_id text not null,
    description text not null,
    start_time timestamptz not null,
    end_time timestamptz,
    total_duration_seconds integer,
    created_at timestamptz not null default now()
);

create index if not exists idx_timesheet_entries_user_start
on timesheet_entries (user_id, start_time desc);
