import { describe, it, expect } from "vitest";
import {
  createResumeSchema,
  updateResumeSchema,
  tailorSchema,
  resumeListQuerySchema,
} from "@/modules/resumes/resumes.validation.js";

describe("createResumeSchema", () => {
  it("accepts valid input", () => {
    const result = createResumeSchema.parse({
      name: "Frontend Resume",
      targetRole: "Senior Engineer",
      storageUrl: "https://storage.example.com/resume.pdf",
    });
    expect(result.name).toBe("Frontend Resume");
    expect(result.targetRole).toBe("Senior Engineer");
    expect(result.storageUrl).toBe("https://storage.example.com/resume.pdf");
  });

  it("accepts input with only name", () => {
    const result = createResumeSchema.parse({ name: "My Resume" });
    expect(result.name).toBe("My Resume");
    expect(result.targetRole).toBeUndefined();
    expect(result.storageUrl).toBeUndefined();
  });

  it("rejects missing name", () => {
    expect(() => createResumeSchema.parse({})).toThrow();
  });

  it("rejects empty name", () => {
    expect(() => createResumeSchema.parse({ name: "" })).toThrow();
  });

  it("rejects name over 255 chars", () => {
    expect(() => createResumeSchema.parse({ name: "x".repeat(256) })).toThrow();
  });

  it("rejects invalid URL for storageUrl", () => {
    expect(() =>
      createResumeSchema.parse({ name: "Resume", storageUrl: "not-a-url" }),
    ).toThrow();
  });

  it("rejects targetRole over 255 chars", () => {
    expect(() =>
      createResumeSchema.parse({ name: "Resume", targetRole: "x".repeat(256) }),
    ).toThrow();
  });
});

describe("updateResumeSchema", () => {
  it("accepts partial update", () => {
    const result = updateResumeSchema.parse({ name: "Updated Resume" });
    expect(result.name).toBe("Updated Resume");
  });

  it("accepts empty object", () => {
    const result = updateResumeSchema.parse({});
    expect(Object.keys(result)).toHaveLength(0);
  });

  it("rejects invalid URL", () => {
    expect(() =>
      updateResumeSchema.parse({ storageUrl: "invalid" }),
    ).toThrow();
  });
});

describe("tailorSchema", () => {
  it("accepts valid UUID", () => {
    const result = tailorSchema.parse({
      jobId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.jobId).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("rejects missing jobId", () => {
    expect(() => tailorSchema.parse({})).toThrow();
  });

  it("rejects invalid UUID", () => {
    expect(() => tailorSchema.parse({ jobId: "not-uuid" })).toThrow();
  });
});

describe("resumeListQuerySchema", () => {
  it("applies defaults for empty query", () => {
    const result = resumeListQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.sortBy).toBe("createdAt");
    expect(result.sortOrder).toBe("desc");
  });

  it("accepts isActive filter", () => {
    const result = resumeListQuerySchema.parse({ isDefault: "true" });
    expect(result.isDefault).toBe(true);
  });

  it("rejects invalid sortBy", () => {
    expect(() =>
      resumeListQuerySchema.parse({ sortBy: "invalid" }),
    ).toThrow();
  });
});
