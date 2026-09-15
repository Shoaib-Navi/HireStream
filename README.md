# HireStream

HireStream is a full-stack MERN job portal. Job seekers build one profile, search and filter jobs, apply in minutes and
follow every application through the hiring pipeline. Recruiters register companies, post jobs and move applicants from
applied to hired.

## Tech stack

- **Frontend:** React 19, Vite, Tailwind CSS 4, shadcn/ui (Radix), Redux Toolkit + RTK Query, React Router
- **Backend:** Node.js, Express 5, MongoDB with Mongoose, Zod validation, JWT session in an httpOnly cookie
- **Services:** Cloudinary (photos, logos, resumes), Google Gemini (career assistant, called from the backend)
- **Testing:** Node test runner, Supertest and an in-memory MongoDB

## Features

- **Job seekers:** job search with URL-based filters (work mode, job type, experience, salary), job details, one-click
  apply with resume and cover letter, application tracking, profile with experience, education, links and preferences
- **Recruiters:** companies with logos, job posts (publish or save as draft), applicant review with profile summaries,
  hiring pipeline (shortlisted, interview, offered, hired, rejected) with status history
- **Everyone:** light and dark themes, responsive layouts, AI career assistant

## Security

- Role and ownership checks on every recruiter and candidate endpoint
- Zod validation of params, query and body (blocks NoSQL injection and invalid data)
- httpOnly session cookie (`SameSite=None; Secure` in production); sessions are versioned so they can be revoked
- Passwords hashed with bcrypt and never returned; Helmet headers; rate limits on login, signup and AI
- Upload type and size limits (5 MB); the Gemini API key never reaches the browser

## Project structure

```
backend/
├── index.js                  # entry: listens locally, exported for Vercel
├── src/
│   ├── app.js                # Express app: security middleware, routes, errors
│   ├── routes.js             # mounts every module under /api/v1
│   ├── config/               # environment variables, database connection
│   ├── constants/            # roles, statuses, enums shared by the modules
│   ├── middleware/           # auth + roles, validation, uploads, rate limits, errors
│   ├── modules/<domain>/     # model, validation, service, controller, routes per domain
│   ├── services/             # Cloudinary storage, email delivery, Gemini client
│   ├── migrations/           # versioned data migrations + runner
│   └── scripts/              # migrate, seed, create-admin
└── tests/                    # API integration tests

frontend/src/
├── app/                      # store and router
├── styles/theme.css          # design system: every color, font, size and radius
├── components/ui/            # base UI primitives (shadcn)
├── components/common/        # shared app components (page header, empty state, pagination…)
├── components/layout/        # site, dashboard and auth layouts
├── features/<domain>/        # api, components, hooks and pages per feature
├── services/api.js           # RTK Query base API
└── lib/                      # constants, formatting, helpers
```

## Getting started

Requires Node.js 22.12+ (or 20.19+) and a MongoDB database.

```bash
# backend
cd backend
cp .env.example .env       # set MONGO_URI and JWT_SECRET; Cloudinary, SMTP and Gemini are optional
npm install
npm run migrate            # creates indexes (and converts data from the first version of HireStream)
npm run seed               # optional sample data for development
npm run create-admin -- "Admin Name" admin@example.com "Password123"   # optional admin account
npm run dev                # http://localhost:8000

# frontend
cd frontend
cp .env.example .env       # VITE_API_URL=http://localhost:8000
npm install
npm run dev                # http://localhost:5173
```

Seeded accounts use the password `Password123`, for example `aarav@hirestream.dev` (job seeker) and
`neha.recruiter@hirestream.dev` (recruiter).

## Scripts

| Where | Command | What it does |
|---|---|---|
| backend | `npm test` | API integration tests against an in-memory MongoDB |
| backend | `npm run migrate` | Runs pending migrations and syncs indexes (back up production data first) |
| backend | `npm run seed -- --reset` | Replaces development data with sample data (refuses to run in production) |
| frontend | `npm run lint` | ESLint |
| frontend | `npm run build` | Production build |

## API overview

All routes are under `/api/v1`. Responses look like `{ success, message?, data?, meta? }`; errors look like
`{ success: false, message, errors? }`.

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| Account | `PATCH /users/me`, `PUT /users/me/avatar` |
| Candidate profile | `GET/PATCH /users/me/profile`, `PUT/DELETE /users/me/resume` |
| Jobs | `GET /jobs` (public search), `GET /jobs/:id`, `POST /jobs`, `GET /jobs/mine` |
| Applications | `POST/GET /jobs/:jobId/applications`, `GET /applications/mine`, `GET /applications/:id`, `PATCH /applications/:id/status` |
| Companies | `GET /companies/mine`, `GET /companies/mine/:id`, `POST /companies`, `PATCH /companies/:id`, `PUT /companies/:id/logo` |
| AI | `POST /ai/chat` |
| Health | `GET /health` |
