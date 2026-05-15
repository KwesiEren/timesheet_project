import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { LogOut, AlertTriangle, Zap, LogIn } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Suspense, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function AppLayout() {
  const { user, logout, isSuperAdmin } = useAuthStore();
  const qc = useQueryClient();
  const navigate = useNavigate();

  // Periodic check for org status (suspension/plan changes)
  const { data: orgStatus } = useQuery({
    queryKey: ["org-status", user?.organizationId],
    queryFn: async () => {
      if (!user?.organizationId) return null;
      const { data } = await supabase
        .from("organizations")
        .select("status, plan")
        .eq("id", user.organizationId)
        .single();
      return data;
    },
    enabled: !!user?.organizationId,
    refetchInterval: 300_000 // 5 minutes
  });

  useEffect(() => {
    if (orgStatus?.status === "suspended" && !isSuperAdmin) {
      logout();
      navigate("/", { state: { error: "Your account has been suspended." } });
    }
  }, [orgStatus, isSuperAdmin, logout, navigate]);

  const handleLogout = () => {
    logout();
    qc.clear();
    navigate("/", { replace: true });
  };

  const initials = (user?.name || user?.email || "U")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-foreground" />
              <div className="hidden items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground sm:flex">
                <div className="flex items-center gap-1.5">
                   <span className="font-semibold">Org</span>
                   <span className="font-mono-data text-foreground">{user?.organizationId?.slice(0, 8) ?? "—"}</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className={cn(
                  "flex items-center gap-1.5 rounded-full px-2 py-0.5 font-bold",
                  user?.organizationPlan === "Paid" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
                )}>
                  {user?.organizationPlan === "Paid" ? <Zap size={10} className="fill-current" /> : null}
                  {user?.organizationPlan} Plan
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {initials}
                  </div>
                  <div className="hidden text-left sm:block">
                    <div className="text-sm font-medium leading-none text-foreground">
                      {user?.name || user?.email || "Account"}
                    </div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {user?.role}
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user?.organizationPlan === "Free" && (
                   <DropdownMenuItem onClick={() => navigate("/admin/subscriptions")}>
                     <Zap className="mr-2 h-4 w-4 text-warning fill-warning" /> Upgrade to Pro
                   </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          {orgStatus?.status === "suspended" && !isSuperAdmin && (
             <div className="bg-destructive p-2 text-center text-xs font-bold text-destructive-foreground">
               ACCOUNT SUSPENDED. YOUR ACCESS IS RESTRICTED.
             </div>
          )}

          <main className="flex-1 overflow-auto p-6">
            <Suspense fallback={<div className="text-muted-foreground">Loading…</div>}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
