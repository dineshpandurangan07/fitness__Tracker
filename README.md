# FitPulse - Fitness & Workout Tracker

A full-stack, modern fitness tracking app built with **React + Vite** (frontend) and **Node.js + Express + MongoDB** (backend).

## Features

- **Real Google OAuth** - Sign in with your actual Google account
- **Fast Mail Login** - Instant login with just your email
- **Dashboard** - Workout stats, progress charts, and calorie tracking
- **Workout Logging** - Log exercises, sets, reps, and duration
- **Weight Tracker** - Track body weight over time with charts
- **Goals** - Set and monitor fitness goals
- **Calorie Tracker** - Daily calorie intake management
- **History** - Full workout history and analytics
- **Dark Mode** - Full dark/light theme support

## Tech Stack

| Layer      | Technologies                                                        |
| ---------- | ------------------------------------------------------------------- |
| Frontend   | React 18, Vite, Tailwind CSS, Framer Motion, Recharts, React Router |
| Backend    | Node.js, Express, MongoDB (Mongoose), JWT Auth, bcryptjs            |
| Deployment | Vercel (unified serverless API + static SPA) or Netlify + Mongo Atlas |

## Getting Started

Prerequisites: **Node.js 18+** and **MongoDB** (local, Docker, or MongoDB Atlas).

### Quick Start (all in one)

```bash
npm run install:all   # installs backend + frontend dependencies
npm run dev           # runs backend (:5000) + frontend (:5173) with API proxy
```

- Frontend: http://localhost:5173 (proxies `/api` to the backend)
- Backend API: http://localhost:5000
- Pre-seeded demo account: `alex@example.com` / `password123`

> No local MongoDB? The backend automatically falls back to an in-memory
> MongoDB (development only). For a real database, set `MONGO_URI`.

### Environment Variables

**backend/.env**

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/fitness_tracker
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

**frontend/.env** (optional - defaults to `/api`)

```
VITE_API_URL=/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

## Deployment (Vercel - recommended)

The repo is preconfigured for Vercel (`vercel.json`). The Express API and the
React SPA share one domain, so relative `/api` requests work with zero CORS
issues and no `VITE_API_URL` required.

1. Push to GitHub and **Import** the repo into Vercel.
2. Use these project settings:
   ```
   Root Directory:   .                 (repo root, NOT frontend/)
   Build Command:    npm --prefix frontend run build
   Output Directory: frontend/dist
   Install Command:  npm --prefix backend install && npm --prefix frontend install
   ```
3. Add these environment variables (Production / Preview / Development):
   ```
   MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/fitness_tracker
   JWT_SECRET=<long-random-secret>
   NODE_ENV=production
   GOOGLE_CLIENT_ID=<google-client-id>          (optional)
   VITE_GOOGLE_CLIENT_ID=<google-client-id>     (optional)
   ```
4. Deploy. First request warms up the API (MongoDB Atlas connection).

> `MONGO_URI` **must** point to a real MongoDB (MongoDB Atlas free tier works
> great). The in-memory fallback is disabled in production by design.

## Deployment (Netlify)

`netlify.toml` builds the frontend. For the API, host the backend separately
(serverless function or a VPS) and set `VITE_API_URL` at build time to its URL.

## Project Structure

```
.
├── api/index.js          # Vercel serverless handler (Express entry)
├── backend/              # Express REST API
│   ├── config/db.js      # MongoDB connection (+ dev in-memory fallback)
│   ├── controllers/      # Route handlers
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   └── utils/            # Seed data (exercises + demo user)
├── frontend/             # React + Vite SPA
│   ├── src/              # Components, pages, contexts, services
│   └── public/           # Static assets
├── vercel.json           # Vercel build/route config
├── netlify.toml          # Netlify build/route config
└── package.json          # Root scripts (dev/build/install)
```

## License

MIT