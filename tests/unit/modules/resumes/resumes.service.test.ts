import { describe, it, expect, vi, beforeEach } from "vitest";

const mockResumeRepository = vi.hoisted(() => ({
  createResume: vi.fn(),
  findResumeById: vi.fn(),
  findResumes: vi.fn(),
  countResumes: vi.fn(),
  updateResume: vi.fn(),
  softDeleteResume: vi.fn(),
  deactivateAllResumes: vi.fn(),
}));

const mockJobRepository = vi.hoisted(() => ({
  findJobById: vi.fn(),
}));

vi.mock("@/services/prisma.js", () => ({ prisma: {} }));
vi.mock("@/modules/resumes/resumes.repository.js", () => mockResumeRepository);
vi.mock("@/modules/jobs/jobs.repository.js", () => mockJobRepository);

const userId = "user-1";
const resumeId = "resume-1";
const jobId = "job-1";

function makeResume(overrides = {}) {
  return {
    id: resumeId,
    userId,
    name: "My Resume",
    targetRole: null,
    storageUrl: null,
    atsScore: null,
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
}

describe("createResume", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("creates a resume successfully", async () => {
    mockResumeRepository.createResume.mockResolvedValue(makeResume());

    const { createResume } = await import("@/modules/resumes/resumes.service.js");
    const result = await createResume(userId, { name: "My Resume" });

    expect(result.name).toBe("My Resume");
    expect(mockResumeRepository.createResume).toHaveBeenCalledTimes(1);
  });

  it("passes optional fields", async () => {
    mockResumeRepository.createResume.mockResolvedValue(makeResume({
      targetRole: "Engineer",
      storageUrl: "https://example.com/resume.pdf",
    }));

    const { createResume } = await import("@/modules/resumes/resumes.service.js");
    const result = await createResume(userId, {
      name: "Resume",
      targetRole: "Engineer",
      storageUrl: "https://example.com/resume.pdf",
    });

    expect(result.targetRole).toBe("Engineer");
    expect(result.storageUrl).toBe("https://example.com/resume.pdf");
  });
});

describe("listResumes", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns paginated results", async () => {
    mockResumeRepository.findResumes.mockResolvedValue([makeResume()]);
    mockResumeRepository.countResumes.mockResolvedValue(1);

    const { listResumes } = await import("@/modules/resumes/resumes.service.js");
    const result = await listResumes(userId, { page: 1, limit: 20 });

    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it("filters by isDefault", async () => {
    mockResumeRepository.findResumes.mockResolvedValue([]);
    mockResumeRepository.countResumes.mockResolvedValue(0);

    const { listResumes } = await import("@/modules/resumes/resumes.service.js");
    await listResumes(userId, { page: 1, limit: 20, isDefault: true });

    expect(mockResumeRepository.findResumes).toHaveBeenCalled();
  });
});

describe("getResume", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns a resume by id", async () => {
    mockResumeRepository.findResumeById.mockResolvedValue(makeResume());

    const { getResume } = await import("@/modules/resumes/resumes.service.js");
    const result = await getResume(userId, resumeId);

    expect(result.id).toBe(resumeId);
  });

  it("throws 404 when not found", async () => {
    mockResumeRepository.findResumeById.mockResolvedValue(null);

    const { getResume } = await import("@/modules/resumes/resumes.service.js");
    await expect(getResume(userId, resumeId)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("updateResume", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("updates resume fields", async () => {
    mockResumeRepository.findResumeById.mockResolvedValue(makeResume());
    mockResumeRepository.updateResume.mockResolvedValue(makeResume({ name: "Updated" }));

    const { updateResume } = await import("@/modules/resumes/resumes.service.js");
    const result = await updateResume(userId, resumeId, { name: "Updated" });

    expect(result.name).toBe("Updated");
  });

  it("throws 404 when not found", async () => {
    mockResumeRepository.findResumeById.mockResolvedValue(null);

    const { updateResume } = await import("@/modules/resumes/resumes.service.js");
    await expect(updateResume(userId, resumeId, { name: "Test" })).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("deleteResume", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("soft deletes a resume", async () => {
    mockResumeRepository.findResumeById.mockResolvedValue(makeResume());
    mockResumeRepository.softDeleteResume.mockResolvedValue(makeResume({ deletedAt: new Date() }));

    const { deleteResume } = await import("@/modules/resumes/resumes.service.js");
    await deleteResume(userId, resumeId);

    expect(mockResumeRepository.softDeleteResume).toHaveBeenCalledWith(resumeId);
  });

  it("throws 404 when not found", async () => {
    mockResumeRepository.findResumeById.mockResolvedValue(null);

    const { deleteResume } = await import("@/modules/resumes/resumes.service.js");
    await expect(deleteResume(userId, resumeId)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("setActiveResume", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("sets resume as active and deactivates others", async () => {
    mockResumeRepository.findResumeById.mockResolvedValue(makeResume());
    mockResumeRepository.deactivateAllResumes.mockResolvedValue({ count: 2 });
    mockResumeRepository.updateResume.mockResolvedValue(makeResume({ isDefault: true }));

    const { setActiveResume } = await import("@/modules/resumes/resumes.service.js");
    const result = await setActiveResume(userId, resumeId);

    expect(result.isDefault).toBe(true);
    expect(mockResumeRepository.deactivateAllResumes).toHaveBeenCalledWith(userId);
  });

  it("throws 404 when not found", async () => {
    mockResumeRepository.findResumeById.mockResolvedValue(null);

    const { setActiveResume } = await import("@/modules/resumes/resumes.service.js");
    await expect(setActiveResume(userId, resumeId)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("tailorResume", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("throws 501 when called", async () => {
    mockResumeRepository.findResumeById.mockResolvedValue(makeResume());
    mockJobRepository.findJobById.mockResolvedValue({ id: jobId });

    const { tailorResume } = await import("@/modules/resumes/resumes.service.js");
    await expect(tailorResume(userId, resumeId, jobId)).rejects.toMatchObject({ statusCode: 501 });
  });

  it("throws 404 when resume not found", async () => {
    mockResumeRepository.findResumeById.mockResolvedValue(null);

    const { tailorResume } = await import("@/modules/resumes/resumes.service.js");
    await expect(tailorResume(userId, resumeId, jobId)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("throws 404 when job not found", async () => {
    mockResumeRepository.findResumeById.mockResolvedValue(makeResume());
    mockJobRepository.findJobById.mockResolvedValue(null);

    const { tailorResume } = await import("@/modules/resumes/resumes.service.js");
    await expect(tailorResume(userId, resumeId, jobId)).rejects.toMatchObject({ statusCode: 404 });
  });
});
