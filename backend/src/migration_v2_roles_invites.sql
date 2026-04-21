-- Phase 1: Foundation & Roles Migration
-- Target: Supabase SQL Editor

-- 1. Create Roles table
create table if not exists roles (
    id serial primary key,
    name text not null unique
);

-- Seed roles
insert into roles (id, name) values 
(1, 'Owner'),
(2, 'Manager'),
(3, 'Employee')
on conflict (id) do nothing;

-- 2. Create user_roles bridge table
-- This enforces "One Role per Organization per User"
-- As per user request, we add UNIQUE(user_id) to enforce "One Organization per User" for now
create table if not exists user_roles (
    user_id text not null references users(id) on delete cascade,
    organization_id uuid not null references organizations(id) on delete cascade,
    role_id integer not null references roles(id) on delete cascade,
    primary key (user_id, organization_id),
    constraint unique_user_per_org unique (user_id)
);

-- 3. Create Invites table
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

-- 4. Migrate existing users to be "Owners" of their current organization
insert into user_roles (user_id, organization_id, role_id)
select id, organization_id, 1 from users
where organization_id is not null
on conflict do nothing;

-- 5. Add indices for performance
create index if not exists idx_user_roles_org on user_roles(organization_id);
create index if not exists idx_user_roles_role on user_roles(role_id);
create index if not exists idx_invites_token on invites(token);
create index if not exists idx_invites_email on invites(email);
