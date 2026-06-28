# Plan: Phase 6 — Tasks Module

## Steps

### Step 1: Module Files
Create `src/modules/tasks/` with 8 standard files.

### Step 2: Unit Tests
- `tasks.validation.test.ts` — 14 tests
- `tasks.service.test.ts` — 18 tests

### Step 3: Integration Tests
- `tasks.test.ts` — 12 tests

### Step 4: Mount in app.ts

### Step 5: Verify
lint → typecheck → test → build → coverage

## Dependencies
- authenticate middleware
- Existing utilities (errors, response, pagination)

## Rollback
1. Revert app.ts mount
2. Delete `src/modules/tasks/`
3. Delete test files
