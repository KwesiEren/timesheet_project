import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  roles?: Array<"owner" | "manager">;
}

export function ProtectedRoute({ children, roles = ["owner", "manager"] }: Props) {
  const { token, user } = useAuthStore();
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!roles.includes(user.role as "owner" | "manager")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md rounded-lg border border-border bg-card p-8 text-center">
          <h1 className="mb-2 text-2xl font-semibold text-foreground">Access denied</h1>
          <p className="text-muted-foreground">
            The Worktivo Web Portal is for Owners and Managers only. Please use the mobile app to clock in and out.
          </p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
