import { describe, it, expect } from "vitest";
import {
  createJobSchema,
  updateJobSchema,
  jobStatusSchema,
  favoriteSchema,
  jobListQuerySchema,
} from "@/modules/jobs/jobs.validation.js";

describe("createJobSchema", () => {
  it("accepts valid input", () => {
    const result = createJobSchema.parse({
      role: "Software Engineer",
      company: "Google",
    });
    expect(result.role).toBe("Software Engineer");
    expect(result.company).toBe("Google");
  });

  it("accepts full input with all fields", () => {
    const result = createJobSchema.parse({
      role: "Engineer",
      company: "Acme",
      location: "Remote",
      employmentType: "FULL_TIME",
      workplaceType: "REMOTE",
      salaryMin: 100000,
      salaryMax: 200000,
      currency: "USD",
      source: "linkedin",
      jobUrl: "https://example.com/job",
      description: "A great job",
      requirements: "5 years exp",
      benefits: "Stock options",
      experienceRequired: "5 years",
      education: "BS",
      notes: "Call recruiter",
    });
    expect(result.role).toBe("Engineer");
    expect(result.notes).toBe("Call recruiter");
  });

  it("rejects missing role", () => {
    expect(() => createJobSchema.parse({ company: "Google" })).toThrow();
  });

  it("rejects missing company", () => {
    expect(() => createJobSchema.parse({ role: "Engineer" })).toThrow();
  });

  it("rejects invalid URL", () => {
    expect(() =>
      createJobSchema.parse({ role: "Engineer", company: "Acme", jobUrl: "not-a-url" }),
    ).toThrow();
  });

  it("rejects invalid employmentType", () => {
    expect(() =>
      createJobSchema.parse({ role: "Engineer", company: "Acme", employmentType: "INVALID" }),
    ).toThrow();
  });

  it("rejects overly long role", () => {
    expect(() =>
      createJobSchema.parse({ role: "x".repeat(256), company: "Acme" }),
    ).toThrow();
  });

  it("rejects negative salary", () => {
    expect(() =>
      createJobSchema.parse({ role: "Engineer", company: "Acme", salaryMin: -100 }),
    ).toThrow();
  });
});

describe("updateJobSchema", () => {
  it("accepts partial update", () => {
    const result = updateJobSchema.parse({ role: "Senior Engineer" });
    expect(result.role).toBe("Senior Engineer");
  });

  it("accepts empty object", () => {
    const result = updateJobSchema.parse({});
    expect(Object.keys(result).length).toBe(0);
  });

  it("rejects invalid field", () => {
    const result = updateJobSchema.safeParse({ role: "", company: "Acme" });
    expect(result.success).toBe(false);
  });
});

describe("jobStatusSchema", () => {
  it("accepts valid status", () => {
    const result = jobStatusSchema.parse({ status: "READY_TO_APPLY" });
    expect(result.status).toBe("READY_TO_APPLY");
  });

  it("rejects invalid status", () => {
    expect(() => jobStatusSchema.parse({ status: "INVALID" })).toThrow();
  });

  it("accepts all valid statuses", () => {
    const statuses = [
      "NEW", "REVIEWING", "READY_TO_APPLY", "APPLIED",
      "FOLLOW_UP", "INTERVIEW", "OFFER", "REJECTED", "CLOSED",
    ];
    for (const status of statuses) {
      expect(() => jobStatusSchema.parse({ status })).not.toThrow();
    }
  });
});

describe("favoriteSchema", () => {
  it("accepts true", () => {
    const result = favoriteSchema.parse({ isFavorite: true });
    expect(result.isFavorite).toBe(true);
  });

  it("accepts false", () => {
    const result = favoriteSchema.parse({ isFavorite: false });
    expect(result.isFavorite).toBe(false);
  });

  it("rejects non-boolean", () => {
    expect(() => favoriteSchema.parse({ isFavorite: "yes" })).toThrow();
  });
});

describe("jobListQuerySchema", () => {
  it("provides defaults", () => {
    const result = jobListQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.sortBy).toBe("createdAt");
    expect(result.sortOrder).toBe("desc");
  });

  it("accepts custom values", () => {
    const result = jobListQuerySchema.parse({
      page: "2",
      limit: "10",
      status: "INTERVIEW",
      sortBy: "company",
      sortOrder: "asc",
    });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
    expect(result.status).toBe("INTERVIEW");
    expect(result.sortBy).toBe("company");
    expect(result.sortOrder).toBe("asc");
  });

  it("coerces favorite to boolean", () => {
    const result = jobListQuerySchema.parse({ favorite: "true" });
    expect(result.favorite).toBe(true);
  });

  it("rejects invalid sortBy", () => {
    expect(() => jobListQuerySchema.parse({ sortBy: "invalid" })).toThrow();
  });

  it("rejects limit over max", () => {
    expect(() => jobListQuerySchema.parse({ limit: "101" })).toThrow();
  });
});
