# Design: Phase 6 — Tasks Module

## Architecture

Standard modular monolith: HTTP → authenticate → controller → service → repository → Prisma → PostgreSQL

## Service Logic

| Method | Logic |
|--------|-------|
| `create(userId, input)` | Validate optional jobId/applicationId exist → create → return |
| `list(userId, params)` | Build filters (status, jobId, applicationId) → paginate → return |
| `getById(userId, id)` | Find → notFound → return |
| `update(userId, id, input)` | Find → update → return |
| `delete(userId, id)` | Find → soft delete |
| `complete(userId, id)` | Find → set `completedAt` to now → return |
| `incomplete(userId, id)` | Find → set `completedAt` to null → return |

## Filtering

Status filter:
- `?status=completed` → `completedAt: { not: null }`
- `?status=pending` → `completedAt: null`

## Error Scenarios

| Scenario | Error | Status |
|----------|-------|--------|
| Task not found | AppError.notFound('Task') | 404 |
| Invalid UUID | ZodError | 422 |
| Missing auth | authenticate throws | 401 |

## Test Plan

### Validation Tests (14)
- Create: valid, missing title, title too long, with dueDate, with jobId, invalid UUID
- Update: valid, empty
- Query: defaults, status filters, jobId filter
- Complete: status enum

### Service Tests (18)
Mocks `@/config/prisma` for `task`:
- create: success
- list: default, filtered by completed, filtered by pending
- getById: found, not found
- update: success, not found
- delete: success, not found
- complete: success, not found, already completed
- incomplete: success, not found

### Integration Tests (12)
Mocks service + JWT:
- Create: 201, 422, 401
- List: 200
- Get: 200, 404
- Update: 200
- Delete: 204
- Complete: 200
- Incomplete: 200
