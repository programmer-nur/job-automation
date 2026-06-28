# Plan: Phase 2 — Authentication Module

## Steps

### Step 1 — Prisma: Add RefreshToken model
- Add `RefreshToken` model to `prisma/schema.prisma`
- Run `prisma generate` to update client

### Step 2 — Auth types + validation
- `src/modules/auth/auth.types.ts` — request/response interfaces
- `src/modules/auth/auth.validation.ts` — Zod schemas for register, login, refresh, change-password

### Step 3 — Auth repository
- `src/modules/auth/auth.repository.ts` — Prisma queries:
  - `findUserByEmail(email)`
  - `createUser(data)`
  - `findUserById(id)`
  - `updatePassword(id, hash)`
  - `saveRefreshToken(data)`
  - `findRefreshToken(token)`
  - `revokeRefreshToken(id)`
  - `revokeAllUserTokens(userId)` (logout from all devices)

### Step 4 — Auth service
- `src/modules/auth/auth.service.ts` — business logic:
  - `register(data)` → hash password, create user, generate tokens, save refresh token
  - `login(data)` → verify credentials, generate tokens, save refresh token
  - `refresh(token)` → verify refresh token, check DB not revoked, rotate tokens
  - `logout(userId, refreshToken)` → revoke refresh token in DB
  - `getProfile(userId)` → fetch user by id, exclude passwordHash
  - `changePassword(userId, currentPassword, newPassword)` → verify current, hash new, update

### Step 5 — Auth controller
- `src/modules/auth/auth.controller.ts` — thin HTTP handlers, call service, format response

### Step 6 — Auth routes
- `src/modules/auth/auth.routes.ts` — wire endpoints with rate limiter + auth middleware
- Mount under `/api/v1/auth` prefix

### Step 7 — Middleware: authenticate + authorize + rate-limiter
- `src/middleware/authenticate.ts` — extract Bearer token, verify JWT, attach `req.user`
- `src/middleware/authorize.ts` — role check factory
- `src/middleware/rate-limiter.ts` — `express-rate-limit` config for auth endpoints

### Step 8 — Wire into app.ts
- Import and mount `authRouter` under `/api/v1`

### Step 9 — Tests
- `tests/unit/modules/auth/auth.validation.test.ts`
- `tests/unit/modules/auth/auth.service.test.ts`
- `tests/unit/middleware/authenticate.test.ts`
- `tests/unit/middleware/authorize.test.ts`
- `tests/integration/auth.test.ts`

### Step 10 — Verify
- Typecheck, lint, test, coverage, build
- Self-review

## Dependencies

```
Step 1 (schema) → blocks Step 3 (repository) → blocks Step 4 (service) → blocks Steps 5-8
Steps 2 can run in parallel with Step 1
Steps 9 depends on implementation
```

## Rollback

If any step fails verification, revert the last change and re-evaluate.
