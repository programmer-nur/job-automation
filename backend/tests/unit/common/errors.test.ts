import { describe, expect, it } from 'vitest';

import { AppError } from '@/common/errors';

describe('AppError', () => {
  describe('constructor', () => {
    it('creates an error with statusCode, code, and message', () => {
      const error = new AppError(404, 'NOT_FOUND', 'Resource not found');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(Error);
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toBe('Resource not found');
      expect(error.details).toBeUndefined();
    });

    it('creates an error with optional details', () => {
      const details = [{ field: 'email', message: 'Email is required' }];
      const error = new AppError(422, 'VALIDATION_ERROR', 'Validation failed', details);

      expect(error.statusCode).toBe(422);
      expect(error.details).toEqual(details);
    });
  });

  describe('static factories', () => {
    describe('notFound', () => {
      it('creates a 404 error with resource name', () => {
        const error = AppError.notFound('Job');

        expect(error.statusCode).toBe(404);
        expect(error.code).toBe('NOT_FOUND');
        expect(error.message).toBe('Job not found');
      });
    });

    describe('badRequest', () => {
      it('creates a 400 error with message', () => {
        const error = AppError.badRequest('Invalid input');

        expect(error.statusCode).toBe(400);
        expect(error.code).toBe('BAD_REQUEST');
        expect(error.message).toBe('Invalid input');
      });
    });

    describe('unauthorized', () => {
      it('creates a 401 error with default message', () => {
        const error = AppError.unauthorized();

        expect(error.statusCode).toBe(401);
        expect(error.code).toBe('UNAUTHORIZED');
        expect(error.message).toBe('Authentication required');
      });

      it('creates a 401 error with custom message', () => {
        const error = AppError.unauthorized('Token expired');

        expect(error.statusCode).toBe(401);
        expect(error.message).toBe('Token expired');
      });
    });

    describe('forbidden', () => {
      it('creates a 403 error with default message', () => {
        const error = AppError.forbidden();

        expect(error.statusCode).toBe(403);
        expect(error.code).toBe('FORBIDDEN');
        expect(error.message).toBe('Access denied');
      });

      it('creates a 403 error with custom message', () => {
        const error = AppError.forbidden('Insufficient permissions');

        expect(error.statusCode).toBe(403);
        expect(error.message).toBe('Insufficient permissions');
      });
    });

    describe('conflict', () => {
      it('creates a 409 error with message', () => {
        const error = AppError.conflict('Duplicate email');

        expect(error.statusCode).toBe(409);
        expect(error.code).toBe('CONFLICT');
        expect(error.message).toBe('Duplicate email');
      });
    });

    describe('validation', () => {
      it('creates a 422 error with field errors', () => {
        const details = [
          { field: 'email', message: 'Invalid email format' },
          { field: 'password', message: 'Password too short' },
        ];
        const error = AppError.validation(details);

        expect(error.statusCode).toBe(422);
        expect(error.code).toBe('VALIDATION_ERROR');
        expect(error.message).toBe('Validation failed');
        expect(error.details).toEqual(details);
      });
    });
  });

  describe('toJSON', () => {
    it('serializes to a plain object for JSON responses', () => {
      const details = [{ field: 'email', message: 'Email is required' }];
      const error = new AppError(422, 'VALIDATION_ERROR', 'Validation failed', details);

      const json = error.toJSON();

      expect(json).toEqual({
        statusCode: 422,
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: [{ field: 'email', message: 'Email is required' }],
      });
    });

    it('serializes without details when not set', () => {
      const error = new AppError(404, 'NOT_FOUND', 'Not found');

      const json = error.toJSON();

      expect(json).toEqual({
        statusCode: 404,
        code: 'NOT_FOUND',
        message: 'Not found',
        details: undefined,
      });
    });
  });
});
