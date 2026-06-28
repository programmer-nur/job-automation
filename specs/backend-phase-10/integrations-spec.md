# Spec: Integrations Module

## Purpose
Synchronize job/application data with Google Sheets (reporting) and Trello (task management). All sync operations use a mock external API provider — no real Google/Trello API calls. No real Redis/BullMQ — queue is mocked.

## Prisma Changes

### New Models

**UserSetting** — per-user preferences
| Field              | Type    | Notes                        |
| ------------------ | ------- | ---------------------------- |
| id                 | UUID    | PK                           |
| userId             | UUID    | FK → User, unique            |
| theme              | String? | light/dark                   |
| timezone           | String? |                              |
| language           | String? |                              |
| defaultResumeId    | String? | FK → ResumeVersion           |
| emailNotifications | Boolean | default true                 |
| trelloEnabled      | Boolean | default false                |
| googleSyncEnabled  | Boolean | default false                |
| createdAt          | DateTime|                              |
| updatedAt          | DateTime|                              |

**Integration** — tracks each integration's config per user
| Field       | Type    | Notes                               |
| ----------- | ------- | ----------------------------------- |
| id          | UUID    | PK                                  |
| userId      | UUID    | FK → User                           |
| type        | String  | "google_sheets" or "trello"         |
| status      | String  | "connected", "disconnected", "error"|
| config      | Json?   | Provider-specific config (sheet ID, board ID, etc.) |
| lastSyncAt  | DateTime? |                                    |
| lastSyncStatus | String? | "success", "failed"               |
| lastSyncMessage | String? |                                     |
| createdAt   | DateTime |                                    |
| updatedAt   | DateTime |                                    |

### Existing Model Changes

**Job** — add two fields
| Field         | Type     | Notes            |
| ------------- | -------- | ---------------- |
| trelloCardId  | String?  | Trello card ref  |
| sheetRowId    | String?  | Sheets row ref   |

## Endpoints

### Google Sheets (base: /api/v1/google-sheets)
| Method | Path             | Description         | Auth |
|--------|------------------|---------------------|------|
| POST   | /sync            | Sync all data       | JWT  |
| POST   | /jobs/:id        | Sync single job     | JWT  |
| GET    | /export          | Get export data     | JWT  |

### Trello (base: /api/v1/trello)
| Method | Path             | Description         | Auth |
|--------|------------------|---------------------|------|
| POST   | /sync            | Sync all jobs to cards | JWT  |
| POST   | /cards           | Create card for job | JWT  |
| PATCH  | /cards/:cardId   | Move card (status)  | JWT  |
| DELETE | /cards/:cardId   | Delete card         | JWT  |

## Module Structure
```
modules/integrations/
├── integrations.types.ts     — Interfaces, DTOs
├── integrations.service.ts   — Business logic
├── integrations.controller.ts — Thin HTTP handlers
├── integrations.routes.ts    — Route definitions
├── integrations.client.ts    — Provider interface + mock
├── integrations.queue.ts     — Mock queue (placeholder for BullMQ)
└── index.ts                  — Barrel exports
```

## Implementation Approach
- `MockIntegrationProvider` returns deterministic success for all operations
- No real Redis/BullMQ — queue is a facade that executes synchronously
- Env vars `GOOGLE_SHEET_ID`, `TRELLO_API_KEY`, `TRELLO_TOKEN` defined but unused by mock
