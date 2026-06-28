import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/common/errors';
import { authService } from '@/modules/auth/auth.service';

const mockPrismaUser = vi.hoisted(() => ({
  findUnique: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
}));

const mockPrismaRefreshToken = vi.hoisted(() => ({
  create: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
}));

vi.mock('@/config/prisma', () => ({
  prisma: {
    user: mockPrismaUser,
    refreshToken: mockPrismaRefreshToken,
  },
}));

const mockHashPassword = vi.hoisted(() => vi.fn());
const mockComparePassword = vi.hoisted(() => vi.fn());

vi.mock('@/utils/password', () => ({
  hashPassword: mockHashPassword,
  comparePassword: mockComparePassword,
}));

const mockSignAccessToken = vi.hoisted(() => vi.fn(() => 'access-token'));
const mockSignRefreshToken = vi.hoisted(() => vi.fn(() => 'refresh-token'));
const mockVerifyRefreshToken = vi.hoisted(() => vi.fn());

vi.mock('@/utils/jwt', () => ({
  signAccessToken: mockSignAccessToken,
  signRefreshToken: mockSignRefreshToken,
  verifyRefreshToken: mockVerifyRefreshToken,
}));

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  passwordHash: 'hashed-password',
  name: 'Test User',
  role: 'USER',
  isActive: true,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  deletedAt: null,
};

const mockUserResponse = {
  id: mockUser.id,
  email: mockUser.email,
  name: mockUser.name,
  role: mockUser.role,
  createdAt: mockUser.createdAt,
};

const mockRefreshTokenRecord = {
  id: 'rt-1',
  userId: 'user-1',
  token: 'valid-refresh-token',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  revoked: false,
  createdAt: new Date(),
};

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('creates user and returns tokens', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);
      mockHashPassword.mockResolvedValue('hashed-password');
      mockPrismaUser.create.mockResolvedValue(mockUser);

      const result = await authService.register({
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      });

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user).toEqual(mockUserResponse);
      expect(mockPrismaUser.create).toHaveBeenCalledWith({
        data: { email: 'test@example.com', passwordHash: 'hashed-password', name: 'Test User' },
      });
    });

    it('throws conflict error when email already exists', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);

      await expect(
        authService.register({ email: 'test@example.com', password: 'Password123' }),
      ).rejects.toThrow(AppError);

      await expect(
        authService.register({ email: 'test@example.com', password: 'Password123' }),
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  describe('login', () => {
    it('returns tokens and user on valid credentials', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);
      mockComparePassword.mockResolvedValue(true);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'Password123',
      });

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user).toEqual(mockUserResponse);
    });

    it('throws unauthorized when user not found', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'unknown@example.com', password: 'Password123' }),
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it('throws unauthorized when password is incorrect', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);
      mockComparePassword.mockResolvedValue(false);

      await expect(
        authService.login({ email: 'test@example.com', password: 'WrongPassword123' }),
      ).rejects.toMatchObject({ statusCode: 401 });
    });
  });

  describe('refresh', () => {
    it('rotates tokens on valid refresh', async () => {
      mockVerifyRefreshToken.mockReturnValue({ userId: 'user-1', role: 'USER' });
      mockPrismaRefreshToken.findUnique.mockResolvedValue(mockRefreshTokenRecord);

      const result = await authService.refresh('valid-refresh-token');

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(mockPrismaRefreshToken.update).toHaveBeenCalledWith({
        where: { id: 'rt-1' },
        data: { revoked: true },
      });
    });

    it('throws unauthorized when JWT verification fails', async () => {
      mockVerifyRefreshToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.refresh('invalid-token')).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it('throws unauthorized when token is revoked', async () => {
      mockVerifyRefreshToken.mockReturnValue({ userId: 'user-1', role: 'USER' });
      mockPrismaRefreshToken.findUnique.mockResolvedValue({
        ...mockRefreshTokenRecord,
        revoked: true,
      });

      await expect(authService.refresh('revoked-token')).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it('throws unauthorized when token is expired', async () => {
      mockVerifyRefreshToken.mockReturnValue({ userId: 'user-1', role: 'USER' });
      mockPrismaRefreshToken.findUnique.mockResolvedValue({
        ...mockRefreshTokenRecord,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(authService.refresh('expired-token')).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it('throws unauthorized when token not found in DB', async () => {
      mockVerifyRefreshToken.mockReturnValue({ userId: 'user-1', role: 'USER' });
      mockPrismaRefreshToken.findUnique.mockResolvedValue(null);

      await expect(authService.refresh('unknown-token')).rejects.toMatchObject({
        statusCode: 401,
      });
    });
  });

  describe('logout', () => {
    it('revokes the refresh token', async () => {
      mockPrismaRefreshToken.findUnique.mockResolvedValue(mockRefreshTokenRecord);

      await authService.logout('user-1', 'valid-refresh-token');

      expect(mockPrismaRefreshToken.update).toHaveBeenCalledWith({
        where: { id: 'rt-1' },
        data: { revoked: true },
      });
    });

    it('does nothing when token not found', async () => {
      mockPrismaRefreshToken.findUnique.mockResolvedValue(null);

      await authService.logout('user-1', 'unknown-token');

      expect(mockPrismaRefreshToken.update).not.toHaveBeenCalled();
    });

    it('throws forbidden when token belongs to another user', async () => {
      mockPrismaRefreshToken.findUnique.mockResolvedValue(mockRefreshTokenRecord);

      await expect(authService.logout('other-user', 'valid-refresh-token')).rejects.toMatchObject({
        statusCode: 403,
      });
    });
  });

  describe('getProfile', () => {
    it('returns user profile', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);

      const result = await authService.getProfile('user-1');

      expect(result).toEqual(mockUserResponse);
    });

    it('throws not found when user does not exist', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);

      await expect(authService.getProfile('nonexistent')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('changePassword', () => {
    it('updates password on valid current password', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);
      mockComparePassword.mockResolvedValue(true);
      mockHashPassword.mockResolvedValue('new-hashed-password');

      await authService.changePassword('user-1', 'old-password', 'NewPassword123');

      expect(mockPrismaUser.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { passwordHash: 'new-hashed-password' },
      });
    });

    it('throws not found when user does not exist', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);

      await expect(
        authService.changePassword('nonexistent', 'old-password', 'NewPassword123'),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('throws unauthorized when current password is incorrect', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);
      mockComparePassword.mockResolvedValue(false);

      await expect(
        authService.changePassword('user-1', 'wrong-password', 'NewPassword123'),
      ).rejects.toMatchObject({ statusCode: 401 });
    });
  });
});
