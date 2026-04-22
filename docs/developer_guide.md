# Developer Guide v1.0

## 🛠 Project Purpose
Worktivo is a multi-tenant SaaS platform for construction and field teams. It facilitates attendance tracking with geofencing, photo proofing, and manager approvals.

## 🏗 System Architecture
- **Mobile**: Flutter/GetX.
- **Backend**: Node.js/Express.
- **DB**: PostgreSQL (Supabase) via `pg` pool.
- **Security**: JWT-based per-organization isolation. RBAC middleware for permissions.

## 💾 Database Logic
- Every entity has `organization_id`. Cross-org queries are prevented at the middleware and route levels.
- Roles: `1=Owner`, `2=Manager`, `3=Employee`.
- Audit: Manager edits to timesheets are stored in `original_data` for audit transparency.

## 📡 Key Services
- **NotificationService**: Handles database notifications and logs push-notification hooks for external providers (e.g. FCM).
- **SyncService (Flutter)**: Buffered queue for offline-productivity.

## 📂 Monorepo Architecture
Worktivo is organized as a unified monorepo:
- **Root**: Flutter mobile application code.
- **`/backend`**: Node.js Express server.
- **`/backend/public/worktivo-manager-hub`**: React management portal.

## 🚀 Web Portal Workflow
1. **Develop**: Run `npm run dev` inside the portal directory.
2. **Build**: Run `npm run build` to generate the `dist` folder.
3. **Serve**: The backend automatically serves the portal at `http://localhost:3000/manager`.

## 🚀 Development Workflow
1. Apply the migration scripts (`v1` to `v5`) in order.
2. Ensure your `.env` specifies a unique `JWT_SECRET`.
3. Use the `auth/register` endpoint to create a new organization and its first Owner account.
4. Use the `auth/invite` endpoint to add Managers or Employees.
