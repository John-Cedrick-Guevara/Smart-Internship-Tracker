# Render Deployment Guide

Personal AI project by [John Cedrick Guevara](https://guevix.vercel.app).

Deploy the Laravel + Inertia app from [`Web/`](Web/) using **Docker** on Render.

## Why Docker?

Render's default **Node** web service does not include PHP or Composer. This project needs:

- PHP 8.3
- Composer
- Node.js 20 (Vite/React build)
- PostgreSQL + Redis in production

The [`Web/Dockerfile`](Web/Dockerfile) provides all of that.

## Step 1 — Create the Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Web Service**
2. Connect `John-Cedrick-Guevara/Smart-Internship-Tracker`
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `smart-internship-tracker` (or your choice) |
| **Region** | Singapore or closest to you |
| **Branch** | `main` |
| **Root Directory** | `Web` |
| **Runtime** | **Docker** |
| **Dockerfile Path** | `./Dockerfile` (default when root is `Web`) |
| **Instance Type** | Free |

Leave **Build Command** and **Start Command** empty — Docker handles both via the Dockerfile and [`docker/entrypoint.sh`](Web/docker/entrypoint.sh).

## Step 2 — Provision managed services

### PostgreSQL (Neon — recommended, free)

Create a database at [neon.tech](https://neon.tech) and set:

```env
DB_CONNECTION=pgsql
DB_HOST=<neon-host>
DB_PORT=5432
DB_DATABASE=<database>
DB_USERNAME=<user>
DB_PASSWORD=<password>
```

### Redis (Upstash — free)

Create Redis at [upstash.com](https://upstash.com) and set:

```env
REDIS_URL=<upstash-redis-url>
REDIS_CLIENT=phpredis
SESSION_DRIVER=redis
CACHE_STORE=redis
```

### Object storage (optional but recommended for resume uploads)

Render's disk is ephemeral. For persistent uploads use S3 or Supabase Storage:

```env
FILESYSTEM_DISK=s3
FILESYSTEM_PUBLIC_DRIVER=s3
FILESYSTEM_PUBLIC_URL=https://<your-bucket-url>
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=
AWS_BUCKET=
```

## Step 3 — Environment variables (Render dashboard)

Add these under **Environment** for your web service:

```env
APP_NAME="Anti Mahinang Nilalang"
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:...your-key...
APP_URL=https://your-service.onrender.com

GEMINI_API_KEY=your-gemini-key
GEMINI_MODEL=gemini-2.0-flash
GEMINI_TIMEOUT=30

OCR_ENABLED=false
AI_RESUME_MATCH_LIFETIME_LIMIT=1
AI_OCR_LIFETIME_LIMIT=1
APP_ALLOW_REGISTRATION=true

LOG_CHANNEL=stderr
QUEUE_CONNECTION=sync
```

Generate `APP_KEY` locally:

```bash
cd Web
php artisan key:generate --show
```

**Important:** Set `APP_URL` to your exact Render URL (e.g. `https://smart-internship-tracker.onrender.com`).

## Step 4 — Deploy

1. Click **Create Web Service** (or **Manual Deploy**)
2. Wait for the Docker build to finish
3. On startup, the entrypoint automatically runs:
   - `php artisan config:cache`
   - `php artisan route:cache`
   - `php artisan view:cache`
   - `php artisan migrate --force`
   - `php artisan serve --host=0.0.0.0 --port=$PORT`

## Step 5 — Verify

- [ ] `https://your-app.onrender.com/up` returns healthy
- [ ] Register / login works
- [ ] Dashboard loads with branding watermark
- [ ] Resume match works once (Gemini)
- [ ] Second resume match returns lifetime quota error
- [ ] OCR tab is hidden (`OCR_ENABLED=false`)

## Troubleshooting

| Error | Fix |
|-------|-----|
| `composer: command not found` | Service is **Node**, not **Docker**. Recreate as Docker with root `Web`. |
| `yarn start` / `npm` only | Remove custom start command; use Docker entrypoint. |
| 500 on boot | Check `APP_KEY`, `DB_*`, and Render logs |
| Session lost between requests | Set `SESSION_DRIVER=redis` and `REDIS_URL` |
| Uploads disappear | Use S3/Supabase storage, not local disk |
| Slow first load (free tier) | Render spins down after ~15 min idle — normal on free plan |

## What is not deployed

- `AI-features/` — OCR microservice (disabled in production)
- `api/`, `vercel.json`, `scripts/` — Vercel-only files (safe to ignore on Render)

## Local Docker test (optional)

From `Web/`:

```bash
docker build -t smart-internship-tracker .
docker run --env-file .env -p 8080:10000 -e PORT=10000 smart-internship-tracker
```

Open `http://localhost:8080`.
