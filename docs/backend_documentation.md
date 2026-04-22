# Backend Documentation v1.0

The Timesheet Backend is a multi-tenant, Node.js Express application providing a scalable RESTful API for the Worktivo workforce platform. It features strict data isolation, role-based access control (RBAC), geofencing, and automated reporting.

## 🛠 Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (Supabase)
- **Authentication**: JWT with Role & Org claims
- **Reporting**: [pdfkit](https://github.com/foliojs/pdfkit)
- **Hashing**: bcryptjs

## 📁 Project Structure

```text
backend/
├── src/
│   ├── middleware/      # auth.js, rbac.js
│   ├── routes/          # auth, timesheet, employees, sites, reports, etc.
│   ├── services/         # notificationService.js
│   ├── db.js            # Connection pool
│   ├── index.js         # Entry point
│   └── schema.sql       # Master Schema
├── .env                 # Environment secrets
└── package.json         # Dependencies
```

## 🔐 Multi-Tenancy & RBAC

The system enforces strict data isolation using `organization_id` on every table. User permissions are governed by three levels:
1. **Owner**: Full access to organization settings, employees, sites, and financial reports.
2. **Manager**: Can manage employees, approve logs, create sites, and edit timesheets (with audit trail).
3. **Employee**: Can clock in/out, log activities, and view their own history.

### 🖥️ Dashboard & Analytics (`/dashboard`)
- `GET /kpis`: Returns high-level stats (Clocked-in now, Late today, Pending approvals, Open alerts).
- `GET /employees`: Real-time status map of all employees and their current sites.

### 📍 Sites & Geofencing (`/sites`)
- `GET /`: List all active sites with shorthand keys (`lat`, `lng`, `radius`).
- `POST /`: (Manager+) Create a site with `lat`/`lng` coordinates.
- `PUT /:id`: Update site settings (including `photo_required`).

### 👷 Employee Management (`/employees`)
- `GET /history`: Filterable organization-wide log history (aligned with web portal `TimeEntry`).
- `POST /check-in`: Log arrival with `lat`, `lng`, and optional `photoUrl`.
- `POST /approve`: (Manager+) Bulk approve daily logs (Status -> Approved, preserves flags).
- `PATCH /status/:id`: (Manager+) Manually set status (e.g. Absent).

### 📝 Timesheet & Audit (`/timesheets`)
- `PUT /:id`: Standard update. If a manager edits an entry, it triggers the **Flagged Edit** audit trail.

### 📊 Reports (`/reports`)
- `GET /payroll`: Generates a professional PDF work summary for a user/period.

### 🔔 Notifications (`/notifications`)
- `POST /missing-logs`: (Manager+) Finds employees who haven't checked in and sends alerts.
- `PUT /:id/read`: Clears alerts.

---

## 🌐 Serving the Management Hub
The backend serves the compiled React Manager Portal statically:
- **Route**: `/manager`
- **Fallback**: All sub-paths `/manager/*` route to the React index for SPA support.

---

### 🚀 Developer Setup
1. `npm install`
2. Configure `.env` (DATABASE_URL, JWT_SECRET)
3. Apply all `migration_v1_...` to `migration_v5_...` in order to a fresh Supabase instance.
4. `npm run dev`
