import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "owner" | "manager" | "employee";

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  role: Role;
  organizationId: string;
  organizationName?: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setToken: (token: string | null) => void;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: "worktivo.auth",
    },
  ),
);
