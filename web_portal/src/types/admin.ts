export interface PlatformKpis {
  total_organizations: number;
  active_users: number;
  total_timesheets: number;
  platform_growth: number;
}

export interface OrganizationRow {
  id: string;
  name: string;
  plan: "Free" | "Paid";
  status: "active" | "suspended";
  created_at: string;
  users_count?: number;
  sites_count?: number;
  timesheets_count?: number;
}

export interface GlobalUserRow {
  id: string;
  name: string;
  email: string;
  status: "active" | "suspended";
  last_active: string;
  organizations: Array<{
    name: string;
    role: string;
  }>;
}

export interface PlatformAuditLogRow {
  id: string;
  actor_email: string;
  organization_name: string;
  action: string;
  entity_type: string;
  details: any;
  created_at: string;
  severity: "info" | "warning" | "error";
}

export interface PlatformSettings {
  id: string;
  max_users_free: number;
  max_sites_free: number;
  geofencing_enabled: boolean;
  photo_verification_enabled: boolean;
  offline_mode_enabled: boolean;
  maintenance_mode: boolean;
}
