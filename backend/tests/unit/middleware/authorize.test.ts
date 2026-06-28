import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { authorize } from '@/middleware/authorize';

function createMocks(user?: { userId: string; role: string }) {
  const req = { user } as unknown as Request;
  const res = {} as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

describe('authorize', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls next when user has required role', () => {
    const { req, res, next } = createMocks({ userId: 'user-1', role: 'ADMIN' });
    const middleware = authorize('ADMIN');

    middleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it('calls next when user has one of the allowed roles', () => {
    const { req, res, next } = createMocks({ userId: 'user-1', role: 'USER' });
    const middleware = authorize('ADMIN', 'USER');

    middleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it('throws forbidden when user role is not allowed', () => {
    const { req, res, next } = createMocks({ userId: 'user-1', role: 'USER' });
    const middleware = authorize('ADMIN');

    expect(() => middleware(req, res, next)).toThrow(expect.objectContaining({ statusCode: 403 }));
    expect(next).not.toHaveBeenCalled();
  });

  it('throws unauthorized when req.user is undefined', () => {
    const { req, res, next } = createMocks();
    const middleware = authorize('ADMIN');

    expect(() => middleware(req, res, next)).toThrow(expect.objectContaining({ statusCode: 401 }));
    expect(next).not.toHaveBeenCalled();
  });
});
