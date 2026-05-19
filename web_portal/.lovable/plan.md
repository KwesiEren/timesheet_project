
# Worktivo Web Portal — Full MVP

A manager/owner-facing SPA that talks to the existing Worktivo Node API. Built inside this Lovable project (Vite + React + Tailwind + shadcn — no separate `web-portal/` dir needed; the existing scaffold replaces that step).

## Design system
- **Base:** Midnight Navy `#1A202C` background, white text, slate borders.
- **Action / Primary:** Safety Orange `#FF8C00` (used for primary buttons, key CTAs).
- **Status:** Emerald (approved/synced), Crimson (violation/error), Amber (pending/manual edit).
- **Type:** Inter for UI/headers, JetBrains Mono / Roboto Mono for numbers, timers, IDs, money.
- **Density:** Condensed tables with zebra striping, card "buckets" for grouped data, generous whitespace between groups.
- **Icons:** Lucide, solid/filled where available.
- All tokens defined as HSL CSS variables in `index.css` and mapped in `tailwind.config.ts` (no hard-coded colors in components).

## Architecture
- **API client:** Axios instance reading `VITE_API_URL` (env var, configurable later) with a Bearer-token request interceptor and a 401 response interceptor that logs out.
- **State:** Zustand store for `auth` (token, decoded `role` + `org_id` + user). TanStack Query for all server data (caching, background refresh).
- **Routing:** React Router with lazy-loaded pages. `<ProtectedRoute>` checks JWT presence + role (`owner` | `manager`); employees are blocked from the portal with a clear message.
- **Layout:** Persistent shadcn sidebar (collapsible to icon rail) + top bar with org name, user menu, logout. Sidebar groups: Overview, Workforce, Sites, Reports, Notifications.

## Pages & features

1. **Login** — email/password → `POST /auth/login`, store JWT, decode claims, redirect to Dashboard.
2. **Dashboard (Overview)**
   - KPI cards: clocked-in now, late today, pending approvals, open alerts.
   - Live employee table (status pills: Late / Approved / Pending / Absent).
   - **react-leaflet** map with OSM tiles showing site geofence circles (lat/lng + radius) and clocked-in counts per site.
3. **Employees**
   - Aggregated history table with filters (date range, site, status), zebra rows.
   - Bulk-select → **Approve** (`POST /employees/approve`).
   - Row action → **Set status** (`PATCH /employees/status/:id`) for Absent/etc.
   - Drawer with per-employee history detail.
4. **Sites & Geofencing**
   - List + map view of sites.
   - Create site dialog (name, lat/lng — pickable on map, radius slider, photo_required toggle).
   - Edit site (`PUT /sites/:id`).
5. **Timesheets**
   - Editable entries; manager edits trigger the backend Flagged Edit audit trail. UI surfaces an Amber "Manual Edit" badge and shows original vs new values from the audit data.
6. **Payroll Reports**
   - Pick employee(s) + period → call `GET /reports/payroll`, stream PDF into an in-app viewer (`<iframe>` blob URL) with download.
   - Bulk select multiple employees → sequential fetch + client-side ZIP download (JSZip).
7. **Notifications**
   - Inbox of alerts; "Run missing-logs check" button → `POST /notifications/missing-logs`.
   - Mark-as-read (`PUT /notifications/:id/read`), unread badge in sidebar.

## Production readiness
- Route-level `React.lazy` + Suspense fallbacks.
- Strict TS, ESLint exhaustive-deps rule on.
- `VITE_API_URL` configurable via env (no hard-coded URLs).
- Logout clears token + Query cache. 401 from any endpoint forces logout.

## Out of scope (v1)
- Org registration / invite acceptance flow (login only).
- GitHub Actions / Nginx deployment pipeline — the app deploys via Lovable's built-in Publish.
