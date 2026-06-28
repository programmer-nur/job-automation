import { describe, expect, it } from 'vitest';

import {
  createNotificationSchema,
  notificationListQuerySchema,
} from '@/modules/notifications/notifications.validation';

describe('createNotificationSchema', () => {
  it('accepts valid input', () => {
    const result = createNotificationSchema.safeParse({
      title: 'Interview Reminder',
      message: 'You have an interview tomorrow at 2pm',
      type: 'reminder',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing title', () => {
    const result = createNotificationSchema.safeParse({ message: 'Body', type: 'reminder' });
    expect(result.success).toBe(false);
  });

  it('rejects missing message', () => {
    const result = createNotificationSchema.safeParse({ title: 'Title', type: 'reminder' });
    expect(result.success).toBe(false);
  });

  it('rejects title exceeding 255 chars', () => {
    const result = createNotificationSchema.safeParse({
      title: 'x'.repeat(256),
      message: 'Body',
      type: 'reminder',
    });
    expect(result.success).toBe(false);
  });
});

describe('notificationListQuerySchema', () => {
  it('provides defaults', () => {
    const result = notificationListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it('accepts isRead filter', () => {
    const result = notificationListQuerySchema.safeParse({ isRead: 'true' });
    expect(result.success).toBe(true);
  });

  it('accepts isRead=false', () => {
    const result = notificationListQuerySchema.safeParse({ isRead: 'false' });
    expect(result.success).toBe(true);
  });
});
