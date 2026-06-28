# Spec: Admin Module

## Purpose
Admin-only read endpoints for system oversight — users, jobs, AI usage, audit logs.

## Endpoints

| Method | Path             | Description            | Auth          |
|--------|------------------|------------------------|---------------|
| GET    | /admin/users     | List all users         | JWT + ADMIN   |
| GET    | /admin/jobs      | List all jobs          | JWT + ADMIN   |
| GET    | /admin/ai        | AI usage statistics    | JWT + ADMIN   |
| GET    | /admin/audit-logs| Audit log entries      | JWT + ADMIN   |

All endpoints support pagination via `?page=1&limit=20`.

## Response Shapes

### GET /admin/users
```json
{
  "data": [{ "id": "...", "email": "...", "name": "...", "role": "...", "jobCount": 5, "createdAt": "..." }],
  "meta": { "page": 1, "limit": 20, "total": 10, "totalPages": 1 }
}
```

### GET /admin/jobs
```json
{
  "data": [{ "id": "...", "userId": "...", "userEmail": "...", "title": "...", "company": "...", "status": "...", "createdAt": "..." }],
  "meta": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

### GET /admin/ai
```json
{
  "data": { "totalRequests": 150, "successRate": 94.0, "byType": { "parse-job": 50, "score-job": 40 }, "recentRequests": [...] },
  "meta": { "page": 1, "limit": 20, "total": 150, "totalPages": 8 }
}
```

### GET /admin/audit-logs
```json
{
  "data": [{ "id": "...", "userId": "...", "action": "...", "entity": "...", "createdAt": "..." }],
  "meta": { "page": 1, "limit": 20, "total": 500, "totalPages": 25 }
}
```

## Module Structure
```
modules/admin/
├── admin.service.ts
├── admin.controller.ts
├── admin.routes.ts
└── index.ts
```

No validation needed — only query params for pagination.
