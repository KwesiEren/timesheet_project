# Worktivo Web Portal: Development & Deployment Guide (v1.0 Ready)

This document provides a complete technical blueprint for developing the **Worktivo Web Management Portal**. This portal is designed for Owners and Managers to oversee multi-tenant operations, approve payroll, and manage geofenced sites on a professional large-screen interface.

---

## 🏗️ 1. Architecture Overview

The web portal functions as a **Single Page Application (SPA)** that is served statically by the existing Worktivo Node.js API at the `/manager` sub-path.

- **Location**: `backend/public/worktivo-manager-hub/`
- **Framework**: [Vite](https://vitejs.dev/) + [React](https://react.dev/) (For speed and developer accuracy).
- **Styling**: [TailwindCSS](https://tailwindcss.com/) (For premium, responsive layouts).
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Lighter and faster than Redux).
- **Data Fetching**: [TanStack Query](https://tanstack.com/query/v5) (For caching and sync states).
- **Icons**: [Lucide React](https://lucide.dev/).

---

## 🚀 2. Phase 1: Initialization (COMPLETED)

### 1.1 Project Structure
The project is integrated as a subdirectory within the backend, enabling a single-URL deployment:
- **Location**: `backend/public/worktivo-manager-hub/`
- **Build Output**: Serves from `/manager` via Express static middleware.

### 1.2 Branding & Aesthetics
Synchronized with the mobile app using HSL color mapping in `index.css`.
- **Primary Color**: `#0432A0` (Worktivo Blue).
- **Surface**: Clean White (`#FFFEFE`).

---

## 🛠️ 3. Phase 2: Feature Implementation (COMPLETED)

### 2.1 Multi-Tenant Dashboard
- **Analytics Engine**: Real-time KPI aggregation via `GET /dashboard/kpis`.
- **Live Employee View**: Real-time status mapping via `GET /dashboard/employees`.
- **Interactive Map**: Site-specific check-in visualization using `react-leaflet`.

### 2.2 Workforce Management
- **Audit-Trail Approvals**: Bulk approval system that preserves transparency flags.
- **Filterable History**: Server-side filtering by date, site, and status (`GET /employees/history`).
- **Site Geofencing**: Full CRUD operations for sites including geofence coordinate picking (`GET/POST/PUT /sites`).

---

## 🌐 4. Phase 3: Backend Integration (COMPLETED)

### 3.1 Sub-Path Routing (SPA Support)
The backend is configured to support React Router's browser history even on refreshes:
```javascript
// index.js refinement
app.use('/manager', express.static(path.join(__dirname, '../public/worktivo-manager-hub/dist')));
app.get('/manager/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/worktivo-manager-hub/dist/index.html'));
});
```

### 3.2 Data Alignment
Standardized property names (e.g., `lat`, `lng`, `clock_in`) across the API to ensure 100% compatibility with the frontend TypeScript interfaces.

---

## 🚢 5. Phase 4: Production Readiness (IN PROGRESS)

### 4.1 Deployment Pipeline
1. **Build Process**: Run `npm run build` inside `backend/public/worktivo-manager-hub`.
2. **Commit**: Consolidate `dist/` or source code into the main repository for zero-config deployment.
3. **Serving**: Ensure `NODE_ENV=production` correctly maps the static paths.

---

## 📈 Next Steps (v1.1)
- **Advanced Payroll Logic**: Integrating automatic hour calculations with Ghanaian tax/SSS localizations.
- **Announcement Broadcasting**: A web-based interface for sending push notifications directly from the dashboard.
- **Photo Proof Gallery**: A dedicated view for managers to review clock-in photos for high-security sites.
