import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const mockSyncGoogleSheets = vi.fn();
const mockSyncGoogleSheetsJob = vi.fn();
const mockExportGoogleSheets = vi.fn();
const mockSyncTrello = vi.fn();
const mockCreateTrelloCard = vi.fn();
const mockMoveTrelloCard = vi.fn();
const mockDeleteTrelloCard = vi.fn();

vi.mock('@/modules/integrations/integrations.service', () => ({
  integrationService: {
    syncGoogleSheets: mockSyncGoogleSheets,
    syncGoogleSheetsJob: mockSyncGoogleSheetsJob,
    exportGoogleSheets: mockExportGoogleSheets,
    syncTrello: mockSyncTrello,
    createTrelloCard: mockCreateTrelloCard,
    moveTrelloCard: mockMoveTrelloCard,
    deleteTrelloCard: mockDeleteTrelloCard,
  },
}));

const mockVerifyAccessToken = vi.hoisted(() => vi.fn());

vi.mock('@/utils/jwt', () => ({
  verifyAccessToken: mockVerifyAccessToken,
}));

let app: Express;

const mockSyncResult = {
  success: true,
  message: 'Sync completed',
  timestamp: new Date().toISOString(),
  details: { jobsSynced: 1, applicationsSynced: 1 },
};

const mockExportResult = {
  data: { jobs: [], applications: [] },
  exportedAt: new Date().toISOString(),
};

const mockCardResult = {
  cardId: 'mock-card-123',
  url: 'https://trello.com/c/mock-card',
};

describe('Google Sheets API', () => {
  beforeAll(async () => {
    mockVerifyAccessToken.mockReturnValue({ userId: 'user-1', role: 'USER' });
    const { createApp } = await import('@/app');
    app = createApp();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyAccessToken.mockReturnValue({ userId: 'user-1', role: 'USER' });
  });

  describe('POST /api/v1/google-sheets/sync', () => {
    it('returns 200 on success', async () => {
      mockSyncGoogleSheets.mockResolvedValue(mockSyncResult);

      const res = await request(app)
        .post('/api/v1/google-sheets/sync')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app).post('/api/v1/google-sheets/sync');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/google-sheets/jobs/:jobId', () => {
    it('returns 200 on success', async () => {
      mockSyncGoogleSheetsJob.mockResolvedValue(mockSyncResult);

      const res = await request(app)
        .post('/api/v1/google-sheets/jobs/job-1')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app).post('/api/v1/google-sheets/jobs/job-1');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/google-sheets/export', () => {
    it('returns 200 on success', async () => {
      mockExportGoogleSheets.mockResolvedValue(mockExportResult);

      const res = await request(app)
        .get('/api/v1/google-sheets/export')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app).get('/api/v1/google-sheets/export');

      expect(res.status).toBe(401);
    });
  });
});

describe('Trello API', () => {
  describe('POST /api/v1/trello/sync', () => {
    it('returns 200 on success', async () => {
      mockSyncTrello.mockResolvedValue(mockSyncResult);

      const res = await request(app)
        .post('/api/v1/trello/sync')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app).post('/api/v1/trello/sync');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/trello/cards', () => {
    it('returns 200 on success', async () => {
      mockCreateTrelloCard.mockResolvedValue(mockCardResult);

      const res = await request(app)
        .post('/api/v1/trello/cards')
        .set('Authorization', 'Bearer token')
        .send({ jobId: 'job-1' });

      expect(res.status).toBe(200);
    });

    it('returns 422 without jobId', async () => {
      const res = await request(app)
        .post('/api/v1/trello/cards')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(res.status).toBe(422);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app).post('/api/v1/trello/cards').send({ jobId: 'job-1' });

      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/v1/trello/cards/:cardId', () => {
    it('returns 200 on success', async () => {
      mockMoveTrelloCard.mockResolvedValue(mockCardResult);

      const res = await request(app)
        .patch('/api/v1/trello/cards/card-1')
        .set('Authorization', 'Bearer token')
        .send({ list: 'Applied' });

      expect(res.status).toBe(200);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app).patch('/api/v1/trello/cards/card-1');

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/v1/trello/cards/:cardId', () => {
    it('returns 200 on success', async () => {
      mockDeleteTrelloCard.mockResolvedValue({ success: true });

      const res = await request(app)
        .delete('/api/v1/trello/cards/card-1')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app).delete('/api/v1/trello/cards/card-1');

      expect(res.status).toBe(401);
    });
  });
});
