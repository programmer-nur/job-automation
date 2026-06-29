import { describe, it, expect } from "vitest";
import {
  createNotificationSchema,
  notificationListQuerySchema,
} from "@/modules/notifications/notifications.validation.js";

describe("createNotificationSchema", () => {
  it("accepts valid input", () => {
    const result = createNotificationSchema.parse({
      title: "Follow-up reminder",
      message: "Don't forget to follow up with Acme",
      taskId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.title).toBe("Follow-up reminder");
    expect(result.message).toBe("Don't forget to follow up with Acme");
    expect(result.taskId).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("accepts input with only title", () => {
    const result = createNotificationSchema.parse({ title: "Reminder" });
    expect(result.title).toBe("Reminder");
  });

  it("rejects missing title", () => {
    expect(() => createNotificationSchema.parse({})).toThrow();
  });

  it("rejects empty title", () => {
    expect(() => createNotificationSchema.parse({ title: "" })).toThrow();
  });

  it("rejects title over 255 chars", () => {
    expect(() =>
      createNotificationSchema.parse({ title: "x".repeat(256) }),
    ).toThrow();
  });

  it("rejects message over 5000 chars", () => {
    expect(() =>
      createNotificationSchema.parse({ title: "Test", message: "x".repeat(5001) }),
    ).toThrow();
  });

  it("rejects invalid UUID for taskId", () => {
    expect(() =>
      createNotificationSchema.parse({ title: "Test", taskId: "bad" }),
    ).toThrow();
  });
});

describe("notificationListQuerySchema", () => {
  it("applies defaults for empty query", () => {
    const result = notificationListQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.isRead).toBeUndefined();
  });

  it("accepts isRead filter", () => {
    const result = notificationListQuerySchema.parse({ isRead: "true" });
    expect(result.isRead).toBe(true);
  });
});
