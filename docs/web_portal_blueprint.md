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

## 🚀 2. Phase 1: Initialization (Start)

### 1.1 Project Setup
The project is initialized inside the backend's public directory to ensure seamless serving:
```bash
cd backend/public
npm create vite@latest worktivo-manager-hub -- --template react-ts
cd worktivo-manager-hub
```

### 1.2 Core Dependencies
```bash
npm install axios lucide-react zustand @tanstack/react-query react-router-dom date-fns
```

### 1.3 Design System
Configure `tailwind.config.js` to match the Worktivo mobile aesthetic (Deep purples, slate grays, and vibrant highlights).

---

## 🛠️ 3. Phase 2: Feature Implementation

### 2.1 Multi-Tenant Dashboard
- **Admin Table**: A high-performance table showing all active employees.
- **Real-time Map**: Integration with `react-leaflet` to visualize Site Geofences and current "Clocked-in" counts.

### 2.2 Payroll Reporting
- **PDF Viewer**: Use `@react-pdf/renderer` or simply consume the backend `/reports/payroll` endpoint created in Phase 4.
- **Bulk Export**: Checkbox selection for employees to generate a single ZIP or merged PDF report.

### 2.3 RBAC Security
Implement a `ProtectedRoute` component that checks the `role` and `org_id` claims in the JWT before rendering the management interface.

---

## 🌐 4. Phase 3: Backend Integration

### 3.1 API Client
Create a centralized Axios instance with interceptors to automatically inject the Bearer token:
```typescript
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### 3.2 Environment Variables
Ensure the production URL is configurable:
- `.env.local`: `VITE_API_URL=http://localhost:3000`
- `.env.production`: `VITE_API_URL=https://api.worktivo.com`

---

## 🚢 5. Phase 4: Production Readiness (Production Ready)

### 4.1 Optimization
- **Lazy Loading**: Use `React.lazy()` for route-based code splitting to ensure the landing page loads under 1 second.
- **Linter & Formatting**: Enforce strict `eslint` rules to prevent memory leaks in useEffect hooks.

### 4.2 Security Audit
- **CORS Configuration**: Ensure the backend `cors()` middleware specifically whitens your production domain.
- **Content Security Policy (CSP)**: Implement headers to prevent XSS attacks.

### 4.3 Deployment Pipeline
1. **GitHub Actions**: Automated builds on every push to `main`.
2. **Build Process**: Run `npm run build` inside `backend/public/worktivo-manager-hub`. Output is directed to `dist/`.
3. **Production Serving**: The Node.js backend serves the `dist/` folder via the `/manager` route using `express.static`.

---

## 📈 Next Steps
Once the foundational React app is initialized, begin by migrating the **Site Management** components first, as they provide the highest value for web-based bulk administration.
