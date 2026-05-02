-- Migration V1: Supabase-native tenancy baseline
-- Model: auth.users (identity) + public.profiles (app user data)

create extension if not exists "uuid-ossp";

create table if not exists organizations (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    logo_url text,
    settings jsonb default '{}',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    name text not null,
    email text not null unique,
    avatar_url text,
    organization_id uuid references organizations(id) on delete set null,
    fcm_token text,
    created_at timestamptz default now()
);

create table if not exists user_roles (
    user_id uuid not null references profiles(id) on delete cascade,
    organization_id uuid not null references organizations(id) on delete cascade,
    role text not null check (role in ('owner', 'manager', 'employee')),
    is_default boolean default false,
    primary key (user_id, organization_id)
);

create index if not exists idx_profiles_org on profiles(organization_id);
create index if not exists idx_user_roles_org on user_roles(organization_id);
create index if not exists idx_user_roles_user on user_roles(user_id);
