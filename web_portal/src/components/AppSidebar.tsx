import { LayoutDashboard, Users, MapPinned, ClipboardList, FileBarChart, Bell, HardHat, ShieldCheck, History, Settings, CreditCard, BarChart3, Building2, FolderKanban } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink } from "@/components/NavLink";
import { useAuthStore } from "@/store/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "@/lib/services";
import logoUrl from "@/assets/worktivo-logo.png";

const buildGroups = (t: (k: string) => string) => [
  {
    label: t("nav.overview"),
    items: [{ title: t("nav.dashboard"), url: "/manager", icon: LayoutDashboard }],
  },
  {
    label: t("nav.workforce"),
    items: [
      { title: t("nav.team"), url: "/manager/employees", icon: Users },
      { title: t("nav.timesheets"), url: "/manager/timesheets", icon: ClipboardList },
      { title: t("nav.activityTypes"), url: "/manager/activities", icon: HardHat },
    ],
  },
  {
    label: t("nav.infrastructure"),
    items: [
      { title: t("nav.projects"), url: "/manager/projects", icon: FolderKanban },
      { title: t("nav.sites"), url: "/manager/sites", icon: MapPinned },
    ],
  },
  {
    label: t("nav.organization"),
    items: [
      { title: t("nav.payrollReports"), url: "/manager/payroll", icon: FileBarChart },
      { title: t("nav.subscription"), url: "/manager/subscription", icon: CreditCard },
      { title: t("nav.settings"), url: "/manager/settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const { t } = useTranslation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const groups = buildGroups(t);

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    refetchInterval: 60_000,
  });
  const unread = notifications?.filter((n) => !n.read).length ?? 0;
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background ring-1 ring-border p-1 shadow-elegant">
            <img
              src={logoUrl}
              alt="Worktivo logo"
              className="h-7 w-7 object-contain"
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold text-sidebar-foreground">Worktivo</span>
              <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/50">
                Web Portal
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            {!collapsed && <SidebarGroupLabel>{g.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/manager"}
                        className="hover:bg-sidebar-accent"
                        activeClassName="bg-sidebar-accent text-primary font-medium"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>{t("nav.alerts")}</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/manager/notifications"
                    className="hover:bg-sidebar-accent"
                    activeClassName="bg-sidebar-accent text-primary font-medium"
                  >
                    <Bell className="h-4 w-4 shrink-0" />
                    {!collapsed && (
                      <span className="flex-1">{t("nav.notifications")}</span>
                    )}
                    {unread > 0 && (
                      <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-destructive-foreground font-mono-data">
                        {unread}
                      </span>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isSuperAdmin && (
          <SidebarGroup>
            {!collapsed && <SidebarGroupLabel className="text-primary/70 font-bold">{t("nav.platformAdmin")}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {[
                  { title: t("nav.adminConsole"), url: "/admin", icon: ShieldCheck },
                  { title: t("nav.organizations"), url: "/admin/organizations", icon: Building2 },
                  { title: t("nav.globalUsers"), url: "/admin/users", icon: Users },
                  { title: t("nav.analytics"), url: "/admin/analytics", icon: BarChart3 },
                  { title: t("nav.subscriptions"), url: "/admin/subscriptions", icon: CreditCard },
                  { title: t("nav.auditLogs"), url: "/admin/audit-logs", icon: History },
                  { title: t("nav.systemSettings"), url: "/admin/settings", icon: Settings },
                ].map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="hover:bg-sidebar-accent"
                        activeClassName="bg-sidebar-accent text-primary font-medium"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
