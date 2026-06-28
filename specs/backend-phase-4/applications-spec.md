# Spec: Phase 4 — Applications Module

## Objective

Implement full application tracking: CRUD, status transitions, follow-up scheduling, notes management, search/filter/sort, pagination, soft delete.

## Dependencies

- **Phase 2 (Auth):** authenticate middleware, req.user
- **Phase 3 (Jobs):** Job model, job lookup for application creation

## API Endpoints

All prefixed with `/api/v1`.

| Method | Path                            | Auth Required | Description              |
| ------ | ------------------------------- | ------------- | ------------------------ |
| POST   | `/api/v1/applications`          | Yes           | Create application       |
| GET    | `/api/v1/applications`          | Yes           | List/search applications |
| GET    | `/api/v1/applications/:id`      | Yes           | Get application by ID    |
| PATCH  | `/api/v1/applications/:id`      | Yes           | Update application       |
| DELETE | `/api/v1/applications/:id`      | Yes           | Soft delete              |
| PATCH  | `/api/v1/applications/:id/status`  | Yes        | Update status            |
| PATCH  | `/api/v1/applications/:id/follow-up` | Yes       | Schedule follow-up date  |
| PATCH  | `/api/v1/applications/:id/notes`    | Yes        | Update notes             |

## Request/Response Contracts

### POST `/api/v1/applications`

**Body:**
```json
{
  "jobId": "uuid",
  "notes": "Initial thoughts"
}
```

**Validation:**
- `jobId`: required, valid UUID
- `notes`: optional, max 5000

**Response 201:**
```json
{
  "success": true,
  "message": "Application created",
  "data": {
    "id": "uuid",
    "jobId": "uuid",
    "status": "DRAFT",
    "notes": null,
    "submittedAt": null,
    "followUpDate": null,
    "createdAt": "ISO",
    "updatedAt": "ISO"
  }
}
```

**Errors:** 404 (job not found), 422 (validation)

### GET `/api/v1/applications`

**Query params:**
- `page` (default 1), `limit` (default 20, max 100)
- `status` — filter by ApplicationStatus
- `jobId` — filter by job
- `sortBy` — `createdAt` (default), `status`, `submittedAt`
- `sortOrder` — `asc` or `desc` (default)

**Response 200:**
```json
{
  "success": true,
  "data": [ ... ],
  "meta": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
}
```

### GET `/api/v1/applications/:id`

**Response 200:** Single application object.
**Errors:** 404

### PATCH `/api/v1/applications/:id`

**Body:** Any subset of application fields (all optional).
**Response 200:** Updated application object.
**Errors:** 404, 422

### DELETE `/api/v1/applications/:id`

**Response 204:** No content. Soft deletes.
**Errors:** 404

### PATCH `/api/v1/applications/:id/status`

**Body:**
```json
{ "status": "SUBMITTED" }
```

**Validation:** Must be valid `ApplicationStatus` value.
**Response 200:** Updated application object.
**Errors:** 404, 422

### PATCH `/api/v1/applications/:id/follow-up`

**Body:**
```json
{ "followUpDate": "2026-07-15T10:00:00Z" }
```

**Validation:** `followUpDate` must be a valid ISO date string.
**Response 200:** Updated application object.
**Errors:** 404, 422

### PATCH `/api/v1/applications/:id/notes`

**Body:**
```json
{ "notes": "Spoke with recruiter, they asked for updated resume" }
```

**Validation:** `notes` optional, max 5000.
**Response 200:** Updated application object.
**Errors:** 404

## Database Changes

Add `followUpDate` field to existing `Application` model:

```prisma
model Application {
  // ... existing fields ...
  followUpDate  DateTime?           @map("follow_up_date")
  // ... existing fields ...
}
```

No new tables. All queries use existing indexes.

## Error Codes

| Code     | Description               | HTTP Status |
| -------- | ------------------------- | ----------- |
| APP_001  | Application not found     | 404         |

## Module Structure

```
src/modules/applications/
├── index.ts
├── applications.routes.ts
├── applications.controller.ts
├── applications.service.ts
├── applications.repository.ts
├── applications.validation.ts
├── applications.types.ts
├── applications.constants.ts
```

## Existing Code Reuse

| File | Purpose |
|------|---------|
| `src/common/errors.ts` | AppError factory methods |
| `src/common/response.ts` | success, error helpers |
| `src/utils/pagination.ts` | getPaginationParams, getPaginationMeta |
| `src/middleware/authenticate.ts` | JWT auth guard |
| `prisma/schema.prisma` | Application model (update with followUpDate) |

## What's NOT Included (deferred)

- Resume/Cover letter linking (handled in separate modules)
- Automated follow-up reminders (scheduler/notifications)
- Status change audit logging
- Application attachments
- Interview scheduling (calendar integration)
