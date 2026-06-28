# Spec: Backend MVP — AI Job Application Management Platform

## Objective

Build the complete backend for the AI Job Application Management Platform as a modular monolith with Node.js, Express.js, TypeScript, Prisma, and PostgreSQL.

The backend must support all API endpoints defined in `docs/API_SPECIFICATION.md`, implement the full database schema from `docs/DATABASE_DESIGN.md`, and follow the architecture and standards in `docs/SYSTEM_ARCHITECTURE.md` and `AGENTS.md`.

---

## Tech Stack

| Component | Technology |
|---|---|
| Runtime | Node.js (LTS) |
| Framework | Express.js |
| Language | TypeScript (strict mode) |
| ORM | Prisma |
| Database | PostgreSQL |
| Validation | Zod |
| Auth | JWT (access + refresh tokens), bcrypt |
| Logging | Pino |
| Queue | BullMQ (Redis) |
| Caching | Redis |
| Testing | Vitest + Supertest |
| Linting | ESLint |
| Formatting | Prettier |
| Dev Tools | pnpm, Husky, Commitlint |

See `docs/TECH_STACK.md` for rationale.

---

## Architecture

**Style:** Modular Monolith (microservice-ready).

**Layers:**
```
Routes → Controllers → Services → Repositories → Prisma → PostgreSQL
```

Dependencies only move downward. Services never import Express. Repositories only contain Prisma queries.

See `docs/SYSTEM_ARCHITECTURE.md` for the full architecture.

**Module structure (every feature):**
```
modules/{feature}/
├── {feature}.routes.ts
├── {feature}.controller.ts
├── {feature}.service.ts
├── {feature}.repository.ts
├── {feature}.validation.ts
├── {feature}.types.ts
└── {feature}.constants.ts
```

---

## Implementation Phases

### Phase 1: Project Scaffolding & Core Infrastructure
- pnpm workspace, package.json, tsconfig, ESLint, Prettier, Husky, Commitlint
- `src/` directory structure
- Config module (env validation with Zod)
- AppError class + global error handler middleware
- Pino logger setup
- Response helper (success/error format)
- Prisma schema (all entities from `docs/DATABASE_DESIGN.md`)
- Prisma migrations
- Health check endpoint

### Phase 2: Authentication Module
- Register (POST /auth/register)
- Login (POST /auth/login)
- Refresh token (POST /auth/refresh-token)
- Logout (POST /auth/logout)
- Get profile (GET /auth/me)
- Change password (PATCH /auth/change-password)
- Auth middleware for protected routes
- Rate limiting on auth endpoints

### Phase 3: Core Business Modules (Jobs, Applications, Resumes, Cover Letters)
- Jobs CRUD (POST/GET/PATCH/DELETE /jobs)
- Job import, search, filter, sort, favorite, status update
- AI match scoring (POST /jobs/:id/score)
- Applications CRUD (POST/GET/PATCH/DELETE /applications)
- Application status transitions, follow-ups, notes
- Resumes upload/CRUD, version management
- Resume tailoring (POST /resumes/:id/tailor)
- Cover letter generation and CRUD

### Phase 4: Supporting Modules (Tasks, Notifications, Dashboard, AI)
- Tasks CRUD with completion
- Notifications list + mark read
- Dashboard summary + analytics endpoints
- AI provider-agnostic service layer
- Job parsing, skill gap detection, interview prep

### Phase 5: Integrations & Queue (Google Sheets, Trello, Scheduler)
- Google Sheets sync (POST /google-sheets/sync)
- Trello sync (POST /trello/sync)
- BullMQ queue setup + workers
- Scheduler endpoints
- Admin module (users, jobs, AI usage, audit logs)

---

## Phase 1 Specification (Current)

### Functional Requirements

**FR-1.1:** Project must scaffold with TypeScript strict mode, path aliases (`@/`), and ES modules.

**FR-1.2:** Config must validate all environment variables at startup using Zod and fail with a clear message if any are missing.

**FR-1.3:** Custom `AppError` class with `statusCode`, `code` (string), `message`, and optional `details` array.

**FR-1.4:** Global error handler middleware that catches all errors and returns the standard error format.

**FR-1.5:** Pino logger configured with levels: INFO, WARN, ERROR, DEBUG. Request logging middleware.

**FR-1.6:** Response helper functions for consistent success/error JSON responses.

**FR-1.7:** Prisma schema must cover all entities from `docs/DATABASE_DESIGN.md`: User, Job, Application, ResumeVersion, CoverLetter, Task, Notification, AIRequest, AuditLog, UserSettings, JobSkill, RefreshToken.

**FR-1.8:** Initial Prisma migration must create all tables with proper indexes, foreign keys, and constraints.

**FR-1.9:** Health check endpoint at `GET /health` returning `{ status, database, redis, queue, timestamp }`.

### Non-Functional Requirements

**NFR-1.1:** TypeScript strict mode with zero `any` types.

**NFR-1.2:** All env vars validated at startup. Missing vars cause immediate startup failure.

**NFR-1.3:** Error responses must never expose stack traces.

**NFR-1.4:** All logs structured JSON via Pino.

**NFR-1.5:** Prisma schema uses `snake_case` table/column names via `@@map` and `@map`.

**NFR-1.6:** All primary keys are auto-generated UUIDs.

**NFR-1.7:** All tables have `created_at` and `updated_at` timestamps.

### Acceptance Criteria

- [ ] `npm run dev` starts the server on port 5000
- [ ] `GET /health` returns 200 with status, database, redis, queue, and timestamp
- [ ] Missing `DATABASE_URL` env var causes startup failure with clear error
- [ ] Unhandled errors return `{ success: false, message, errors }` without stack traces
- [ ] All logs are valid JSON via Pino
- [ ] Prisma migration creates 12 tables matching the specified schema
- [ ] TypeScript compiles with zero errors
- [ ] ESLint passes with zero warnings
- [ ] All unit + integration tests pass

### Risks

| Risk | Mitigation |
|---|---|
| Prisma schema diverges from DATABASE_DESIGN.md | Schema review before migration; update doc if schema changes |
| Missing env vars not caught at startup | Zod validation in config module with early failure |
| Circular dependencies in module structure | Explicit dependency direction enforcement; no cross-module imports |
| Orphaned Prisma migrations | One migration per change; descriptive names; never edit old migrations |

### Edge Cases

- Server starts without Redis available (health check reports `redis: disconnected`, no crash)
- Invalid env var types (Zod catches and reports at startup)
- Concurrent migrations (Prisma handles locking)
- Missing `.env` file (explicit error with instructions)

### Dependencies

- External: PostgreSQL, Redis (for BullMQ)
- Packages: express, @prisma/client, prisma, zod, pino, dotenv, helmet, cors, uuid, bcrypt, jsonwebtoken, bullmq, ioredis
- Dev: typescript, vitest, supertest, eslint, prettier, husky, lint-staged, commitlint, @types/*

---

## Commands

```bash
# Development
pnpm dev              # Start dev server with hot reload
pnpm build            # Compile TypeScript
pnpm start            # Start production server

# Database
pnpm db:migrate       # Run Prisma migrations
pnpm db:generate     # Generate Prisma client
pnpm db:studio       # Open Prisma Studio
pnpm db:seed         # Seed database

# Quality
pnpm lint            # ESLint
pnpm format          # Prettier
pnpm typecheck       # tsc --noEmit
pnpm test            # Run all tests
pnpm test:watch      # Watch mode
pnpm test:coverage   # Coverage report

# Git
pnpm prepare         # Install Husky hooks
```

---

## Project Structure

```
src/
├── app.ts                 # Express app setup (middleware, routes)
├── server.ts              # Server entry point (startup)
├── config/
│   ├── env.ts             # Environment validation (Zod)
│   └── index.ts           # Config export
├── common/
│   ├── errors.ts          # AppError class
│   ├── response.ts        # Success/error response helpers
│   └── types.ts           # Shared types
├── middleware/
│   ├── error-handler.ts   # Global error handler
│   ├── logger.ts          # Request logging middleware
│   └── auth.ts            # Auth middleware
├── modules/
│   ├── health/
│   │   ├── health.routes.ts
│   │   └── health.controller.ts
│   ├── auth/
│   │   ├── auth.routes.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.repository.ts
│   │   ├── auth.validation.ts
│   │   ├── auth.types.ts
│   │   └── auth.constants.ts
│   └── ... (jobs, applications, etc.)
├── services/              # Shared services
│   ├── logger.ts          # Pino logger instance
│   └── prisma.ts          # Prisma client singleton
└── utils/                 # Pure utility functions
    ├── password.ts        # bcrypt helpers
    ├── jwt.ts             # JWT sign/verify helpers
    └── pagination.ts      # Pagination helpers

prisma/
├── schema.prisma          # Database schema
└── migrations/            # Auto-generated migrations

tests/
├── unit/                  # Unit tests
├── integration/           # Integration tests
└── setup.ts               # Test setup (DB, mocks)
```

---

## Code Style

Key conventions from `AGENTS.md §6`:

```typescript
// Imports: Node built-ins → external → @/ alias → relative
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { AppError } from '@/common/errors';
import { JobRepository } from './jobs.repository';

// Interfaces for object shapes
interface CreateJobInput {
  company: string;
  role: string;
  description?: string;
}

// Types for unions/primitives
type JobStatus = 'NEW' | 'REVIEWING' | 'READY_TO_APPLY' | 'APPLIED';

// Named exports always
export class JobService { ... }
```

---

## Testing Strategy

### Test Levels

| Level | Tool | Scope | Location |
|---|---|---|---|
| Unit | Vitest | Services, utilities, helpers | `tests/unit/` |
| Integration | Vitest + Supertest | API endpoints, controllers | `tests/integration/` |

### Practices

- **TDD:** Write failing test first, then implement, then refactor
- **DAMP over DRY:** Each test tells a complete story
- **Arrange-Act-Assert:** Every test follows this pattern
- **Prefer real implementations:** Use test DB over mocks where practical
- **Coverage:** 90%+ on services, all API paths (success + error)

### Key Test Scenarios (Phase 1)

- Health endpoint returns correct shape
- AppError serializes correctly with all fields
- Global error handler formats errors per spec
- Config validation catches missing env vars
- All Prisma models generate without errors

---

## Success Criteria

The backend Phase 1 is complete when:

- [ ] Server starts and responds to health checks
- [ ] All env vars validated at startup
- [ ] Global error handler returns consistent error format
- [ ] Pino logs structured JSON
- [ ] Prisma schema matches `docs/DATABASE_DESIGN.md`
- [ ] All 12 database tables created with indexes and constraints
- [ ] TypeScript compiles with zero errors
- [ ] ESLint passes with zero warnings
- [ ] All tests pass with 90%+ coverage
- [ ] Documentation updated if schema changed

---

## Open Questions

1. Should Redis be required at startup or should the server start without it (graceful degradation)?
   - **Decision (per SYSTEM_ARCHITECTURE.md):** Health check reports Redis status, server starts without it.
2. Should we use `express-async-errors` or manual try-catch in controllers?
   - **Decision (per AGENTS.md §6):** Manual try-catch with explicit error passing to next().
3. Port configuration — 5000 for dev?
   - **Decision (per API_SPECIFICATION.md):** 5000 for development.
4. Path alias — `@/` maps to `src/`?
   - **Decision:** Yes, `@/*` maps to `src/*` via tsconfig paths.
