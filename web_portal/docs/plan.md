# Worktivo Web Portal — Production Plan

Goal: ship every module at production quality, internationally accepted (i18n,
a11y, responsive, theming, error handling), backend fully wired.

## Phase 0 — Foundation (DONE)

- ✅ React Router with role-guarded routes (`ProtectedRoute`, `SuperAdminRoute`)
- ✅ Supabase client, Axios client with bearer + org headers
- ✅ Zustand auth store with `onAuthStateChange` rehydration
- ✅ TanStack Query + sensible defaults
- ✅ Design system: tokens, gradients, shadows, light/dark
- ✅ Shared shell: `AppLayout`, `AppSidebar`, `ThemeToggle`
- ✅ i18n bootstrap: `react-i18next` + `src/locales/en.json`
- ✅ Admin routes wrapped in `AppLayout` (consistent shell)

## Phase 1 — Manager portal polish (DONE)

All 11 manager screens use `PageHeader`, `StatCard`, `EmptyState`,
gradient-mesh backgrounds, and shadcn primitives.

Outstanding cleanup:
- Subscription upgrade CTA (Phase 3)
- Settings 2FA/SSO/API token panels (Phase 3)

## Phase 2 — Super Admin portal completion (NEXT)

Effort: ~1 sprint.

| Task | File | Acceptance |
|---|---|---|
| Refactor admin pages to use `PageHeader` + design tokens (no `bg-white`) | `src/pages/admin/*.tsx` | Visual parity with manager portal in light + dark |
| Replace Analytics mock data | `src/pages/admin/Analytics.tsx` + `src/lib/services.ts` | Charts driven by `getPlatformTimeseries({from,to})` |
| Replace Dashboard trend mocks | `src/pages/admin/Dashboard.tsx` | Same endpoint as Analytics |
| Wire Users suspend/impersonate | `src/pages/admin/Users.tsx` | Calls backend, writes `platform_audit_logs`, shows toast |
| Real invoices list | `src/pages/admin/Subscriptions.tsx` | Reads from billing provider via backend |

## Phase 3 — Billing + Security panels

| Task | Acceptance |
|---|---|
| Stripe (or Paddle) integration | Manager can upgrade Free → Paid; webhook updates `organizations.plan` |
| 2FA enroll (TOTP) | Settings → Security tab, QR + backup codes |
| SSO (SAML) for Paid plans | Settings → SSO tab, IdP metadata upload |
| Personal access tokens | Settings → API tab, generate / revoke |

## Phase 4 — Internationalization

| Task | Acceptance |
|---|---|
| Extract remaining hard-coded strings to `src/locales/en.json` | `rg "['\"][A-Z][a-z]+ [a-z]+['\"]" src/pages` returns ≤ 20 hits |
| Add `es.json` + `fr.json` | Language switcher in header swaps copy live |
| Date / number formatting via `Intl` | All `format*` helpers in `src/lib/utils.ts` accept locale |
| RTL audit | `dir="rtl"` doesn't break sidebar or table headers |

## Phase 5 — Quality bar before launch

- a11y: Lighthouse ≥ 95 on Login, Dashboard, Sites map page
- responsive: every page passes 375 × 667 (iPhone SE) and 1440 × 900 manual sweep
- error states: every `useQuery` renders a retry-able `EmptyState` on error
- skeletons: every list/table has a skeleton loader, no raw "Loading…" text
- e2e: Playwright happy-path for login → manager dashboard → approve timesheet
- security: rotate Supabase anon key only as `VITE_SUPABASE_ANON_KEY`; no service-role key in repo
- observability: Sentry (or Logflare) hooked in `main.tsx`

## Definition of Done (per module)

A module is "production ready" only when **all** are true:

- [ ] No `bg-white` / `text-black` / hard-coded HSL colors — only tokens
- [ ] `PageHeader` used for the title section
- [ ] Loading state (skeleton or spinner inside layout)
- [ ] Empty state via `EmptyState`
- [ ] Error state with retry
- [ ] All visible strings from `i18n.t(...)`
- [ ] Mobile (≤ 640px) is usable, tables fall back to cards or horizontal scroll
- [ ] Dark mode passes visual check
- [ ] All mutations show a toast on success and on error
