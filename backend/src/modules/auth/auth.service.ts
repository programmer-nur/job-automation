import { AppError } from '@/common/errors';
import { authRepository } from '@/modules/auth/auth.repository';
import type { AuthTokens, UserResponse } from '@/modules/auth/auth.types';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/utils/jwt';
import { comparePassword, hashPassword } from '@/utils/password';

function toUserResponse(user: {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
}): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };
}

async function generateTokens(userId: string, role: string): Promise<AuthTokens> {
  const payload = { userId, role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await authRepository.saveRefreshToken({ userId, token: refreshToken, expiresAt });

  return { accessToken, refreshToken };
}

export const authService = {
  async register(input: { email: string; password: string; name?: string }) {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) {
      throw AppError.conflict('Email already registered');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await authRepository.createUser({
      email: input.email,
      passwordHash,
      name: input.name,
    });

    const tokens = await generateTokens(user.id, user.role);

    return { ...tokens, user: toUserResponse(user) };
  },

  async login(input: { email: string; password: string }) {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user) {
      throw AppError.unauthorized('Invalid credentials');
    }

    const isValid = await comparePassword(input.password, user.passwordHash);
    if (!isValid) {
      throw AppError.unauthorized('Invalid credentials');
    }

    const tokens = await generateTokens(user.id, user.role);

    return { ...tokens, user: toUserResponse(user) };
  },

  async refresh(token: string) {
    let payload: { userId: string; role: string };
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw AppError.unauthorized('Invalid refresh token');
    }

    const storedToken = await authRepository.findRefreshToken(token);
    if (!storedToken || storedToken.revoked) {
      throw AppError.unauthorized('Token revoked');
    }

    if (storedToken.expiresAt < new Date()) {
      throw AppError.unauthorized('Token expired');
    }

    await authRepository.revokeRefreshToken(storedToken.id);

    const newAccessToken = signAccessToken({ userId: payload.userId, role: payload.role });
    const newRefreshToken = signRefreshToken({ userId: payload.userId, role: payload.role });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await authRepository.saveRefreshToken({
      userId: payload.userId,
      token: newRefreshToken,
      expiresAt,
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  async logout(userId: string, refreshToken: string) {
    const stored = await authRepository.findRefreshToken(refreshToken);
    if (stored) {
      if (stored.userId !== userId) {
        throw AppError.forbidden();
      }
      await authRepository.revokeRefreshToken(stored.id);
    }
  },

  async getProfile(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw AppError.notFound('User');
    }
    return toUserResponse(user);
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw AppError.notFound('User');
    }

    const isValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isValid) {
      throw AppError.unauthorized('Current password is incorrect');
    }

    const newHash = await hashPassword(newPassword);
    await authRepository.updatePassword(userId, newHash);
  },
};
