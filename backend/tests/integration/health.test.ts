import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';

let app: Express;

describe('GET /health', () => {
  beforeAll(async () => {
    const { createApp } = await import('@/app');
    app = createApp();
  });

  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(['ok', 'degraded']).toContain(res.body.data.status);
    expect(res.body.data.timestamp).toBeDefined();
  });

  it('includes database connection status', async () => {
    const res = await request(app).get('/health');

    expect(res.body.data.database).toBeDefined();
    expect(typeof res.body.data.database).toBe('string');
  });

  it('includes redis connection status', async () => {
    const res = await request(app).get('/health');

    expect(res.body.data.redis).toBeDefined();
    expect(typeof res.body.data.redis).toBe('string');
  });

  it('includes queue health status', async () => {
    const res = await request(app).get('/health');

    expect(res.body.data.queue).toBeDefined();
    expect(typeof res.body.data.queue).toBe('string');
  });

  it('returns ISO timestamp', async () => {
    const res = await request(app).get('/health');

    const timestamp = res.body.data.timestamp;
    expect(timestamp).toBeDefined();
    expect(() => new Date(timestamp)).not.toThrow();
    expect(new Date(timestamp).toISOString()).toBe(timestamp);
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/unknown-route');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
