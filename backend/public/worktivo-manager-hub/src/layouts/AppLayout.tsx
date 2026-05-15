import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { LogOut, Zap } from "lucide-react";
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
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AppLayout() {
  const { user, logout, isSuperAdmin } = useAuthStore();
  const { t } = useTranslation();
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
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card/80 px-3 backdrop-blur-md supports-[backdrop-filter]:bg-card/70 sm:px-4">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <SidebarTrigger className="text-foreground" />
              <div className="hidden items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground md:flex">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold">Org</span>
                  <span className="font-mono-data text-foreground">{user?.organizationId?.slice(0, 8) ?? "—"}</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider shadow-sm",
                    user?.organizationPlan === "Paid"
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-primary/20 bg-primary/5 text-primary",
                  )}
                >
                  {user?.organizationPlan === "Paid" ? <Zap size={10} className="fill-current" /> : null}
                  {user?.organizationPlan} {t("common.plan")}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2 hover:bg-muted/60">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground shadow-elegant">
                      {initials}
                    </div>
                    <div className="hidden text-left sm:block">
                      <div className="max-w-[160px] truncate text-sm font-semibold leading-none text-foreground">
                        {user?.name || user?.email || "Account"}
                      </div>
                      <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {user?.role}
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user?.organizationPlan === "Free" && (
                    <DropdownMenuItem onClick={() => navigate("/manager/subscription")}>
                      <Zap className="mr-2 h-4 w-4 fill-accent text-accent" /> {t("common.upgradeToPro")}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> {t("common.signOut")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {orgStatus?.status === "suspended" && !isSuperAdmin && (
            <div className="bg-destructive p-2 text-center text-xs font-bold text-destructive-foreground">
              ACCOUNT SUSPENDED. YOUR ACCESS IS RESTRICTED.
            </div>
          )}

          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-[1600px] animate-fade-in">
              <Suspense fallback={<div className="text-muted-foreground">{t("common.loading")}</div>}>
                <Outlet />
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
