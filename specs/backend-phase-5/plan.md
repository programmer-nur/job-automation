# Plan: Phase 5 — Resumes + Cover Letters

## Steps

### Step 1: Resume Module
1. Create `src/modules/resumes/` with 8 files
2. Follow standard module structure (constants, types, validation, repository, service, controller, routes, index)
3. Write unit tests (validation + service) and integration tests
4. Mount in app.ts

### Step 2: Cover Letters Module
1. Create `src/modules/cover-letters/` with 8 files
2. Follow standard module structure
3. Write unit tests (validation + service) and integration tests
4. Mount in app.ts

### Step 3: Verify
lint → typecheck → test → build → coverage

## Dependencies
- authenticate middleware
- Job repository (for tailor/generate job verification)
- Existing utilities (errors, response, pagination)

## Rollback
1. Revert app.ts mounts
2. Delete `src/modules/resumes/` and `src/modules/cover-letters/`
3. Delete test files
