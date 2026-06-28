# Design: Phase 3 — Jobs Module

## Architecture

### Data Flow

```
HTTP Request → authenticate middleware → jobs.routes → jobs.controller → jobs.service → jobs.repository → Prisma → PostgreSQL
```

All jobs endpoints require authentication. The `authenticate` middleware sets `req.user = { userId, role }`. Every service method receives `userId` as the first parameter, ensuring user data isolation.

### Component Design

**jobs.constants.ts**

```typescript
export const JOB_SORTABLE_FIELDS = ['createdAt', 'title', 'company', 'status', 'matchScore'] as const;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
```

**jobs.types.ts**

| Interface | Fields |
|-----------|--------|
| `CreateJobInput` | title, company, location?, description?, url?, salaryRange?, jobType?, source?, notes? |
| `UpdateJobInput` | Partial<CreateJobInput> |
| `JobResponse` | All Job model fields + `isFavorite` + `notes` from metadata |
| `JobListParams` | userId, page, limit, status?, company?, search?, favorite?, sortBy?, sortOrder? |

**jobs.validation.ts**

| Schema | Key Rules |
|--------|-----------|
| `createJobSchema` | title (1-255), company (1-255), location (max 255), description (max 10000), url (valid URL, max 2048), salaryRange (max 100), jobType (max 100), source (max 100), notes (max 5000) |
| `updateJobSchema` | Same as create, all optional |
| `jobStatusSchema` | status must be valid JobStatus enum value |
| `favoriteSchema` | isFavorite must be boolean |
| `jobListQuerySchema` | page (coerce positive int), limit (coerce 1-100), status, company, search, favorite (coerce boolean), sortBy (enum), sortOrder (asc/desc) |

**jobs.repository.ts**

All queries include `where: { userId, deletedAt: null }` to enforce user isolation and soft delete filtering.

| Method | Prisma Query |
|--------|-------------|
| `create(data)` | `prisma.job.create({ data: { ...data, userId } })` |
| `findById(id)` | `prisma.job.findFirst({ where: { id, userId, deletedAt: null } })` |
| `findAll(params)` | `prisma.job.findMany({ where: { userId, deletedAt: null, ...filters }, orderBy, skip, take })` |
| `countAll(params)` | `prisma.job.count({ where: { userId, deletedAt: null, ...filters } })` |
| `update(id, data)` | `prisma.job.update({ where: { id }, data })` |
| `softDelete(id)` | `prisma.job.update({ where: { id }, data: { deletedAt: new Date() } })` |
| `findByUrl(userId, url)` | `prisma.job.findFirst({ where: { userId, url, deletedAt: null } })` |

**jobs.service.ts**

| Method | Logic |
|--------|-------|
| `create(userId, input)` | Check duplicate URL → create job with notes in metadata → return response |
| `list(userId, params)` | Build filters → paginate → fetch + count → return { data, meta } |
| `getById(userId, id)` | Find by id → notFound if null → return response |
| `update(userId, id, input)` | Find → update (merge notes into metadata) → return response |
| `delete(userId, id)` | Find → soft delete → return void |
| `updateStatus(userId, id, status)` | Find → update status → return response |
| `toggleFavorite(userId, id, isFavorite)` | Find → toggle isFavorite → return response |

### Duplicate Detection

Only for jobs with a URL. If `url` is provided, check `findByUrl(userId, url)` before creating. Return 409 if exists.

### Search

Uses PostgreSQL `ILIKE` for case-insensitive partial matching across `title`, `company`, and `description`:
```typescript
search ? {
  OR: [
    { title: { contains: search, mode: 'insensitive' } },
    { company: { contains: search, mode: 'insensitive' } },
    { description: { contains: search, mode: 'insensitive' } },
  ],
} : {}
```

Full-text search (tsvector) deferred to a future optimization.

### Notes Storage

`notes` is not a dedicated column. It is stored in the `metadata` JSONB field:
- **Create:** `metadata = notes ? { notes } : undefined`
- **Read:** `response.notes = job.metadata?.notes ?? null`
- **Update:** merge `notes` into existing `metadata`

### Error Scenarios

| Scenario | Error | Status |
|----------|-------|--------|
| Job not found | AppError.notFound('Job') | 404 |
| Duplicate URL | AppError.conflict('Job with this URL already exists') | 409 |
| Invalid status | ZodError | 422 |
| Missing auth | authenticate throws | 401 |
| Invalid job ID format | Type error caught by service, re-thrown as 404 | 404 |

## Security

- All endpoints require authentication (authenticate middleware)
- All queries scoped to `userId` — users can never see another user's jobs
- Input validated at route boundary via Zod
- Soft delete preserves data integrity
- No admin-only endpoints (authorize middleware not needed for basic CRUD)

## Performance

- Pagination with `skip`/`take` (cursor-based deferred to future)
- Index on `userId` for all queries
- Composite indexes on `(userId, status)` and `(userId, company)` for filtered queries
- `LIKE` search on indexed columns limited by `userId` partition
- `count` query for pagination meta (standard offset approach)

## Test Plan

### Unit Tests: `jobs.validation.test.ts`
- Create schema: valid input, missing required, invalid URL, max length
- Update schema: partial update, empty body
- Status schema: valid enum values, invalid string
- Favorite schema: boolean values, invalid type
- Query schema: defaults, custom values, invalid sortBy

### Unit Tests: `jobs.service.test.ts`
Mock `@/config/prisma` user/refreshToken as in auth service tests.

- **create:** success, duplicate URL (409)
- **list:** default pagination, filtered by status, search query, favorite filter, sorted by company
- **getById:** found, not found (404)
- **update:** success, not found
- **delete:** success, not found
- **updateStatus:** success, not found
- **toggleFavorite:** true → false, false → true

### Integration Tests: `jobs.test.ts`
Mock `@/modules/jobs/jobs.service` and `@/utils/jwt` as in auth integration tests.

- Create: 201, 422 (invalid body), 401 (no auth)
- List: 200 with pagination meta
- Get: 200, 404
- Update: 200, 404
- Delete: 204, 404
- Status: 200, 422
- Favorite: 200, 404
