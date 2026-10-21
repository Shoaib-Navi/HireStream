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

- **Job seekers:** job search with URL-based filters (work mode, job type, experience, salary), saved jobs, one-click
  apply with resume and cover letter, application tracking with status history, a profile match score on every job, and
  a profile with experience, education, links and preferences
- **Recruiters:** companies with logos, job posts (publish, edit, close, reopen or save as draft), applicant review with
  profile summaries and match scores, private team notes, a hiring pipeline with a message to the candidate at each
  step, drafted job descriptions, and a hiring overview dashboard
- **Admins:** platform overview, user suspension, company verification and job moderation
- **Everyone:** email verification, password reset and change, in-app notifications with email updates, light and dark
  themes, responsive layouts, and a career assistant

## Security

- Role and ownership checks on every recruiter and candidate endpoint
- Zod validation of params, query and body (blocks NoSQL injection and invalid data)
- httpOnly session cookie (`SameSite=None; Secure` in production); sessions are versioned so they can be revoked
- Passwords hashed with bcrypt and never returned; Helmet headers
- Emailed links (verification, password reset) are single-use, expire, and are stored only as SHA-256 hashes
- Resetting or changing a password signs out every other session; suspending a user signs them out everywhere
- Rate limits on login, signup, emailed links, password checks and assistant requests
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
npm run dev                # http://localhost:8010

# frontend
cd frontend
cp .env.example .env       # VITE_API_URL=http://localhost:8010
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
| backend | `npm run seed` | Creates or refreshes local development data; safe to run repeatedly |
| backend | `npm run seed -- --reset` | Empties every collection first (local databases only) |
| backend | `npm run fetch:jobs` | Refreshes `src/data/public-jobs.json` from public company job boards |
| backend | `npm run create-admin -- "Name" email password` | Creates an admin account, or promotes an existing user |
| frontend | `npm run lint` | ESLint |
| frontend | `npm run build` | Production build |

## API overview

All routes are under `/api/v1`. Responses look like `{ success, message?, data?, meta? }`; errors look like
`{ success: false, message, errors? }`.

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| Account security | `POST /auth/verify-email`, `POST /auth/verify-email/resend`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `PATCH /auth/password` |
| Account | `PATCH /users/me`, `PUT /users/me/avatar` |
| Candidate profile | `GET/PATCH /users/me/profile`, `PUT/DELETE /users/me/resume` |
| Jobs | `GET /jobs` (public search), `GET /jobs/:id`, `GET /jobs/mine`, `POST /jobs`, `PATCH /jobs/:id`, `PATCH /jobs/:id/status`, `DELETE /jobs/:id` |
| Applications | `POST/GET /jobs/:jobId/applications`, `GET /applications/mine`, `GET /applications/:id`, `PATCH /applications/:id/status`, `PATCH /applications/:id/withdraw`, `POST /applications/:id/notes` |
| Saved jobs | `GET /saved-jobs`, `PUT /saved-jobs/:jobId`, `DELETE /saved-jobs/:jobId` |
| Companies | `GET /companies` (public directory), `GET /companies/:slug`, `GET /companies/mine`, `GET /companies/mine/:id`, `POST /companies`, `PATCH /companies/:id`, `PUT /companies/:id/logo` |
| Notifications | `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all` |
| Dashboard | `GET /dashboard/recruiter` |
| Admin | `GET /admin/overview`, `GET /admin/users`, `PATCH /admin/users/:id/status`, `GET /admin/companies`, `PATCH /admin/companies/:id`, `GET /admin/jobs`, `PATCH /admin/jobs/:id/status`, `DELETE /admin/jobs/:id` |
| Assistant | `POST /ai/chat`, `POST /ai/job-description` |
| Health | `GET /health` |

## Development data

`npm run seed` fills a local database with enough jobs, companies and applications to make the
board feel real. Every seeded row records where it came from, and the two kinds never mix:

| Marker | What it is |
|---|---|
| `PUBLIC_SOURCE` | Postings fetched from companies' public Greenhouse job boards by `npm run fetch:jobs`. Each keeps the board's own id, URL and publish date, so any row can be traced back to the posting it came from. |
| `SYNTHETIC` | Companies, recruiters, candidates and job posts written for demos, in `src/data/synthetic-jobs.js`. They describe no real employer or vacancy, and use `example.com` domains. |

Jobs posted through the app are left unmarked — the field only ever labels seeded data, and the
API ignores it if a client tries to send it.

Two things to know about the fetched postings. Greenhouse publishes no structured work mode,
employment type, experience or skills, so those are **derived** from the title and location and
are approximations rather than statements from the employer. It also exposes no pay range, so
those jobs carry no salary; the salary filters exercise the synthetic Indian-market jobs, which
are priced in LPA.

The seed is idempotent: it matches on natural keys (user email, company slug, job source plus
external id) and updates in place, so running it twice leaves the same rows. It also refuses to
run against anything other than a local database, which keeps production out of reach.

## Testing and CI

Backend tests run against a throwaway in-memory MongoDB, so they never touch a real database. GitHub Actions runs the
backend tests plus the frontend lint and build on every pull request and on pushes to `main`
(`.github/workflows/ci.yml`).
