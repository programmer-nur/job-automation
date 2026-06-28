# Implementation Plan — Backend Phase 1: Project Scaffolding & Core Infrastructure

## Overview

Set up the complete backend project from scratch: project tooling, TypeScript configuration, core infrastructure (config, error handling, logging, middleware), database schema (Prisma), and health check endpoint.

**Target:** A working Express server with zero TypeScript errors, zero lint warnings, passing tests, and a fully migrated database.

---

## Step Order & Dependencies

```
Step 1: Project Scaffolding
  └─► Step 2: Config Module (env validation)
        └─► Step 3: Core Infrastructure (AppError, response, prisma, logger, jwt, password, pagination)
              └─► Step 4: Middleware (error handler, logger, auth)
                    └─► Step 5: Health Module
                          └─► Step 6: App Assembly (app.ts + server.ts)
                                └─► Step 7: Prisma Schema + Migration
                                      └─► Step 8: Tests
                                            └─► Step 9: Verification
```

---

## Step 1: Project Scaffolding

### Files to Create

| File | Purpose |
|---|---|
| `package.json` | Dependencies, scripts, pnpm config |
| `tsconfig.json` | TypeScript strict mode, path aliases |
| `.eslintrc.cjs` | ESLint config (TypeScript + imports + prettier) |
| `.prettierrc` | Prettier config |
| `.husky/pre-commit` | Lint-staged hook |
| `.husky/commit-msg` | Commitlint hook |
| `commitlint.config.cjs` | Conventional Commits config |
| `.lintstagedrc.cjs` | Lint-staged config |
| `.env.example` | Example env vars |
| `.env` | Actual env vars (gitignored) |
| `.gitignore` | Git ignore rules |
| `src/` | Directory structure |
| `tests/` | Test directory structure |
| `prisma/` | Prisma directory structure |

### Dependencies to Install

**Runtime:**
- express, cors, helmet
- @prisma/client, prisma
- zod
- pino, pino-http
- dotenv
- uuid
- bcrypt
- jsonwebtoken
- bullmq, ioredis
- express-rate-limit

**Dev:**
- typescript, tsx, @types/node
- vitest, supertest, @types/supertest
- eslint, prettier
- @typescript-eslint/eslint-plugin, @typescript-eslint/parser
- eslint-config-prettier, eslint-plugin-prettier
- eslint-plugin-import
- husky, lint-staged
- @commitlint/cli, @commitlint/config-conventional
- @types/express, @types/cors, @types/bcrypt, @types/jsonwebtoken, @types/uuid

### Scripts in package.json
```
dev: tsx watch src/server.ts
build: tsc
start: node dist/server.js
lint: eslint src/ tests/
format: prettier --write "src/**/*.ts"
typecheck: tsc --noEmit
test: vitest run
test:watch: vitest
test:coverage: vitest run --coverage
db:migrate: prisma migrate dev
db:generate: prisma generate
db:studio: prisma studio
db:seed: tsx prisma/seed.ts
prepare: husky
```

### tsconfig.json Key Settings
- `strict: true`
- `target: ES2022`
- `module: NodeNext`
- `moduleResolution: NodeNext`
- `outDir: dist`
- `rootDir: src`
- `paths: { "@/*": ["./src/*"] }`
- `include: ["src/**/*"]`

---

## Step 2: Config Module

### Files
| File | Purpose |
|---|---|
| `src/config/env.ts` | Zod schema for env vars, validated singleton |
| `src/config/index.ts` | Re-export typed config object |

### Design
- Load `.env` with dotenv
- Define Zod schema for all env vars with defaults where appropriate
- Validate on import, throw on missing required vars
- Export a typed `config` object (not process.env access elsewhere)
- Types are inferred from Zod schema (no manual interface)

### Env Vars to Validate
```
NODE_ENV (dev|prod|test, default: dev)
PORT (number, default: 5000)
DATABASE_URL (string, required)
JWT_SECRET (string, required)
JWT_REFRESH_SECRET (string, required)
JWT_ACCESS_EXPIRES_IN (string, default: 15m)
JWT_REFRESH_EXPIRES_IN (string, default: 7d)
REDIS_URL (string, optional)
CORS_ORIGIN (string, default: http://localhost:3000)
LOG_LEVEL (string, default: info)
```

---

## Step 3: Core Infrastructure

### Files

| File | Purpose |
|---|---|
| `src/common/errors.ts` | AppError class + helper factories |
| `src/common/response.ts` | Success/error response helpers |
| `src/common/types.ts` | Shared types (pagination, API response) |
| `src/services/logger.ts` | Pino logger singleton |
| `src/services/prisma.ts` | Prisma client singleton |
| `src/utils/password.ts` | bcrypt hash/compare |
| `src/utils/jwt.ts` | JWT sign/verify/verifyAsync |
| `src/utils/pagination.ts` | Pagination helper (skip, take, meta) |

### AppError Design
```typescript
class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: { field: string; message: string }[]
  );
  // Static factories:
  static notFound(resource: string): AppError;
  static badRequest(message: string): AppError;
  static unauthorized(message?: string): AppError;
  static forbidden(message?: string): AppError;
  static conflict(message: string): AppError;
  static validation(details: { field: string; message: string }[]): AppError;
}
```

### Response Helpers
```typescript
function success<T>(data: T, message?: string, meta?: PaginationMeta): ApiResponse<T>;
function error(message: string, errors?: ValidationError[]): ApiResponse<null>;
```

### Logger
- Pino instance with level from config
- Pretty printing in development
- JSON in production

### Prisma Client
- Singleton pattern
- Export `prisma` instance
- Graceful shutdown on SIGTERM/SIGINT

### Password Utils
- `hashPassword(plain: string): Promise<string>` — bcrypt with 12 rounds
- `comparePassword(plain: string, hash: string): Promise<boolean>`

### JWT Utils
- `signAccessToken(payload: TokenPayload): string`
- `signRefreshToken(payload: TokenPayload): string`
- `verifyAccessToken(token: string): TokenPayload`
- `verifyRefreshToken(token: string): TokenPayload`

### Pagination Utils
- `getPaginationParams(page?: number, limit?: number): { skip, take }`
- `getPaginationMeta(total: number, page: number, limit: number): PaginationMeta`

---

## Step 4: Middleware

### Files
| File | Purpose |
|---|---|
| `src/middleware/error-handler.ts` | Global error handler |
| `src/middleware/logger.ts` | Request logging (pino-http) |
| `src/middleware/auth.ts` | JWT authentication middleware |

### Error Handler Design
- Express error handler `(err, req, res, next)`
- If `AppError`: respond with statusCode, code, message, details
- If unknown error: log with Pino, respond 500 with generic message
- Never expose stack traces in production

### Auth Middleware Design
- Extract Bearer token from Authorization header
- Verify JWT with `verifyAccessToken`
- Attach decoded payload to `req.user`
- Export `authenticate` and `authorize(...roles)` middleware

---

## Step 5: Health Module

### Files
| File | Purpose |
|---|---|
| `src/modules/health/health.routes.ts` | Route definitions |
| `src/modules/health/health.controller.ts` | Controller |

### Design
- `GET /health` returns:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "database": "connected",
    "redis": "disconnected",
    "queue": "healthy",
    "timestamp": "2026-06-28T00:00:00.000Z"
  }
}
```
- Database check: `prisma.$queryRaw` SELECT 1
- Redis check: ping (report disconnected if not configured)
- Queue check: report healthy if Redis is connected, otherwise degraded

---

## Step 6: App Assembly

### Files
| File | Purpose |
|---|---|
| `src/app.ts` | Express app creation, middleware registration, route mounting |
| `src/server.ts` | HTTP server start, graceful shutdown |

### app.ts Design
```
1. Create Express app
2. Apply helmet()
3. Apply cors(corsOrigin)
4. Apply express.json()
5. Apply logger middleware (pino-http)
6. Mount routes:
   - GET /health → healthRoutes
7. Apply 404 handler
8. Apply global error handler
```

### server.ts Design
```
1. Import config, app, prisma, logger
2. Start HTTP server on config.port
3. Log startup message
4. Graceful shutdown handlers:
   - SIGTERM: close server, disconnect Prisma, exit
   - SIGINT: same
```

---

## Step 7: Prisma Schema + Migration

### Files
| File | Purpose |
|---|---|
| `prisma/schema.prisma` | Complete database schema |
| `prisma/migrations/` | Initial migration |

### Schema Design
Follow `docs/DATABASE_DESIGN.md` exactly. Key conventions:
- `@@map("snake_case_table_name")` on every model
- `@map("snake_case_column")` on every field
- UUID primary keys with `@default(uuid())`
- `createdAt` and `updatedAt` with `@default(now())` and `@updatedAt`
- Soft delete via `deletedAt` on Job, Application, ResumeVersion
- All indexes from `docs/DATABASE_DESIGN.md` §18

### Entities (12 models)
User, Job, JobSkill, Application, ResumeVersion, CoverLetter, Task, Notification, AIRequest, AuditLog, UserSetting, RefreshToken

### Enums (6)
UserRole (ADMIN, USER), JobStatus (NEW, REVIEWING, READY_TO_APPLY, APPLIED, FOLLOW_UP, INTERVIEW, OFFER, REJECTED, CLOSED), EmploymentType, WorkplaceType, Priority, TaskType, NotificationType, AIRequestType, AuditAction

---

## Step 8: Tests

### Files
| File | Purpose |
|---|---|
| `tests/setup.ts` | Vitest setup (env vars, hooks) |
| `tests/unit/common/errors.test.ts` | AppError tests |
| `tests/unit/common/response.test.ts` | Response helper tests |
| `tests/unit/utils/password.test.ts` | Password util tests |
| `tests/unit/utils/jwt.test.ts` | JWT util tests |
| `tests/unit/utils/pagination.test.ts` | Pagination util tests |
| `tests/unit/config/env.test.ts` | Config validation tests |
| `tests/integration/health.test.ts` | Health endpoint tests |
| `tests/integration/middleware/error-handler.test.ts` | Error handler tests |

---

## Step 9: Verification

- `pnpm typecheck` — zero errors
- `pnpm lint` — zero warnings
- `pnpm test` — all passing, 90%+ coverage
- `pnpm build` — successful production build

---

## Rollback Strategy

If any step fails:
1. If a test fails, fix the implementation (not the test)
2. If a migration fails, run `prisma migrate reset` and retry
3. If env validation fails, check `.env` values
4. If TypeScript errors exist, fix type issues before proceeding

No step should be merged until all previous steps pass.
