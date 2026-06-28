import { describe, expect, it } from 'vitest';

import { comparePassword, hashPassword } from '@/utils/password';

describe('password utils', () => {
  describe('hashPassword', () => {
    it('returns a hashed string', async () => {
      const hashed = await hashPassword('MyPassword123!');

      expect(hashed).toBeDefined();
      expect(typeof hashed).toBe('string');
      expect(hashed).not.toBe('MyPassword123!');
    });

    it('produces different hashes for the same password (different salts)', async () => {
      const hash1 = await hashPassword('SamePassword1!');
      const hash2 = await hashPassword('SamePassword1!');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('returns true for matching password', async () => {
      const password = 'MyPassword123!';
      const hashed = await hashPassword(password);

      const isValid = await comparePassword(password, hashed);

      expect(isValid).toBe(true);
    });

    it('returns false for incorrect password', async () => {
      const hashed = await hashPassword('CorrectPassword1!');

      const isValid = await comparePassword('WrongPassword1!', hashed);

      expect(isValid).toBe(false);
    });

    it('returns false for empty string', async () => {
      const hashed = await hashPassword('ValidPassword1!');

      const isValid = await comparePassword('', hashed);

      expect(isValid).toBe(false);
    });
  });
});
