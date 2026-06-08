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
    .from("profiles")
    .select("organization_id")
    .eq("id", session.user.id)
    .maybeSingle();

  if (profile?.organization_id) return profile.organization_id;

  const { data: roles } = await supabase
    .from("user_roles")
    .select("organization_id, is_default")
    .eq("user_id", session.user.id);

  const preferred =
    roles?.find((r) => r.is_default) ??
    roles?.[0];

  return preferred?.organization_id ?? null;
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

  const userId = session.user.id;

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("id, name, email, organization_id")
    .eq("id", userId)
    .single();

  if (profileErr) throw profileErr;

  const { data: roles } = await supabase
    .from("user_roles")
    .select("role, organization_id, is_default, organizations(id, name, plan, status)")
    .eq("user_id", userId);

  const membership =
    (roles ?? []).find((r) => r.organization_id === profile.organization_id) ??
    (roles ?? []).find((r) => r.is_default) ??
    roles?.[0];

  const organizationId =
    membership?.organization_id ?? profile.organization_id ?? "";

  let org = membership?.organizations as
    | { id?: string; name?: string; plan?: string; status?: string }
    | null
    | undefined;

  if (organizationId && (!org || !org.name)) {
    const { data: orgRow } = await supabase
      .from("organizations")
      .select("id, name, plan, status")
      .eq("id", organizationId)
      .maybeSingle();
    org = orgRow ?? org;
  }

  return {
    id: profile.id as string,
    email: profile.email as string | undefined,
    name: (profile.name as string) ?? profile.email ?? "User",
    role: (membership?.role?.toLowerCase() ?? "employee") as "owner" | "manager" | "employee",
    organizationId,
    organizationName: org?.name as string | undefined,
    organizationPlan: (org?.plan ?? "Free") as "Free" | "Paid",
    organizationStatus: (org?.status ?? "active") as "active" | "suspended",
  };
}

// ---- Dashboard ----
export async function getDashboardKpis(): Promise<DashboardKpis> {
  const orgId = await getCurrentOrgId();
  if (!orgId) throw new Error("No organization found");

  const today = new Date().toISOString().slice(0, 10);

  const [
    { count: clockedIn },
    { count: lateToday },
    { count: pendingTimesheets },
    { count: pendingLogs },
    { count: openAlerts },
  ] = await Promise.all([
    supabase
      .from("timesheet_entries")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("is_completed", false)
      .is("end_time", null),
    supabase
      .from("daily_logs")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("date", today)
      .eq("status", "late"),
    supabase
      .from("timesheet_entries")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("status", "pending"),
    supabase
      .from("daily_logs")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("status", "pending"),
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("is_read", false),
  ]);

  return {
    clocked_in_now: clockedIn || 0,
    late_today: lateToday || 0,
    pending_approvals: (pendingTimesheets || 0) + (pendingLogs || 0),
    open_alerts: openAlerts || 0,
  };
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
  let query = supabase
    .from('daily_logs')
    .select('*, profiles(id, name, email), sites(id, name)')
    .eq('organization_id', orgId);
  if (params?.from) query = query.gte('date', params.from);
  if (params?.to) query = query.lte('date', params.to);
  if (params?.site_id) query = query.eq('site_id', params.site_id);
  if (params?.status) query = query.eq('status', params.status);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    ...r,
    employee_id: r.user_id ?? r.profiles?.id,
    employee_name: r.profiles?.name ?? r.profiles?.email ?? "Unknown",
    site_name: r.sites?.name ?? "—",
  })) as any;
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
  const { data: { user } } = await supabase.auth.getUser();
  const token = (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const expires_at = new Date(Date.now() + 7 * 86400000).toISOString();
  const { error } = await supabase.from('invites').insert([{
    organization_id: orgId,
    inviter_id: user?.id ?? null,
    email: payload.email,
    role: payload.role,
    token,
    expires_at,
    status: 'pending',
  }]);
  if (error) throw error;
}

export async function removeEmployee(userId: string): Promise<void> {
  const orgId = await getCurrentOrgId();
  const { error } = await supabase.from('user_roles').delete().eq('user_id', userId).eq('organization_id', orgId);
  if (error) throw error;
}

export async function getOrgMembers() {
  const orgId = await getCurrentOrgId();
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      name,
      email,
      department,
      primary_site_id,
      user_roles!inner (
        role,
        organization_id
      )
    `)
    .eq("user_roles.organization_id", orgId);
  
  if (error) throw error;
  return data.map(m => ({
    ...m,
    role: (m.user_roles as any)[0]?.role
  }));
}

// ---- Sites ----
// DB columns: latitude, longitude, radius_meters, project_uuid (uuid FK)
// Frontend Site type: lat, lng, radius, project_id
function mapSiteRow(r: any): Site {
  return {
    id: r.id,
    organization_id: r.organization_id,
    project_id: r.project_uuid ?? r.project_id ?? undefined,
    name: r.name,
    lat: Number(r.latitude),
    lng: Number(r.longitude),
    radius: Number(r.radius_meters ?? 100),
    photo_required: !!r.photo_required,
    created_at: r.created_at,
  };
}

function mapSitePayload(p: Partial<Site> & { lat?: number; lng?: number; radius?: number }) {
  const out: any = {};
  if (p.name !== undefined) out.name = p.name;
  if (p.lat !== undefined) out.latitude = p.lat;
  if (p.lng !== undefined) out.longitude = p.lng;
  if (p.radius !== undefined) out.radius_meters = p.radius;
  if (p.photo_required !== undefined) out.photo_required = p.photo_required;
  if (p.project_id !== undefined) out.project_uuid = p.project_id || null;
  return out;
}

export async function getSites(): Promise<Site[]> {
  const orgId = await getCurrentOrgId();
  const { data, error } = await supabase.from('sites').select('*').eq('organization_id', orgId).order('name');
  if (error) throw error;
  return (data ?? []).map(mapSiteRow);
}

export async function createSite(payload: Omit<Site, "id" | "organization_id" | "created_at">): Promise<Site> {
  const orgId = await getCurrentOrgId();
  const row = {
    id: crypto.randomUUID(),
    organization_id: orgId,
    is_active: true,
    ...mapSitePayload(payload as any),
  };
  const { data, error } = await supabase.from('sites').insert([row]).select().single();
  if (error) throw error;
  return mapSiteRow(data);
}

export async function updateSite(id: string, payload: Partial<Site>): Promise<Site> {
  const orgId = await getCurrentOrgId();
  const { data, error } = await supabase
    .from('sites')
    .update(mapSitePayload(payload as any))
    .eq('id', id)
    .eq('organization_id', orgId)
    .select()
    .single();
  if (error) throw error;
  return mapSiteRow(data);
}

export async function deleteSite(id: string): Promise<void> {
  const orgId = await getCurrentOrgId();
  const { error } = await supabase.from('sites').delete().eq('id', id).eq('organization_id', orgId);
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
// DB: timesheet_entries(start_time, end_time, is_completed, is_flagged, user_id, project_id)
// Frontend TimeEntry: clock_in, clock_out, status, employee_id, site_id
function mapTimeEntry(r: any): TimeEntry {
  const status: any = r.is_flagged ? "pending" : r.is_completed ? "approved" : "pending";
  return {
    id: r.id,
    employee_id: r.user_id,
    employee_name: r.profiles?.name ?? r.profiles?.email ?? "—",
    site_id: r.project_id ?? "",
    site_name: r.title ?? "—",
    clock_in: r.start_time,
    clock_out: r.end_time,
    hours: r.total_duration_seconds ? Math.round((r.total_duration_seconds / 3600) * 100) / 100 : undefined,
    status,
    manual_edit: !!r.last_edited_by,
  };
}

function mapTimeEntryPayload(p: Partial<TimeEntry> & { clock_in?: string; clock_out?: string }) {
  const out: any = {};
  if (p.clock_in !== undefined) out.start_time = p.clock_in;
  if (p.clock_out !== undefined) out.end_time = p.clock_out;
  if (p.clock_in && p.clock_out) {
    const total = Math.max(0, Math.floor((new Date(p.clock_out).getTime() - new Date(p.clock_in).getTime()) / 1000));
    out.total_duration_seconds = total;
  }
  return out;
}

export async function getTimesheets(params?: { from?: string; to?: string }): Promise<TimeEntry[]> {
  const orgId = await getCurrentOrgId();
  let query = supabase
    .from('timesheet_entries')
    .select('*, profiles(id, name, email)')
    .eq('organization_id', orgId)
    .order('start_time', { ascending: false });
  if (params?.from) query = query.gte('start_time', params.from);
  if (params?.to) query = query.lte('start_time', params.to);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapTimeEntry);
}

export async function updateTimesheet(id: string, payload: Partial<TimeEntry> & { clock_in?: string; clock_out?: string }): Promise<TimeEntry> {
  const orgId = await getCurrentOrgId();
  const { data, error } = await supabase
    .from('timesheet_entries')
    .update(mapTimeEntryPayload(payload))
    .eq('id', id)
    .eq('organization_id', orgId)
    .select('*, profiles(id, name, email)')
    .single();
  if (error) throw error;
  return mapTimeEntry(data);
}

export async function approveTimesheet(id: string): Promise<void> {
  const orgId = await getCurrentOrgId();
  const { error } = await supabase.from('timesheet_entries').update({ is_completed: true, is_flagged: false }).eq('id', id).eq('organization_id', orgId);
  if (error) throw error;
}

export async function rejectTimesheet(id: string): Promise<void> {
  const orgId = await getCurrentOrgId();
  const { error } = await supabase.from('timesheet_entries').update({ is_flagged: true }).eq('id', id).eq('organization_id', orgId);
  if (error) throw error;
}

export async function createTimesheet(payload: { user_id: string; site_id?: string; project_id?: string; start_time: string; end_time: string; title?: string; details?: string; notes?: string }): Promise<void> {
  const orgId = await getCurrentOrgId();
  const start = new Date(payload.start_time).getTime();
  const end = new Date(payload.end_time).getTime();
  const total = Math.max(0, Math.floor((end - start) / 1000));
  const { error } = await supabase.from('timesheet_entries').insert([{
    id: crypto.randomUUID(),
    user_id: payload.user_id,
    organization_id: orgId,
    project_id: payload.project_id ?? null,
    title: payload.title ?? 'Manual entry',
    details: payload.details ?? null,
    notes: payload.notes ?? null,
    start_time: payload.start_time,
    end_time: payload.end_time,
    total_duration_seconds: total,
    is_completed: true,
  }]);
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
// DB columns: id (text, no default), user_id, organization_id, title, message, is_read, created_at
// Frontend Notification.type is derived from title prefix tag (e.g. "[missing_log] ...").
function parseNotificationType(title: string): Notification["type"] {
  const m = /^\[(missing_log|geofence_violation|manual_edit|info)\]/.exec(title || "");
  return (m?.[1] as Notification["type"]) || "info";
}

export async function getNotifications(): Promise<Notification[]> {
  const orgId = await getCurrentOrgId();
  const { data, error } = await supabase.from('notifications').select('*').eq('organization_id', orgId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.id,
    type: parseNotificationType(row.title),
    message: row.message,
    created_at: row.created_at,
    read: Boolean(row.is_read),
    employee_id: row.user_id ?? undefined,
  }));
}

export async function markNotificationRead(id: string): Promise<void> {
  const orgId = await getCurrentOrgId();
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id).eq('organization_id', orgId);
  if (error) throw error;
}

export async function runMissingLogsCheck(): Promise<{ created: number; scanned: number; days: number }> {
  const orgId = await getCurrentOrgId();
  if (!orgId) return { created: 0, scanned: 0, days: 0 };

  const { data: members } = await supabase
    .from('user_roles')
    .select('user_id, profiles(name, email)')
    .eq('organization_id', orgId);

  const userIds = (members ?? []).map((m: any) => m.user_id).filter(Boolean);
  if (userIds.length === 0) return { created: 0, scanned: 0, days: 0 };

  const days: string[] = [];
  const d = new Date();
  while (days.length < 7) {
    d.setDate(d.getDate() - 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) days.push(d.toISOString().slice(0, 10));
  }
  const from = days[days.length - 1];
  const to = days[0];

  const { data: logs } = await supabase
    .from('daily_logs')
    .select('user_id, date')
    .eq('organization_id', orgId)
    .gte('date', from)
    .lte('date', to)
    .in('user_id', userIds);

  const present = new Set((logs ?? []).map((l: any) => `${l.user_id}|${l.date}`));

  // Dedupe against existing missing_log notifications in last 7 days
  const { data: existing } = await supabase
    .from('notifications')
    .select('message,title')
    .eq('organization_id', orgId)
    .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString());
  const existingSet = new Set(
    (existing ?? [])
      .filter((n: any) => (n.title || '').startsWith('[missing_log]'))
      .map((n: any) => n.message)
  );

  const inserts: any[] = [];
  for (const m of members ?? []) {
    const uid = (m as any).user_id;
    const name = (m as any).profiles?.name ?? (m as any).profiles?.email ?? 'Employee';
    for (const day of days) {
      if (present.has(`${uid}|${day}`)) continue;
      const message = `${name} missed log on ${day}`;
      if (existingSet.has(message)) continue;
      inserts.push({
        id: crypto.randomUUID(),
        organization_id: orgId,
        user_id: uid,
        title: '[missing_log] Missing daily log',
        message,
        is_read: false,
      });
    }
  }

  if (inserts.length > 0) {
    const { error } = await supabase.from('notifications').insert(inserts);
    if (error) throw error;
  }

  return { created: inserts.length, scanned: userIds.length, days: days.length };
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
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    { count: orgCount },
    { count: userCount },
    { count: tsCount },
    { count: projectCount },
    { count: thisMonthOrgs },
    { count: lastMonthOrgs },
  ] = await Promise.all([
    supabase.from("organizations").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("timesheet_entries").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase
      .from("organizations")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thisMonthStart.toISOString()),
    supabase
      .from("organizations")
      .select("*", { count: "exact", head: true })
      .gte("created_at", lastMonthStart.toISOString())
      .lt("created_at", thisMonthStart.toISOString()),
  ]);

  const growth =
    lastMonthOrgs && lastMonthOrgs > 0
      ? (((thisMonthOrgs ?? 0) - lastMonthOrgs) / lastMonthOrgs) * 100
      : (thisMonthOrgs ?? 0) > 0
        ? 100
        : 0;

  return {
    total_organizations: orgCount || 0,
    active_users: userCount || 0,
    total_timesheets: tsCount || 0,
    total_projects: projectCount || 0,
    platform_growth: Math.round(growth * 10) / 10,
  };
}

export async function getAdminOrganizations(): Promise<OrganizationRow[]> {
  const { data, error } = await supabase
    .from("organizations")
    .select(`id, name, plan, status, created_at, sites_count:sites(count), users_count:profiles!profiles_organization_id_fkey(count)`)
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

export async function deleteOrganization(id: string) {
  const { error } = await supabase.from("organizations").delete().eq("id", id);
  if (error) throw error;
}

export async function getAdminUsers(): Promise<GlobalUserRow[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select(`id, name, email, created_at, suspended, user_roles ( role, organizations (name) )`);
  if (error) throw error;

  return (data as any[]).map((u) => ({
    id: u.id,
    name: u.name ?? u.email ?? "Unknown",
    email: u.email,
    status: u.suspended ? "suspended" : "active",
    last_active: u.created_at,
    organizations:
      u.user_roles?.map((r: any) => ({
        name: r.organizations?.name,
        role: r.role,
      })) || [],
  }));
}

export async function setUserSuspended(userId: string, suspended: boolean) {
  const { error } = await supabase.from("profiles").update({ suspended }).eq("id", userId);
  if (error) throw error;
}

export async function createAdminOrganization(payload: { name: string; plan: "Free" | "Paid" }) {
  const { data, error } = await supabase.from("organizations").insert([payload]).select().single();
  if (error) throw error;
  return data;
}

export async function createAdminUser(payload: { name: string; email: string; password?: string }) {
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password || 'Temporary123!',
    options: {
      data: { name: payload.name }
    }
  });
  if (error) throw error;
  return data;
}

export async function updateAdminUser(id: string, payload: { name?: string; email?: string }) {
  const { data, error } = await supabase.from("profiles").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteAdminUser(id: string) {
  const { error } = await supabase.from("profiles").delete().eq("id", id);
  if (error) throw error;
}

export async function getPlatformAuditLogs(): Promise<PlatformAuditLogRow[]> {
  const { data, error } = await supabase.from("platform_audit_logs").select("*").order("created_at", { ascending: false }).limit(500);
  if (error) throw error;
  return data as any;
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  const { data, error } = await supabase.from("platform_settings").select("*").single();
  if (error) throw error;
  return data;
}

export async function updatePlatformSettings(payload: Partial<PlatformSettings>): Promise<void> {
  const current = await getPlatformSettings();
  const { error } = await supabase.from("platform_settings").update(payload).eq("id", current.id);
  if (error) throw error;
}

export async function getBillingOverview() {
  const { count: proCount } = await supabase.from("organizations").select("*", { count: "exact", head: true }).eq("plan", "Paid");
  const { count: pastDueCount } = await supabase.from("organizations").select("*", { count: "exact", head: true }).eq("status", "suspended");

  return {
    mrr: (Number(proCount) || 0) * 149,
    pro_orgs: Number(proCount) || 0,
    past_due: Number(pastDueCount) || 0,
  };
}

// ---- Admin Analytics (live aggregations) ----
export interface PlatformGrowthPoint { date: string; orgs: number; users: number }
export interface PlatformActivityPoint { name: string; entries: number; active: number }

export async function getPlatformGrowth(): Promise<PlatformGrowthPoint[]> {
  const since = new Date();
  since.setMonth(since.getMonth() - 5);
  since.setDate(1);

  const [{ data: orgs }, { data: users }] = await Promise.all([
    supabase.from("organizations").select("created_at").gte("created_at", since.toISOString()),
    supabase.from("profiles").select("created_at").gte("created_at", since.toISOString()),
  ]);

  const months: Record<string, { orgs: number; users: number }> = {};
  for (let i = 0; i < 6; i++) {
    const d = new Date(since);
    d.setMonth(since.getMonth() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months[key] = { orgs: 0, users: 0 };
  }
  (orgs ?? []).forEach((r: any) => {
    const d = new Date(r.created_at);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (months[k]) months[k].orgs += 1;
  });
  (users ?? []).forEach((r: any) => {
    const d = new Date(r.created_at);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (months[k]) months[k].users += 1;
  });

  // Convert to cumulative running totals
  let cumOrgs = 0;
  let cumUsers = 0;
  return Object.entries(months).map(([date, v]) => {
    cumOrgs += v.orgs;
    cumUsers += v.users;
    return { date, orgs: cumOrgs, users: cumUsers };
  });
}

export async function getPlatformPlanMix() {
  const [{ count: freeCount }, { count: paidCount }] = await Promise.all([
    supabase.from("organizations").select("*", { count: "exact", head: true }).eq("plan", "Free"),
    supabase.from("organizations").select("*", { count: "exact", head: true }).eq("plan", "Paid"),
  ]);
  return [
    { name: "Free", value: Number(freeCount) || 0 },
    { name: "Paid", value: Number(paidCount) || 0 },
  ];
}

export async function getPlatformWeeklyActivity(): Promise<PlatformActivityPoint[]> {
  const start = new Date();
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  const { data: entries } = await supabase
    .from("timesheet_entries")
    .select("start_time, user_id")
    .gte("start_time", start.toISOString());

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const buckets: Record<string, { entries: number; users: Set<string> }> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    buckets[days[d.getDay()]] = { entries: 0, users: new Set() };
  }
  (entries ?? []).forEach((r: any) => {
    const k = days[new Date(r.start_time).getDay()];
    if (!buckets[k]) return;
    buckets[k].entries += 1;
    if (r.user_id) buckets[k].users.add(r.user_id);
  });
  return Object.entries(buckets).map(([name, v]) => ({ name, entries: v.entries, active: v.users.size }));
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
