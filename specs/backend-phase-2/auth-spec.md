# Spec: Phase 2 — Authentication Module

## Objective

Implement full authentication for the backend: register, login, refresh tokens, logout, profile, and change password. Includes JWT access/refresh token rotation, rate limiting, and auth middleware.

## API Endpoints

| Method | Path                    | Auth Required | Rate Limit     |
| ------ | ----------------------- | ------------- | -------------- |
| POST   | `/api/v1/auth/register`  | No            | 10 req/min     |
| POST   | `/api/v1/auth/login`     | No            | 10 req/min     |
| POST   | `/api/v1/auth/refresh`   | No            | 10 req/min     |
| POST   | `/api/v1/auth/logout`    | Yes           | 10 req/min     |
| GET    | `/api/v1/auth/me`        | Yes           | General (100)  |
| PATCH  | `/api/v1/auth/change-password` | Yes     | General (100)  |

All prefixed with `/api/v1` per `docs/API_SPECIFICATION.md`.

## Request/Response Contracts

### POST `/api/v1/auth/register`

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Validation rules:**
- `name`: optional, string, max 100 chars
- `email`: required, valid email format, max 255 chars
- `password`: required, min 8 chars, max 128 chars, must contain uppercase, lowercase, digit

**Response 201:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "user": { "id": "uuid", "email": "...", "name": "...", "role": "USER" }
  }
}
```

**Errors:** 409 (duplicate email), 422 (validation)

### POST `/api/v1/auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Response 200:** Same shape as register response.

**Errors:** 401 (invalid credentials), 422 (validation)

### POST `/api/v1/auth/refresh`

**Body:**
```json
{
  "refreshToken": "..."
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

**Errors:** 401 (invalid/revoked token)

### POST `/api/v1/auth/logout`

**Headers:** `Authorization: Bearer <accessToken>`

**Body:**
```json
{
  "refreshToken": "..."
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

Revokes the refresh token in database.

### GET `/api/v1/auth/me`

**Headers:** `Authorization: Bearer <accessToken>`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "...",
    "name": "...",
    "role": "USER",
    "createdAt": "..."
  }
}
```

### PATCH `/api/v1/auth/change-password`

**Headers:** `Authorization: Bearer <accessToken>`

**Body:**
```json
{
  "currentPassword": "...",
  "newPassword": "NewPassword123!"
}
```

**Validation rules:** Same as register password.
**Response 200:** `{ "success": true, "message": "Password changed successfully" }`
**Errors:** 401 (wrong current password), 422 (validation)

## Database Changes

Add `refresh_tokens` table to Prisma schema:

```prisma
model RefreshToken {
  id        String   @id @default(uuid()) @map("id")
  userId    String   @map("user_id")
  token     String   @unique @map("token")
  expiresAt DateTime @map("expires_at")
  revoked   Boolean  @default(false) @map("revoked")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([token])
  @@map("refresh_tokens")
}
```

## Auth Middleware

Two middleware functions:

1. `authenticate` — extracts Bearer token, verifies JWT, attaches `req.user` with `{ userId, role }`
2. `authorize(...roles)` — checks `req.user.role` against allowed roles, returns 403 if not permitted

Both throw `AppError` (401/403) on failure.

## Module Structure

```
src/modules/auth/
├── auth.routes.ts
├── auth.controller.ts
├── auth.service.ts
├── auth.repository.ts
├── auth.validation.ts
├── auth.types.ts

src/middleware/
├── authenticate.ts
├── authorize.ts
├── rate-limiter.ts

src/common/
├── errors.ts        (extends existing - add AUTH_001, AUTH_002 codes)
├── response.ts      (already done)
```

## Existing Code Reuse

The following already exist and must be reused:

| File | Purpose |
|------|---------|
| `src/utils/jwt.ts` | signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken |
| `src/utils/password.ts` | hashPassword, comparePassword |
| `src/common/errors.ts` | AppError with factory methods (unauthorized, forbidden, conflict, validation, badRequest) |
| `src/common/response.ts` | success, error response helpers |
| `src/config/env.ts` | JWT env vars (SECRET, REFRESH_SECRET, ACCESS_EXPIRES_IN, REFRESH_EXPIRES_IN) |

## Error Codes

Per `docs/API_SPECIFICATION.md`:

| Code     | Description           | HTTP Status |
| -------- | --------------------- | ----------- |
| AUTH_001 | Invalid credentials   | 401         |
| AUTH_002 | Token expired         | 401         |
| AUTH_003 | Unauthorized          | 401         |
| AUTH_004 | Token revoked         | 401         |

## Rate Limiting

Auth endpoints limited to 10 requests/minute per IP using `express-rate-limit`.

## What's NOT Included (deferred)

- Email verification
- Password reset flow
- OAuth (Google, LinkedIn)
- User settings table
- Admin user management
