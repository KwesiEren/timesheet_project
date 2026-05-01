# Worktivo — Node.js Middleman Integration Guide

This document explains how to integrate your existing **Node.js API** (the "middleman")
with the **Supabase-backed Worktivo database and authentication**.

The web portal (this repo) talks to Supabase **directly** for auth and most reads/writes.
Your Node.js layer is now optional and used only for:

- Heavy/aggregation endpoints (payroll PDFs, reports)
- Third-party integrations (push notifications via FCM, email)
- Cross-tenant admin tasks
- Any business logic that must run server-side with elevated privileges

---

## 1. Project facts

| Item | Value |
|---|---|
| Supabase Project Ref | `ulnsokshmnssndzwbufz` |
| Supabase URL | `https://ulnsokshmnssndzwbufz.supabase.co` |
| Anon (publishable) key | safe for clients — already in `.env` as `VITE_SUPABASE_PUBLISHABLE_KEY` |
| Service-role key | **server-only**, never ship to a browser/mobile app |

Get the keys from the Supabase dashboard → Project Settings → API.

---

## 2. Environment variables for your Node service

Create a `.env` in your Node project:

```bash
SUPABASE_URL=https://ulnsokshmnssndzwbufz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...         # public/anon key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi... # SECRET — bypasses RLS
SUPABASE_JWT_SECRET=...                 # from Project Settings → API → JWT Settings
```

> The portal sends the user's Supabase access token in `Authorization: Bearer <jwt>`
> and the active organization in `X-Organization-Id: <uuid>`.

---

## 3. Install dependencies

```bash
npm install @supabase/supabase-js jsonwebtoken
```

---

## 4. Two Supabase clients (this is important)

You need TWO clients, used for very different things:

```js
// src/lib/supabase.js
const { createClient } = require('@supabase/supabase-js');

// (A) For acting AS THE USER. Honors RLS. Use this for 99% of requests.
function userClient(accessToken) {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// (B) Service-role client. BYPASSES RLS. Only for trusted server logic
//     (cron jobs, admin actions, creating organizations during signup, etc.)
const adminClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

module.exports = { userClient, adminClient };
```

**Rule of thumb:** if a request comes from a logged-in portal user, use `userClient(token)`
so RLS policies enforce multi-tenant isolation automatically.

---

## 5. Auth middleware (verify Supabase JWT)

```js
// src/middleware/auth.js
const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'missing_token' });

  try {
    const payload = jwt.verify(token, process.env.SUPABASE_JWT_SECRET, {
      algorithms: ['HS256'],
    });
    req.auth = {
      token,
      userId: payload.sub,           // auth.users.id
      email: payload.email,
      role: payload.role,            // Supabase role: "authenticated"
    };
    req.orgId = req.headers['x-organization-id'] || null;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid_token' });
  }
}

module.exports = { requireAuth };
```

---

## 6. Org membership / role guard

The portal sends `X-Organization-Id`. You must verify the user actually belongs to that
org with the required role. Use the SQL helpers we already created:

- `public.is_org_member(_user_id uuid, _org uuid) → boolean`
- `public.has_role_in_org(_user_id uuid, _org uuid, _role app_role) → boolean`
- `public.is_org_manager_or_owner(_user_id uuid, _org uuid) → boolean`

```js
// src/middleware/rbac.js
const { adminClient } = require('../lib/supabase');

function requireOrgRole(roles = ['owner', 'manager']) {
  return async (req, res, next) => {
    if (!req.orgId) return res.status(400).json({ error: 'missing_org' });

    const { data, error } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', req.auth.userId)
      .eq('organization_id', req.orgId)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!data || !roles.includes(data.role)) {
      return res.status(403).json({ error: 'forbidden' });
    }
    req.userRole = data.role;
    next();
  };
}

module.exports = { requireOrgRole };
```

---

## 7. Example route — list employees of an org

```js
// src/routes/employees.js
const express = require('express');
const { userClient } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');
const { requireOrgRole } = require('../middleware/rbac');

const router = express.Router();

router.get('/', requireAuth, requireOrgRole(['owner', 'manager']), async (req, res) => {
  const sb = userClient(req.auth.token);
  const { data, error } = await sb
    .from('user_roles')
    .select('role, is_default, profiles!inner(id, name, email, avatar_url)')
    .eq('organization_id', req.orgId);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
```

Because we used `userClient(token)`, RLS double-checks that this user can read those
rows — defense in depth.

---

## 8. Bootstrapping the first user (owner of a new org)

Supabase Auth signup only creates the `auth.users` row + `profiles` row (via the
`handle_new_user` trigger). It does **not** create an organization or assign a role.

Recommended flow on first signup:

```js
// POST /onboarding/create-org   (called right after signup, with the new user's JWT)
router.post('/create-org', requireAuth, async (req, res) => {
  const { name } = req.body;
  const { data: org, error: e1 } = await adminClient
    .from('organizations').insert({ name }).select().single();
  if (e1) return res.status(500).json({ error: e1.message });

  const { error: e2 } = await adminClient.from('user_roles').insert({
    user_id: req.auth.userId,
    organization_id: org.id,
    role: 'owner',
    is_default: true,
  });
  if (e2) return res.status(500).json({ error: e2.message });

  res.json({ organization: org });
});
```

> Until at least one row exists in `user_roles` for a given user, the portal will show
> "Resolving access…" and they cannot enter the app.

---

## 9. Inviting users (manager/owner only)

1. Insert a row into `invites` with a random `token` and an `expires_at`.
2. Email the user `https://yourapp.com/invite/<token>`.
3. On accept: the invitee signs up via Supabase Auth, then your endpoint validates the
   token, inserts `user_roles(user_id, organization_id, role)`, and marks the invite
   `accepted`.

You can also use Supabase's built-in `inviteUserByEmail` from the admin client:

```js
await adminClient.auth.admin.inviteUserByEmail(email, {
  redirectTo: 'https://yourapp.com/invite/accept',
  data: { invited_org_id: orgId, invited_role: 'manager' },
});
```

Then in a `POST /invite/accept` route, read `invited_org_id` from `user.user_metadata`
and create the `user_roles` row.

---

## 10. File uploads (check-in photos)

The bucket `check-in-photos` is private. Path convention:

```
<organization_id>/<user_id>/<YYYY>/<MM>/<DD>/<filename>
```

- **Mobile app** (employee): uploads directly to Supabase Storage with their own JWT —
  RLS policy allows write only when the path's first segment matches their `org_id`.
- **Node middleman**: if you need to generate a temporary signed URL for managers:

```js
const { data, error } = await adminClient
  .storage.from('check-in-photos')
  .createSignedUrl(path, 60 * 5); // 5-minute link
```

---

## 11. Realtime / push notifications

- Insert into `public.notifications` from any service-role context.
- The portal can subscribe with:
  ```ts
  supabase.channel('notifs')
    .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications',
          filter: `user_id=eq.${user.id}` },
        (payload) => { /* show toast */ })
    .subscribe();
  ```
- For mobile push, your Node service reads `profiles.fcm_token` and sends via FCM.

---

## 12. Google OAuth — one-time setup in Supabase

The portal already calls `supabase.auth.signInWithOAuth({ provider: 'google' })`.
For it to actually work you must enable Google in Supabase:

1. **Google Cloud Console** → APIs & Services → Credentials → Create OAuth Client ID
   (type: *Web application*).
2. Authorized JavaScript origins:
   - `http://localhost:5173`
   - your portal's published URL
3. Authorized redirect URI:
   - `https://ulnsokshmnssndzwbufz.supabase.co/auth/v1/callback`
4. Copy the Client ID + Client Secret.
5. **Supabase Dashboard** → Authentication → Providers → Google → enable, paste keys.
6. **Supabase Dashboard** → Authentication → URL Configuration:
   - **Site URL**: your portal's URL
   - **Redirect URLs**: add `http://localhost:5173/**` and `https://your-portal.com/**`

Without step 6 the OAuth callback returns "requested path is invalid".

---

## 13. Email confirmations during development

In **Authentication → Providers → Email**, you can disable
*Confirm email* for faster local testing. Re-enable it for production.

---

## 14. Security checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is **only** in your Node server's environment, never
      committed to git, never sent to a browser.
- [ ] Every route uses `requireAuth` + `requireOrgRole(...)`.
- [ ] You always pass the user's JWT to `userClient(token)` for user-acting reads/writes.
- [ ] Don't log full JWTs.
- [ ] Rotate the service-role key if it ever leaks (Supabase dashboard → API → Reset).

---

## 15. Quick request flow (end to end)

```
[Portal browser]
    │  user signs in → supabase.auth.signInWithPassword()
    │  gets access_token (JWT) + refresh_token, stored by supabase-js
    │
    │  GET /timesheets
    │  Authorization: Bearer <access_token>
    │  X-Organization-Id: <uuid>
    ▼
[Node middleman]
    │  requireAuth → verifies JWT with SUPABASE_JWT_SECRET
    │  requireOrgRole(['owner','manager']) → checks user_roles
    │  userClient(token).from('timesheet_entries').select(...)
    ▼
[Supabase Postgres]
    │  RLS: organization_id = X AND user is member  ✓
    ▼
[Response] → Node → Portal
```

That's it. Most CRUD can skip the Node layer entirely and call Supabase from the
browser — the middleman is for things RLS alone cannot do.
