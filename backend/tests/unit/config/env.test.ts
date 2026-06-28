import { describe, expect, it } from 'vitest';

import { envSchema } from '@/config/env';

describe('Config validation', () => {
  describe('required variables', () => {
    it('requires DATABASE_URL', () => {
      const result = envSchema.safeParse({
        JWT_SECRET: 'a'.repeat(32),
        JWT_REFRESH_SECRET: 'b'.repeat(32),
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.DATABASE_URL).toBeDefined();
      }
    });

    it('requires JWT_SECRET with min 32 chars', () => {
      const result = envSchema.safeParse({
        DATABASE_URL: 'postgresql://localhost:5432/db',
        JWT_SECRET: 'short',
        JWT_REFRESH_SECRET: 'b'.repeat(32),
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.JWT_SECRET).toBeDefined();
      }
    });

    it('requires JWT_REFRESH_SECRET with min 32 chars', () => {
      const result = envSchema.safeParse({
        DATABASE_URL: 'postgresql://localhost:5432/db',
        JWT_SECRET: 'a'.repeat(32),
        JWT_REFRESH_SECRET: 'short',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.JWT_REFRESH_SECRET).toBeDefined();
      }
    });
  });

  describe('default values', () => {
    it('uses default PORT when not set', () => {
      const result = envSchema.safeParse({
        DATABASE_URL: 'postgresql://localhost:5432/db',
        JWT_SECRET: 'a'.repeat(32),
        JWT_REFRESH_SECRET: 'b'.repeat(32),
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.PORT).toBe(5000);
      }
    });

    it('uses default CORS_ORIGIN when not set', () => {
      const result = envSchema.safeParse({
        DATABASE_URL: 'postgresql://localhost:5432/db',
        JWT_SECRET: 'a'.repeat(32),
        JWT_REFRESH_SECRET: 'b'.repeat(32),
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.CORS_ORIGIN).toBe('http://localhost:3000');
      }
    });

    it('uses default LOG_LEVEL when not set', () => {
      const result = envSchema.safeParse({
        DATABASE_URL: 'postgresql://localhost:5432/db',
        JWT_SECRET: 'a'.repeat(32),
        JWT_REFRESH_SECRET: 'b'.repeat(32),
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.LOG_LEVEL).toBe('info');
      }
    });
  });

  describe('valid values', () => {
    it('parses PORT as a number', () => {
      const result = envSchema.safeParse({
        DATABASE_URL: 'postgresql://localhost:5432/db',
        JWT_SECRET: 'a'.repeat(32),
        JWT_REFRESH_SECRET: 'b'.repeat(32),
        PORT: '8080',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.PORT).toBe(8080);
        expect(typeof result.data.PORT).toBe('number');
      }
    });

    it('accepts valid NODE_ENV values', () => {
      const result = envSchema.safeParse({
        DATABASE_URL: 'postgresql://localhost:5432/db',
        JWT_SECRET: 'a'.repeat(32),
        JWT_REFRESH_SECRET: 'b'.repeat(32),
        NODE_ENV: 'production',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.NODE_ENV).toBe('production');
      }
    });
  });

  describe('REDIS_URL', () => {
    it('accepts optional REDIS_URL', () => {
      const result = envSchema.safeParse({
        DATABASE_URL: 'postgresql://localhost:5432/db',
        JWT_SECRET: 'a'.repeat(32),
        JWT_REFRESH_SECRET: 'b'.repeat(32),
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.REDIS_URL).toBeUndefined();
      }
    });

    it('accepts REDIS_URL when provided', () => {
      const result = envSchema.safeParse({
        DATABASE_URL: 'postgresql://localhost:5432/db',
        JWT_SECRET: 'a'.repeat(32),
        JWT_REFRESH_SECRET: 'b'.repeat(32),
        REDIS_URL: 'redis://localhost:6379',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.REDIS_URL).toBe('redis://localhost:6379');
      }
    });
  });
});
