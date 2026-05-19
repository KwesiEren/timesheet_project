-- Migration V5: Cleanup + push support

alter table profiles add column if not exists fcm_token text;

-- 2. Support for Payroll Export Tracking
alter table daily_logs add column if not exists payroll_exported boolean not null default false;

-- 3. Ensure indices exist for all foreign keys (Performance Cleanup)
create index if not exists idx_daily_logs_site_id on daily_logs(site_id);
create index if not exists idx_user_roles_org_id on user_roles(organization_id);
create index if not exists idx_invites_org_id on invites(organization_id);
create index if not exists idx_announcements_org_id on announcements(organization_id);

-- 4. Initial seed for missing roles if any (Safety check)
update user_roles
set role = lower(role)
where role <> lower(role);
