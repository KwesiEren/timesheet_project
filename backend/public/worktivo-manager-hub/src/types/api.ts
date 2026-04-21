export type EmployeeStatus = "approved" | "pending" | "late" | "absent" | "clocked_in" | "clocked_out";

export interface Site {
  id: string;
  org_id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
  photo_required?: boolean;
  created_at?: string;
}

export interface Employee {
  id: string;
  org_id: string;
  name: string;
  email?: string;
  role: string;
  status?: EmployeeStatus;
  current_site_id?: string | null;
  clocked_in_at?: string | null;
}

export interface TimeEntry {
  id: string;
  employee_id: string;
  employee_name?: string;
  site_id: string;
  site_name?: string;
  clock_in: string;
  clock_out?: string | null;
  hours?: number;
  status: EmployeeStatus;
  manual_edit?: boolean;
  geofence_violation?: boolean;
  original?: { clock_in?: string; clock_out?: string };
}

export interface Notification {
  id: string;
  type: "missing_log" | "geofence_violation" | "manual_edit" | "info";
  message: string;
  created_at: string;
  read: boolean;
  employee_id?: string;
  site_id?: string;
}

export interface DashboardKpis {
  clocked_in_now: number;
  late_today: number;
  pending_approvals: number;
  open_alerts: number;
}
