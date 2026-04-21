import { api } from "@/lib/api";
import type {
  DashboardKpis,
  Employee,
  Notification,
  Site,
  TimeEntry,
} from "@/types/api";

// ---- Auth ----
export async function login(email: string, password: string): Promise<{ token: string }> {
  const { data } = await api.post("/auth/login", { email, password });
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
