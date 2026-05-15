import { LayoutDashboard, Users, MapPinned, ClipboardList, FileBarChart, Bell, HardHat, ShieldCheck, History, Settings, CreditCard, BarChart3, Building2, FolderKanban } from "lucide-react";
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

const groups = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", url: "/manager", icon: LayoutDashboard }],
  },
  {
    label: "Workforce",
    items: [
      { title: "Team", url: "/manager/employees", icon: Users },
      { title: "Timesheets", url: "/manager/timesheets", icon: ClipboardList },
      { title: "Activity Types", url: "/manager/activities", icon: HardHat },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { title: "Projects", url: "/manager/projects", icon: FolderKanban },
      { title: "Sites & Geofences", url: "/manager/sites", icon: MapPinned },
    ],
  },
  {
    label: "Organization",
    items: [
      { title: "Payroll Reports", url: "/manager/payroll", icon: FileBarChart },
      { title: "Subscription", url: "/manager/subscription", icon: CreditCard },
      { title: "Settings", url: "/manager/settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    refetchInterval: 60_000,
  });
  const unread = notifications?.filter((n) => !n.read).length ?? 0;
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white p-1">
            <img
              src="/assets/icons/worktivo.png"
              alt="Worktivo logo"
              className="h-6 w-6 object-contain"
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-none text-sidebar-foreground">Worktivo</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Web Portal</span>
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
          {!collapsed && <SidebarGroupLabel>Alerts</SidebarGroupLabel>}
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
                      <span className="flex-1">Notifications</span>
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
            {!collapsed && <SidebarGroupLabel className="text-primary/70 font-bold">Platform Admin</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {[
                  { title: "Admin Console", url: "/admin", icon: ShieldCheck },
                  { title: "Organizations", url: "/admin/organizations", icon: Building2 },
                  { title: "Global Users", url: "/admin/users", icon: Users },
                  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
                  { title: "Subscriptions", url: "/admin/subscriptions", icon: CreditCard },
                  { title: "Audit Logs", url: "/admin/audit-logs", icon: History },
                  { title: "System Settings", url: "/admin/settings", icon: Settings },
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
