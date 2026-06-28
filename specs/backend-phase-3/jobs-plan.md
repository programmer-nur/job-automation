# Plan: Phase 3 — Jobs Module

## Step 1: Update Prisma Schema

Add `isFavorite` field to existing `Job` model:
```prisma
isFavorite    Boolean   @default(false) @map("is_favorite")
```
No new tables. No migration needed yet (will run `prisma generate` for type updates).

## Step 2: Create Jobs Module Files

All standard module files in `src/modules/jobs/`:

| File | Purpose |
|------|---------|
| `jobs.constants.ts` | Re-exported Prisma JobStatus enum, sortable fields list |
| `jobs.types.ts` | DTO interfaces: CreateJobInput, UpdateJobInput, JobResponse, JobListParams |
| `jobs.validation.ts` | Zod schemas for create, update, status change, favorite toggle, query params |
| `jobs.repository.ts` | Prisma queries: create, findById, findAll, update, softDelete, updateStatus, toggleFavorite, findByUrl |
| `jobs.service.ts` | Business logic: create (with duplicate check), list (with search/filter/sort/pagination), getById, update, delete, changeStatus, toggleFavorite — all scoped to userId |
| `jobs.controller.ts` | HTTP handlers: parse request → call service → format response |
| `jobs.routes.ts` | 7 endpoints, all behind `authenticate` middleware |
| `index.ts` | Barrel export of `jobRouter` |

## Step 3: Mount Routes in App

Add `app.use('/api/v1/jobs', authenticate, jobRouter);` in `app.ts`.

## Step 4: Write Tests

### Unit tests (4 files):
- `tests/unit/modules/jobs/jobs.validation.test.ts` — Zod schemas
- `tests/unit/modules/jobs/jobs.service.test.ts` — Business logic (mock Prisma)
- `tests/unit/modules/jobs/jobs.repository.test.ts` — Prisma query building (optional)

### Integration tests (1 file):
- `tests/integration/modules/jobs/jobs.test.ts` — HTTP pipeline (mock service + jwt)

## Step 5: Verify

Run: lint → typecheck → test → build → coverage. All must pass.

## Dependencies

- `@/common/errors`, `@/common/response`, `@/utils/pagination` — already exist
- `@/middleware/authenticate` — already exists
- `prisma` — already configured

## Rollback Strategy

1. Revert `app.ts` changes
2. Delete `src/modules/jobs/` directory
3. Revert Prisma schema
4. Delete test files
5. Run `prisma generate` if schema was changed
