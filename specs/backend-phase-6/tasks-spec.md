# Spec: Tasks Module

## Purpose
Manage follow-up tasks, reminders, and workflow items — create, list, update, complete, soft-delete.

## Prisma Model (`Task`)

| Field         | Type      | Notes                       |
|---------------|-----------|-----------------------------|
| id            | UUID      | PK                          |
| userId        | UUID      | FK → users                  |
| jobId         | UUID?     | FK → jobs (optional)        |
| applicationId | UUID?     | FK → applications (optional)|
| title         | String    | Required task title         |
| description   | String?   | Optional details            |
| dueDate       | DateTime? | Optional deadline            |
| completedAt   | DateTime? | Set when marked complete    |
| createdAt     | DateTime  |                             |
| updatedAt     | DateTime  |                             |
| deletedAt     | DateTime? | Soft delete                 |

## Endpoints

| Method | Path                    | Description             |
|--------|-------------------------|-------------------------|
| POST   | /tasks                  | Create task             |
| GET    | /tasks                  | List tasks (filterable) |
| GET    | /tasks/:id              | Get by ID               |
| PATCH  | /tasks/:id              | Update task             |
| DELETE | /tasks/:id              | Soft delete             |
| PATCH  | /tasks/:id/complete     | Mark as complete        |
| PATCH  | /tasks/:id/incomplete   | Mark as incomplete      |

## Validation Rules

- Create: title (required, max 500), description (max 5000, optional), dueDate (ISO datetime, optional), jobId (UUID, optional), applicationId (UUID, optional)
- Update: title (max 500, optional), description (max 5000, optional), dueDate (ISO datetime, optional)
- Query: page, limit, status (pending/completed), jobId, applicationId, sortBy, sortOrder

## Error Codes

| Code     | Description          |
|----------|----------------------|
| TASK_001 | Task not found       |

## Module Structure

```
modules/tasks/
├── tasks.constants.ts
├── tasks.types.ts
├── tasks.validation.ts
├── tasks.repository.ts
├── tasks.service.ts
├── tasks.controller.ts
├── tasks.routes.ts
└── index.ts
```
