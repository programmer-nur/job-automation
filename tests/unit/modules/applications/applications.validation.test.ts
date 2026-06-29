import { describe, it, expect } from "vitest";
import {
  createApplicationSchema,
  updateApplicationSchema,
  applicationStatusSchema,
  followUpSchema,
  notesSchema,
  applicationListQuerySchema,
} from "@/modules/applications/applications.validation.js";

describe("createApplicationSchema", () => {
  it("accepts valid input", () => {
    const result = createApplicationSchema.parse({
      jobId: "550e8400-e29b-41d4-a716-446655440000",
      notes: "Initial thoughts",
    });
    expect(result.jobId).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(result.notes).toBe("Initial thoughts");
  });

  it("accepts input without notes", () => {
    const result = createApplicationSchema.parse({
      jobId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.notes).toBeUndefined();
  });

  it("rejects missing jobId", () => {
    expect(() => createApplicationSchema.parse({})).toThrow();
  });

  it("rejects invalid UUID for jobId", () => {
    expect(() =>
      createApplicationSchema.parse({ jobId: "not-a-uuid" }),
    ).toThrow();
  });

  it("rejects notes longer than 5000", () => {
    expect(() =>
      createApplicationSchema.parse({
        jobId: "550e8400-e29b-41d4-a716-446655440000",
        notes: "x".repeat(5001),
      }),
    ).toThrow();
  });
});

describe("updateApplicationSchema", () => {
  it("accepts valid input", () => {
    const result = updateApplicationSchema.parse({ notes: "Updated" });
    expect(result.notes).toBe("Updated");
  });

  it("accepts empty object", () => {
    const result = updateApplicationSchema.parse({});
    expect(result.notes).toBeUndefined();
  });

  it("rejects notes longer than 5000", () => {
    expect(() =>
      updateApplicationSchema.parse({ notes: "x".repeat(5001) }),
    ).toThrow();
  });
});

describe("applicationStatusSchema", () => {
  it("accepts valid status", () => {
    const result = applicationStatusSchema.parse({ status: "INTERVIEW" });
    expect(result.status).toBe("INTERVIEW");
  });

  it("accepts all valid statuses", () => {
    const statuses = [
      "NEW", "REVIEWING", "READY_TO_APPLY", "APPLIED",
      "FOLLOW_UP", "INTERVIEW", "OFFER", "REJECTED", "CLOSED",
    ];
    for (const s of statuses) {
      expect(() => applicationStatusSchema.parse({ status: s })).not.toThrow();
    }
  });

  it("rejects invalid status", () => {
    expect(() => applicationStatusSchema.parse({ status: "INVALID" })).toThrow();
  });

  it("rejects missing status", () => {
    expect(() => applicationStatusSchema.parse({})).toThrow();
  });
});

describe("followUpSchema", () => {
  it("accepts valid ISO datetime", () => {
    const result = followUpSchema.parse({
      followUpDate: "2026-07-15T10:00:00Z",
    });
    expect(result.followUpDate).toBe("2026-07-15T10:00:00Z");
  });

  it("rejects invalid date string", () => {
    expect(() =>
      followUpSchema.parse({ followUpDate: "not-a-date" }),
    ).toThrow();
  });

  it("rejects missing followUpDate", () => {
    expect(() => followUpSchema.parse({})).toThrow();
  });
});

describe("notesSchema", () => {
  it("accepts notes", () => {
    const result = notesSchema.parse({ notes: "Spoke with recruiter" });
    expect(result.notes).toBe("Spoke with recruiter");
  });

  it("accepts empty notes", () => {
    const result = notesSchema.parse({});
    expect(result.notes).toBeUndefined();
  });

  it("accepts explicit undefined notes", () => {
    const result = notesSchema.parse({ notes: undefined });
    expect(result.notes).toBeUndefined();
  });

  it("rejects notes longer than 5000", () => {
    expect(() => notesSchema.parse({ notes: "x".repeat(5001) })).toThrow();
  });
});

describe("applicationListQuerySchema", () => {
  it("applies defaults for empty query", () => {
    const result = applicationListQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.sortBy).toBe("createdAt");
    expect(result.sortOrder).toBe("desc");
  });

  it("accepts valid filters", () => {
    const result = applicationListQuerySchema.parse({
      page: "2",
      limit: "50",
      status: "APPLIED",
      jobId: "550e8400-e29b-41d4-a716-446655440002",
      sortBy: "status",
      sortOrder: "asc",
    });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(50);
    expect(result.status).toBe("APPLIED");
    expect(result.jobId).toBe("550e8400-e29b-41d4-a716-446655440002");
    expect(result.sortBy).toBe("status");
    expect(result.sortOrder).toBe("asc");
  });

  it("rejects invalid sortBy", () => {
    expect(() =>
      applicationListQuerySchema.parse({ sortBy: "invalid" }),
    ).toThrow();
  });

  it("rejects invalid sortOrder", () => {
    expect(() =>
      applicationListQuerySchema.parse({ sortOrder: "invalid" }),
    ).toThrow();
  });

  it("rejects invalid UUID for jobId", () => {
    expect(() =>
      applicationListQuerySchema.parse({ jobId: "not-uuid" }),
    ).toThrow();
  });

  it("rejects limit over max", () => {
    expect(() =>
      applicationListQuerySchema.parse({ limit: "101" }),
    ).toThrow();
  });
});
