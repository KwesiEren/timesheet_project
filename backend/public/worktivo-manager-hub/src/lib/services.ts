import { api } from "@/lib/api";
import type {
  DashboardKpis,
  Employee,
  Notification,
  Site,
  TimeEntry,
} from "@/types/api";

import { supabase } from "./supabase";

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
  const { data } = await api.get("/auth/me");
  return data;
}

// ---- Dashboard ----
export async function getDashboardKpis(): Promise<DashboardKpis> {
  const { data } = await api.get("/dashboard/kpis");
  return data;
}
export async function getLiveEmployees(): Promise<Employee[]> {
  const { data } = await api.get("/dashboard/employees");
  return data;
}

// ---- Employees ----
export async function getEmployees(params?: {
  from?: string;
  to?: string;
  site_id?: string;
  status?: string;
}): Promise<TimeEntry[]> {
  const { data } = await api.get("/employees/history", { params });
  return data;
}
export async function approveEmployees(ids: string[]): Promise<void> {
  await api.post("/employees/approve", { ids });
}
export async function setEmployeeStatus(id: string, status: string): Promise<void> {
  await api.patch(`/employees/status/${id}`, { status });
}
export async function inviteEmployee(payload: { email: string; role: string }): Promise<void> {
  await api.post("/auth/invite", payload);
}

// ---- Sites ----
export async function getSites(): Promise<Site[]> {
  const { data } = await api.get("/sites");
  return data;
}
export async function createSite(payload: Omit<Site, "id" | "org_id" | "created_at">): Promise<Site> {
  const { data } = await api.post("/sites", payload);
  return data;
}
export async function updateSite(id: string, payload: Partial<Site>): Promise<Site> {
  const { data } = await api.put(`/sites/${id}`, payload);
  return data;
}
export async function deleteSite(id: string): Promise<void> {
  await api.delete(`/sites/${id}`);
}

// ---- Timesheets ----
export async function getTimesheets(params?: { from?: string; to?: string }): Promise<TimeEntry[]> {
  const { data } = await api.get("/timesheets", { params });
  return data;
}
export async function updateTimesheet(id: string, payload: Partial<TimeEntry>): Promise<TimeEntry> {
  const { data } = await api.patch(`/timesheets/${id}`, payload);
  return data;
}

// ---- Reports ----
export async function getPayrollPdf(params: {
  employee_id: string;
  from: string;
  to: string;
}): Promise<Blob> {
  const { data } = await api.get("/reports/payroll", {
    params,
    responseType: "blob",
  });
  return data as Blob;
}

// ---- Notifications ----
export async function getNotifications(): Promise<Notification[]> {
  const { data } = await api.get("/notifications");
  return data;
}
export async function markNotificationRead(id: string): Promise<void> {
  await api.put(`/notifications/${id}/read`);
}
export async function runMissingLogsCheck(): Promise<{ created: number }> {
  const { data } = await api.post("/notifications/missing-logs");
  return data;
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
  // In a real app, this might be a RPC or a set of parallel counts
  const { count: orgCount } = await supabase.from("organizations").select("*", { count: "exact", head: true });
  const { count: userCount } = await supabase.from("users").select("*", { count: "exact", head: true });
  const { count: tsCount } = await supabase.from("time_entries").select("*", { count: "exact", head: true });
  
  return {
    total_organizations: orgCount || 0,
    active_users: userCount || 0,
    total_timesheets: tsCount || 0,
    platform_growth: 12.5, // Mocked for now
  };
}

export async function getAdminOrganizations(): Promise<OrganizationRow[]> {
  const { data, error } = await supabase
    .from("organizations")
    .select(`
      id, 
      name, 
      plan, 
      status, 
      created_at,
      sites_count:sites(count),
      users_count:users(count)
    `)
    .order("created_at", { ascending: false });
    
  if (error) throw error;
  
  return data.map((org: any) => ({
    ...org,
    sites_count: org.sites_count?.[0]?.count || 0,
    users_count: org.users_count?.[0]?.count || 0,
  })) as any;
}

export async function updateOrganizationStatus(id: string, payload: { plan?: "Free" | "Paid"; status?: "active" | "suspended" }) {
  const { error } = await supabase
    .from("organizations")
    .update(payload)
    .eq("id", id);
  if (error) throw error;
}

export async function getAdminUsers(): Promise<GlobalUserRow[]> {
  // This is complex as it involves crossing organizations
  // For now, we fetch from the public.users table (which we assume exists or is linked)
  const { data, error } = await supabase
    .from("users")
    .select(`
      id,
      name,
      email,
      status,
      last_active,
      user_roles (
        role,
        organizations (name)
      )
    `);
    
  if (error) throw error;
  
  return data.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    status: u.status,
    last_active: u.last_active,
    organizations: u.user_roles?.map((r: any) => ({
      name: r.organizations?.name,
      role: r.role
    })) || []
  }));
}

export async function getPlatformAuditLogs(): Promise<PlatformAuditLogRow[]> {
  const { data, error } = await supabase
    .from("platform_audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
    
  if (error) throw error;
  return data;
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  const { data, error } = await supabase
    .from("platform_settings")
    .select("*")
    .single();
    
  if (error) throw error;
  return data;
}

export async function updatePlatformSettings(payload: Partial<PlatformSettings>): Promise<void> {
  const { error } = await supabase
    .from("platform_settings")
    .update(payload)
    .eq("id", (await getPlatformSettings()).id); // Assuming one row
    
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
