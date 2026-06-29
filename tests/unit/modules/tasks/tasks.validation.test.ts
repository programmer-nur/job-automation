import { describe, it, expect } from "vitest";
import {
  createTaskSchema,
  updateTaskSchema,
  taskListQuerySchema,
} from "@/modules/tasks/tasks.validation.js";

describe("createTaskSchema", () => {
  it("accepts valid input", () => {
    const result = createTaskSchema.parse({
      title: "Follow up with recruiter",
      description: "Send thank you email",
      dueDate: "2026-07-15T10:00:00Z",
      applicationId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.title).toBe("Follow up with recruiter");
    expect(result.description).toBe("Send thank you email");
    expect(result.dueDate).toBe("2026-07-15T10:00:00Z");
    expect(result.applicationId).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("accepts input with only title", () => {
    const result = createTaskSchema.parse({ title: "Simple task" });
    expect(result.title).toBe("Simple task");
  });

  it("rejects missing title", () => {
    expect(() => createTaskSchema.parse({})).toThrow();
  });

  it("rejects empty title", () => {
    expect(() => createTaskSchema.parse({ title: "" })).toThrow();
  });

  it("rejects title over 500 chars", () => {
    expect(() => createTaskSchema.parse({ title: "x".repeat(501) })).toThrow();
  });

  it("rejects description over 5000 chars", () => {
    expect(() =>
      createTaskSchema.parse({ title: "Task", description: "x".repeat(5001) }),
    ).toThrow();
  });

  it("rejects invalid ISO datetime for dueDate", () => {
    expect(() =>
      createTaskSchema.parse({ title: "Task", dueDate: "not-a-date" }),
    ).toThrow();
  });

  it("rejects invalid UUID for applicationId", () => {
    expect(() =>
      createTaskSchema.parse({ title: "Task", applicationId: "bad" }),
    ).toThrow();
  });
});

describe("updateTaskSchema", () => {
  it("accepts partial update", () => {
    const result = updateTaskSchema.parse({ title: "Updated" });
    expect(result.title).toBe("Updated");
  });

  it("accepts empty object", () => {
    const result = updateTaskSchema.parse({});
    expect(Object.keys(result)).toHaveLength(0);
  });

  it("rejects title over 500 chars", () => {
    expect(() => updateTaskSchema.parse({ title: "x".repeat(501) })).toThrow();
  });
});

describe("taskListQuerySchema", () => {
  it("applies defaults for empty query", () => {
    const result = taskListQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.sortBy).toBe("createdAt");
    expect(result.sortOrder).toBe("desc");
  });

  it("accepts status filter", () => {
    const result = taskListQuerySchema.parse({ status: "completed" });
    expect(result.status).toBe("completed");
  });

  it("rejects invalid status", () => {
    expect(() => taskListQuerySchema.parse({ status: "invalid" })).toThrow();
  });

  it("accepts applicationId filter", () => {
    const result = taskListQuerySchema.parse({
      applicationId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.applicationId).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("rejects invalid applicationId", () => {
    expect(() =>
      taskListQuerySchema.parse({ applicationId: "bad" }),
    ).toThrow();
  });
});
