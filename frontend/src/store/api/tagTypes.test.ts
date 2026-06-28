import { describe, it, expect } from "vitest";
import { TAG_TYPES } from "./tagTypes";

describe("TAG_TYPES", () => {
  it("contains all expected tag types", () => {
    expect(TAG_TYPES).toContain("User");
    expect(TAG_TYPES).toContain("Job");
    expect(TAG_TYPES).toContain("Application");
    expect(TAG_TYPES).toContain("Resume");
    expect(TAG_TYPES).toContain("CoverLetter");
    expect(TAG_TYPES).toContain("Task");
    expect(TAG_TYPES).toContain("Notification");
    expect(TAG_TYPES).toContain("Dashboard");
    expect(TAG_TYPES).toContain("Admin");
  });

  it("has exactly 9 tag types", () => {
    expect(TAG_TYPES).toHaveLength(9);
  });

  it("is a readonly tuple", () => {
    expect(Array.isArray(TAG_TYPES)).toBe(true);
    expect(typeof TAG_TYPES[0]).toBe("string");
  });
});
