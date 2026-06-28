# Plan: Phase 9 — Dashboard Module

## Steps

### Step 1: Module Files (5 files — no validation or repository needed)
- `dashboard.types.ts`
- `dashboard.service.ts`
- `dashboard.controller.ts`
- `dashboard.routes.ts`
- `index.ts`

### Step 2: Unit Tests
- `dashboard.service.test.ts` — 4 tests (one per endpoint)

### Step 3: Integration Tests
- `dashboard.test.ts` — 6 tests (200 + 401 per endpoint)

### Step 4: Mount in app.ts

### Step 5: Verify
lint → typecheck → test → build → coverage

## Dependencies
- authenticate middleware
- Existing Prisma models (Job, Application, Task, Notification, ResumeVersion)
