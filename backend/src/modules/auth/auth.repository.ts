import { prisma } from '@/config/prisma';

export const authRepository = {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async createUser(data: { email: string; passwordHash: string; name?: string }) {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name,
      },
    });
  },

  async findUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  async updatePassword(id: string, passwordHash: string) {
    return prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  },

  async saveRefreshToken(data: { userId: string; token: string; expiresAt: Date }) {
    return prisma.refreshToken.create({ data });
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
