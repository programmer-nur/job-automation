import type { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/common/errors';
import { authenticate } from '@/middleware/authenticate';

const mockVerifyAccessToken = vi.hoisted(() => vi.fn());

vi.mock('@/utils/jwt', () => ({
  verifyAccessToken: mockVerifyAccessToken,
}));

function createMocks() {
  const req = {
    headers: {},
    user: undefined,
  } as unknown as Request;
  const res = {} as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

describe('authenticate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets req.user and calls next on valid token', () => {
    const { req, res, next } = createMocks();
    req.headers.authorization = 'Bearer valid-token';
    mockVerifyAccessToken.mockReturnValue({ userId: 'user-1', role: 'USER' });

    authenticate(req, res, next);

    expect(req.user).toEqual({ userId: 'user-1', role: 'USER' });
    expect(next).toHaveBeenCalledOnce();
  });

  it('throws unauthorized when no auth header', () => {
    const { req, res, next } = createMocks();

    expect(() => authenticate(req, res, next)).toThrow(AppError);
    expect(next).not.toHaveBeenCalled();
  });

  it('throws bad request when header format is invalid', () => {
    const { req, res, next } = createMocks();
    req.headers.authorization = 'InvalidFormat token';

    expect(() => authenticate(req, res, next)).toThrow(AppError);
    expect(next).not.toHaveBeenCalled();
  });

  it('throws bad request when only Bearer keyword without token', () => {
    const { req, res, next } = createMocks();
    req.headers.authorization = 'Bearer';

    expect(() => authenticate(req, res, next)).toThrow(AppError);
    expect(next).not.toHaveBeenCalled();
  });

  it('throws unauthorized when token verification fails', () => {
    const { req, res, next } = createMocks();
    req.headers.authorization = 'Bearer invalid-token';
    mockVerifyAccessToken.mockImplementation(() => {
      throw new Error('jwt malformed');
    });

    expect(() => authenticate(req, res, next)).toThrow(AppError);
    expect(next).not.toHaveBeenCalled();
  });
});
