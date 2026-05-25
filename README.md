# AntiMahinangNIlalang

Smart internship/job application tracker with a Laravel + Inertia (React) web app and a local FastAPI OCR microservice.

## Repo Layout

- `Web/`: Laravel 13 backend + Inertia React frontend (Kanban board, assets, interview prep, resume alignment)
- `AI-features/`: FastAPI service used for OCR extraction (image -> extracted text)
- `docs/`: feature docs and implementation plans

## Features (High Level)

- Application tracking with stages (`wishlist`, `applied`, `interviewing`, `offer`, `rejected`)
- Application-scoped assets (links + uploaded files)
- Interview prep questions stored per application (only persisted when the application is saved)
- Resume/job alignment report (0-100) backed by Gemini with local/proxy fallback
- Optional screenshot OCR flow (FastAPI OCR -> Gemini JSON extraction for form autofill)

## Requirements

- PHP 8.3+
- Node.js (for Vite/React build)
- Composer
- Python 3.10+ (for the OCR microservice)

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

### 2) OCR Microservice (FastAPI)

From `AI-features/`:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

Laravel calls the OCR service at `http://127.0.0.1:8001/extract-text/`.

## Environment Variables

Copy `Web/.env.example` to `Web/.env` and set:

- `GEMINI_API_KEY`: required for Gemini-backed resume alignment and OCR-to-JSON extraction
- `GEMINI_MODEL`: defaults to `gemini-2.0-flash`
- `GEMINI_TIMEOUT`: request timeout in seconds
- `RESUME_MATCHER_API_URL`: optional legacy proxy (FastAPI) for resume analysis

## Tests

From `Web/`:

```powershell
php artisan test
```

## Docs

- `docs/CONTEXT.md`
- `docs/features/`
- `docs/plans/`
