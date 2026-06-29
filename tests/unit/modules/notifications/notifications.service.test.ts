import { describe, it, expect, vi, beforeEach } from "vitest";

const mockNotificationRepository = vi.hoisted(() => ({
  createNotification: vi.fn(),
  findNotificationById: vi.fn(),
  findNotifications: vi.fn(),
  countNotifications: vi.fn(),
  updateNotification: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
}));

vi.mock("@/services/prisma.js", () => ({ prisma: {} }));
vi.mock("@/modules/notifications/notifications.repository.js", () => mockNotificationRepository);

const userId = "user-1";
const notifId = "notif-1";

function makeNotification(overrides = {}) {
  return {
    id: notifId,
    userId,
    title: "Follow-up reminder",
    message: null,
    isRead: false,
    createdAt: new Date(),
    ...overrides,
  };
}

describe("createNotification", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("creates a notification successfully", async () => {
    mockNotificationRepository.createNotification.mockResolvedValue(
      makeNotification({ title: "Reminder" }),
    );

    const { createNotification } = await import(
      "@/modules/notifications/notifications.service.js"
    );
    const result = await createNotification(userId, { title: "Reminder" });

    expect(result.title).toBe("Reminder");
    expect(result.isRead).toBe(false);
    expect(mockNotificationRepository.createNotification).toHaveBeenCalledTimes(1);
  });
});

describe("listNotifications", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns paginated results", async () => {
    mockNotificationRepository.findNotifications.mockResolvedValue([makeNotification()]);
    mockNotificationRepository.countNotifications.mockResolvedValue(1);

    const { listNotifications } = await import(
      "@/modules/notifications/notifications.service.js"
    );
    const result = await listNotifications(userId, { page: 1, limit: 20 });

    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it("filters by isRead", async () => {
    mockNotificationRepository.findNotifications.mockResolvedValue([]);
    mockNotificationRepository.countNotifications.mockResolvedValue(0);

    const { listNotifications } = await import(
      "@/modules/notifications/notifications.service.js"
    );
    await listNotifications(userId, { page: 1, limit: 20, isRead: false });

    expect(mockNotificationRepository.findNotifications).toHaveBeenCalled();
  });
});

describe("getNotification", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns by id", async () => {
    mockNotificationRepository.findNotificationById.mockResolvedValue(makeNotification());

    const { getNotification } = await import(
      "@/modules/notifications/notifications.service.js"
    );
    const result = await getNotification(userId, notifId);

    expect(result.id).toBe(notifId);
  });

  it("throws 404 when not found", async () => {
    mockNotificationRepository.findNotificationById.mockResolvedValue(null);

    const { getNotification } = await import(
      "@/modules/notifications/notifications.service.js"
    );
    await expect(getNotification(userId, notifId)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe("markAsRead", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("marks notification as read", async () => {
    mockNotificationRepository.findNotificationById.mockResolvedValue(makeNotification());
    mockNotificationRepository.updateNotification.mockResolvedValue(
      makeNotification({ isRead: true }),
    );

    const { markAsRead } = await import(
      "@/modules/notifications/notifications.service.js"
    );
    const result = await markAsRead(userId, notifId);

    expect(result.isRead).toBe(true);
  });

  it("throws 404 when not found", async () => {
    mockNotificationRepository.findNotificationById.mockResolvedValue(null);

    const { markAsRead } = await import(
      "@/modules/notifications/notifications.service.js"
    );
    await expect(markAsRead(userId, notifId)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe("markAllAsRead", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("marks all unread notifications as read", async () => {
    mockNotificationRepository.markAllNotificationsAsRead.mockResolvedValue({ count: 3 });

    const { markAllAsRead } = await import(
      "@/modules/notifications/notifications.service.js"
    );
    const result = await markAllAsRead(userId);

    expect(result.count).toBe(3);
    expect(mockNotificationRepository.markAllNotificationsAsRead).toHaveBeenCalledWith(userId);
  });
});
