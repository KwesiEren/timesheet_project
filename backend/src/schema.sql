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
    project_id text,
    title text,
    details text,
    notes text,
    start_time timestamptz not null,
    end_time timestamptz,
    total_duration_seconds integer,
    is_completed boolean default false,
    created_at timestamptz not null default now()
);

create table if not exists breaks (
    id text primary key,
    user_id text not null references users(id) on delete cascade,
    timesheet_entry_id text references timesheet_entries(id) on delete cascade,
    start_time timestamptz not null,
    end_time timestamptz,
    created_at timestamptz not null default now()
);

create table if not exists daily_logs (
    id text primary key,
    user_id text not null references users(id) on delete cascade,
    date date not null default current_date,
    arrival_time timestamptz,
    departure_time timestamptz,
    created_at timestamptz not null default now(),
    unique(user_id, date)
);

create table if not exists announcements (
    id text primary key,
    title text not null,
    content text not null,
    author_id text references users(id),
    created_at timestamptz not null default now()
);

create table if not exists notifications (
    id text primary key,
    user_id text not null references users(id) on delete cascade,
    title text not null,
    message text not null,
    is_read boolean default false,
    created_at timestamptz not null default now()
);

create index if not exists idx_timesheet_entries_user_start
on timesheet_entries (user_id, start_time desc);

create index if not exists idx_notifications_user_unread
on notifications (user_id) where is_read = false;

