# Plan: Phase 11 — Admin Module

## Steps

### Step 1: Types (inline in service, nothing complex needed)

### Step 2: Tests
- **Unit service tests (8)**: 2 per endpoint (success + edge case)
- **Integration tests (8)**: 200 + 401 + 403 per endpoint

### Step 3: Service
- `admin.service.ts` — 4 query methods, all with pagination

### Step 4: Controller
- `admin.controller.ts` — thin handlers, all JWT + ADMIN protected

### Step 5: Routes
- `admin.routes.ts` — authenticate + authorize('ADMIN')

### Step 6: Mount in app.ts

### Step 7: Verify
lint → typecheck → test → build → coverage
