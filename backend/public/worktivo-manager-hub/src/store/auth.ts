import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";

export type Role = "owner" | "manager" | "employee";

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  role: Role;
  org_id: string;
}

interface JwtClaims {
  sub?: string;
  user_id?: string;
  id?: string;
  email?: string;
  name?: string;
  role: Role;
  org_id: string;
  exp?: number;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setToken: (token: string) => void;
  logout: () => void;
}

function decode(token: string): AuthUser | null {
  try {
    const c = jwtDecode<JwtClaims>(token);
    if (c.exp && c.exp * 1000 < Date.now()) return null;
    return {
      id: c.sub || c.user_id || c.id || "",
      email: c.email,
      name: c.name,
      role: c.role,
      org_id: c.org_id,
    };
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token) => set({ token, user: decode(token) }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: "worktivo.auth",
      partialize: (s) => ({ token: s.token }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          const u = decode(state.token);
          if (!u) state.logout();
          else state.user = u;
        }
      },
    },
  ),
);
