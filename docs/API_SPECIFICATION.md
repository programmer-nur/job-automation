# API Specification

> **AI Job Application Management Platform**

**Version:** v1

**Protocol:** REST API

**Format:** JSON

**Authentication:** JWT (Bearer Token)

**Base URL**

```
Production
https://api.example.com/api/v1

Development
http://localhost:5000/api/v1
```

---

# 1. API Design Principles

The API follows RESTful principles.

## Standards

- Resource-oriented URLs
- Stateless requests
- JSON request/response
- Consistent error format
- Cursor pagination
- Versioned endpoints
- JWT authentication

---

# 2. Authentication

Protected endpoints require:

```
Authorization: Bearer <access_token>
```

Access tokens are short-lived.

Refresh tokens are used to obtain new access tokens.

---

# 3. Response Format

## Success

```json
{
  "success": true,
  "message": "Job created successfully.",
  "data": {}
}
```

---

## Error

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    {
      "field": "company",
      "message": "Company is required."
    }
  ]
}
```

---

# 4. HTTP Status Codes

| Code | Meaning               |
| ---- | --------------------- |
| 200  | Success               |
| 201  | Created               |
| 204  | No Content            |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 409  | Conflict              |
| 422  | Validation Error      |
| 429  | Too Many Requests     |
| 500  | Internal Server Error |

---

# 5. Pagination

Request

```
GET /jobs?page=1&limit=20
```

Response

```json
{
  "success": true,
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 126,
    "totalPages": 7
  },
  "data": []
}
```

---

# 6. Filtering

Example

```
GET /jobs?status=READY_TO_APPLY

GET /jobs?company=Google

GET /jobs?scoreMin=80

GET /jobs?priority=HIGH
```

---

# 7. Sorting

```
GET /jobs?sortBy=createdAt

GET /jobs?sortOrder=desc
```

---

# 8. Authentication Module

## Register

```
POST /auth/register
```

Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!"
}
```

Response

```
201 Created
```

---

## Login

```
POST /auth/login
```

Response

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {}
}
```

---

## Refresh Token

```
POST /auth/refresh-token
```

---

## Logout

```
POST /auth/logout
```

---

## Get Profile

```
GET /auth/me
```

---

## Change Password

```
PATCH /auth/change-password
```

---

# 9. Jobs Module

Base Route

```
/jobs
```

---

## Create Job

```
POST /jobs
```

---

## Import Job

```
POST /jobs/import
```

Supports

- Manual
- CSV
- LinkedIn URL
- Career Page URL

---

## Get Jobs

```
GET /jobs
```

Supports

- Search
- Filter
- Pagination
- Sorting

---

## Get Job

```
GET /jobs/:id
```

---

## Update Job

```
PATCH /jobs/:id
```

---

## Delete Job

```
DELETE /jobs/:id
```

Soft delete.

---

## Favorite Job

```
PATCH /jobs/:id/favorite
```

---

## Update Status

```
PATCH /jobs/:id/status
```

Body

```json
{
  "status": "APPLIED"
}
```

---

## AI Match Score

```
POST /jobs/:id/score
```

Returns

```json
{
  "score": 87
}
```

---

## Parse Job Description

```
POST /jobs/:id/parse
```

---

# 10. Applications Module

Base Route

```
/applications
```

---

## Create Application

```
POST /applications
```

---

## Get Applications

```
GET /applications
```

---

## Get Application

```
GET /applications/:id
```

---

## Update Application

```
PATCH /applications/:id
```

---

## Delete Application

```
DELETE /applications/:id
```

---

## Update Status

```
PATCH /applications/:id/status
```

---

## Schedule Follow-up

```
PATCH /applications/:id/follow-up
```

---

## Add Notes

```
PATCH /applications/:id/notes
```

---

# 11. Resume Module

Base Route

```
/resumes
```

---

## Upload Resume

```
POST /resumes
```

Multipart form-data.

---

## Get Resume Versions

```
GET /resumes
```

---

## Get Resume

```
GET /resumes/:id
```

---

## Update Resume

```
PATCH /resumes/:id
```

---

## Delete Resume

```
DELETE /resumes/:id
```

---

## Set Default Resume

```
PATCH /resumes/:id/default
```

---

## Tailor Resume

```
POST /resumes/:id/tailor
```

Body

```json
{
  "jobId": "uuid"
}
```

---

# 12. Cover Letter Module

Base Route

```
/cover-letters
```

---

## Generate Cover Letter

```
POST /cover-letters/generate
```

---

## Get Cover Letter

```
GET /cover-letters/:id
```

---

## Update Cover Letter

```
PATCH /cover-letters/:id
```

---

## Delete Cover Letter

```
DELETE /cover-letters/:id
```

---

# 13. AI Module

Base Route

```
/ai
```

---

## Parse Job

```
POST /ai/parse-job
```

---

## Score Job

```
POST /ai/score-job
```

---

## Tailor Resume

```
POST /ai/tailor-resume
```

---

## Generate Cover Letter

```
POST /ai/generate-cover-letter
```

---

## Detect Skill Gap

```
POST /ai/skill-gap
```

---

## Interview Preparation

```
POST /ai/interview-prep
```

---

# 14. Tasks Module

Base Route

```
/tasks
```

---

## Create Task

```
POST /tasks
```

---

## Get Tasks

```
GET /tasks
```

---

## Update Task

```
PATCH /tasks/:id
```

---

## Complete Task

```
PATCH /tasks/:id/complete
```

---

## Delete Task

```
DELETE /tasks/:id
```

---

# 15. Notifications

Base Route

```
/notifications
```

---

## Get Notifications

```
GET /notifications
```

---

## Mark as Read

```
PATCH /notifications/:id/read
```

---

## Mark All Read

```
PATCH /notifications/read-all
```

---

# 16. Dashboard

Base Route

```
/dashboard
```

---

## Summary

```
GET /dashboard/summary
```

Returns

- Total Jobs
- Applications
- Interviews
- Offers
- Rejections

---

## Monthly Analytics

```
GET /dashboard/monthly
```

---

## Match Score Analytics

```
GET /dashboard/match-scores
```

---

## Application Sources

```
GET /dashboard/sources
```

---

# 17. Google Sheets

Base Route

```
/google-sheets
```

---

## Sync

```
POST /google-sheets/sync
```

---

## Sync Job

```
POST /google-sheets/jobs/:id
```

---

## Export

```
GET /google-sheets/export
```

---

# 18. Trello

Base Route

```
/trello
```

---

## Sync

```
POST /trello/sync
```

---

## Create Card

```
POST /trello/cards
```

---

## Move Card

```
PATCH /trello/cards/:id
```

---

## Delete Card

```
DELETE /trello/cards/:id
```

---

# 19. Scheduler

Base Route

```
/scheduler
```

---

## Trigger Job

```
POST /scheduler/run
```

---

## Retry Failed Jobs

```
POST /scheduler/retry
```

---

## Queue Status

```
GET /scheduler/status
```

---

# 20. Admin

Base Route

```
/admin
```

---

## Users

```
GET /admin/users
```

---

## Jobs

```
GET /admin/jobs
```

---

## AI Usage

```
GET /admin/ai
```

---

## Audit Logs

```
GET /admin/audit-logs
```

---

# 21. Health Check

```
GET /health
```

Response

```json
{
  "status": "ok",
  "database": "connected",
  "redis": "connected",
  "queue": "healthy",
  "timestamp": "2026-06-27T10:00:00Z"
}
```

---

# 22. Error Codes

| Code       | Description               |
| ---------- | ------------------------- |
| AUTH_001   | Invalid credentials       |
| AUTH_002   | Token expired             |
| AUTH_003   | Unauthorized              |
| JOB_001    | Job not found             |
| JOB_002    | Duplicate job             |
| APP_001    | Application not found     |
| RESUME_001 | Resume not found          |
| AI_001     | AI provider unavailable   |
| QUEUE_001  | Queue failure             |
| SYNC_001   | Google Sheets sync failed |
| SYNC_002   | Trello sync failed        |

---

# 23. Rate Limiting

| Endpoint       | Limit               |
| -------------- | ------------------- |
| Authentication | 10 requests/minute  |
| AI Endpoints   | 30 requests/minute  |
| General API    | 100 requests/minute |
| Admin API      | 200 requests/minute |

---

# 24. API Versioning

```
/api/v1
```

Future versions

```
/api/v2
/api/v3
```

Breaking changes require a new API version.

---

# 25. Security

- HTTPS only
- JWT authentication
- Refresh token rotation
- Role-based authorization
- Request validation (Zod)
- Helmet security headers
- CORS protection
- Rate limiting
- Input sanitization
- Audit logging

---

# 26. Future APIs

Planned endpoints include:

- `/linkedin`
- `/github`
- `/companies`
- `/interviews`
- `/salary-insights`
- `/career-coach`
- `/learning`
- `/browser-extension`
- `/webhooks`
- `/organizations`
- `/teams`

These will follow the same REST conventions and versioning strategy to maintain a consistent developer experience.
