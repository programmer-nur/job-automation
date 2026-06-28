import { describe, expect, it } from 'vitest';

import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '@/utils/jwt';

describe('jwt utils', () => {
  const payload = { userId: 'user-123', role: 'USER' };

  describe('signAccessToken', () => {
    it('returns a signed JWT string', () => {
      const token = signAccessToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('token contains iat and exp claims', () => {
      const token = signAccessToken(payload);
      const decoded = verifyAccessToken(token);

      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat as number);
    });
  });

  describe('signRefreshToken', () => {
    it('returns a signed JWT string', () => {
      const token = signRefreshToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyAccessToken', () => {
    it('returns the decoded payload for a valid token', () => {
      const token = signAccessToken(payload);
      const decoded = verifyAccessToken(token);

      expect(decoded.userId).toBe('user-123');
      expect(decoded.role).toBe('USER');
    });

    it('throws for an invalid token', () => {
      expect(() => verifyAccessToken('invalid-token')).toThrow();
    });

    it('throws for an expired token', () => {
      expect(() => verifyAccessToken('expired-token')).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('returns the decoded payload for a valid refresh token', () => {
      const token = signRefreshToken(payload);
      const decoded = verifyRefreshToken(token);

      expect(decoded.userId).toBe('user-123');
      expect(decoded.role).toBe('USER');
    });

    it('throws for an invalid refresh token', () => {
      expect(() => verifyRefreshToken('invalid-token')).toThrow();
    });
  });

  describe('token separation', () => {
    it('access token payload should contain expected fields', () => {
      const token = signAccessToken(payload);
      const decoded = verifyAccessToken(token);

      expect(decoded.userId).toBe('user-123');
      expect(decoded.role).toBe('USER');
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it('refresh token payload should contain expected fields', () => {
      const token = signRefreshToken(payload);
      const decoded = verifyRefreshToken(token);

      expect(decoded.userId).toBe('user-123');
      expect(decoded.role).toBe('USER');
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });
  });
});
