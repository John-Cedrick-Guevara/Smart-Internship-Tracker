# Anti Mahinang Nilalang

Personal AI engineering project by [John Cedrick Guevara](https://guevix.vercel.app).

Smart internship/job application tracker with a Laravel + Inertia (React) web app and an optional local FastAPI OCR microservice.

## Repo Layout

- `Web/`: Laravel 13 backend + Inertia React frontend (Kanban board, assets, interview prep, resume alignment)
- `AI-features/`: FastAPI service used for OCR extraction (image -> extracted text) — local dev only
- `api/`, `scripts/`, `vercel.json`: Vercel deployment adapter
- `docs/`: feature docs and implementation plans
- `DEPLOYMENT.md`: production deployment guide for Vercel

## Features (High Level)

- Application tracking with stages (`wishlist`, `applied`, `interviewing`, `offer`, `rejected`)
- Application-scoped assets (links + uploaded files)
- Interview prep questions stored per application
- Resume/job alignment report (0-100) backed by Gemini (1 lifetime analysis per user in production)
- Optional screenshot OCR flow for local development (disabled in production)

## Requirements

- PHP 8.3+
- Node.js (for Vite/React build)
- Composer
- Python 3.10+ (optional, for local OCR microservice)

## Setup

### 1) Web App (Laravel + React)

From `Web/`:

```powershell
composer run setup
```

To run the dev stack (Laravel server + queue + Vite):

```powershell
composer run dev
```

### 2) OCR Microservice (FastAPI, local only)

From `AI-features/`:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

Set `OCR_ENABLED=true` and `OCR_SERVICE_URL=http://127.0.0.1:8001/extract-text/` in `Web/.env` to enable locally.

## Environment Variables

Copy `Web/.env.example` to `Web/.env` and set:

- `GEMINI_API_KEY`: required for Gemini-backed resume alignment
- `GEMINI_MODEL`: defaults to `gemini-2.0-flash`
- `OCR_ENABLED`: `false` in production (default)
- `AI_RESUME_MATCH_LIFETIME_LIMIT`: lifetime Gemini resume analyses per user (default `1`)
- `REDIS_URL`, `DB_*`, `AWS_*`: required for Vercel production (see `DEPLOYMENT.md`)

## Vercel Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full production checklist.

Quick summary:

1. Provision Neon Postgres, Upstash Redis, and S3 storage
2. Connect repo to Vercel (root directory)
3. Set secrets in Vercel dashboard
4. Deploy and run `php artisan migrate --force`

## Tests

From `Web/`:

```powershell
php artisan test
```

## Docs

- `DEPLOYMENT.md`
- `docs/CONTEXT.md`
- `docs/features/`
- `docs/plans/`
