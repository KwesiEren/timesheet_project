import { useAuthStore } from "@/store/auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useSubscription() {
  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin);

  // 1. Fetch current counts
  const { data: usage, isLoading } = useQuery({
    queryKey: ["org-usage", user?.organizationId],
    queryFn: async () => {
      if (!user?.organizationId) return null;

      const [{ count: projectCount }, { count: employeeCount }] = await Promise.all([
        supabase.from("projects").select("*", { count: "exact", head: true }).eq("organization_id", user.organizationId),
        supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("organization_id", user.organizationId).eq("role", "employee")
      ]);

      return {
        projects: projectCount || 0,
        employees: employeeCount || 0
      };
    },
    enabled: !!user?.organizationId
  });

  const plan = user?.organizationPlan || "Free";
  const isPaid = plan === "Paid";
  
  // Hardcoded limits for now, but could be fetched from platform_settings
  const limits = {
    projects: isPaid ? Infinity : 2,
    employees: isPaid ? Infinity : 5
  };

  const isAtProjectLimit = (usage?.projects || 0) >= limits.projects;
  const isAtEmployeeLimit = (usage?.employees || 0) >= limits.employees;

  return {
    plan,
    isPaid,
    isSuperAdmin,
    usage,
    limits,
    isLoading,
    isAtProjectLimit,
    isAtEmployeeLimit,
    canCreateProject: isPaid || !isAtProjectLimit,
    canCreateEmployee: isPaid || !isAtEmployeeLimit
  };
}
