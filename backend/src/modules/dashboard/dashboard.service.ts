import { prisma } from '@/config/prisma';
import type {
  MonthlyData,
  ScoreDistribution,
  SourceDistribution,
  SummaryData,
} from '@/modules/dashboard/dashboard.types';

export const dashboardService = {
  async getSummary(userId: string): Promise<SummaryData> {
    const [
      totalJobs,
      totalApplications,
      activeApplications,
      interviews,
      offers,
      rejections,
      pendingTasks,
      unreadNotifications,
      activeResumes,
    ] = await Promise.all([
      prisma.job.count({ where: { userId, deletedAt: null } }),
      prisma.application.count({ where: { userId, deletedAt: null } }),
      prisma.application.count({
        where: { userId, deletedAt: null, status: { notIn: ['OFFER', 'REJECTED'] } },
      }),
      prisma.application.count({ where: { userId, status: 'INTERVIEWING', deletedAt: null } }),
      prisma.application.count({ where: { userId, status: 'OFFER', deletedAt: null } }),
      prisma.application.count({ where: { userId, status: 'REJECTED', deletedAt: null } }),
      prisma.task.count({ where: { userId, completedAt: null, deletedAt: null } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
      prisma.resumeVersion.count({ where: { userId, isActive: true, deletedAt: null } }),
    ]);

    return {
      totalJobs,
      totalApplications,
      activeApplications,
      interviews,
      offers,
      rejections,
      pendingTasks,
      unreadNotifications,
      activeResumes,
    };
  },

  async getMonthly(userId: string): Promise<MonthlyData> {
    const apps = await prisma.application.findMany({
      where: { userId, deletedAt: null },
      select: { createdAt: true, status: true },
      orderBy: { createdAt: 'asc' },
    });

    const grouped: Record<string, { applications: number; interviews: number; offers: number }> =
      {};
    for (const app of apps) {
      const month = app.createdAt.toISOString().slice(0, 7);
      if (!grouped[month]) {
        grouped[month] = { applications: 0, interviews: 0, offers: 0 };
      }
      grouped[month].applications++;
      if (app.status === 'INTERVIEWING') {
        grouped[month].interviews++;
      }
      if (app.status === 'OFFER') {
        grouped[month].offers++;
      }
    }

    const monthly = Object.entries(grouped).map(([month, data]) => ({
      month,
      ...data,
    }));

    return { monthly };
  },

  async getMatchScores(userId: string): Promise<ScoreDistribution> {
    const jobs = await prisma.job.findMany({
      where: { userId, deletedAt: null, matchScore: { not: null } },
      select: { matchScore: true },
    });

    let count0To20 = 0;
    let count21To40 = 0;
    let count41To60 = 0;
    let count61To80 = 0;
    let count81To100 = 0;

    for (const job of jobs) {
      if (job.matchScore === null) continue;
      const score = job.matchScore;
      if (score <= 20) {
        count0To20++;
      } else if (score <= 40) {
        count21To40++;
      } else if (score <= 60) {
        count41To60++;
      } else if (score <= 80) {
        count61To80++;
      } else {
        count81To100++;
      }
    }

    return {
      scores: [
        { range: '0-20', count: count0To20 },
        { range: '21-40', count: count21To40 },
        { range: '41-60', count: count41To60 },
        { range: '61-80', count: count61To80 },
        { range: '81-100', count: count81To100 },
      ],
    };
  },

  async getSources(userId: string): Promise<SourceDistribution> {
    const jobs = await prisma.job.findMany({
      where: { userId, source: { not: null }, deletedAt: null },
      select: { source: true },
    });

    const grouped: Record<string, number> = {};
    for (const job of jobs) {
      if (job.source === null) continue;
      const source = job.source;
      grouped[source] = (grouped[source] || 0) + 1;
    }

    const sources = Object.entries(grouped)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);

    return { sources };
  },
};
