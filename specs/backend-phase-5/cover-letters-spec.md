# Spec: Cover Letters Module

## Purpose
Manage AI-generated cover letters — create, list, get, update, soft-delete, and AI generation scaffolding.

## Prisma Model (`CoverLetter`)

| Field     | Type     | Notes                      |
|-----------|----------|----------------------------|
| id        | UUID     | PK                         |
| userId    | UUID     | FK → users                 |
| jobId     | UUID?    | FK → jobs (nullable)       |
| content   | String   | Cover letter text          |
| tone      | String?  | professional, casual, etc. |
| createdAt | DateTime |                            |
| updatedAt | DateTime |                            |
| deletedAt | DateTime?| Soft delete                |

## Endpoints

| Method | Path                          | Description                |
|--------|-------------------------------|----------------------------|
| POST   | /cover-letters                | Create cover letter        |
| GET    | /cover-letters                | List cover letters         |
| GET    | /cover-letters/:id            | Get by ID                  |
| PATCH  | /cover-letters/:id            | Update content/tone        |
| DELETE | /cover-letters/:id            | Soft delete                |
| POST   | /cover-letters/generate       | AI generate (scaffolding)  |

## Validation Rules

- Create: jobId (UUID, optional), content (required, max 50000), tone (max 50, optional)
- Update: content (max 50000, optional), tone (max 50, optional)
- Generate: jobId (UUID, required), tone (max 50, optional) — returns 501 Not Implemented
- Query: page, limit

## Error Codes

| Code          | Description                  |
|---------------|------------------------------|
| COVER_001     | Cover letter not found       |

## Module Files

```
modules/cover-letters/
├── cover-letters.constants.ts
├── cover-letters.types.ts
├── cover-letters.validation.ts
├── cover-letters.repository.ts
├── cover-letters.service.ts
├── cover-letters.controller.ts
├── cover-letters.routes.ts
└── index.ts
```
