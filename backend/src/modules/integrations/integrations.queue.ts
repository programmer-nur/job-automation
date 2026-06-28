import type { SyncJobData } from '@/modules/integrations/integrations.types';

type JobHandler = (data: SyncJobData) => Promise<unknown>;

interface QueueJob {
  id: string;
  type: string;
  data: SyncJobData;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export class MockQueue {
  private handlers = new Map<string, JobHandler>();
  private jobs: QueueJob[] = [];
  private counter = 0;

  register(type: string, handler: JobHandler): void {
    this.handlers.set(type, handler);
  }

  async add(type: string, data: SyncJobData): Promise<{ id: string; status: string }> {
    const id = `queue-${++this.counter}`;
    const job: QueueJob = {
      id,
      type,
      data,
      status: 'pending',
      createdAt: new Date(),
    };
    this.jobs.push(job);

    const handler = this.handlers.get(type);
    if (handler) {
      try {
        await handler(data);
        job.status = 'completed';
      } catch {
        job.status = 'failed';
      }
    }

    return { id, status: job.status };
  }

  getStatus(): { pending: number; completed: number; failed: number } {
    return {
      pending: this.jobs.filter((j) => j.status === 'pending').length,
      completed: this.jobs.filter((j) => j.status === 'completed').length,
      failed: this.jobs.filter((j) => j.status === 'failed').length,
    };
  }

  reset(): void {
    this.jobs = [];
    this.counter = 0;
  }
}

export const syncQueue = new MockQueue();
