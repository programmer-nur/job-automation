import { describe, expect, it } from 'vitest';

import { error, success } from '@/common/response';

describe('response helpers', () => {
  describe('success', () => {
    it('returns a success response with data', () => {
      const result = success({ id: '1', name: 'Test' });

      expect(result).toEqual({
        success: true,
        data: { id: '1', name: 'Test' },
      });
    });

    it('returns a success response with message', () => {
      const result = success(null, 'Operation completed');

      expect(result).toEqual({
        success: true,
        message: 'Operation completed',
        data: null,
      });
    });

    it('returns a success response with pagination meta', () => {
      const meta = { page: 1, limit: 20, total: 100, totalPages: 5 };
      const result = success([], undefined, meta);

      expect(result).toEqual({
        success: true,
        data: [],
        meta,
      });
    });

    it('returns a success response with data, message, and meta', () => {
      const meta = { page: 1, limit: 20, total: 50, totalPages: 3 };
      const result = success({ items: [] }, 'List retrieved', meta);

      expect(result).toEqual({
        success: true,
        message: 'List retrieved',
        data: { items: [] },
        meta,
      });
    });
  });

  describe('error', () => {
    it('returns an error response with message', () => {
      const result = error('Something went wrong');

      expect(result).toEqual({
        success: false,
        message: 'Something went wrong',
      });
    });

    it('returns an error response with field errors', () => {
      const errors = [
        { field: 'email', message: 'Email is required' },
        { field: 'password', message: 'Password too short' },
      ];
      const result = error('Validation failed', errors);

      expect(result).toEqual({
        success: false,
        message: 'Validation failed',
        errors,
      });
    });
  });
});
