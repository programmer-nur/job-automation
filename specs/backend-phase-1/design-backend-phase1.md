# Technical Design Document — Backend Phase 1

## Architecture Validation

### Layer Compliance
```
app.ts / server.ts          → Entry point (no business logic)
  │
middleware/                 → Express middleware (auth, logging, error handling)
  │
modules/{feature}/          → Feature modules
  ├── {feature}.routes.ts   → Route definitions only
  ├── {feature}.controller.ts → Request parsing + response formatting only
  ├── {feature}.service.ts  → Business logic (no HTTP knowledge)
  ├── {feature}.repository.ts → Prisma queries only
  ├── {feature}.validation.ts → Zod schemas
  └── {feature}.types.ts    → TypeScript types
  │
services/                   → Shared services (logger, prisma client)
  │
common/                     → Shared constructs (AppError, response helpers)
  │
utils/                      → Pure utility functions (no side effects)
```

**Validated:** Dependencies only flow downward. Services never import Express. Controllers never contain business logic. Repositories only contain Prisma queries.

### Module Boundary Map

```
modules/        depends on
─────────────────────────────────────
health          → services/prisma
auth (Phase 2)  → services/prisma, utils/password, utils/jwt, common/*
jobs (Phase 3)  → services/prisma, common/*
applications    → services/prisma, jobs, common/*
resumes         → services/prisma, common/*
cover-letters   → services/prisma, common/*
tasks           → services/prisma, common/*
notifications   → services/prisma, common/*
ai              → services/ai-provider (abstraction)
dashboard       → services/prisma, jobs, applications
google-sheets   → queues, jobs
trello          → queues, applications
scheduler       → queues
admin           → all modules (read-only)
```

**Rule:** No cross-module imports between feature modules. Shared logic lives in `services/`.

---

## Component Design

### AppError
```
AppError extends Error
├── statusCode: number     (HTTP status code)
├── code: string           (machine-readable error code, e.g. "NOT_FOUND")
├── message: string        (human-readable)
├── details?: ValidationError[]  (field-level errors)
│
├── static notFound(resource)        → 404
├── static badRequest(message)       → 400
├── static unauthorized(message?)    → 401
├── static forbidden(message?)       → 403
├── static conflict(message)         → 409
├── static validation(details)       → 422
└── toJSON()                         → serialized error object
```

### Response Helpers
```
function success<T>(data, message?, meta?) → ApiResponse<T>
  └─► { success: true, message, data, meta? }

function error(message, errors?) → ApiResponse<null>
  └─► { success: false, message, errors? }
```

### Global Error Handler
```
( err, req, res, next )
  │
  ├── err instanceof AppError
  │     └─► res.status(err.statusCode).json({ success: false, message: err.message, errors: err.details })
  │
  ├── err instanceof ZodError
  │     └─► res.status(422).json({ success: false, message: "Validation failed", errors: formatZodErrors(err) })
  │
  └── else
        ├── logger.error(err)
        └── res.status(500).json({ success: false, message: "Internal server error" })
```

### Health Check
```
GET /health
  │
  ├── db: prisma.$queryRaw`SELECT 1`  → "connected" | "error"
  ├── redis: redis.ping()             → "connected" | "disconnected"
  ├── queue: redis status             → "healthy" | "degraded"
  └── timestamp: new Date().toISOString()
```

---

## Data Flow

### Request Lifecycle
```
HTTP Request
  │
  ├── helmet()           → Security headers
  ├── cors()             → CORS check
  ├── express.json()     → Body parsing
  ├── pino-http()        → Request logging
  ├── rate-limit()       → Rate limiting
  │
  ├── Route matching
  │     └── Controller
  │           ├── Parse params/body/query
  │           ├── Validate with Zod
  │           ├── Call Service
  │           │     ├── Business logic
  │           │     ├── Call Repository
  │           │     │     └── Prisma query
  │           │     └── Return DTO
  │           └── Format response
  │
  ├── 404 handler (if no route matched)
  └── Global error handler (if error thrown)
```

---

## Security Review

### Input Validation
- All env vars validated at startup via Zod (fail fast)
- All request bodies validated at route boundary via Zod
- Never trust client-side validation

### Authentication (Phase 2 ready)
- JWT access tokens: 15-minute expiry
- JWT refresh tokens: 7-day expiry with rotation
- Passwords hashed with bcrypt (12 rounds)
- Auth middleware extracts and verifies JWT

### HTTP Security
- Helmet middleware for security headers
- CORS restricted to configured origin
- Rate limiting on auth routes (10 req/min)
- JSON body parser with size limit

### Error Handling
- Stack traces never exposed in responses
- Unknown errors logged server-side only
- Structured error format with machine-readable codes

### Secrets
- All secrets in env vars (`.env` gitignored)
- Zero secrets in source code
- Example env vars in `.env.example`

---

## Dependency Boundaries

```
                     ┌──────────┐
                     │ Zod      │  Validation schemas
                     ├──────────┤
                     │ Prisma   │  Database ORM
                     ├──────────┤
                     │ Pino     │  Structured logging
                     ├──────────┤
                     │ bcrypt   │  Password hashing
                     ├──────────┤
                     │ JWT      │  Token signing/verification
                     └──────────┘

Infrastructure boundaries:
  PostgreSQL ← Prisma ORM ← Repository
  Redis      ← ioredis   ← Service layer
  External   ← fetch/axios ← Integration layer
```

All infrastructure dependencies are abstracted behind service interfaces. Direct dependency on Prisma is contained within repository layer.

---

## State Flow

No application state in Phase 1. State management begins in Phase 2 (auth tokens stored in DB, JWT in memory).

```
Auth Flow (Phase 2):
  Login → Validate credentials → Generate JWT → Return tokens
  └─► Refresh token stored in DB
  └─► Access token in memory (client-side)

Protected Route:
  Request → Auth middleware → Verify JWT → Extract user → Controller
```

---

## Error Flow

```
Controller action
  │
  ├── Success → response.success(data, message)
  │
  ├── Validation error → throw AppError.validation(details)
  │
  ├── Not found → throw AppError.notFound(resource)
  │
  ├── Business error → throw AppError.badRequest(msg)
  │
  └── Unexpected error → throw err
                          └─► Global handler → log → 500 response
```

---

## Design Validation Checklist

- [x] **Architecture** — Follows modular monolith pattern (AGENTS.md §4)
- [x] **Domain boundaries** — No cross-module imports in Phase 1 (only health module)
- [x] **Dependency direction** — Routes → Controllers → Services → Repositories → Prisma
- [x] **Security** — Helmet, CORS, rate limiting ready, env validation, no secrets in code
- [x] **API contract** — Response format matches API_SPECIFICATION.md
- [x] **Module structure** — Each module has routes/controller/service/repository/validation/types
- [x] **Error handling** — AppError class with statusCode/code/details, global handler
- [x] **Logging** — Pino structured JSON, request logging middleware
- [x] **Testing** — Vitest + Supertest, unit + integration, 90%+ coverage
