import { AppError } from '@/common/errors';
import { prisma } from '@/config/prisma';
import { MockIntegrationProvider } from '@/modules/integrations/integrations.client';
import { syncQueue } from '@/modules/integrations/integrations.queue';
import type { CardResult, ExportData, SyncResult } from '@/modules/integrations/integrations.types';

const client = new MockIntegrationProvider();

function getTrelloListFromStatus(status: string): string {
  const map: Record<string, string> = {
    SAVED: 'To Review',
    READY_TO_APPLY: 'Ready to Apply',
    APPLIED: 'Applied',
    INTERVIEWING: 'Interview',
    OFFER: 'Closed',
    REJECTED: 'Closed',
    WITHDRAWN: 'Closed',
    ARCHIVED: 'Closed',
  };
  return map[status] || 'To Review';
}

export const integrationService = {
  async syncGoogleSheets(userId: string): Promise<SyncResult> {
    const [jobs, apps] = await Promise.all([
      prisma.job.findMany({
        where: { userId, deletedAt: null },
        select: {
          id: true,
          title: true,
          company: true,
          status: true,
          matchScore: true,
          createdAt: true,
        },
      }),
      prisma.application.findMany({
        where: { userId, deletedAt: null },
        select: {
          id: true,
          status: true,
          createdAt: true,
          job: { select: { title: true, company: true } },
        },
      }),
    ]);

    const exportData: ExportData = {
      jobs: jobs.map((j) => ({
        id: j.id,
        title: j.title,
        company: j.company,
        status: j.status,
        matchScore: j.matchScore,
        createdAt: j.createdAt.toISOString(),
      })),
      applications: apps.map((a) => ({
        id: a.id,
        jobTitle: a.job.title,
        company: a.job.company,
        status: a.status,
        createdAt: a.createdAt.toISOString(),
      })),
    };

    const result = client.syncToSheet(userId, exportData);

    await prisma.integration.upsert({
      where: { userId_type: { userId, type: 'google_sheets' } },
      update: {
        lastSyncAt: new Date(),
        lastSyncStatus: 'success',
        lastSyncMessage: result.message,
      },
      create: {
        userId,
        type: 'google_sheets',
        status: 'connected',
        lastSyncAt: new Date(),
        lastSyncStatus: 'success',
        lastSyncMessage: result.message,
      },
    });

    return {
      ...result,
      details: {
        jobsSynced: exportData.jobs.length,
        applicationsSynced: exportData.applications.length,
      },
    };
  },

  async syncGoogleSheetsJob(userId: string, jobId: string): Promise<SyncResult> {
    const job = await prisma.job.findFirst({ where: { id: jobId, userId } });
    if (!job || job.deletedAt) {
      throw new AppError(404, 'Job not found', 'JOB_001');
    }

    const jobData = {
      id: job.id,
      title: job.title,
      company: job.company,
      status: job.status,
      matchScore: job.matchScore,
      createdAt: job.createdAt.toISOString(),
    };

    const result = client.syncSingleJobToSheet(userId, jobData);

    await prisma.job.update({
      where: { id: jobId },
      data: { sheetRowId: `row-${jobId.slice(0, 8)}` },
    });

    return result;
  },

  async exportGoogleSheets(userId: string): Promise<{ data: ExportData; exportedAt: string }> {
    const [jobs, apps] = await Promise.all([
      prisma.job.findMany({
        where: { userId, deletedAt: null },
        select: {
          id: true,
          title: true,
          company: true,
          status: true,
          matchScore: true,
          createdAt: true,
        },
      }),
      prisma.application.findMany({
        where: { userId, deletedAt: null },
        select: {
          id: true,
          status: true,
          createdAt: true,
          job: { select: { title: true, company: true } },
        },
      }),
    ]);

    const exportData: ExportData = {
      jobs: jobs.map((j) => ({ ...j, createdAt: j.createdAt.toISOString() })),
      applications: apps.map((a) => ({
        id: a.id,
        jobTitle: a.job.title,
        company: a.job.company,
        status: a.status,
        createdAt: a.createdAt.toISOString(),
      })),
    };

    return client.exportData(exportData);
  },

  async syncTrello(userId: string): Promise<SyncResult> {
    const jobs = await prisma.job.findMany({
      where: { userId, deletedAt: null },
      select: { id: true, title: true, status: true },
    });

    const cards = jobs.map((j) => ({
      title: j.title,
      list: getTrelloListFromStatus(j.status),
    }));

    const result = client.syncToTrello(userId, cards);

    await prisma.integration.upsert({
      where: { userId_type: { userId, type: 'trello' } },
      update: {
        lastSyncAt: new Date(),
        lastSyncStatus: 'success',
        lastSyncMessage: result.message,
      },
      create: {
        userId,
        type: 'trello',
        status: 'connected',
        lastSyncAt: new Date(),
        lastSyncStatus: 'success',
        lastSyncMessage: result.message,
      },
    });

    return { ...result, details: { cardsCreated: cards.length } };
  },

  async createTrelloCard(userId: string, jobId: string): Promise<CardResult> {
    const job = await prisma.job.findFirst({ where: { id: jobId, userId } });
    if (!job || job.deletedAt) {
      throw new AppError(404, 'Job not found', 'JOB_001');
    }

    const list = getTrelloListFromStatus(job.status);
    const result = client.createCard(job.title, list);

    await prisma.job.update({ where: { id: jobId }, data: { trelloCardId: result.cardId } });

    return result;
  },

  async moveTrelloCard(userId: string, cardId: string, list?: string): Promise<CardResult> {
    const targetList = list || 'To Review';
    await syncQueue.add('trello-move', { userId });
    return client.moveCard(cardId, targetList);
  },

  async deleteTrelloCard(userId: string, cardId: string): Promise<{ success: boolean }> {
    await syncQueue.add('trello-delete', { userId });
    return client.deleteCard(cardId);
  },
};
