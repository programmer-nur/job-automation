# Plan: Phase 4 — Applications Module

## Step 1: Update Prisma Schema

Add `followUpDate` to Application model. Run `prisma generate`.

## Step 2: Create Applications Module Files

All standard files in `src/modules/applications/`:

| File | Purpose |
|------|---------|
| `applications.constants.ts` | Sortable fields list, defaults |
| `applications.types.ts` | DTO interfaces: CreateApplicationInput, UpdateApplicationInput, ApplicationResponse, ApplicationListParams |
| `applications.validation.ts` | Zod schemas for create, update, status, follow-up, notes, query params |
| `applications.repository.ts` | Prisma queries: create, findById, findAll, count, update, softDelete |
| `applications.service.ts` | Business logic: create (verify job exists), list (filter/sort/paginate), getById, update, delete, changeStatus, scheduleFollowUp, updateNotes |
| `applications.controller.ts` | HTTP handlers |
| `applications.routes.ts` | 8 endpoints behind authenticate middleware |
| `index.ts` | Barrel export |

## Step 3: Mount Routes in App

Add `app.use('/api/v1/applications', authenticate, applicationRouter);` in `app.ts`.

## Step 4: Write Tests (TDD)

### Unit tests (2 files):
- `tests/unit/modules/applications/applications.validation.test.ts`
- `tests/unit/modules/applications/applications.service.test.ts`

### Integration tests (1 file):
- `tests/integration/modules/applications/applications.test.ts`

## Step 5: Verify

lint → typecheck → test → build → coverage. All must pass.

## Dependencies

- Jobs module (for job existence verification in create)
- authenticate middleware
- Existing utilities (errors, response, pagination)

## Rollback Strategy

1. Revert `app.ts` changes
2. Delete `src/modules/applications/`
3. Revert Prisma schema
4. Delete test files
