# Vercel Production Deployment Guide

Personal AI project by [John Cedrick Guevara](https://guevix.vercel.app).

This guide covers deploying **Smart-Internship-Tracker** to Vercel with managed Postgres, Redis, and production safeguards.

## Architecture

- **Vercel**: Laravel 13 + Inertia/React via Go PHP-FPM proxy (`api/main.go`)
- **Neon**: PostgreSQL database
- **Upstash**: Redis for sessions, cache, and rate limiting
- **S3 or compatible storage**: Resume/asset uploads (`FILESYSTEM_PUBLIC_DRIVER=s3`)
- **Google Gemini**: Resume alignment only (1 lifetime use per user)
- **OCR**: Disabled in production (`OCR_ENABLED=false`)

## Prerequisites

- Vercel account (Hobby or higher)
- Neon Postgres database
- Upstash Redis instance
- S3-compatible bucket (or AWS S3)
- `GEMINI_API_KEY`
- GitHub repo connected to Vercel (optional CI via `.github/workflows/deploy.yml`)

## Step 1 — Provision managed services

### Neon Postgres

1. Create a project in [Neon](https://neon.tech).
2. Copy connection details for Vercel env vars:

```env
DB_CONNECTION=pgsql
DB_HOST=<neon-host>
DB_PORT=5432
DB_DATABASE=<database>
DB_USERNAME=<user>
DB_PASSWORD=<password>
```

### Upstash Redis

1. Create a Redis database in [Upstash](https://upstash.com).
2. Set:

```env
REDIS_URL=<upstash-redis-url>
SESSION_DRIVER=redis
CACHE_STORE=redis
```

### Object storage

```env
FILESYSTEM_DISK=s3
FILESYSTEM_PUBLIC_DRIVER=s3
FILESYSTEM_PUBLIC_URL=https://<bucket-url>
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=
AWS_BUCKET=
```

## Step 2 — Configure Vercel project

Create a Vercel project pointing at this repository root.

**Build command** (also in `vercel.json`):

```bash
cd Web && composer install --no-dev --optimize-autoloader && npm ci && npm run build && cd .. && bash scripts/pack.sh && bash scripts/vercel-prepare.sh
```

**Environment variables** (Vercel dashboard):

| Variable | Value |
|----------|-------|
| `APP_KEY` | Run `php artisan key:generate --show` locally |
| `APP_URL` | `https://your-app.vercel.app` |
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `GEMINI_API_KEY` | Your Gemini key |
| `GEMINI_MODEL` | `gemini-2.0-flash` |
| `OCR_ENABLED` | `false` |
| `AI_RESUME_MATCH_LIFETIME_LIMIT` | `1` |
| `DB_*` | Neon credentials |
| `REDIS_URL` | Upstash URL |
| `AWS_*` | S3 credentials |

Optional abuse controls:

```env
APP_ALLOW_REGISTRATION=false
```

## Step 3 — Run database migrations

After first deploy (or from local with production DB URL):

```bash
cd Web
php artisan migrate --force
```

## Step 4 — GitHub Actions (optional)

Add repository secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Pushing to `main` triggers `.github/workflows/deploy.yml`.

## Production verification checklist

- [ ] `GET /up` returns healthy
- [ ] Register/login works; session persists across requests
- [ ] Create internship and upload a resume asset to object storage
- [ ] First resume match succeeds via Gemini
- [ ] Second resume match returns HTTP 429 with lifetime quota message
- [ ] OCR endpoint returns HTTP 403; AI Image Scan tab is hidden
- [ ] Watermark visible on Welcome, auth, and dashboard pages
- [ ] `APP_DEBUG=false` — no stack traces in responses

## Local production simulation

```bash
cd Web
cp .env.example .env
php artisan key:generate
php artisan migrate
npm ci && npm run build
```

Set `OCR_ENABLED=false` and `AI_RESUME_MATCH_LIFETIME_LIMIT=1` to mirror production AI policy.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 500 on cold start | Normal for serverless PHP; retry after warm-up |
| Session not persisting | Verify `REDIS_URL` and `SESSION_DRIVER=redis` |
| Uploads fail | Check `FILESYSTEM_PUBLIC_DRIVER=s3` and bucket permissions |
| Gemini quota bypass | Ensure `APP_ENV=production` (disables local fallbacks) |
| Vendor too large | Re-run `bash scripts/pack.sh` after `composer update` |

## What is not deployed

- `AI-features/` FastAPI OCR service (disabled in production)
- Queue workers (resume match runs synchronously)
