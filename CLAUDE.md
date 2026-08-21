# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**CoastalLink** — a council facility booking and maintenance system built for a CSIT214 IT
Project assignment. Three roles (`resident`, `staff`, `admin`) with separate dashboards:
residents search facilities and book them, staff handle bookings/maintenance tasks, admins
approve bookings, schedule closures, assign maintenance, and view reports/audit history.

Stack: React 19 + Vite SPA (`frontend/`, package name `CoastalLink`) and an Express 5 +
Mongoose API (`backend/`). No test suite exists.

## Commands

```bash
npm run dev            # repo root — runs run-dev.cmd, opens two PowerShell windows (Windows only)
cd backend && npm run dev    # nodemon server.js, port from PORT (default 5001)
cd frontend && npm run dev   # vite dev server
cd frontend && npm run build # vite build
cd frontend && npm run lint  # eslint
```

Both halves need their own `.env` (not committed):
- `backend/.env`: `PORT`, `MONGO_URI`, `JWT_SECRET`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `FRONTEND_URL`, `GOOGLE_CLIENT_ID`, `NODE_ENV`
- `frontend/.env`: `VITE_GOOGLE_CLIENT_ID`, `VITE_BACKEND_URL`, `NODE_ENV`

Vite only exposes `VITE_`-prefixed vars to the client, and `process` does not exist in the
browser — use `import.meta.env.DEV`, never `process.env.NODE_ENV`, in `frontend/`.

## Architecture

### Current state (important)

The project is mid-migration from a mock/prototype frontend to a real API. Auth is now wired
end to end; **nothing else is**:

- **No page under `frontend/src/pages/` calls the API.** They all render local mock arrays
  (e.g. `INITIAL_BOOKINGS` in `AdminBookings.jsx`). `lib/axios.js` is used only by
  `context/authContext.jsx`.
- `/api/auth/*` is the only route group on the backend; `User` is the only model.
- Signup picks its own role from the account-type radios (`resident`/`staff`/`admin`), so any
  visitor can create an admin. Deliberate for this assignment; revisit before real use.

### Auth flow

Both login paths end in the same session: an httpOnly `coastlink_token` JWT cookie
(7d, payload `{userId, email, role}`, signed in `middleware/jwtUtils.js`).

- `POST /api/auth/register` — bcrypt-hashed `passwordHash` (schema field is `select: false`;
  query it with `.select('+passwordHash')`); `accountType` sets the role, validated against
  `ASSIGNABLE_ROLES` and defaulting to `resident`.
- `POST /api/auth/login` — same 401 message for unknown email and wrong password.
- `POST /api/auth/google` — the `@react-oauth/google` credential is POSTed to the backend and
  verified with `google-auth-library` against `GOOGLE_CLIENT_ID`, then the user is upserted.
  The frontend never decodes the Google token itself.
- `GET /api/auth/me` — behind `middleware/auth.js`; the client's source of truth.
- `DELETE /api/auth/me` — self-service account deletion; clears the cookie with the account.
- `POST /api/auth/logout` — `clearCookie` must be passed the same flags as `res.cookie`,
  hence the shared `cookieOptions()` helper.

Cookie flags come from `cookieOptions()`: `sameSite: 'lax'` + `secure: false` in dev (a
`'none'` cookie over http://localhost is dropped by the browser), `'none'` + `secure` in
production. CORS must keep `credentials: true` or the cookie never travels.

On the client, `AuthProvider` seeds state from the `coastlink_user` localStorage **cache**
for first paint, then confirms it against `/auth/me` — the server always wins. Guard new
protected pages on `user.role` from that verified user, never on the cache alone. Use
`homePathFor(user)` (exported from `authContext`) for post-login redirects instead of
hardcoding a path. The 401 interceptor in `lib/axios.js` hard-redirects to `/login`, except
for the auth endpoints themselves.### Routing

`src/App.jsx` (mounted from `src/mainLayout.jsx` — note the swapped filenames: `mainLayout.jsx`
holds the React root, `App.jsx` holds the routes). Structure is nested-route based:
`ProtectedRoute allowedRoles={[...]}` wraps a role layout (`components/layouts/*Layout.jsx`)
which wraps that role's pages under `/admin/*`, `/staff/*`, `/resident/*`. New role pages go in
`pages/<role>/` and must be added inside the matching guarded block.

### Styling

Design tokens are CSS custom properties in `src/global.css` (`--color-*`, `--space-*`, …).
The convention, stated at the top of that file, is **inline styles referencing the variables**
rather than new CSS classes. Shared primitives (`Button`, `Card`, `Badge`, `PageHeader`,
`StatCard`, `inputStyle`, `tableStyles`, …) live in `src/components/ui.jsx` — reuse these
instead of restyling from scratch.

### Backend middleware order

`server.js` applies `cors` (with `credentials: true`) → `express.json()` → `cookieParser` →
`rateLimiter` (Upstash sliding window, 10 req / 20s, keyed on `req.ip`) → routes. CORS must
stay first so preflights are answered before the rate limiter can 429 them.
