import { describe, expect, it } from 'vitest';

import { getPaginationMeta, getPaginationParams } from '@/utils/pagination';

describe('pagination utils', () => {
  describe('getPaginationParams', () => {
    it('returns default skip (0) and take (20) when no params given', () => {
      const result = getPaginationParams();

      expect(result).toEqual({ skip: 0, take: 20 });
    });

    it('calculates skip correctly for page 2', () => {
      const result = getPaginationParams(2, 20);

      expect(result).toEqual({ skip: 20, take: 20 });
    });

    it('uses custom limit as take', () => {
      const result = getPaginationParams(1, 50);

      expect(result).toEqual({ skip: 0, take: 50 });
    });

    it('calculates skip for page 3 with limit 10', () => {
      const result = getPaginationParams(3, 10);

      expect(result).toEqual({ skip: 20, take: 10 });
    });

    it('returns page 1 if page is 0 or negative', () => {
      const result1 = getPaginationParams(0, 20);
      const result2 = getPaginationParams(-1, 20);

      expect(result1).toEqual({ skip: 0, take: 20 });
      expect(result2).toEqual({ skip: 0, take: 20 });
    });

    it('returns default limit if limit is 0 or negative', () => {
      const result1 = getPaginationParams(1, 0);
      const result2 = getPaginationParams(1, -5);

      expect(result1).toEqual({ skip: 0, take: 20 });
      expect(result2).toEqual({ skip: 0, take: 20 });
    });

    it('caps limit at 100', () => {
      const result = getPaginationParams(1, 500);

      expect(result).toEqual({ skip: 0, take: 100 });
    });
  });

  describe('getPaginationMeta', () => {
    it('returns correct meta with total, page, limit', () => {
      const result = getPaginationMeta(100, 1, 20);

      expect(result).toEqual({
        page: 1,
        limit: 20,
        total: 100,
        totalPages: 5,
      });
    });

    it('calculates totalPages rounding up', () => {
      const result = getPaginationMeta(101, 1, 20);

      expect(result.totalPages).toBe(6);
    });

    it('returns 0 totalPages for 0 total', () => {
      const result = getPaginationMeta(0, 1, 20);

      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('returns 1 totalPage when total is less than limit', () => {
      const result = getPaginationMeta(5, 1, 20);

      expect(result.totalPages).toBe(1);
    });

    it('returns correct totalPages when total equals limit exactly', () => {
      const result = getPaginationMeta(20, 1, 20);

      expect(result.totalPages).toBe(1);
    });
  });
});
