import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";

export const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin);
  
  if (!isSuperAdmin) {
    return <Navigate to="/manager" replace />;
  }

  return <>{children}</>;
};
