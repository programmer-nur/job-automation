# Plan: Phase 8 — AI Integration Module

## Steps

### Step 1: Create AI Client
- `ai.types.ts` — input/output types for each AI operation
- `ai.client.ts` — `AIClient` interface + `MockAIProvider` implementation

### Step 2: Create Standard Module Files
- `ai.repository.ts` — AIRequest CRUD (create, findById, findMany, count)
- `ai.validation.ts` — 6 Zod schemas
- `ai.service.ts` — validates input, invokes client, logs request/response
- `ai.controller.ts` — HTTP handlers
- `ai.routes.ts` — 6 routes
- `index.ts` — barrel

### Step 3: Unit Tests
- `ai.validation.test.ts` — 18 tests (3 per schema)
- `ai.service.test.ts` — 18 tests (success + error per operation)

### Step 4: Integration Tests
- `ai.test.ts` — 14 tests (201/422 for each + 401)

### Step 5: Mount in app.ts

### Step 6: Verify
lint → typecheck → test → build → coverage

## Dependencies
- authenticate middleware
- AIRequest table (already exists in Prisma)
- Job repository (for job verification)
- Resume repository (for resume verification)
