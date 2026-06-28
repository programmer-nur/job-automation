import { prisma } from "@/services/prisma.js";
import type { RegisterInput, UserResponse } from "./auth.types.js";

export const authRepository = {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  async createUser(data: RegisterInput): Promise<UserResponse> {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: data.password,
      },
    });
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async updatePassword(id: string, passwordHash: string) {
    return prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  },

  async saveRefreshToken(userId: string, token: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: { userId, token, expiresAt },
    });
  },

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({ where: { token } });
  },

  async revokeRefreshToken(id: string) {
    return prisma.refreshToken.update({
      where: { id },
      data: { revoked: true },
    });
  },

  async revokeAllUserTokens(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  },
};
