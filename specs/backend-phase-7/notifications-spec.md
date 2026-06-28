# Spec: Notifications Module

## Purpose
Manage in-app notifications — create, list, mark as read individually or bulk.

## Prisma Model (`Notification`)

| Field     | Type      | Notes                     |
|-----------|-----------|---------------------------|
| id        | UUID      | PK                        |
| userId    | UUID      | FK → users                |
| title     | String    | Notification title        |
| message   | String    | Notification body         |
| type      | String    | e.g. reminder, task_due   |
| isRead    | Boolean   | Default false             |
| createdAt | DateTime  |                           |
| updatedAt | DateTime  |                           |

## Endpoints

| Method | Path                          | Description                |
|--------|-------------------------------|----------------------------|
| POST   | /notifications                | Create notification        |
| GET    | /notifications                | List (paginated, filter)   |
| GET    | /notifications/:id            | Get by ID                  |
| PATCH  | /notifications/:id/read       | Mark single as read        |
| PATCH  | /notifications/read-all       | Mark all as read           |

## Validation Rules

- Create: title (required, max 255), message (required, max 5000), type (required, max 50)
- Query: page, limit, isRead filter

## Error Codes

| Code           | Description               |
|----------------|---------------------------|
| NOTIF_001      | Notification not found    |

## Module Structure

```
modules/notifications/
├── notifications.constants.ts
├── notifications.types.ts
├── notifications.validation.ts
├── notifications.repository.ts
├── notifications.service.ts
├── notifications.controller.ts
├── notifications.routes.ts
└── index.ts
```
