import type { CardResult, ExportData, SyncResult } from '@/modules/integrations/integrations.types';

export interface IntegrationClient {
  syncToSheet(userId: string, data: ExportData): SyncResult;
  syncSingleJobToSheet(userId: string, job: ExportData['jobs'][number]): SyncResult;
  exportData(data: ExportData): SheetExportResult;
  syncToTrello(userId: string, cards: Array<{ title: string; list: string }>): SyncResult;
  createCard(title: string, list: string): CardResult;
  moveCard(cardId: string, list: string): CardResult;
  deleteCard(cardId: string): { success: boolean };
}

export interface SheetExportResult {
  data: ExportData;
  exportedAt: string;
}

const now = (): string => new Date().toISOString();

export class MockIntegrationProvider implements IntegrationClient {
  syncToSheet(_userId: string, data: ExportData): SyncResult {
    return {
      success: true,
      message: 'Google Sheets sync completed',
      timestamp: now(),
      details: {
        jobsSynced: data.jobs.length,
        applicationsSynced: data.applications.length,
      },
    };
  }

  syncSingleJobToSheet(_userId: string, _job: ExportData['jobs'][number]): SyncResult {
    return {
      success: true,
      message: 'Job synced to Google Sheets',
      timestamp: now(),
      details: { jobsSynced: 1 },
    };
  }

  exportData(data: ExportData): SheetExportResult {
    return { data, exportedAt: now() };
  }

  syncToTrello(_userId: string, cards: Array<{ title: string; list: string }>): SyncResult {
    return {
      success: true,
      message: 'Trello sync completed',
      timestamp: now(),
      details: { cardsCreated: cards.length },
    };
  }

  createCard(title: string, _list: string): CardResult {
    return {
      cardId: `mock-card-${Date.now()}`,
      url: `https://trello.com/c/mock-${title.toLowerCase().replace(/\s+/g, '-')}`,
    };
  }

  moveCard(_cardId: string, _list: string): CardResult {
    return {
      cardId: `mock-card-${Date.now()}`,
      url: 'https://trello.com/c/mock-moved',
    };
  }

  deleteCard(_cardId: string): { success: boolean } {
    return { success: true };
  }
}
