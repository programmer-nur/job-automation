# Design: Phase 7 — Notifications Module

## Architecture

Standard modular monolith: HTTP → authenticate → controller → service → repository → Prisma

## Service Logic

| Method | Logic |
|--------|-------|
| `create(userId, input)` | Create notification → return |
| `list(userId, params)` | Filter by isRead → paginate → return |
| `getById(userId, id)` | Find → notFound → return |
| `markAsRead(userId, id)` | Find → set `isRead = true` → return |
| `markAllAsRead(userId)` | `updateMany` where `isRead = false` |

## Filtering

- `?isRead=true` — show only read notifications
- `?isRead=false` — show only unread notifications
- no filter — show all (default newest first)

## Error Scenarios

| Scenario | Error | Status |
|----------|-------|--------|
| Notification not found | AppError.notFound('Notification') | 404 |
| Missing auth | authenticate | 401 |

## Test Plan

### Validation Tests (10)
- Create: valid, missing title, missing message, title too long
- Query: defaults, isRead filter

### Service Tests (14)
- create: success
- list: default, filtered by isRead
- getById: found, not found
- markAsRead: success, not found, already read
- markAllAsRead: updates matching records

### Integration Tests (10)
- Create: 201, 422, 401
- List: 200
- Get: 200, 404
- Mark read: 200
- Mark all read: 200
