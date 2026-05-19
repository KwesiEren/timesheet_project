# Worktivo Web Portal — User Guide

This guide explains every screen in the web portal. The portal has two
audiences:

- **Managers / Owners** of an organization — `/manager/*`
- **Super Admins** of the Worktivo platform — `/admin/*`

Field employees use the **mobile app**, not this portal.

---

## Getting in

1. Open the portal and sign in with your Worktivo email + password.
2. If you're an Owner or Manager, you'll land on the **Manager Dashboard**.
3. If you're a Super Admin, you'll land on the **Platform Overview**.
4. Forgot your password? Use **"Forgot password?"** on the login screen — you'll
   get a reset email and be returned to `/reset-password`.

The header (top right) lets you switch **light / dark mode** and sign out.

---

## Manager / Owner portal

### Dashboard (`/manager`)
Live snapshot of your workforce. Shows: clocked-in now, late today, pending
approvals, open alerts, and a real-time list of who's on the clock and where.
Refreshes every 60 seconds.

### Team (`/manager/employees`)
Your active roster. Filter by site or role. Click **Invite** to send an
invitation email (assign a role and primary site). Status pills show whether
someone is clocked in, late, absent, or approved.

### History (`/manager/history`)
Past timesheet entries across the org. Filter by date range, site, status. Use
**bulk approve** to clear a batch of pending entries.

### Sites (`/manager/sites`)
Geofenced locations on a map. **Create site** lets you drop a pin, set a
radius, and require a photo at clock-in. Edit or delete by clicking the row.

### Projects (`/manager/projects`)
Project list — used to group sites and time entries. Add, rename, archive.

### Activity Types (`/manager/activities`)
The vocabulary your team uses to tag time (e.g. "Framing", "Inspection").
Toggle active/inactive without losing history.

### Timesheets (`/manager/timesheets`)
Review every entry. Edit clock-in/out times (the original is preserved and
the entry is flagged as a manual edit). **Approve** or **Reject**. Geofence
violations are highlighted.

### Payroll Reports (`/manager/payroll`)
Pick an employee + date range and **Download PDF** for payroll.

### Notifications (`/manager/notifications`)
Inbox of operational alerts: missing logs, geofence violations, manual edits.
Click **Run missing-logs check** to scan immediately. **Mark read** clears the
badge in the sidebar.

### Subscription (`/manager/subscription`)
Your plan, usage bars, and benefits. Upgrade from Free to Paid.

### Settings (`/manager/settings`)
- **Profile** — name, email, avatar
- **Organization** — name, timezone, currency, week-start
- **Security** — change password (2FA / SSO coming)

---

## Super Admin portal

Visible only to platform super-admins.

### Platform Overview (`/admin`)
Total organizations, active users, total timesheets, growth %. Trend charts.

### Organizations (`/admin/organizations`)
Every tenant on the platform. Search, switch plan (Free ↔ Paid), suspend /
reactivate, view full profile.

### Global Users (`/admin/users`)
All users across all orgs, with their role and org chips.

### Analytics (`/admin/analytics`)
User acquisition, organization growth, plan mix. Export CSV.

### Subscriptions (`/admin/subscriptions`)
Billing overview: MRR, paid org count, past-due, recent invoices.

### Audit Logs (`/admin/audit-logs`)
Last 100 platform-level actions: who, what, when, severity.

### System Settings (`/admin/settings`)
Platform feature flags: free-tier limits (max users, max sites), geofencing
toggle, photo verification, offline mode, maintenance mode.

---

## Tips

- **Sidebar collapse** — click the rail to collapse the sidebar to icons only.
- **Notifications badge** — the red number in the sidebar is unread alerts.
- **Theme** — your light/dark choice is remembered per device.
- **Field workers** — direct them to the Worktivo mobile app; the web portal
  will refuse them sign-in.
