# CoastalLink: Council Facility Booking and Maintenance System

**University of Wollongong — CSIT214 IT Project**

> Project delivery date: 16 October 2026

---

## Project Summary

This repository contains the IT software system developed for **CoastalLink**, a local council
facility management portal. The system is designed to manage the full lifecycle of a council
facility booking — from a resident searching for a hall, to an administrator approving the request,
to staff completing the maintenance work that keeps the facility open.

The system replaces phone-and-spreadsheet booking with a single online portal serving three distinct
user groups. Residents book facilities and borrow equipment; staff process bookings and close out
maintenance tasks; administrators approve requests, schedule closures, assign work, and review
reports and a tamper-evident audit history. Every action that changes a booking, facility, or task
is written to an audit log, giving the council both operational efficiency and accountability.

---

## Key Functionalities

The system implements the following core features:

- **Role-based portals** — separate dashboards and navigation for `resident`, `staff`, and `admin`,
  enforced on both the client route guard and the API.
- **Facility search and booking** — residents search council facilities, see live availability by
  the hour, and request a booking; overlapping bookings and closed dates are rejected by the API.
- **Equipment borrowing** — residents reserve equipment by quantity, optionally linked to an
  existing facility booking.
- **Booking approval workflow** — pending requests move through Approved / Rejected / Cancelled,
  with administrators and staff acting on them from their own queues.
- **Facility closures** — administrators schedule dated closures with a reason; the resident-facing
  facility cards and the booking time picker both respect them automatically.
- **Maintenance management** — issues are reported by residents or administrators, assigned to
  staff, and tracked across a Pending → In Progress → Completed board.
- **Notifications** — in-app notification bell for booking outcomes and assignments.
- **Reporting** — administrators view booking trends, maintenance by status and by priority.
- **Audit history** — a read-only record of who changed what and when.

---

## Project Structure

The application is split into a React single-page application and an Express REST API:

```
AirplaneMode/
├── frontend/                  React 19 + Vite SPA
│   └── src/
│       ├── pages/
│       │   ├── landing/       Landing page and login
│       │   ├── resident/      Facility search, equipment, bookings, maintenance
│       │   ├── staff/         Dashboard, bookings, maintenance, schedule
│       │   └── admin/         Dashboard, facilities, equipment, approvals,
│       │                      bookings, maintenance, closures, reports, audit
│       ├── components/        Shared UI primitives, charts, role layouts
│       ├── context/           Auth provider and session state
│       ├── lib/               Axios instance with the 401 interceptor
│       ├── global.css         Design tokens (colours, spacing, typography)
│       ├── App.jsx            React root
│       └── mainLayout.jsx     Route table
│
└── backend/                   Express 5 + Mongoose API
    ├── app.js                 Builds and exports the Express app
    ├── server.js              Local dev entry point (listens on PORT)
    ├── api/index.js           Serverless entry point (Vercel)
    ├── routes/                12 route groups under /api/*
    ├── controllers/           Request handling and business rules
    ├── models/                8 Mongoose schemas
    ├── middleware/            JWT auth guard and cookie/token helpers
    └── db/                    Cached Mongoose connection

```

Each role's pages live in their own folder and are mounted inside a matching
`ProtectedRoute allowedRoles={[...]}` block, so a route cannot be reached by the wrong role.

---

## Non-Functional Requirements Highlights

- **Security** — passwords are hashed with bcrypt and never returned by a query; the session is an
  httpOnly JWT cookie that JavaScript cannot read; every protected route is checked server-side
  rather than trusting the client.
- **Reliability** — booking conflicts, closures, and opening hours are validated on the server, so
  two residents racing for the same hour cannot both succeed.
- **Accountability** — changes to bookings, facilities, and maintenance tasks are written to an
  audit log.
- **Performance** — list endpoints are queried per role rather than filtered in the browser, and the
  database connection is cached between serverless invocations.
- **User experience** — a consistent design-token system across all three portals, with tables and
  card grids that scroll within the viewport rather than pushing the page.

---

## Technology Stack

**Frontend**
- React 19 with Vite 8
- React Router 8 for nested, role-guarded routing
- Recharts for dashboard visualisations
- Axios (with credentials) for API calls; react-hot-toast for feedback
- Styling by CSS custom properties in `global.css` plus shared primitives in `components/ui.jsx`

**Backend**
- Node.js with Express 5
- MongoDB with Mongoose 9
- JSON Web Tokens in an httpOnly cookie for session auth
- bcryptjs for password hashing
- google-auth-library for verifying Google Sign-In credentials server-side

**Infrastructure**
- MongoDB Atlas for the database
- Vercel for hosting — the SPA as a static build, the API as a serverless function

**Development tools**
- npm for package management
- ESLint for linting
- nodemon for backend hot reload
- Postman collection included under `postman/`

---

## Installation & Setup

### Prerequisites

- Node.js v20 or higher (the deployment targets 22.x)
- npm
- Git
- A MongoDB database — MongoDB Atlas is recommended
- A Google OAuth 2.0 Client ID (for Google Sign-In)

### Setup instructions

```bash
# Clone the repository
git clone https://github.com/duyanhta1304-cloud/Flight-Management-System.git
cd Flight-Management-System

# Install dependencies for both halves
cd backend  && npm install
cd ../frontend && npm install
```

### Environment variables

Neither `.env` file is committed. Create both before starting the app.

**`backend/.env`**

| Variable | Purpose |
|---|---|
| `PORT` | Local API port (defaults to 5001) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign session tokens |
| `FRONTEND_URL` | Allowed CORS origin(s), comma-separated |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID, for verifying sign-in |
| `NODE_ENV` | `development` locally, `production` when deployed |

**`frontend/.env`**

| Variable | Purpose |
|---|---|
| `VITE_BACKEND_URL` | API origin, with no trailing slash and no `/api` |
| `VITE_GOOGLE_CLIENT_ID` | The same Google OAuth client ID |

> Vite only exposes `VITE_`-prefixed variables to the browser, and it substitutes them at **build
> time** — changing one requires a rebuild, not just a restart.

---

## Running the Application

Two terminals, one per half:

```bash
# Terminal 1 — API on http://localhost:5001
cd backend
npm run dev

# Terminal 2 — SPA on http://localhost:5173
cd frontend
npm run dev
```

On Windows, `npm run dev` from the repository root runs `run-dev.cmd`, which opens both in separate
PowerShell windows.

Then open **http://localhost:5173** and register an account. The sign-up form's account-type
selection sets your role, so you can create a resident, staff, or admin account to explore each
portal.

### Other commands

```bash
cd frontend && npm run build    # production build into dist/
cd frontend && npm run lint     # ESLint
```

---

## Module Navigation

| Area | Route | Description |
|---|---|---|
| Landing | `/` | Public home page |
| Login | `/login` | Email/password and Google sign-in |
| **Resident** | `/resident` | Overview of the resident's own activity |
| | `/resident/facilities` | Search facilities and request a booking |
| | `/resident/equipment` | Borrow equipment |
| | `/resident/bookings` | View and cancel own bookings |
| | `/resident/maintenance` | Report a facility issue |
| **Staff** | `/staff` | Today's bookings and open tasks |
| | `/staff/bookings` | Process booking requests |
| | `/staff/maintenance` | Update assigned task status |
| | `/staff/schedule` | Shift roster |
| **Admin** | `/admin` | Council-wide dashboard and charts |
| | `/admin/facilities` | Create and edit facilities |
| | `/admin/equipment` | Manage the equipment catalogue |
| | `/admin/approvals` | Approve or reject pending bookings |
| | `/admin/bookings` | Every booking, searchable and filterable |
| | `/admin/maintenance` | Assignment board across all statuses |
| | `/admin/closures` | Schedule facility closures |
| | `/admin/reports` | Booking and maintenance reporting |
| | `/admin/audit` | Audit history |

---

## Project Status & Deliverables

**Current status:** the frontend and backend are integrated, with authentication, facilities,
equipment, bookings, closures, maintenance, notifications, reporting, and audit logging all working
end to end against MongoDB. The application is deployed on Vercel.

**Key deliverables:**
- Working web application implementing the functionality above
- Deployed frontend and API
- Postman collection covering the API routes
- Project documentation (Business Case, Charter, Scope, WBS, Risk Management, etc.)

**Known limitations:**
- The sign-up form lets a visitor choose their own role, including `admin`. This is deliberate for
  assignment demonstration and would be removed before any real deployment.
- The staff schedule page uses fixed sample data; it is outside the assessed requirements.
- There is no automated test suite; verification is manual.

---

## Future Enhancements

- Restrict role assignment to administrators, with invitation-based staff onboarding
- Email or SMS notification delivery alongside the in-app bell
- Recurring bookings for regular community groups
- Payment handling for chargeable facilities
- Calendar export (iCal) for residents and staff rosters
- Automated test coverage for the booking-conflict and closure rules
- Native mobile application

---

## Team & Contributors

| Role | Name |
|---|---|
| Project Sponsor | Tai Papesch-Ward |
| Project Manager | Jun Kai Heng |
| Documentation Manager | Min Qi Wong |
| Project Planner | Sayu Nitanai |
| Technical Coordinator | Duy Anh Ta |

---

## Browser Compatibility

Developed and tested against the current releases of Chrome, Firefox, Safari, and Edge.

---

## License

© 2026 University of Wollongong — CSIT214 Project Team. All rights reserved.
