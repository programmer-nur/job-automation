import { logger } from '@/config/logger';
import { prisma } from '@/config/prisma';
import type { HealthStatus } from '@/modules/health/health.types';

async function checkDatabase(): Promise<string> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return 'connected';
  } catch (error) {
    logger.error({ error }, 'Database health check failed');
    return 'disconnected';
  }
}

async function checkRedis(): Promise<string> {
  try {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) return 'not configured';
    return 'connected';
  } catch {
    return 'disconnected';
  }
}

async function checkQueue(): Promise<string> {
  try {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) return 'not configured';
    return 'connected';
  } catch {
    return 'disconnected';
  }
}

export async function getHealthStatus(): Promise<HealthStatus> {
  const [database, redis, queue] = await Promise.all([checkDatabase(), checkRedis(), checkQueue()]);

  return {
    status: database === 'connected' ? 'ok' : 'degraded',
    database,
    redis,
    queue,
    timestamp: new Date().toISOString(),
  };
}
