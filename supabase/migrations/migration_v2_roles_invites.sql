-- Migration V2: Roles + invites using profiles

create table if not exists invites (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    inviter_id uuid not null references profiles(id) on delete cascade,
    email text not null,
    role text not null check (role in ('owner', 'manager', 'employee')),
    token text not null unique,
    status text not null default 'pending' check (status in ('pending', 'accepted', 'expired', 'revoked')),
    expires_at timestamptz not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Backfill an owner role for users already attached to an organization.
insert into user_roles (user_id, organization_id, role, is_default)
select p.id, p.organization_id, 'owner', true
from profiles p
where p.organization_id is not null
on conflict (user_id, organization_id) do nothing;

create index if not exists idx_user_roles_role on user_roles(role);
create index if not exists idx_invites_token on invites(token);
create index if not exists idx_invites_email on invites(email);
