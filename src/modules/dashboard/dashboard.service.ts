import { prisma } from "@/services/prisma.js";

export async function getSummary(userId: string) {
  const baseJobWhere = { userId, deletedAt: null };
  const baseAppWhere = { userId, deletedAt: null };

  const [
    totalJobs,
    totalApplications,
    interviews,
    offers,
    rejections,
    pendingTasks,
    unreadNotifications,
    activeResumes,
  ] = await Promise.all([
    prisma.job.count({ where: baseJobWhere }),
    prisma.application.count({ where: baseAppWhere }),
    prisma.application.count({ where: { ...baseAppWhere, status: "INTERVIEW" } }),
    prisma.application.count({ where: { ...baseAppWhere, status: "OFFER" } }),
    prisma.application.count({ where: { ...baseAppWhere, status: "REJECTED" } }),
    prisma.task.count({ where: { userId, completed: false } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
    prisma.resumeVersion.count({ where: { userId, isDefault: true, deletedAt: null } }),
  ]);

  const closed = await prisma.application.count({
    where: { ...baseAppWhere, status: "CLOSED" },
  });

  return {
    totalJobs,
    totalApplications,
    activeApplications: totalApplications - rejections - offers - closed,
    interviews,
    offers,
    rejections,
    pendingTasks,
    unreadNotifications,
    activeResumes,
  };
}

export async function getMonthly(userId: string) {
  const applications = await prisma.application.findMany({
    where: { userId, deletedAt: null, appliedAt: { not: null } },
    select: { appliedAt: true, status: true },
    orderBy: { appliedAt: "asc" },
  });

  const monthMap = new Map<string, { applications: number; interviews: number; offers: number }>();

  for (const app of applications) {
    if (!app.appliedAt) continue;
    const month = app.appliedAt.toISOString().slice(0, 7);
    const entry = monthMap.get(month) ?? { applications: 0, interviews: 0, offers: 0 };
    entry.applications++;
    if (app.status === "INTERVIEW") entry.interviews++;
    if (app.status === "OFFER") entry.offers++;
    monthMap.set(month, entry);
  }

  return Array.from(monthMap.entries())
    .map(([month, counts]) => ({ month, ...counts }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export async function getMatchScores(userId: string) {
  const jobs = await prisma.job.findMany({
    where: { userId, deletedAt: null, matchScore: { not: null } },
    select: { matchScore: true },
  });

  const buckets = [
    { range: "0-20", count: 0 },
    { range: "21-40", count: 0 },
    { range: "41-60", count: 0 },
    { range: "61-80", count: 0 },
    { range: "81-100", count: 0 },
  ];

  for (const job of jobs) {
    const score = job.matchScore!;
    if (score <= 20) buckets[0].count++;
    else if (score <= 40) buckets[1].count++;
    else if (score <= 60) buckets[2].count++;
    else if (score <= 80) buckets[3].count++;
    else buckets[4].count++;
  }

  return buckets;
}

export async function getSources(userId: string) {
  const jobs = await prisma.job.findMany({
    where: { userId, deletedAt: null, source: { not: null } },
    select: { source: true },
  });

  const sourceMap = new Map<string, number>();

  for (const job of jobs) {
    const source = job.source!;
    sourceMap.set(source, (sourceMap.get(source) ?? 0) + 1);
  }

  return Array.from(sourceMap.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);
}
