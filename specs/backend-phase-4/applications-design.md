# Design: Phase 4 — Applications Module

## Architecture

### Data Flow

```
HTTP Request → authenticate → applications.routes → applications.controller → applications.service → applications.repository → Prisma → PostgreSQL
```

All endpoints require authentication. Every service method receives `userId` to enforce user isolation.

### Component Design

**applications.types.ts**

| Interface | Fields |
|-----------|--------|
| `CreateApplicationInput` | jobId, notes? |
| `UpdateApplicationInput` | notes? |
| `ApplicationResponse` | id, jobId, status, notes, submittedAt, followUpDate, createdAt, updatedAt |
| `ApplicationListParams` | userId, page, limit, status?, jobId?, sortBy?, sortOrder? |

**applications.validation.ts**

| Schema | Key Rules |
|--------|-----------|
| `createApplicationSchema` | jobId (UUID required), notes (max 5000 optional) |
| `updateApplicationSchema` | notes (max 5000 optional) |
| `applicationStatusSchema` | status must be valid ApplicationStatus enum |
| `followUpSchema` | followUpDate must be ISO datetime string |
| `notesSchema` | notes (max 5000 optional) |
| `applicationListQuerySchema` | page (coerce), limit (coerce 1-100), status, jobId, sortBy (enum), sortOrder (asc/desc) |

**applications.repository.ts**

All queries include `where: { userId, deletedAt: null }`.

| Method | Prisma Query |
|--------|-------------|
| `create(data)` | `prisma.application.create({ data })` |
| `findById(id)` | `prisma.application.findFirst({ where: { id, userId, deletedAt: null } })` |
| `findAll(params)` | `prisma.application.findMany({ where, orderBy, skip, take })` |
| `count(where)` | `prisma.application.count({ where })` |
| `update(id, data)` | `prisma.application.update({ where: { id }, data })` |
| `softDelete(id)` | `prisma.application.update({ where: { id }, data: { deletedAt: new Date() } })` |

**applications.service.ts**

| Method | Logic |
|--------|-------|
| `create(userId, input)` | Verify job exists (via jobRepository) → create → return response |
| `list(userId, params)` | Build filters → paginate → fetch + count → { data, meta } |
| `getById(userId, id)` | Find → notFound if null → return |
| `update(userId, id, input)` | Find → update → return |
| `delete(userId, id)` | Find → soft delete |
| `updateStatus(userId, id, status)` | Find → update status → return |
| `scheduleFollowUp(userId, id, date)` | Find → set followUpDate → return |
| `updateNotes(userId, id, notes)` | Find → set notes → return |

### Job Verification

On create, verify the referenced job exists and belongs to the user:
```typescript
const job = await jobRepository.findById(userId, input.jobId);
if (!job) throw AppError.notFound('Job');
```

This ensures users can only create applications for their own jobs.

### Error Scenarios

| Scenario | Error | Status |
|----------|-------|--------|
| Application not found | AppError.notFound | 404 |
| Job not found (on create) | AppError.notFound('Job') | 404 |
| Invalid status | ZodError | 422 |
| Invalid UUID | ZodError | 422 |
| Missing auth | authenticate throws | 401 |

## Security

- All endpoints require authentication
- All queries scoped to `userId`
- Job ownership verified on application creation
- Input validated at route boundary via Zod

## Performance

- Pagination with skip/take
- Index on `userId` for all queries
- Composite indexes on `(userId, status)` and `[jobId]`

## Test Plan

### Unit Tests: `applications.validation.test.ts`
- Create schema: valid, missing jobId, invalid UUID, notes too long
- Status schema: valid statuses, invalid
- Follow-up schema: valid date, invalid string
- Notes schema: update notes, empty
- Query schema: defaults, custom

### Unit Tests: `applications.service.test.ts`
Mock both `@/config/prisma` (for applications) and `@/modules/jobs/jobs.repository` (for job verification).

- **create:** success, job not found (404)
- **list:** default pagination, filtered by status, sorted
- **getById:** found, not found
- **update:** success, not found
- **delete:** success, not found
- **updateStatus:** success, not found
- **scheduleFollowUp:** success, not found
- **updateNotes:** success, not found

### Integration Tests: `applications.test.ts`
Mock `@/modules/applications/applications.service` and `@/utils/jwt`.

- Create: 201, 422, 401
- List: 200 with meta
- Get: 200, 404
- Update: 200, 404
- Delete: 204
- Status: 200, 422
- Follow-up: 200, 422
- Notes: 200
