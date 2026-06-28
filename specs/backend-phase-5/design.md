# Design: Phase 5 — Resumes + Cover Letters

## Architecture

Standard modular monolith pattern:

```
HTTP → authenticate → routes → controller → service → repository → Prisma → PostgreSQL
```

## Resumes Design

### Service Logic

| Method | Logic |
|--------|-------|
| `create(userId, input)` | Auto-increment version (get max for user + 1) → create → return |
| `list(userId, params)` | Paginate with optional `isActive` filter |
| `getById(userId, id)` | Find → notFound → return |
| `update(userId, id, input)` | Find → update → return |
| `delete(userId, id)` | Find → soft delete |
| `setActive(userId, id)` | Find → deactivate all → set active → return |
| `tailor(userId, id, jobId)` | Verify job exists → 501 error (AI not implemented) |

### Version Auto-Increment

```typescript
const maxVersion = await resumeRepository.findMaxVersion(userId);
// new version = (maxVersion ?? 0) + 1
```

### Set Active Logic

Uses a Prisma transaction:
1. Deactivate all resumes for user: `updateMany({ where: { userId }, data: { isActive: false } })`
2. Activate the target resume: `update({ where: { id }, data: { isActive: true } })`
3. Return updated resume

## Cover Letters Design

### Service Logic

| Method | Logic |
|--------|-------|
| `create(userId, input)` | Create → return |
| `list(userId, params)` | Paginate |
| `getById(userId, id)` | Find → notFound → return |
| `update(userId, id, input)` | Find → update → return |
| `delete(userId, id)` | Find → soft delete |
| `generate(userId, input)` | Verify job exists → 501 error (AI not implemented) |

## Error Scenarios

| Scenario | Error | Status |
|----------|-------|--------|
| Resume not found | AppError.notFound('Resume') | 404 |
| Cover letter not found | AppError.notFound('Cover letter') | 404 |
| AI not implemented | AppError with 501 | 501 |
| Invalid UUID | ZodError | 422 |
| Missing auth | authenticate | 401 |

## AI Scaffolding

Both `tailor` and `generate` endpoints validate input and return 501 Not Implemented:

```typescript
throw new AppError(501, 'AI resume tailoring is not yet implemented', 'AI_002');
```

## Test Plan

### Resume Validation Tests (14)
- Create: valid, invalid (missing content, title too long)
- Update: valid, empty
- Query: defaults, custom, isActive filter
- Tailor: valid, missing jobId

### Resume Service Tests (18)
- create: success, version auto-increment
- list: default pagination, filtered by isActive
- getById: found, not found
- update: success, not found
- delete: success, not found
- setActive: success, not found
- tailor: job not found, not implemented (501)

### Cover Letter Validation Tests (12)
- Create: valid, missing content, invalid UUID
- Update: valid, empty
- Generate: valid, missing jobId

### Cover Letter Service Tests (12)
- create: success
- list: default pagination
- getById: found, not found
- update: success, not found
- delete: success, not found
- generate: job not found, not implemented (501)

### Integration Tests (30 total)
- Resume: create (201, 422), list (200), get (200, 404), update (200), delete (204), setActive (200), tailor (501, 422)
- Cover letter: create (201, 422), list (200), get (200, 404), update (200), delete (204), generate (501, 422)
