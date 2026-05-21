# Module Status

Legend:
- ✅ **Fully implemented** — UI complete, wired to data layer, empty/loading/error states present.
- 🟡 **Partial** — UI built, but some flows are mocked, missing edit/create paths, or use placeholder data.
- ⚪ **Stub** — placeholder only, needs build-out.

---

## Manager / Owner Portal (`/manager/*`)

| # | Module | Route | File | Status | Notes |
|---|---|---|---|---|---|
| 1 | Dashboard | `/manager` | `src/pages/Dashboard.tsx` | ✅ | Hero KPIs and live employees via Supabase direct queries, refetches every 60s |
| 2 | Team (live) | `/manager/employees` | `src/pages/Team.tsx` | ✅ | Roster with status pills, invite drawer, role/site filter |
| 3 | History | `/manager/history` | `src/pages/Employees.tsx` | ✅ | Historical entries, filterable, bulk-approve |
| 4 | Sites & Geofencing | `/manager/sites` | `src/pages/Sites.tsx` | ✅ | Leaflet map, create/edit/delete site, radius slider, photo-required toggle |
| 5 | Projects | `/manager/projects` | `src/pages/Projects.tsx` | ✅ | Direct Supabase CRUD on `projects` table |
| 6 | Activity Types | `/manager/activities` | `src/pages/ActivityTypes.tsx` | ✅ | Direct Supabase CRUD on `activity_types` |
| 7 | Timesheets | `/manager/timesheets` | `src/pages/Timesheets.tsx` | ✅ | List, edit, approve, reject; manual-edit and geofence flags |
| 8 | Payroll Reports | `/manager/payroll` | `src/pages/Payroll.tsx` | ✅ | Date-range + employee picker, downloads PDF blob |
| 9 | Notifications | `/manager/notifications` | `src/pages/Notifications.tsx` | ✅ | Inbox, mark-read, run missing-logs check |
| 10 | Subscription | `/manager/subscription` | `src/pages/Subscription.tsx` | 🟡 | Plan card and usage bars wired; **upgrade CTA** still routes to placeholder — needs Stripe/Paddle |
| 11 | Settings | `/manager/settings` | `src/pages/Settings.tsx` | 🟡 | Profile + org settings persist; **2FA / SSO / API tokens panels** are UI-only |

## Super Admin Portal (`/admin/*`)

| # | Module | Route | File | Status | Notes |
|---|---|---|---|---|---|
| 12 | Platform Dashboard | `/admin` | `src/pages/admin/Dashboard.tsx` | 🟡 | KPIs live from Supabase counts; **trend charts** still use mocked weekly data |
| 13 | Organizations | `/admin/organizations` | `src/pages/admin/Organizations.tsx` | ✅ | List, plan toggle, suspend/reactivate; delete is wired UI but soft-deletes only |
| 14 | Global Users | `/admin/users` | `src/pages/admin/Users.tsx` | 🟡 | List with role + org chips; **suspend / impersonate** actions stubbed |
| 15 | Analytics | `/admin/analytics` | `src/pages/admin/Analytics.tsx` | ⚪ | Entire page uses static mock data — needs Supabase queries |
| 16 | Subscriptions | `/admin/subscriptions` | `src/pages/admin/Subscriptions.tsx` | 🟡 | MRR + plan mix from billing overview; **invoice list** mocked |
| 17 | Audit Logs | `/admin/audit-logs` | `src/pages/admin/AuditLogs.tsx` | ✅ | Pulls last 100 from `platform_audit_logs` |
| 18 | System Settings | `/admin/settings` | `src/pages/admin/Settings.tsx` | ✅ | Reads + writes `platform_settings` row |

## Public

| # | Module | Route | File | Status |
|---|---|---|---|---|
| 19 | Login | `/` | `src/pages/Login.tsx` | ✅ |
| 20 | Password Reset | `/reset-password` | `src/pages/ResetPassword.tsx` | ✅ |
| 21 | 404 | `*` | `src/pages/NotFound.tsx` | ✅ |

---

## Cross-cutting components

| Component | Purpose |
|---|---|
| `AppLayout` | Sticky blurred header + collapsible sidebar shell (used by manager **and** admin) |
| `AppSidebar` | Grouped nav, unread badge, conditional Super Admin section |
| `PageHeader` | Eyebrow chip + icon tile + title + description + actions slot |
| `StatCard` | KPI card with tone-based glow (`success` / `warning` / `destructive`) |
| `EmptyState` | Dashed-border placeholder with mesh background |
| `StatusPill` | Themed status badge (`approved`/`pending`/`late`/`absent`) |
| `ProtectedRoute` | Auth + manager/owner role gate |
| `SuperAdminRoute` | Super-admin gate, redirects to `/manager` otherwise |
| `ThemeProvider` + `ThemeToggle` | Light/dark via `class` strategy on `<html>` |

## Known gaps to close before production

1. **Subscription billing** — wire upgrade CTA to a payment provider (Stripe recommended, Paddle alternative).
2. **Admin Analytics** — replace mocked weekly data with real time-series endpoint.
3. **Admin trend charts on Dashboard** — same as above.
4. **Settings sub-panels** — implement 2FA enroll, SSO config, API token issuance.
5. **Admin Users actions** — suspend / impersonate need Supabase Edge functions or direct queries + audit log entry.
6. **i18n** — only EN strings exist; add at least ES + FR before international launch.
7. **Hard delete vs soft delete** — confirm org delete behavior with product.
