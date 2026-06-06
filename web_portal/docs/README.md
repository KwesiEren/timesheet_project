# Worktivo Web Portal — Documentation

This directory contains the canonical documentation for the Worktivo Web Portal
(the React + Vite + Supabase application served at `/app/` in production).

| File | Audience | Purpose |
|---|---|---|
| [`modules.md`](./modules.md) | Engineering | Per-module status: fully implemented vs. partial, files, APIs, gaps |
| [`plan.md`](./plan.md) | Engineering / PM | Roadmap to production: phase plan, priorities, acceptance criteria |
| [`user-guide.md`](./user-guide.md) | Managers / Owners / Super Admins | How to use every screen of the portal |
| [`backend-integration.md`](./backend-integration.md) | Engineering | API contract, Supabase tables, auth flow, env config |
| [`auth-login-fix.md`](./auth-login-fix.md) | Engineering / Ops | Fix for "No organization assigned" login error (RLS + getMe) |

## Quick architectural map

```text
Routes
  /                     → Login (public)
  /reset-password       → Password reset (public)
  /manager/*            → Manager / Owner portal  (AppLayout + Sidebar)
  /admin/*              → Super Admin portal      (AppLayout + Sidebar)

Stack
  React 18 · Vite 5 · TypeScript · Tailwind v3 · shadcn/ui
  TanStack Query (data) · Zustand (auth) · react-i18next (i18n)
  Supabase JS (auth + direct DB reads) · Axios (REST backend)

Data sources
  Supabase  — auth, projects, activity_types, organizations, profiles,
              user_roles, platform_audit_logs, platform_settings
  Backend   — /auth/me, /dashboard/*, /employees/*, /sites, /timesheets,
              /reports/payroll, /notifications  (Express, base via VITE_API_URL)
```

See `backend-integration.md` for the full contract.
