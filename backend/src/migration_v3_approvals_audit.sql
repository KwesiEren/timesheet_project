-- Phase 2: Core Timesheet Enhancements Migration
-- Target: Supabase SQL Editor

-- 1. Update daily_logs table
alter table daily_logs add column if not exists status text not null default 'pending';
alter table daily_logs add column if not exists approved_by text references users(id) on delete set null;
alter table daily_logs add column if not exists approved_at timestamptz;
alter table daily_logs add column if not exists meta jsonb default '{}';

-- 2. Update timesheet_entries table
alter table timesheet_entries add column if not exists is_flagged boolean not null default false;
alter table timesheet_entries add column if not exists original_data jsonb;
alter table timesheet_entries add column if not exists last_edited_by text references users(id) on delete set null;

-- 3. Add constraint to allow status values
-- Using a check constraint for simple enum logic
alter table daily_logs drop constraint if exists daily_logs_status_check;
alter table daily_logs add constraint daily_logs_status_check 
check (status in ('pending', 'present', 'late', 'absent', 'approved'));

-- 4. Create indices for faster approval retrieval
create index if not exists idx_daily_logs_status on daily_logs(status);
create index if not exists idx_timesheet_is_flagged on timesheet_entries(is_flagged);
