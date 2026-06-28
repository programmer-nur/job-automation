# Technical Design Document — Phase 2: Authentication

## Architecture Validation

### Data Flow

```
Request
  │
  ▼
rateLimiter (express-rate-limit)
  │
  ▼
router → validation (Zod, fail fast)
  │
  ▼
controller (parse request, call service, format response)
  │
  ▼
service (business logic: hash/verify passwords, generate tokens, rotate refresh)
  │
  ▼
repository (Prisma queries: users, refresh_tokens)
  │
  ▼
PostgreSQL
```

### Token Flow

```
REGISTER / LOGIN
  ├── hashPassword(password)
  ├── signAccessToken({ userId, role })     ← 15min expiry
  ├── signRefreshToken({ userId, role })    ← 7d expiry
  ├── saveRefreshToken({ token, userId, expiresAt })
  └── return { accessToken, refreshToken, user }

REFRESH
  ├── verifyRefreshToken(token)             ← JWT verification
  ├── findRefreshToken(token)               ← DB check (not revoked)
  ├── revokeRefreshToken(oldToken.id)
  ├── signAccessToken({ userId, role })     ← new
  ├── signRefreshToken({ userId, role })    ← new
  ├── saveRefreshToken({ token, userId, expiresAt })
  └── return { accessToken, refreshToken }

LOGOUT
  ├── verifyAccessToken(token)              ← authenticate middleware
  ├── findRefreshToken(refreshToken)
  ├── revokeRefreshToken(refreshToken.id)
  └── return success
```

### Middleware Chain

```
app.use([
  helmet(),
  cors(),
  express.json(),
  requestLogger,
  jsonParseErrorHandler,       ← already exists
  healthRouter,
  authRateLimiter,             ← POST /api/v1/auth/*
  authRouter,                  ← POST /api/v1/auth/*
  authenticate,                ← applies to protected routes only
  notFoundHandler,
  errorHandler,
])
```

### Auth Middleware Design

`authenticate`:
1. Extract `Authorization: Bearer <token>` from headers
2. Call `verifyAccessToken(token)` (throws on invalid/expired)
3. Attach `{ userId, role }` to `req.user`
4. Call `next()`
5. On error → throw `AppError.unauthorized()` or `AppError.badRequest('Missing auth token')`

`authorize(...roles)`:
1. Factory function returning middleware
2. Check `req.user.role` is in `roles`
3. If not → throw `AppError.forbidden()`

### Express Type Extension

```typescript
// src/types/express.d.ts
declare namespace Express {
  interface Request {
    user?: { userId: string; role: string };
  }
}
```

### Security Considerations

| Concern | Mitigation |
|---------|-----------|
| Password exposure | bcrypt with 12 salt rounds, never returned in responses |
| Token theft | Short-lived access tokens (15m), refresh token rotation (old revoked on use) |
| Brute force | Rate limiting (10 req/min on auth endpoints) |
| Token replay | Refresh tokens stored in DB, revoked on use/logout |
| Timing attacks | bcrypt compare is constant-time |
| JWT secret strength | Enforced via Zod `.min(32)` in env validation |

### Rate Limiter Configuration

```typescript
const authLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minute
  max: 10,                    // 10 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, try again later' },
});
```

### Error Codes (extending AppError)

| Factory | Code | Status | When |
|---------|------|--------|------|
| `AppError.unauthorized('Invalid credentials')` | AUTH_001 | 401 | Wrong email/password |
| `AppError.unauthorized('Token expired')` | AUTH_002 | 401 | Expired JWT |
| `AppError.unauthorized()` | AUTH_003 | 401 | Missing/invalid token |
| `AppError.unauthorized('Token revoked')` | AUTH_004 | 401 | Revoked refresh token |

Note: `AppError` already has `unauthorized()`, `forbidden()`, `conflict()`, `badRequest()`, `validation()`, and `notFound()`. The `code` field maps to the AUTH_xxx codes.

### Route Registration

```typescript
// src/app.ts
app.use('/api/v1/auth', authLimiter, authRouter);
```

### Module File Checklist

```
src/modules/auth/
├── auth.routes.ts        ✓
├── auth.controller.ts    ✓
├── auth.service.ts       ✓
├── auth.repository.ts    ✓
├── auth.validation.ts    ✓
├── auth.types.ts         ✓

src/middleware/
├── authenticate.ts       ✓
├── authorize.ts          ✓
├── rate-limiter.ts       ✓

src/types/
└── express.d.ts          ✓
```

### Test Plan

| Test file | What it covers |
|-----------|---------------|
| `tests/unit/modules/auth/auth.validation.test.ts` | Zod schema edge cases (valid/invalid inputs) |
| `tests/unit/modules/auth/auth.service.test.ts` | Business logic (mocked repository) |
| `tests/unit/middleware/authenticate.test.ts` | Token extraction, verification, error cases |
| `tests/unit/middleware/authorize.test.ts` | Role checking, 403 cases |
| `tests/integration/auth.test.ts` | Full request→response (register, login, refresh, me, logout, change-password) |
