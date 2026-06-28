import { PrismaClient } from '@prisma/client';

import { env } from '@/config/env';
import { logger } from '@/config/logger';

export const prisma = new PrismaClient({
  datasources: { db: { url: env.DATABASE_URL } },
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
  ],
});

prisma.$on('error', (e) => {
  logger.error({ error: e }, 'Prisma error');
});

prisma.$on('warn', (e) => {
  logger.warn({ message: e.message }, 'Prisma warning');
});

prisma.$on('info', (e) => {
  logger.info({ message: e.message }, 'Prisma info');
});
