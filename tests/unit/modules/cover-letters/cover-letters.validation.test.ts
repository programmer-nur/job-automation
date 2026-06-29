import { describe, it, expect } from "vitest";
import {
  createCoverLetterSchema,
  updateCoverLetterSchema,
  generateCoverLetterSchema,
  coverLetterListQuerySchema,
} from "@/modules/cover-letters/cover-letters.validation.js";

describe("createCoverLetterSchema", () => {
  it("accepts valid input", () => {
    const result = createCoverLetterSchema.parse({
      jobId: "550e8400-e29b-41d4-a716-446655440000",
      content: "Dear hiring manager...",
      storageUrl: "https://storage.example.com/letter.pdf",
    });
    expect(result.content).toBe("Dear hiring manager...");
    expect(result.jobId).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(result.storageUrl).toBe("https://storage.example.com/letter.pdf");
  });

  it("accepts input without optional fields", () => {
    const result = createCoverLetterSchema.parse({ content: "Hello" });
    expect(result.content).toBe("Hello");
    expect(result.jobId).toBeUndefined();
    expect(result.storageUrl).toBeUndefined();
  });

  it("rejects missing content", () => {
    expect(() => createCoverLetterSchema.parse({})).toThrow();
  });

  it("rejects empty content", () => {
    expect(() => createCoverLetterSchema.parse({ content: "" })).toThrow();
  });

  it("rejects content over 50000 chars", () => {
    expect(() =>
      createCoverLetterSchema.parse({ content: "x".repeat(50001) }),
    ).toThrow();
  });

  it("rejects invalid UUID for jobId", () => {
    expect(() =>
      createCoverLetterSchema.parse({ content: "Hello", jobId: "not-uuid" }),
    ).toThrow();
  });

  it("rejects invalid URL for storageUrl", () => {
    expect(() =>
      createCoverLetterSchema.parse({ content: "Hello", storageUrl: "invalid" }),
    ).toThrow();
  });
});

describe("updateCoverLetterSchema", () => {
  it("accepts partial update", () => {
    const result = updateCoverLetterSchema.parse({ content: "Updated" });
    expect(result.content).toBe("Updated");
  });

  it("accepts empty object", () => {
    const result = updateCoverLetterSchema.parse({});
    expect(Object.keys(result)).toHaveLength(0);
  });

  it("rejects content over 50000", () => {
    expect(() =>
      updateCoverLetterSchema.parse({ content: "x".repeat(50001) }),
    ).toThrow();
  });
});

describe("generateCoverLetterSchema", () => {
  it("accepts valid UUID", () => {
    const result = generateCoverLetterSchema.parse({
      jobId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.jobId).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("rejects missing jobId", () => {
    expect(() => generateCoverLetterSchema.parse({})).toThrow();
  });

  it("rejects invalid UUID", () => {
    expect(() => generateCoverLetterSchema.parse({ jobId: "bad" })).toThrow();
  });
});

describe("coverLetterListQuerySchema", () => {
  it("applies defaults", () => {
    const result = coverLetterListQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.sortBy).toBe("createdAt");
    expect(result.sortOrder).toBe("desc");
  });

  it("rejects invalid sortBy", () => {
    expect(() =>
      coverLetterListQuerySchema.parse({ sortBy: "invalid" }),
    ).toThrow();
  });
});
