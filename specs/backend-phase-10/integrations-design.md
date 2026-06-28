# Design: Phase 10 — Integrations Module

## Architecture

```
Controller → Service → IntegrationClient (interface)
                        ├── MockIntegrationProvider
                        └── [future] GoogleSheetsProvider / TrelloProvider

Service → Queue (facade)
          └── MockQueue (synchronous, placeholder for BullMQ)
```

## Data Flow

### Google Sheets Sync
```
POST /api/v1/google-sheets/sync
  → controller.getSyncParams(req)
  → service.syncGoogleSheets(userId)
    → queue.add('google-sheets-sync', { userId })
      → MockQueue.execute(worker)
        → client.syncToSheet(userId, data)
  → return { message, timestamp }
```

### Trello Create Card
```
POST /api/v1/trello/cards { jobId }
  → controller.getCreateCardParams(req)
  → service.createCard(userId, jobId)
    → validate job exists + belongs to user
    → client.createCard(job.title, list)
    → update job.trelloCardId
  → return { cardId, url }
```

## Sync Behavior (Mock)
- Google Sheets sync: iterate all user's non-deleted jobs + applications, pass to mock
- Trello sync: iterate all user's non-deleted jobs, create/update cards via mock
- Single job sync (Google Sheets): update one row

## Error Handling
- Job not found → 404
- Integration not configured → 400 (if toggle disabled)
- Sync failure tracked in `Integration.lastSyncStatus`

## File Structure
```
modules/integrations/
├── integrations.types.ts
├── integrations.service.ts
├── integrations.controller.ts
├── integrations.routes.ts
├── integrations.client.ts
├── integrations.queue.ts
└── index.ts
```

## Test Plan
- **Unit service tests (6)**: sync sheets, sync sheets single job, export, sync trello, create card, move card, delete card
- **Integration tests (14)**: 200 + 401 per endpoint, plus 404/400 for edge cases
