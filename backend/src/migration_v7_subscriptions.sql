-- Migration V7: Subscription & Billing Enforcements
-- Target: Supabase SQL Editor

-- 1. Add plan and status to organizations
alter table organizations add column if not exists plan text not null default 'Free' check (plan in ('Free', 'Paid'));
alter table organizations add column if not exists status text not null default 'active' check (status in ('active', 'suspended'));

-- 2. Add subscription metadata to organizations for future flexibility
alter table organizations add column if not exists subscription_data jsonb default '{
    "max_projects": 2,
    "max_employees": 5,
    "billing_cycle": "monthly",
    "next_billing_date": null,
    "payment_method": null
}';

-- 3. Update existing platform_settings for global defaults
insert into platform_settings (key, value) values 
('subscription_tiers', '{
    "Free": {
        "max_projects": 2,
        "max_employees": 5,
        "price": 0
    },
    "Paid": {
        "max_projects": -1,
        "max_employees": -1,
        "price": 149
    }
}')
on conflict (key) do update set value = excluded.value;

-- 4. Create function to check project limits
create or replace function check_project_limit()
returns trigger as $$
declare
    org_plan text;
    project_count int;
    max_projects int;
begin
    -- Get org plan and limits
    select plan into org_plan from organizations where id = NEW.organization_id;
    
    -- If Paid, no limit
    if org_plan = 'Paid' then
        return NEW;
      end if;

    -- Get current count (excluding the one being added)
    select count(*) into project_count from sites where organization_id = NEW.organization_id;
    
    -- Get limit from platform_settings
    select (value->'Free'->>'max_projects')::int into max_projects from platform_settings where key = 'subscription_tiers';
    
    if project_count >= max_projects then
        raise exception 'You’ve reached your limit on the Free plan. Upgrade to add more.';
    end if;
    
    return NEW;
end;
$$ language plpgsql;

-- 5. Create function to check employee limits
create or replace function check_employee_limit()
returns trigger as $$
declare
    org_plan text;
    employee_count int;
    max_employees int;
begin
    -- Get org plan
    select plan into org_plan from organizations where id = NEW.organization_id;
    
    -- If Paid, no limit
    if org_plan = 'Paid' then
        return NEW;
    end if;

    -- Get current count of users with role 'employee'
    select count(*) into employee_count from users where organization_id = NEW.organization_id and role = 'employee';
    
    -- Get limit from platform_settings
    select (value->'Free'->>'max_employees')::int into max_employees from platform_settings where key = 'subscription_tiers';
    
    if employee_count >= max_employees then
        raise exception 'You’ve reached your limit on the Free plan. Upgrade to add more.';
    end if;
    
    return NEW;
end;
$$ language plpgsql;

-- 6. Attach triggers (Assuming 'sites' is the table for projects based on previous work)
drop trigger if exists trg_check_project_limit on sites;
create trigger trg_check_project_limit
before insert on sites
for each row execute function check_project_limit();

drop trigger if exists trg_check_employee_limit on users;
create trigger trg_check_employee_limit
before insert on users
for each row execute function check_employee_limit();
