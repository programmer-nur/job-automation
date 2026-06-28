import { prisma } from '@/config/prisma';
import { getPaginationMeta } from '@/utils/pagination';

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  jobCount: number;
  createdAt: Date;
}

interface AdminJob {
  id: string;
  userId: string;
  title: string;
  company: string;
  status: string;
  userEmail: string;
  createdAt: Date;
}

interface AiStats {
  totalRequests: number;
  successRate: number;
  byType: Record<string, number>;
  recentRequests: Array<{
    id: string;
    userId: string;
    type: string;
    status: string;
    durationMs: number | null;
    model: string;
    userEmail: string;
    createdAt: Date;
  }>;
}

interface AuditLogEntry {
  id: string;
  userId: string | null;
  action: string;
  entity: string | null;
  entityId: string | null;
  userEmail: string | null;
  createdAt: Date;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

function parsePage(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : DEFAULT_PAGE;
}

function parseLimit(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.min(Math.floor(n), 100) : DEFAULT_LIMIT;
}

export const adminService = {
  async listUsers(page?: number, limit?: number) {
    const p = parsePage(page);
    const l = parseLimit(limit);
    const skip = (p - 1) * l;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: l,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { jobs: true } } },
      }),
      prisma.user.count(),
    ]);

    const data: AdminUser[] = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      isActive: u.isActive,
      jobCount: u._count.jobs,
      createdAt: u.createdAt,
    }));

    return { data, meta: getPaginationMeta(total, p, l) };
  },

  async listJobs(page?: number, limit?: number) {
    const p = parsePage(page);
    const l = parseLimit(limit);
    const skip = (p - 1) * l;

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        skip,
        take: l,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } } },
      }),
      prisma.job.count(),
    ]);

    const data: AdminJob[] = jobs.map((j) => ({
      id: j.id,
      userId: j.userId,
      title: j.title,
      company: j.company,
      status: j.status,
      userEmail: j.user.email,
      createdAt: j.createdAt,
    }));

    return { data, meta: getPaginationMeta(total, p, l) };
  },

  async getAiStats(page?: number, limit?: number) {
    const p = parsePage(page);
    const l = parseLimit(limit);
    const skip = (p - 1) * l;

    const [totalRequests, completedRequests, allTypes, recentRequests] = await Promise.all([
      prisma.aIRequest.count(),
      prisma.aIRequest.count({ where: { status: 'completed' } }),
      prisma.aIRequest.findMany({ select: { type: true } }),
      prisma.aIRequest.findMany({
        skip,
        take: l,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } } },
      }),
    ]);

    const byType: Record<string, number> = {};
    for (const req of allTypes) {
      byType[req.type] = (byType[req.type] || 0) + 1;
    }

    const data: AiStats = {
      totalRequests,
      successRate: totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0,
      byType,
      recentRequests: recentRequests.map((r) => ({
        id: r.id,
        userId: r.userId,
        type: r.type,
        status: r.status,
        durationMs: r.durationMs,
        model: r.model,
        userEmail: r.user.email,
        createdAt: r.createdAt,
      })),
    };

    return { data, meta: getPaginationMeta(totalRequests, p, l) };
  },

  async listAuditLogs(page?: number, limit?: number) {
    const p = parsePage(page);
    const l = parseLimit(limit);
    const skip = (p - 1) * l;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: l,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } } },
      }),
      prisma.auditLog.count(),
    ]);

    const data: AuditLogEntry[] = logs.map((l) => ({
      id: l.id,
      userId: l.userId,
      action: l.action,
      entity: l.entity,
      entityId: l.entityId,
      userEmail: l.user?.email ?? null,
      createdAt: l.createdAt,
    }));

    return { data, meta: getPaginationMeta(total, p, l) };
  },
};
