import { describe, it, expect, vi, beforeEach } from "vitest";
import { createJob, listJobs, getJob, updateJob, deleteJob, updateJobStatus, toggleFavorite } from "@/modules/jobs/jobs.service.js";

const mockRepository = vi.hoisted(() => ({
  createJob: vi.fn(),
  findJobById: vi.fn(),
  findJobs: vi.fn(),
  countJobs: vi.fn(),
  updateJob: vi.fn(),
  softDeleteJob: vi.fn(),
  findJobByUrl: vi.fn(),
}));

vi.mock("@/services/prisma.js", () => ({ prisma: {} }));
vi.mock("@/modules/jobs/jobs.repository.js", () => mockRepository);

const userId = "user-1";
const jobId = "job-1";

function makeJob(overrides = {}) {
  return {
    id: jobId,
    userId,
    role: "Engineer",
    company: "Acme",
    location: null,
    employmentType: null,
    workplaceType: null,
    salaryMin: null,
    salaryMax: null,
    currency: null,
    source: null,
    jobUrl: null,
    description: null,
    requirements: null,
    benefits: null,
    experienceRequired: null,
    education: null,
    matchScore: null,
    status: "NEW",
    priority: "MEDIUM",
    isFavorite: false,
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    jobSkills: [],
    ...overrides,
  };
}

describe("createJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a job successfully", async () => {
    mockRepository.createJob.mockResolvedValue(makeJob());
    mockRepository.findJobByUrl.mockResolvedValue(null);

    const result = await createJob(userId, { role: "Engineer", company: "Acme" });

    expect(result.role).toBe("Engineer");
    expect(result.company).toBe("Acme");
    expect(mockRepository.createJob).toHaveBeenCalledTimes(1);
  });

  it("stores notes in metadata", async () => {
    mockRepository.createJob.mockResolvedValue(makeJob({ metadata: { notes: "Call recruiter" } }));
    mockRepository.findJobByUrl.mockResolvedValue(null);

    const result = await createJob(userId, {
      role: "Engineer",
      company: "Acme",
      notes: "Call recruiter",
    });

    expect(result.notes).toBe("Call recruiter");
  });

  it("rejects duplicate URL", async () => {
    mockRepository.findJobByUrl.mockResolvedValue(makeJob());

    await expect(
      createJob(userId, { role: "Engineer", company: "Acme", jobUrl: "https://example.com/job" }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("allows same URL for different users", async () => {
    mockRepository.findJobByUrl.mockResolvedValue(null);
    mockRepository.createJob.mockResolvedValue(makeJob());

    const result = await createJob(userId, {
      role: "Engineer",
      company: "Acme",
      jobUrl: "https://example.com/job",
    });

    expect(result).toBeDefined();
  });
});

describe("listJobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated results", async () => {
    mockRepository.findJobs.mockResolvedValue([makeJob()]);
    mockRepository.countJobs.mockResolvedValue(1);

    const result = await listJobs(userId, { page: 1, limit: 20 });

    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
    expect(result.meta.page).toBe(1);
  });

  it("filters by status", async () => {
    mockRepository.findJobs.mockResolvedValue([makeJob({ status: "INTERVIEW" })]);
    mockRepository.countJobs.mockResolvedValue(1);

    await listJobs(userId, { page: 1, limit: 20, status: "INTERVIEW" });
    expect(mockRepository.findJobs).toHaveBeenCalled();
  });

  it("filters by favorite", async () => {
    mockRepository.findJobs.mockResolvedValue([]);
    mockRepository.countJobs.mockResolvedValue(0);

    await listJobs(userId, { page: 1, limit: 20, favorite: true });
    expect(mockRepository.findJobs).toHaveBeenCalled();
  });

  it("searches across role, company, description", async () => {
    mockRepository.findJobs.mockResolvedValue([makeJob()]);
    mockRepository.countJobs.mockResolvedValue(1);

    await listJobs(userId, { page: 1, limit: 20, search: "eng" });
    expect(mockRepository.findJobs).toHaveBeenCalled();
  });

  it("returns empty array when no jobs match", async () => {
    mockRepository.findJobs.mockResolvedValue([]);
    mockRepository.countJobs.mockResolvedValue(0);

    const result = await listJobs(userId, { page: 1, limit: 20 });

    expect(result.data).toHaveLength(0);
    expect(result.meta.total).toBe(0);
  });
});

describe("getJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a job by id", async () => {
    mockRepository.findJobById.mockResolvedValue(makeJob());

    const result = await getJob(userId, jobId);

    expect(result.id).toBe(jobId);
  });

  it("throws 404 when not found", async () => {
    mockRepository.findJobById.mockResolvedValue(null);

    await expect(getJob(userId, jobId)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("updateJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates job fields", async () => {
    mockRepository.findJobById.mockResolvedValue(makeJob());
    mockRepository.updateJob.mockResolvedValue(makeJob({ role: "Senior Engineer" }));

    const result = await updateJob(userId, jobId, { role: "Senior Engineer" });

    expect(result.role).toBe("Senior Engineer");
  });

  it("updates notes in metadata", async () => {
    mockRepository.findJobById.mockResolvedValue(makeJob({ metadata: { notes: "Old" } }));
    mockRepository.updateJob.mockResolvedValue(makeJob({ metadata: { notes: "New note" } }));

    const result = await updateJob(userId, jobId, { notes: "New note" });

    expect(result.notes).toBe("New note");
  });

  it("throws 404 when not found", async () => {
    mockRepository.findJobById.mockResolvedValue(null);

    await expect(updateJob(userId, jobId, { role: "Engineer" })).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe("deleteJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("soft deletes a job", async () => {
    mockRepository.findJobById.mockResolvedValue(makeJob());
    mockRepository.softDeleteJob.mockResolvedValue(makeJob({ deletedAt: new Date() }));

    await deleteJob(userId, jobId);

    expect(mockRepository.softDeleteJob).toHaveBeenCalledWith(jobId);
  });

  it("throws 404 when not found", async () => {
    mockRepository.findJobById.mockResolvedValue(null);

    await expect(deleteJob(userId, jobId)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("updateJobStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates job status", async () => {
    mockRepository.findJobById.mockResolvedValue(makeJob());
    mockRepository.updateJob.mockResolvedValue(makeJob({ status: "REVIEWING" }));

    const result = await updateJobStatus(userId, jobId, "REVIEWING");

    expect(result.status).toBe("REVIEWING");
  });

  it("throws 404 when not found", async () => {
    mockRepository.findJobById.mockResolvedValue(null);

    await expect(updateJobStatus(userId, jobId, "REVIEWING")).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe("toggleFavorite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets favorite to true", async () => {
    mockRepository.findJobById.mockResolvedValue(makeJob({ isFavorite: false }));
    mockRepository.updateJob.mockResolvedValue(makeJob({ isFavorite: true }));

    const result = await toggleFavorite(userId, jobId, true);

    expect(result.isFavorite).toBe(true);
  });

  it("sets favorite to false", async () => {
    mockRepository.findJobById.mockResolvedValue(makeJob({ isFavorite: true }));
    mockRepository.updateJob.mockResolvedValue(makeJob({ isFavorite: false }));

    const result = await toggleFavorite(userId, jobId, false);

    expect(result.isFavorite).toBe(false);
  });

  it("throws 404 when not found", async () => {
    mockRepository.findJobById.mockResolvedValue(null);

    await expect(toggleFavorite(userId, jobId, true)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
