---
marp: true
theme: default
paginate: true
backgroundColor: #fff
style: |
  section {
    font-family: 'Inter', 'Helvetica Neue', sans-serif;
    padding: 40px 60px;
  }
  section.lead h1 { font-size: 2.8em; color: #1a1a2e; }
  section.lead h2 { font-size: 1.4em; color: #666; font-weight: 400; }
  h1 { color: #1a1a2e; font-size: 1.8em; }
  h2 { color: #2d6a4f; font-size: 1.2em; }
  code { background: #f4f4f8; border-radius: 4px; }
  pre { border-radius: 8px; font-size: 0.75em; }
  table { font-size: 0.8em; }
  th { background: #1a1a2e; color: white; }
  strong { color: #1a1a2e; }
  a { color: #2d6a4f; }
---

<!-- _class: lead -->

# Kindo School Payments

## Full Stack Engineering Challenge

**Anh Tuan Kieu** &middot; February 2026

---

# Architecture

```
  Browser            Vercel (Edge CDN)           Railway (Container)          Neon
 ┌───────┐  HTTPS  ┌─────────────────┐  HTTPS  ┌─────────────────────┐     ┌────────┐
 │ React │ ──────► │ Vite SPA        │ ──────► │ Django + DRF        │────►│Postgres│
 │ TanStack Query  │ Tailwind CSS    │         │                     │     └────────┘
 │ React Hook Form │ SPA rewrites    │         │ Views → Service     │
 └───────┘         └─────────────────┘         │   → Adapter         │
                                               │     → LegacyProcessor│
                                               └─────────────────────┘
```

```
  GitHub Actions CI/CD
 ┌──────────────────────────────────────────────────────────────────┐
 │  Backend:  pytest + coverage ──► Railway deploy (gated to main) │
 │  Frontend: tsc + vitest + cov ──► Vercel deploy (gated to main) │
 │  Path-filtered │ PR coverage reports │ workflow_dispatch trigger │
 └──────────────────────────────────────────────────────────────────┘
```

**Local dev:** `docker compose up` — Postgres + Django + Vite, all wired up

---

# Key Engineering Decisions

**Adapter pattern for legacy integration**
`PaymentService → PaymentProcessorAdapter (ABC) → LegacyPaymentAdapter → LegacyProcessor`
Provided code untouched. Adapter classifies errors as retryable vs non-retryable. Swap to HTTP client in prod.

**Retry with exponential backoff** — 3 attempts, 1s → 2s → 4s delays
Only retries "declined by processor" errors. Validation errors fail immediately. Worst case ~12s; frontend has 20s timeout. Synchronous — no Celery needed for this scale.

**3-layer validation** — React Hook Form (instant UX) → DRF serializers (authoritative) → Legacy processor (defence in depth)

**Data model choices** — UUID PKs (no enumeration), `Decimal` for money, case-insensitive unique constraint on registration, attempt count tracked per transaction

**Testing** — 31 backend + 36 frontend tests. Service retry logic mocked. All API edge cases covered (duplicate registration, double payment, invalid card formats).

**API documentation** — OpenAPI 3 schema with interactive Swagger UI at `/api/docs/` (drf-spectacular)

---

# Production Readiness & What I'd Change at Scale

| Current | At Scale |
|---------|----------|
| Sync retry in request | Async (Celery) + WebSocket updates |
| Local class import | HTTP client to PCI-compliant gateway |
| No auth (not required) | JWT, role-based (parent, admin) |
| Logging | Sentry + structured JSON logs + Datadog |
| SPA | SSR (Next.js) for SEO + faster initial load |
| Unit + integration tests | Add E2E (Playwright), API contract tests |

**Already production-minded:**
CORS allowlist &middot; `ALLOWED_HOSTS` &middot; card data not stored (only last 4) &middot; secrets in env vars &middot; gated deploys with `DEPLOY_ENABLED` &middot; Whitenoise for static files &middot; conventional commits + linting

---

<!-- _class: lead -->

# Demo & Questions

**Live:** [kindo-challenge.vercel.app](https://kindo-challenge.vercel.app)
**API Docs:** [/api/docs/](https://backend-production-47d5.up.railway.app/api/docs/)
**Code:** [github.com/passkey1510/kindo-challenge](https://github.com/passkey1510/kindo-challenge)
