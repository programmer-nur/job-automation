# Spec: Phase 3 — Jobs Module

## Objective

Implement full job management: CRUD, search/filter/sort, status transitions, favorite toggling. Includes pagination, soft delete, and duplicate detection.

## API Endpoints

All prefixed with `/api/v1`.

| Method | Path                     | Auth Required | Description              |
| ------ | ------------------------ | ------------- | ------------------------ |
| POST   | `/api/v1/jobs`           | Yes           | Create a job             |
| GET    | `/api/v1/jobs`           | Yes           | List/search jobs         |
| GET    | `/api/v1/jobs/:id`       | Yes           | Get job by ID            |
| PATCH  | `/api/v1/jobs/:id`       | Yes           | Update a job             |
| DELETE | `/api/v1/jobs/:id`       | Yes           | Soft delete a job        |
| PATCH  | `/api/v1/jobs/:id/status`   | Yes        | Update job status        |
| PATCH  | `/api/v1/jobs/:id/favorite` | Yes        | Toggle favorite          |

## Request/Response Contracts

### POST `/api/v1/jobs`

**Body:**
```json
{
  "title": "Software Engineer",
  "company": "Google",
  "location": "Mountain View, CA",
  "description": "Join our cloud team...",
  "url": "https://careers.google.com/...",
  "salaryRange": "$150k - $200k",
  "jobType": "FULL_TIME",
  "source": "linkedin",
  "notes": "Talk to recruiter first"
}
```

**Validation rules:**
- `title`: required, 1-255 chars
- `company`: required, 1-255 chars
- `location`: optional, max 255
- `description`: optional, max 10000
- `url`: optional, valid URL, max 2048
- `salaryRange`: optional, max 100
- `jobType`: optional, max 100
- `source`: optional, max 100
- `notes`: optional, max 5000 — stored in `metadata` JSON field

**Response 201:**
```json
{
  "success": true,
  "message": "Job created",
  "data": {
    "id": "uuid",
    "title": "Software Engineer",
    "company": "Google",
    "location": "...",
    "description": "...",
    "url": "...",
    "salaryRange": "...",
    "jobType": "...",
    "source": "...",
    "status": "SAVED",
    "matchScore": null,
    "isFavorite": false,
    "notes": null,
    "appliedAt": null,
    "createdAt": "ISO",
    "updatedAt": "ISO"
  }
}
```

**Errors:** 422 (validation), 409 (duplicate — same url + user_id)

### GET `/api/v1/jobs`

**Query params:**
- `page` (default 1), `limit` (default 20, max 100)
- `status` — filter by JobStatus
- `company` — partial match (case-insensitive)
- `search` — full-text search across title, company, description
- `favorite` — boolean, filter favorites
- `sortBy` — `createdAt` (default), `title`, `company`, `status`, `matchScore`
- `sortOrder` — `asc` or `desc` (default)

**Response 200:**
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

### GET `/api/v1/jobs/:id`

**Response 200:** Single job object.
**Errors:** 404 (job not found)

### PATCH `/api/v1/jobs/:id`

**Body:** Partial job fields (same validation as create, all optional).
**Response 200:** Updated job object.
**Errors:** 404, 422

### DELETE `/api/v1/jobs/:id`

**Response 204:** No content. Soft deletes (sets `deletedAt`).
**Errors:** 404

### PATCH `/api/v1/jobs/:id/status`

**Body:**
```json
{ "status": "READY_TO_APPLY" }
```

**Validation:** Must be a valid `JobStatus` value.
**Response 200:** Updated job object.
**Errors:** 404, 422

### PATCH `/api/v1/jobs/:id/favorite`

**Body:**
```json
{ "isFavorite": true }
```

**Response 200:** Updated job object.
**Errors:** 404, 422

## Database Changes

Add `isFavorite` field to the existing `Job` model:

```prisma
model Job {
  // ... existing fields ...
  isFavorite    Boolean   @default(false) @map("is_favorite")
  // ... existing fields ...
}
```

No new tables. All queries use existing indexes on `userId`, `(userId, status)`, `(userId, company)`.

## Error Codes

Per `docs/API_SPECIFICATION.md`:

| Code     | Description     | HTTP Status |
| -------- | --------------- | ----------- |
| JOB_001  | Job not found   | 404         |
| JOB_002  | Duplicate job   | 409         |

## Module Structure

```
src/modules/jobs/
├── index.ts
├── jobs.routes.ts
├── jobs.controller.ts
├── jobs.service.ts
├── jobs.repository.ts
├── jobs.validation.ts
├── jobs.types.ts
├── jobs.constants.ts
```

## Existing Code Reuse

| File | Purpose |
|------|---------|
| `src/common/errors.ts` | AppError with factory methods (notFound, conflict, validation) |
| `src/common/response.ts` | success, error response helpers |
| `src/utils/pagination.ts` | getPaginationParams, getPaginationMeta |
| `src/middleware/authenticate.ts` | JWT auth guard |
| `src/middleware/authorize.ts` | Role-based access control |
| `prisma/schema.prisma` | Job model (already exists with all needed fields) |

## What's NOT Included (deferred)

- Job import (CSV, LinkedIn URL, Career Page)
- AI job parsing (skills extraction)
- AI match scoring
- Job attachments/files
- Trello/Sheets sync
- Application linking (handled in separate Applications module)
