import type {
  ActivityType,
  DashboardKpis,
  Employee,
  Notification,
  Project,
  Site,
  TimeEntry,
} from "@/types/api";

import { supabase } from "./supabase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Utility to get current organization ID
async function getCurrentOrgId() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_roles(organization_id)')
    .eq('id', session.user.id)
    .single();
  return profile?.user_roles?.[0]?.organization_id;
}

// ---- Auth ----
export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function getMe() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) throw new Error("Not logged in");
  
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('*, user_roles(role, organizations(*))')
    .eq('id', session.user.id)
    .single();
    
  if (profileErr) throw profileErr;
  
  return {
    user: profile,
    role: profile.user_roles?.[0]?.role,
    organization: profile.user_roles?.[0]?.organizations
  };
}

// ---- Dashboard ----
export async function getDashboardKpis(): Promise<DashboardKpis> {
  const orgId = await getCurrentOrgId();
  if (!orgId) throw new Error("No organization found");
  
  const { count: employeeCount } = await supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('organization_id', orgId);
  const { count: timesheetCount } = await supabase.from('timesheet_entries').select('*', { count: 'exact', head: true }).eq('organization_id', orgId);
  const { count: projectCount } = await supabase.from('projects').select('*', { count: 'exact', head: true }).eq('org_id', orgId);

  return {
    total_organizations: 1,
    active_users: employeeCount || 0,
    total_timesheets: timesheetCount || 0,
    platform_growth: projectCount || 0,
  } as any;
}

export async function getLiveEmployees(): Promise<Employee[]> {
  const orgId = await getCurrentOrgId();
  const { data, error } = await supabase
    .from('profiles')
    .select('*, user_roles!inner(organization_id)')
    .eq('user_roles.organization_id', orgId)
    .limit(10);
  if (error) throw error;
  return data as any;
}

// ---- Employees ----
export async function getEmployees(params?: {
  from?: string;
  to?: string;
  site_id?: string;
  status?: string;
}): Promise<TimeEntry[]> {
  const orgId = await getCurrentOrgId();
  let query = supabase.from('daily_logs').select('*').eq('organization_id', orgId);
  if (params?.from) query = query.gte('date', params.from);
  if (params?.to) query = query.lte('date', params.to);
  if (params?.status) query = query.eq('status', params.status);
  
  const { data, error } = await query;
  if (error) throw error;
  return data as any;
}

export async function approveEmployees(ids: string[]): Promise<void> {
  const orgId = await getCurrentOrgId();
  for (const id of ids) {
    await supabase.from('daily_logs').update({ status: 'approved' }).eq('id', id).eq('organization_id', orgId);
  }
}

export async function setEmployeeStatus(id: string, status: string): Promise<void> {
  const orgId = await getCurrentOrgId();
  await supabase.from('daily_logs').update({ status }).eq('id', id).eq('organization_id', orgId);
}

export async function inviteEmployee(payload: { 
  email: string; 
  role: string;
  department?: string;
  primary_site_id?: string;
}): Promise<void> {
  const orgId = await getCurrentOrgId();
  const { error } = await supabase.from('invites').insert([{ ...payload, organization_id: orgId }]);
  if (error) throw error;
}

// ---- Sites ----
export async function getSites(): Promise<Site[]> {
  const orgId = await getCurrentOrgId();
  const { data, error } = await supabase.from('sites').select('*').eq('org_id', orgId).order('name');
  if (error) throw error;
  return data as any;
}

export async function createSite(payload: Omit<Site, "id" | "org_id" | "created_at">): Promise<Site> {
  const orgId = await getCurrentOrgId();
  const { data, error } = await supabase.from('sites').insert([{ ...payload, org_id: orgId }]).select().single();
  if (error) throw error;
  return data as any;
}

export async function updateSite(id: string, payload: Partial<Site>): Promise<Site> {
  const orgId = await getCurrentOrgId();
  const { data, error } = await supabase.from('sites').update(payload).eq('id', id).eq('org_id', orgId).select().single();
  if (error) throw error;
  return data as any;
}

export async function deleteSite(id: string): Promise<void> {
  const orgId = await getCurrentOrgId();
  const { error } = await supabase.from('sites').delete().eq('id', id).eq('org_id', orgId);
  if (error) throw error;
}

// ---- Projects ----
export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase.from("projects").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function createProject(payload: Partial<Project>): Promise<Project> {
  const { data, error } = await supabase.from("projects").insert([payload]).select().single();
  if (error) throw error;
  return data;
}

export async function updateProject(id: string, payload: Partial<Project>): Promise<Project> {
  const { data, error } = await supabase.from("projects").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

// ---- Activity Types ----
export async function getActivityTypes(): Promise<ActivityType[]> {
  const { data, error } = await supabase.from("activity_types").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function createActivityType(payload: Partial<ActivityType>): Promise<ActivityType> {
  const { data, error } = await supabase.from("activity_types").insert([payload]).select().single();
  if (error) throw error;
  return data;
}

export async function updateActivityType(id: string, payload: Partial<ActivityType>): Promise<ActivityType> {
  const { data, error } = await supabase.from("activity_types").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteActivityType(id: string): Promise<void> {
  const { error } = await supabase.from("activity_types").delete().eq("id", id);
  if (error) throw error;
}

// ---- Timesheets ----
export async function getTimesheets(params?: { from?: string; to?: string }): Promise<TimeEntry[]> {
  const orgId = await getCurrentOrgId();
  let query = supabase.from('timesheet_entries').select('*').eq('organization_id', orgId).order('start_time', { ascending: false });
  if (params?.from) query = query.gte('start_time', params.from);
  if (params?.to) query = query.lte('start_time', params.to);
  const { data, error } = await query;
  if (error) throw error;
  return data as any;
}

export async function updateTimesheet(id: string, payload: Partial<TimeEntry>): Promise<TimeEntry> {
  const orgId = await getCurrentOrgId();
  const { data, error } = await supabase.from('timesheet_entries').update(payload).eq('id', id).eq('organization_id', orgId).select().single();
  if (error) throw error;
  return data as any;
}

export async function approveTimesheet(id: string): Promise<void> {
  const orgId = await getCurrentOrgId();
  const { error } = await supabase.from('timesheet_entries').update({ is_completed: true }).eq('id', id).eq('organization_id', orgId);
  if (error) throw error;
}

export async function rejectTimesheet(id: string): Promise<void> {
  const orgId = await getCurrentOrgId();
  const { error } = await supabase.from('timesheet_entries').update({ is_flagged: true }).eq('id', id).eq('organization_id', orgId);
  if (error) throw error;
}

// ---- Reports (Client-Side PDF Generation) ----
export async function getPayrollPdf(params: {
  employee_id: string;
  from: string;
  to: string;
}): Promise<Blob> {
  const orgId = await getCurrentOrgId();
  
  // Fetch user details
  const { data: user } = await supabase.from('profiles').select('*').eq('id', params.employee_id).single();
  
  // Fetch activities for the period
  const { data: activities, error } = await supabase
    .from('timesheet_entries')
    .select('*')
    .eq('user_id', params.employee_id)
    .eq('organization_id', orgId)
    .gte('start_time', params.from)
    .lte('start_time', params.to)
    .order('start_time', { ascending: true });
    
  if (error) throw error;

  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Payroll Work Summary', 14, 22);
  
  doc.setFontSize(12);
  doc.text(`Employee: ${user?.name || 'Unknown'}`, 14, 32);
  doc.text(`Period: ${params.from} to ${params.to}`, 14, 40);

  const tableData = activities?.map((a: any) => [
    new Date(a.start_time).toLocaleDateString(),
    a.title || 'Work',
    new Date(a.start_time).toLocaleTimeString(),
    a.end_time ? new Date(a.end_time).toLocaleTimeString() : '-',
    a.total_duration_seconds ? (a.total_duration_seconds / 3600).toFixed(2) : '0'
  ]) || [];

  autoTable(doc, {
    startY: 50,
    head: [['Date', 'Activity', 'Start', 'End', 'Hours']],
    body: tableData,
  });

  return doc.output('blob');
}

// ---- Notifications ----
export async function getNotifications(): Promise<Notification[]> {
  const orgId = await getCurrentOrgId();
  const { data, error } = await supabase.from('notifications').select('*').eq('organization_id', orgId).order('created_at', { ascending: false });
  if (error) throw error;
  return data as any;
}

export async function markNotificationRead(id: string): Promise<void> {
  const orgId = await getCurrentOrgId();
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id).eq('organization_id', orgId);
  if (error) throw error;
}

export async function runMissingLogsCheck(): Promise<{ created: number }> {
  // In a pure Supabase setup, this would be an Edge Function or pg_cron job.
  // For now, we mock the result to avoid client-side heavy scans.
  return { created: 0 };
}

// ---- Super Admin ----
import type { 
  PlatformKpis, 
  OrganizationRow, 
  GlobalUserRow, 
  PlatformAuditLogRow, 
  PlatformSettings 
} from "@/types/admin";

export async function getPlatformKpis(): Promise<PlatformKpis> {
  const { count: orgCount } = await supabase.from("organizations").select("*", { count: "exact", head: true });
  const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
  const { count: tsCount } = await supabase.from("timesheet_entries").select("*", { count: "exact", head: true });
  
  return {
    total_organizations: orgCount || 0,
    active_users: userCount || 0,
    total_timesheets: tsCount || 0,
    platform_growth: 12.5,
  };
}

export async function getAdminOrganizations(): Promise<OrganizationRow[]> {
  const { data, error } = await supabase
    .from("organizations")
    .select(`id, name, plan, status, created_at, sites_count:sites(count), users_count:profiles(count)`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  
  return data.map((org: any) => ({
    ...org,
    sites_count: org.sites_count?.[0]?.count || 0,
    users_count: org.users_count?.[0]?.count || 0,
  })) as any;
}

export async function updateOrganizationStatus(id: string, payload: { plan?: "Free" | "Paid"; status?: "active" | "suspended" }) {
  const { error } = await supabase.from("organizations").update(payload).eq("id", id);
  if (error) throw error;
}

export async function getAdminUsers(): Promise<GlobalUserRow[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select(`id, name, email, created_at, user_roles ( role, organizations (name) )`);
  if (error) throw error;
  
  return data.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    status: "active",
    last_active: u.created_at,
    organizations: u.user_roles?.map((r: any) => ({
      name: r.organizations?.name,
      role: r.role
    })) || []
  }));
}

export async function getPlatformAuditLogs(): Promise<PlatformAuditLogRow[]> {
  const { data, error } = await supabase.from("platform_audit_logs").select("*").order("created_at", { ascending: false }).limit(100);
  if (error) throw error;
  return data;
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  const { data, error } = await supabase.from("platform_settings").select("*").single();
  if (error) throw error;
  return data;
}

export async function updatePlatformSettings(payload: Partial<PlatformSettings>): Promise<void> {
  const { error } = await supabase.from("platform_settings").update(payload).eq("id", (await getPlatformSettings()).id);
  if (error) throw error;
}

export async function getBillingOverview() {
  const { count: proCount } = await supabase.from("organizations").select("*", { count: "exact", head: true }).eq("plan", "Pro");
  const { count: pastDueCount } = await supabase.from("organizations").select("*", { count: "exact", head: true }).eq("status", "suspended");
  
  return {
    mrr: (Number(proCount) || 0) * 149,
    pro_orgs: Number(proCount) || 0,
    past_due: Number(pastDueCount) || 0
  };
}

// ---- Organization Settings ----
export async function getOrganizationSettings(id: string) {
  const { data, error } = await supabase.from("organizations").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function updateOrganizationSettings(id: string, payload: any) {
  const { error } = await supabase.from("organizations").update(payload).eq("id", id);
  if (error) throw error;
}
