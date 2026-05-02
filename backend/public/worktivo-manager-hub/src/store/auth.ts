import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "owner" | "manager" | "employee";
export type Plan = "Free" | "Paid";
export type OrgStatus = "active" | "suspended";

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  role: Role;
  organizationId: string;
  organizationName?: string;
  organizationPlan: Plan;
  organizationStatus: OrgStatus;
  isSuperAdmin?: boolean;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isSuperAdmin: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: AuthUser | null) => void;
  setSuperAdmin: (isSuperAdmin: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isSuperAdmin: false,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user, isSuperAdmin: user?.isSuperAdmin || false }),
      setSuperAdmin: (isSuperAdmin) => set({ isSuperAdmin }),
      logout: () => set({ token: null, user: null, isSuperAdmin: false }),
    }),
    {
      name: "worktivo.auth",
    },
  ),
);
