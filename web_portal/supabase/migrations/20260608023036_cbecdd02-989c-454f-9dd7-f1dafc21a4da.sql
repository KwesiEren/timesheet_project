
-- SITES
DROP POLICY IF EXISTS "Members view sites" ON public.sites;
DROP POLICY IF EXISTS "Managers manage sites" ON public.sites;
CREATE POLICY "Members view sites" ON public.sites FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id) OR public.is_super_admin(auth.uid()));
CREATE POLICY "Managers manage sites" ON public.sites FOR ALL TO authenticated
  USING (public.is_org_manager(organization_id) OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_org_manager(organization_id) OR public.is_super_admin(auth.uid()));

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Members view notifications" ON public.notifications;
DROP POLICY IF EXISTS "Managers manage notifications" ON public.notifications;
CREATE POLICY "Members view notifications" ON public.notifications FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id) OR public.is_super_admin(auth.uid()));
CREATE POLICY "Managers manage notifications" ON public.notifications FOR ALL TO authenticated
  USING (public.is_org_manager(organization_id) OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_org_manager(organization_id) OR public.is_super_admin(auth.uid()));

-- INVITES
DROP POLICY IF EXISTS "Managers manage invites" ON public.invites;
CREATE POLICY "Managers manage invites" ON public.invites FOR ALL TO authenticated
  USING (public.is_org_manager(organization_id) OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_org_manager(organization_id) OR public.is_super_admin(auth.uid()));

-- TIMESHEET ENTRIES (members manage their own, managers manage org)
DROP POLICY IF EXISTS "Users view own timesheets" ON public.timesheet_entries;
DROP POLICY IF EXISTS "Users insert own timesheets" ON public.timesheet_entries;
DROP POLICY IF EXISTS "Managers view org timesheets" ON public.timesheet_entries;
DROP POLICY IF EXISTS "Managers manage org timesheets" ON public.timesheet_entries;
CREATE POLICY "Users view own timesheets" ON public.timesheet_entries FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_org_manager(organization_id) OR public.is_super_admin(auth.uid()));
CREATE POLICY "Users insert own timesheets" ON public.timesheet_entries FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_org_manager(organization_id));
CREATE POLICY "Managers manage org timesheets" ON public.timesheet_entries FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_org_manager(organization_id) OR public.is_super_admin(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.is_org_manager(organization_id) OR public.is_super_admin(auth.uid()));
CREATE POLICY "Managers delete org timesheets" ON public.timesheet_entries FOR DELETE TO authenticated
  USING (public.is_org_manager(organization_id) OR public.is_super_admin(auth.uid()));

-- DAILY LOGS (members view their own, managers full org)
DROP POLICY IF EXISTS "Members view daily logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Managers manage daily logs" ON public.daily_logs;
CREATE POLICY "Members view daily logs" ON public.daily_logs FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_org_manager(organization_id) OR public.is_super_admin(auth.uid()));
CREATE POLICY "Managers manage daily logs" ON public.daily_logs FOR ALL TO authenticated
  USING (public.is_org_manager(organization_id) OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_org_manager(organization_id) OR public.is_super_admin(auth.uid()));

-- PROJECTS DELETE (was missing)
DROP POLICY IF EXISTS "Managers delete projects" ON public.projects;
CREATE POLICY "Managers delete projects" ON public.projects FOR DELETE TO authenticated
  USING (public.is_org_manager(organization_id) OR public.is_super_admin(auth.uid()));

-- Ensure grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sites TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invites TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.timesheet_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_types TO authenticated;
GRANT ALL ON public.sites, public.notifications, public.invites, public.timesheet_entries, public.daily_logs, public.projects, public.activity_types TO service_role;
