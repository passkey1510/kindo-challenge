# Kindo School Payments Challenge

## Overview
Full-stack school field trip payment app. Parents view trip → register child → pay → get confirmation.

**Challenge spec:** `~/Downloads/FS_Eng_Challenge.pdf`

## Tech Stack
- **Backend:** Python, Django, Django REST Framework
- **Frontend:** React, Vite, TypeScript, TanStack Query, React Hook Form, Tailwind CSS
- **Database:** PostgreSQL (Neon free tier in prod, Docker in dev)
- **Dev environment:** Docker Compose (backend + frontend + postgres)
- **Deployment:** Vercel (frontend), Railway (backend), Neon (postgres), GitHub Actions (CI/CD)

## Architecture

### Backend (Django + DRF)

**Apps:**
- `trips` — trip model + API
- `payments` — registration, transaction models, payment service, API

**Models:**
- `Trip` — name, date, location, latitude, longitude, cost, description, school_id, activity_id
- `Registration` — student_name, parent_name, parent_email, trip (FK), created_at
- `Transaction` — registration (FK), amount, card_last_four, status (pending/success/failed), transaction_id, error_message, attempts, created_at

**Endpoints (versioned: `/api/v1/`):**
- `GET /api/v1/trips/` — list all trips
- `GET /api/v1/trips/:id/` — trip details
- `POST /api/v1/registrations/` — register child for trip
- `POST /api/v1/payments/` — submit payment (registration_id + card info)
- `GET /api/v1/payments/:id/status/` — payment confirmation / receipt
- `GET /api/docs/` — interactive Swagger UI (drf-spectacular)
- `GET /api/schema/` — OpenAPI 3 schema

**Service Layer (`payments/services/payment_service.py`):**
- `PaymentService` wraps the legacy processor via an **adapter pattern**
- Retry with **exponential backoff**: max 3 retries, delays 1s → 2s → 4s
- Only retry on processor "declined" errors, NOT validation errors
- Track attempt count on transaction

**Adapter Pattern (`payments/adapters/`):**
- `PaymentProcessorAdapter` — abstract interface
- `LegacyPaymentAdapter` — wraps the provided legacy class
- Swappable for real HTTP client in production (document in README)

**Error Handling:**
- Validation errors → 400
- Processor failures (after retries exhausted) → 502
- Server errors → 500
- Consistent error response format: `{ "error": true, "message": "...", "code": "..." }`

**Config:**
- `dj-database-url` for DATABASE_URL parsing
- `django-cors-headers` for CORS
- `drf-spectacular` for OpenAPI 3 / Swagger docs
- `whitenoise` for static file serving
- Environment variables for all secrets/config
- Gunicorn for production

### Frontend (React + Vite + TypeScript)

**Wizard Flow (single page, multi-step):**
1. **Trip Details** — display trip info, "Register" CTA
2. **Registration Form** — student name, parent name, parent email
3. **Payment Form** — card number, expiry (MM/YY), CVV, shows amount
4. **Confirmation** — success with transaction ID, or error with retry

**Data fetching:**
- `useQuery` — fetch trip details
- `useMutation` — registration submission
- `useMutation` — payment submission (frontend just waits for final result, backend handles retries)

**Forms:**
- React Hook Form for all forms
- Client-side validation mirrors backend validation
- Loading spinner during payment (backend retry can take up to ~13s worst case, set timeout ~20s)

**Styling:**
- Tailwind CSS
- Responsive / mobile-friendly

### Docker Compose (Local Dev)

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: kindo
      POSTGRES_USER: kindo
      POSTGRES_PASSWORD: kindo
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"
    depends_on:
      - db
    environment:
      DATABASE_URL: postgres://kindo:kindo@db:5432/kindo
      DEBUG: "true"

  frontend:
    build: ./frontend
    command: npm run dev -- --host
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "5173:5173"
    depends_on:
      - backend
    environment:
      VITE_API_URL: http://localhost:8000
```

### Deployment

**Neon:** Free tier Postgres, connection string in env vars.

**Railway (backend):**
- Dockerfile-based deploy
- Env vars: DATABASE_URL, ALLOWED_HOSTS, CORS_ORIGINS, SECRET_KEY, DJANGO_SETTINGS_MODULE
- Gunicorn entrypoint

**Vercel (frontend):**
- Deploys via GitHub Actions using Vercel CLI
- Env var: VITE_API_URL → Railway backend URL

**GitHub Actions (`.github/workflows/`):**
- `backend.yml` — on push: pytest + coverage; on push to main: deploy to Railway
- `frontend.yml` — on push: tsc + vitest + coverage; on push to main: deploy to Vercel
- Path-filtered (backend changes only trigger backend CI, and vice versa)
- Gated deploys: requires push to main + `DEPLOY_ENABLED=true`
- `workflow_dispatch` for manual triggers

### Testing
- **Backend:** pytest + pytest-django
  - Unit test PaymentService (mock legacy processor)
  - Test retry logic (mock random failures)
  - Test validation edge cases (bad card, bad expiry, missing fields)
  - Test API endpoints
- **Frontend:** Vitest + React Testing Library
  - Test form validation
  - Test wizard flow

### Legacy Payment Processor
The provided `LegacyPaymentProcessor` class goes in `payments/adapters/legacy_processor.py`. It is NOT a separate service — just imported and wrapped by the adapter. The README should note that in production this would be an HTTP client to an external API.

### What NOT to build
- No auth/JWT (not requested)
- No async/Celery (retry is fast enough synchronously)
- No microservices
- No complex state management (TanStack Query + useState is enough)

### README should include
- Setup instructions (docker compose up)
- Architecture overview with diagram
- Design decisions and tradeoffs
- How AI tools were used
- Live demo links (Vercel + Railway)

## Seed Data
Django management command `seed_trips` creates a sample field trip:
- "Auckland Museum Field Trip"
- Date: today + 30 days (dynamic)
- Location: "Auckland Museum, Auckland"
- Latitude: -36.8601, Longitude: 174.7787
- Cost: $25.00 NZD
- school_id: "SCH-001"
- activity_id: "ACT-FIELD-001"
