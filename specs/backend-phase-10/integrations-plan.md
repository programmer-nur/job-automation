# Plan: Phase 10 — Integrations Module

## Steps

### Step 1: Prisma Schema Update
- Add `trelloCardId` (String?) and `sheetRowId` (String?) to Job model
- Add `UserSetting` model
- Add `Integration` model

### Step 2: Migration + Generate Client

### Step 3: Types
- `integrations.types.ts` — operation types, result types

### Step 4: Client Interface + Mock
- `integrations.client.ts` — `IntegrationClient` interface + `MockIntegrationProvider`

### Step 5: Mock Queue
- `integrations.queue.ts` — `MockQueue` that executes jobs immediately (placeholder for BullMQ)

### Step 6: Service
- `integrations.service.ts` — orchestrates sync, uses client + queue

### Step 7: Controller + Routes
- 7 endpoints across two routers

### Step 8: Mount in app.ts

### Step 9: Tests
- Unit: service tests
- Integration: route tests

### Step 10: Verify
lint → typecheck → test → build → coverage
