import { AppError } from "@/common/errors.js";
import { hashPassword, comparePassword } from "@/utils/password.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  type TokenPayload,
} from "@/utils/jwt.js";
import { authRepository } from "./auth.repository.js";
import type {
  RegisterInput,
  LoginInput,
  AuthTokens,
  UserResponse,
} from "./auth.types.js";

function generateTokens(payload: TokenPayload): AuthTokens {
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  return { accessToken, refreshToken };
}

async function saveRefreshToken(userId: string, token: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await authRepository.saveRefreshToken(userId, token, expiresAt);
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthTokens & { user: UserResponse }> {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) {
      throw AppError.conflict("Email already registered");
    }

    const passwordHash = await hashPassword(input.password);

    const user = await authRepository.createUser({
      ...input,
      password: passwordHash,
    });

    const payload: TokenPayload = { userId: user.id, role: user.role };
    const tokens = generateTokens(payload);
    await saveRefreshToken(user.id, tokens.refreshToken);

    return { ...tokens, user };
  },

  async login(input: LoginInput): Promise<AuthTokens & { user: UserResponse }> {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user) {
      throw AppError.unauthorized("Invalid credentials");
    }

    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) {
      throw AppError.unauthorized("Invalid credentials");
    }

    const payload: TokenPayload = { userId: user.id, role: user.role };
    const tokens = generateTokens(payload);
    await saveRefreshToken(user.id, tokens.refreshToken);

    const { passwordHash: _, ...userWithoutPassword } = user;
    return { ...tokens, user: userWithoutPassword };
  },

  async refresh(token: string): Promise<AuthTokens> {
    let payload: TokenPayload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw AppError.unauthorized("Invalid refresh token");
    }

    const stored = await authRepository.findRefreshToken(token);
    if (!stored || stored.revoked) {
      throw AppError.unauthorized("Token revoked");
    }

    if (stored.expiresAt < new Date()) {
      throw AppError.unauthorized("Token expired");
    }

    await authRepository.revokeRefreshToken(stored.id);

    const newPayload: TokenPayload = { userId: payload.userId, role: payload.role };
    const tokens = generateTokens(newPayload);
    await saveRefreshToken(payload.userId, tokens.refreshToken);

    return tokens;
  },

  async logout(userId: string, refreshToken: string) {
    const stored = await authRepository.findRefreshToken(refreshToken);
    if (stored) {
      await authRepository.revokeRefreshToken(stored.id);
    }
  },

  async getProfile(userId: string): Promise<UserResponse> {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw AppError.notFound("User");
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw AppError.notFound("User");
    }

    const valid = await comparePassword(currentPassword, user.passwordHash);
    if (!valid) {
      throw AppError.badRequest("Current password is incorrect");
    }

    const newHash = await hashPassword(newPassword);
    await authRepository.updatePassword(userId, newHash);

    await authRepository.revokeAllUserTokens(userId);
  },
};
