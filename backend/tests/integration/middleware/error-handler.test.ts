import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';

let app: Express;

describe('Global error handler', () => {
  beforeAll(async () => {
    const { createApp } = await import('@/app');
    app = createApp();
  });

  it('handles health endpoint correctly', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 with structured error for unknown routes', async () => {
    const res = await request(app).get('/api/v1/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBeDefined();
    expect(typeof res.body.message).toBe('string');
  });

  it('does not expose stack traces in error responses', async () => {
    const res = await request(app).get('/api/v1/nonexistent');

    expect(res.body.stack).toBeUndefined();
  });

  it('returns proper error format for invalid JSON body', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .set('Content-Type', 'application/json')
      .send('not-valid-json{');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('handles too-large payload gracefully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ data: 'x'.repeat(10_000_000) });

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.success).toBe(false);
  });
});
