# Spec: Resumes Module

## Purpose
Manage resume versions — create, list, get, update, soft-delete, set active, and AI tailoring scaffolding.

## Prisma Model (`ResumeVersion`)

| Field      | Type     | Notes                      |
|------------|----------|----------------------------|
| id         | UUID     | PK                         |
| userId     | UUID     | FK → users                 |
| version    | Int      | Auto-increment per user    |
| title      | String?  | e.g. "Frontend Resume"     |
| content    | String   | Full resume text           |
| fileUrl    | String?  | Uploaded file URL          |
| matchScore | Int?     | AI match score             |
| isActive   | Boolean  | Only one active per user   |
| createdAt  | DateTime |                            |
| updatedAt  | DateTime |                            |
| deletedAt  | DateTime?| Soft delete                |

## Endpoints

| Method | Path                    | Description             |
|--------|-------------------------|-------------------------|
| POST   | /resumes                | Create resume version   |
| GET    | /resumes                | List versions           |
| GET    | /resumes/:id            | Get by ID               |
| PATCH  | /resumes/:id            | Update title/content    |
| DELETE | /resumes/:id            | Soft delete             |
| PATCH  | /resumes/:id/active     | Set as active version   |
| POST   | /resumes/:id/tailor     | AI tailor (scaffolding) |

## Validation Rules

- Create: title (max 255, optional), content (required, max 50000), fileUrl (url, optional)
- Update: title (max 255, optional), content (max 50000, optional), fileUrl (url, optional)
- Tailor: jobId (UUID, required) — returns 501 Not Implemented
- Query: page, limit, isActive

## Error Codes

| Code       | Description               |
|------------|---------------------------|
| RESUME_001 | Resume not found          |

## Module Files

```
modules/resumes/
├── resumes.constants.ts
├── resumes.types.ts
├── resumes.validation.ts
├── resumes.repository.ts
├── resumes.service.ts
├── resumes.controller.ts
├── resumes.routes.ts
└── index.ts
```
