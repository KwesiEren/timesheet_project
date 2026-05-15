import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/auth";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const { token, user } = useAuthStore.getState();
  if (token && config.headers) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  if (user?.organizationId && config.headers) {
    config.headers.set("X-Organization-Id", user.organizationId);
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== "undefined" && window.location.pathname !== "/app/") {
        window.location.href = "/app/";
      }
    }
    return Promise.reject(error);
  },
);

export const API_BASE_URL = baseURL;
