import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SuperAdminRoute } from "@/components/SuperAdminRoute";
import AppLayout from "@/layouts/AppLayout";
import NotFound from "./pages/NotFound.tsx";

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Team = lazy(() => import("./pages/Team"));
const Sites = lazy(() => import("./pages/Sites"));
const Timesheets = lazy(() => import("./pages/Timesheets"));
const EmployeesHistory = lazy(() => import("./pages/Employees")); // This is history
const Payroll = lazy(() => import("./pages/Payroll"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Projects = lazy(() => import("./pages/Projects"));
const ActivityTypes = lazy(() => import("./pages/ActivityTypes"));
const Settings = lazy(() => import("./pages/Settings"));
const Subscription = lazy(() => import("./pages/Subscription"));

// Admin
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminOrganizations = lazy(() => import("./pages/admin/Organizations"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminAnalytics = lazy(() => import("./pages/admin/Analytics"));
const AdminSubscriptions = lazy(() => import("./pages/admin/Subscriptions"));
const AdminAuditLogs = lazy(() => import("./pages/admin/AuditLogs"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

const Fallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">Loading…</div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<Fallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/employees" element={<Team />} />
              <Route path="/history" element={<EmployeesHistory />} />
              <Route path="/sites" element={<Sites />} />
              <Route path="/timesheets" element={<Timesheets />} />
              <Route path="/payroll" element={<Payroll />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/activities" element={<ActivityTypes />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/subscription" element={<Subscription />} />
              
              {/* Super Admin Routes */}
              <Route path="/admin" element={<SuperAdminRoute><AdminDashboard /></SuperAdminRoute>} />
              <Route path="/admin/organizations" element={<SuperAdminRoute><AdminOrganizations /></SuperAdminRoute>} />
              <Route path="/admin/users" element={<SuperAdminRoute><AdminUsers /></SuperAdminRoute>} />
              <Route path="/admin/analytics" element={<SuperAdminRoute><AdminAnalytics /></SuperAdminRoute>} />
              <Route path="/admin/subscriptions" element={<SuperAdminRoute><AdminSubscriptions /></SuperAdminRoute>} />
              <Route path="/admin/audit-logs" element={<SuperAdminRoute><AdminAuditLogs /></SuperAdminRoute>} />
              <Route path="/admin/settings" element={<SuperAdminRoute><AdminSettings /></SuperAdminRoute>} />
            </Route>
            <Route path="/index" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
