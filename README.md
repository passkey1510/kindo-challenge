# Kindo School Payments

A full-stack school field trip payment application. Parents can view trip details, register their child, make a payment, and receive confirmation — all in a single-page wizard flow.

**Live Demo:** [Frontend (Vercel)](#) | [Backend API (Railway)](#)

## Architecture

```
┌─────────────────────┐       ┌─────────────────────────────────────────┐
│                     │       │              Django Backend              │
│   React Frontend    │       │                                         │
│   (Vite + TS)       │       │  ┌─────────┐  ┌──────────────────────┐ │
│                     │ HTTP  │  │  trips   │  │      payments        │ │
│  Wizard Flow:       │──────▶│  │  app     │  │  ┌────────────────┐ │ │
│  1. Trip Details    │       │  │         ╌│  │  │ PaymentService │ │ │
│  2. Registration    │       │  └─────────┘  │  │  (retry logic)  │ │ │
│  3. Payment         │       │               │  └───────┬────────┘ │ │
│  4. Confirmation    │       │               │          │          │ │
│                     │       │               │  ┌───────▼────────┐ │ │
└─────────────────────┘       │               │  │ LegacyAdapter  │ │ │
                              │               │  └───────┬────────┘ │ │
                              │               │          │          │ │
                              │               │  ┌───────▼────────┐ │ │
                              │               │  │ LegacyPayment  │ │ │
                              │               │  │ Processor      │ │ │
                              │               │  └────────────────┘ │ │
                              │               └──────────────────────┘ │
                              │                                         │
                              │  PostgreSQL                             │
                              └─────────────────────────────────────────┘
```

## Tech Stack

| Layer      | Technology                                          |
|------------|-----------------------------------------------------|
| Frontend   | React 19, Vite, TypeScript, TanStack Query, React Hook Form, Tailwind CSS v4 |
| Backend    | Python 3.12, Django 5.1, Django REST Framework      |
| Database   | PostgreSQL 16 (Docker dev / Neon prod)               |
| Testing    | pytest + pytest-django (backend), Vitest + RTL (frontend) |
| Deploy     | Vercel (frontend), Railway (backend), Neon (DB)      |
| CI/CD      | GitHub Actions                                       |

## Quick Start

### With Docker Compose (recommended)

```bash
docker compose up --build
```

This starts:
- **PostgreSQL** on port 5432
- **Backend** on http://localhost:8000 (auto-runs migrations + seeds data)
- **Frontend** on http://localhost:5173

### Manual Setup

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL=postgres://kindo:kindo@localhost:5432/kindo
python manage.py migrate
python manage.py seed_trips
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

All endpoints are versioned under `/api/v1/`.

| Method | Endpoint                     | Description              |
|--------|------------------------------|--------------------------|
| GET    | `/api/v1/trips/:id/`         | Get trip details         |
| POST   | `/api/v1/registrations/`     | Register child for trip  |
| POST   | `/api/v1/payments/`          | Submit payment           |
| GET    | `/api/v1/payments/:id/status/` | Get payment status/receipt |

### Error Response Format

All errors follow a consistent format:
```json
{
  "error": true,
  "message": "Description of what went wrong",
  "code": "ERROR_CODE"
}
```

## Design Decisions

### Adapter Pattern for Legacy Integration

The legacy payment processor is wrapped behind an abstract `PaymentProcessorAdapter` interface. `LegacyPaymentAdapter` implements this interface and translates between the domain model and the legacy API format. In production, this adapter would be swapped for an HTTP client that calls the real external payment API — the service layer remains unchanged.

### Retry with Exponential Backoff

The `PaymentService` retries failed payments up to 3 times with exponential backoff (1s → 2s → 4s delays). Only "declined by processor" errors are retried — validation errors (bad card number, missing fields) fail immediately. This prevents unnecessary retries for user input errors while handling transient processor failures gracefully.

### Synchronous Retries (No Celery)

Retries happen synchronously within the request. Worst case is ~10.5s (3 attempts × 1.5s processing + 1s + 2s + 4s backoff). The frontend sets a 20s timeout. This keeps the architecture simple — no message queues or async workers needed for this use case.

### Multi-Step Wizard

The frontend uses a single-page wizard pattern with local state management. TanStack Query handles server state (trip data, mutations) while React state manages the current step. This avoids the complexity of a full state management library.

### Currency

All amounts are stored as `DecimalField` in the database and displayed as NZD ($) throughout the application.

## Testing

**Backend (26 tests):**
```bash
cd backend
DATABASE_URL=sqlite:///test.db pytest -v
```
- Payment service retry logic and backoff timing
- Adapter retryable vs non-retryable error classification
- All API endpoint happy paths and error cases
- Validation edge cases

**Frontend (20 tests):**
```bash
cd frontend
npm test
```
- Wizard flow navigation and state management
- Form validation (registration + payment)
- Loading states and error handling

## Project Structure

```
kindo-challenge/
├── backend/
│   ├── config/            # Django project settings, URLs, WSGI
│   ├── trips/             # Trip model, serializer, views, seed command
│   ├── payments/
│   │   ├── adapters/      # Abstract adapter + legacy implementation
│   │   ├── services/      # PaymentService with retry logic
│   │   ├── models.py      # Registration, Transaction
│   │   ├── serializers.py
│   │   └── views.py
│   ├── tests/             # pytest test suite
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # Wizard steps + progress bar
│   │   ├── test/          # Vitest + RTL tests
│   │   ├── api.ts         # API client layer
│   │   ├── types.ts       # TypeScript interfaces
│   │   └── App.tsx        # Root component
│   ├── Dockerfile
│   └── package.json
├── .github/workflows/     # CI + deploy pipelines
├── docker-compose.yml
└── README.md
```

## AI Tools Usage

This project was built using **Claude Code** (Anthropic's CLI agent) as the primary development tool:

- **Architecture planning:** Claude Code helped design the overall architecture, adapter pattern, retry strategy, and task breakdown documented in `CLAUDE.md`
- **Code generation:** Backend and frontend were built in parallel by specialized agents — one for Django/DRF and one for React/Vite/TypeScript
- **UI/UX design:** The frontend agent used the `ui-ux-pro-max` skill for design guidelines, resulting in a clean, mobile-first, accessible interface
- **Testing:** Both agents wrote comprehensive test suites covering critical paths
- **Infrastructure:** Docker Compose, CI/CD pipelines, and this README were generated with AI assistance

All generated code was reviewed for correctness, security, and adherence to the challenge requirements. The legacy payment processor code was included exactly as provided in the challenge spec.

## Deployment

**Backend (Railway):**
- Set env vars: `DATABASE_URL`, `SECRET_KEY`, `ALLOWED_HOSTS`, `CORS_ORIGINS`, `DJANGO_SETTINGS_MODULE=config.settings`
- Deploys via Dockerfile with Gunicorn

**Frontend (Vercel):**
- Auto-deploys from GitHub
- Set env var: `VITE_API_URL` → Railway backend URL

**Database (Neon):**
- Free tier PostgreSQL
- Connection string set as `DATABASE_URL` on Railway
