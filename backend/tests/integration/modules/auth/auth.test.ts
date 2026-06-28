import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const mockRegister = vi.fn();
const mockLogin = vi.fn();
const mockRefresh = vi.fn();
const mockLogout = vi.fn();
const mockGetProfile = vi.fn();
const mockChangePassword = vi.fn();

vi.mock('@/modules/auth/auth.service', () => ({
  authService: {
    register: mockRegister,
    login: mockLogin,
    refresh: mockRefresh,
    logout: mockLogout,
    getProfile: mockGetProfile,
    changePassword: mockChangePassword,
  },
}));

const mockVerifyAccessToken = vi.hoisted(() => vi.fn());
const mockSignAccessToken = vi.hoisted(() => vi.fn());
const mockSignRefreshToken = vi.hoisted(() => vi.fn());

vi.mock('@/utils/jwt', () => ({
  verifyAccessToken: mockVerifyAccessToken,
  signAccessToken: mockSignAccessToken,
  signRefreshToken: mockSignRefreshToken,
}));

let app: Express;

describe('Auth API', () => {
  beforeAll(async () => {
    mockVerifyAccessToken.mockReturnValue({ userId: 'user-1', role: 'USER' });
    const { createApp } = await import('@/app');
    app = createApp();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyAccessToken.mockReturnValue({ userId: 'user-1', role: 'USER' });
  });

  describe('POST /api/v1/auth/register', () => {
    it('returns 201 on successful registration', async () => {
      mockRegister.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test',
          role: 'USER',
          createdAt: new Date().toISOString(),
        },
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@example.com', password: 'Password123', name: 'Test' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBe('access-token');
    });

    it('returns 422 for invalid input', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'not-email', password: 'weak' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('returns 200 on successful login', async () => {
      mockLogin.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: null,
          role: 'USER',
          createdAt: new Date().toISOString(),
        },
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'Password123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('returns 422 for invalid input', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({ email: '', password: '' });

      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('returns 200 on successful refresh', async () => {
      mockRefresh.mockResolvedValue({ accessToken: 'new-access', refreshToken: 'new-refresh' });

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'valid-refresh-token' });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBe('new-access');
    });

    it('returns 422 for empty token', async () => {
      const res = await request(app).post('/api/v1/auth/refresh').send({ refreshToken: '' });

      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('returns 200 when authenticated', async () => {
      mockLogout.mockResolvedValue(undefined);

      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', 'Bearer valid-token')
        .send({ refreshToken: 'some-token' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 401 without auth header', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .send({ refreshToken: 'some-token' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('returns profile when authenticated', async () => {
      mockGetProfile.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test',
        role: 'USER',
        createdAt: new Date().toISOString(),
      });

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('test@example.com');
    });

    it('returns 401 without auth header', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/v1/auth/change-password', () => {
    it('returns 200 when authenticated', async () => {
      mockChangePassword.mockResolvedValue(undefined);

      const res = await request(app)
        .patch('/api/v1/auth/change-password')
        .set('Authorization', 'Bearer valid-token')
        .send({ currentPassword: 'old', newPassword: 'NewPassword123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 422 for weak new password', async () => {
      const res = await request(app)
        .patch('/api/v1/auth/change-password')
        .set('Authorization', 'Bearer valid-token')
        .send({ currentPassword: 'old', newPassword: 'weak' });

      expect(res.status).toBe(422);
    });

    it('returns 401 without auth header', async () => {
      const res = await request(app)
        .patch('/api/v1/auth/change-password')
        .send({ currentPassword: 'old', newPassword: 'NewPassword123' });

      expect(res.status).toBe(401);
    });
  });
});
