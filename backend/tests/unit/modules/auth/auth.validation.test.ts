import { describe, expect, it } from 'vitest';

import {
  changePasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
} from '@/modules/auth/auth.validation';

describe('registerSchema', () => {
  it('accepts valid input', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'Password123',
      name: 'Test User',
    });
    expect(result.success).toBe(true);
  });

  it('accepts input without name', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'Password123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({
      email: 'not-an-email',
      password: 'Password123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'Short1A',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without uppercase', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without lowercase', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'PASSWORD123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without digit', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'Password!',
    });
    expect(result.success).toBe(false);
  });

  it('rejects name exceeding 100 characters', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'Password123',
      name: 'A'.repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it('rejects email exceeding 255 characters', () => {
    const result = registerSchema.safeParse({
      email: 'a'.repeat(250) + '@example.com',
      password: 'Password123',
    });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('accepts valid input', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'any-password',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: 'password',
    });
    expect(result.success).toBe(false);
  });
});

describe('refreshSchema', () => {
  it('accepts valid token', () => {
    const result = refreshSchema.safeParse({
      refreshToken: 'some-token-value',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty token', () => {
    const result = refreshSchema.safeParse({ refreshToken: '' });
    expect(result.success).toBe(false);
  });
});

describe('changePasswordSchema', () => {
  it('accepts valid input', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'old-password',
      newPassword: 'NewPassword123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty current password', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: '',
      newPassword: 'NewPassword123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects weak new password', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'old-password',
      newPassword: 'weak',
    });
    expect(result.success).toBe(false);
  });
});
