-- Migration V10: Fix RLS infinite recursion between profiles ↔ user_roles
--
-- Problem: "Managers can view all profiles in their org" queries user_roles,
-- while "Org managers can view member roles" (v9) queries profiles → loop.
--
-- Fix: SECURITY DEFINER helpers that read membership without re-entering RLS.

-- ---- helpers (bypass RLS safely; only expose membership checks) ----

create or replace function public.get_my_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_org_manager(_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and organization_id = _org_id
      and role in ('owner', 'manager')
  );
$$;

create or replace function public.is_org_member(_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and organization_id = _org_id
  )
  or exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and organization_id = _org_id
  );
$$;

revoke all on function public.get_my_organization_id() from public;
revoke all on function public.is_org_manager(uuid) from public;
revoke all on function public.is_org_member(uuid) from public;
grant execute on function public.get_my_organization_id() to authenticated;
grant execute on function public.is_org_manager(uuid) to authenticated;
grant execute on function public.is_org_member(uuid) to authenticated;

-- ---- profiles ----

drop policy if exists "Managers can view all profiles in their org" on profiles;
create policy "Managers can view all profiles in their org"
on profiles for select
using (
  profiles.organization_id is not null
  and public.is_org_manager(profiles.organization_id)
);

-- ---- user_roles (replace v9 policy that subqueried profiles) ----

drop policy if exists "Org managers can view member roles" on user_roles;
create policy "Org managers can view member roles"
on user_roles for select
using (
  public.is_org_manager(user_roles.organization_id)
);

-- ---- organizations (replace v9 policy that subqueried profiles + user_roles) ----

drop policy if exists "Members can view their organization" on organizations;
create policy "Members can view their organization"
on organizations for select
using (
  public.is_org_member(organizations.id)
);

-- Keep v9 policy — no recursion (user_id = auth.uid() only):
-- "Users can view own roles" on user_roles
