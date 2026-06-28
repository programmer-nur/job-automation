# Spec: Dashboard Module

## Purpose
Aggregate analytics across jobs, applications, and tasks — summary stats, monthly trends, match score distribution, and application sources.

## Endpoints

| Method | Path                       | Description                |
|--------|----------------------------|----------------------------|
| GET    | /dashboard/summary          | Aggregate counts           |
| GET    | /dashboard/monthly          | Monthly application trends |
| GET    | /dashboard/match-scores     | Match score distribution   |
| GET    | /dashboard/sources          | Application source stats   |

## Response Shapes

### GET /dashboard/summary
```json
{
  "totalJobs": 42,
  "totalApplications": 18,
  "activeApplications": 12,
  "interviews": 3,
  "offers": 1,
  "rejections": 4,
  "pendingTasks": 5,
  "unreadNotifications": 2,
  "activeResumes": 1
}
```

### GET /dashboard/monthly
```json
{
  "monthly": [
    { "month": "2026-01", "applications": 3, "interviews": 1, "offers": 0 },
    { "month": "2026-02", "applications": 5, "interviews": 2, "offers": 1 }
  ]
}
```

### GET /dashboard/match-scores
```json
{
  "scores": [
    { "range": "0-20", "count": 1 },
    { "range": "21-40", "count": 2 },
    { "range": "41-60", "count": 5 },
    { "range": "61-80", "count": 8 },
    { "range": "81-100", "count": 4 }
  ]
}
```

### GET /dashboard/sources
```json
{
  "sources": [
    { "source": "LinkedIn", "count": 10 },
    { "source": "Indeed", "count": 5 },
    { "source": "Company Website", "count": 3 }
  ]
}
```

## Module Structure

```
modules/dashboard/
├── dashboard.types.ts
├── dashboard.service.ts
├── dashboard.controller.ts
├── dashboard.routes.ts
└── index.ts
```

No repository layer needed — service uses existing repositories and Prisma directly. No validation needed (no request body).
