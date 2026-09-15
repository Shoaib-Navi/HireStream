# 🚀 HireStream

HireStream is a full-stack MERN job portal that connects job seekers and recruiters on a single platform.
Recruiters register companies, post jobs and review applicants; job seekers browse jobs, apply and track their applications.

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS 4, shadcn/ui (Radix), Redux Toolkit, React Router, Axios
- **Backend:** Node.js, Express 5, Mongoose (MongoDB), Zod validation, JWT auth in an httpOnly cookie
- **Services:** Cloudinary (photos, logos, resumes), Google Gemini (chat assistant, called from the backend)

## ✨ Features

- Registration and login for two roles: job seeker (`student`) and `recruiter`
- Public job listing, keyword search and job details (no account needed to browse)
- Job seekers: apply to jobs, track application status, manage profile and resume
- Recruiters: register and edit companies, post jobs, review applicants, accept or reject them
- AI career assistant

## 🔒 Security

- Role checks **and** ownership checks on every recruiter endpoint (a recruiter can only see or change their own companies, jobs and applicants)
- Request validation with Zod on all inputs (blocks NoSQL injection and bad data)
- httpOnly auth cookie (`SameSite=None; Secure` in production), passwords hashed with bcrypt and never returned by the API
- Helmet security headers, rate limiting (stricter on login, signup and chat), upload type and size limits (5 MB)
- The Gemini API key stays on the server; the browser only talks to `/api/v1/chat`

## 🧱 Project Structure

```
HireStream/
├── backend/
│   ├── index.js          # entry: connects DB and listens locally; exported for Vercel
│   ├── app.js            # Express app: security middleware, routes, error handling
│   ├── config/env.js     # reads and checks environment variables
│   ├── controller/       # request handlers
│   ├── middleware/       # auth + roles, validation, uploads, rate limits, errors
│   ├── models/           # Mongoose schemas
│   ├── routes/           # URL → middleware → controller
│   ├── validators/       # Zod schemas for request bodies and params
│   └── utils/            # db connection, Cloudinary, cookies, ApiError
└── frontend/
    └── src/
        ├── App.jsx       # routes, layouts and role-protected sections
        ├── lib/api.js    # shared Axios client (base URL, cookies, 401 handling)
        ├── hooks/        # data-fetching hooks
        ├── redux/        # store (only the logged-in user is persisted)
        └── components/   # pages, admin pages, shared layout, ui kit
```

## ⚙️ Getting Started

Requires Node.js 22.12+ (or 20.19+) and a MongoDB database.

```bash
# backend
cd backend
cp .env.example .env      # fill in MONGO_URI, SECRET_KEY, Cloudinary and Gemini keys
npm install
npm run dev               # http://localhost:8000

# frontend
cd frontend
cp .env.example .env      # VITE_API_URL=http://localhost:8000
npm install
npm run dev               # http://localhost:5173
```

In production set `CLIENT_URL` on the backend to the deployed frontend origin (comma-separate multiple origins).

## 📡 API Overview

All routes are under `/api/v1`.

| Method | Route | Access |
|---|---|---|
| POST | `/user/register`, `/user/login`, `/user/logout` | Public |
| GET | `/user/me` | Logged in |
| POST | `/user/profile/update` | Logged in |
| GET | `/job/get?keyword=`, `/job/get/:id` | Public |
| POST | `/job/post` | Recruiter (own company) |
| GET | `/job/getadminjobs` | Recruiter |
| POST | `/company/register` · GET `/company/get`, `/company/get/:id` · PUT `/company/update/:id` | Recruiter (own companies) |
| POST | `/application/apply/:id` · GET `/application/get` | Job seeker |
| GET | `/application/:id/applicants` · POST `/application/status/:id/update` | Recruiter (own jobs) |
| POST | `/chat` | Public (rate limited) |

Errors always have the shape `{ "success": false, "message": "...", "errors"?: [...] }`.
