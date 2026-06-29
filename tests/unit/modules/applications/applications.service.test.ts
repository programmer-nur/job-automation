import { describe, it, expect, vi, beforeEach } from "vitest";

const mockApplicationRepository = vi.hoisted(() => ({
  createApplication: vi.fn(),
  findApplicationById: vi.fn(),
  findApplications: vi.fn(),
  countApplications: vi.fn(),
  updateApplication: vi.fn(),
  softDeleteApplication: vi.fn(),
}));

const mockJobRepository = vi.hoisted(() => ({
  findJobById: vi.fn(),
}));

vi.mock("@/services/prisma.js", () => ({ prisma: {} }));
vi.mock("@/modules/applications/applications.repository.js", () => mockApplicationRepository);
vi.mock("@/modules/jobs/jobs.repository.js", () => mockJobRepository);

const userId = "user-1";
const appId = "app-1";
const jobId = "job-1";

function makeApplication(overrides = {}) {
  return {
    id: appId,
    userId,
    jobId,
    resumeVersionId: null,
    coverLetterId: null,
    status: "APPLIED",
    appliedAt: null,
    followUpDate: null,
    interviewDate: null,
    offerDate: null,
    rejectionDate: null,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
}

describe("createApplication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an application successfully", async () => {
    mockJobRepository.findJobById.mockResolvedValue({ id: jobId });
    mockApplicationRepository.createApplication.mockResolvedValue(makeApplication());

    const { createApplication } = await import("@/modules/applications/applications.service.js");
    const result = await createApplication(userId, { jobId, notes: "Initial thoughts" });

    expect(result.jobId).toBe(jobId);
    expect(result.notes).toBeNull();
    expect(mockApplicationRepository.createApplication).toHaveBeenCalledTimes(1);
  });

  it("throws 404 when job not found", async () => {
    mockJobRepository.findJobById.mockResolvedValue(null);

    const { createApplication } = await import("@/modules/applications/applications.service.js");
    await expect(
      createApplication(userId, { jobId }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("listApplications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated results", async () => {
    mockApplicationRepository.findApplications.mockResolvedValue([makeApplication()]);
    mockApplicationRepository.countApplications.mockResolvedValue(1);

    const { listApplications } = await import("@/modules/applications/applications.service.js");
    const result = await listApplications(userId, { page: 1, limit: 20 });

    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
    expect(result.meta.page).toBe(1);
  });

  it("filters by status", async () => {
    mockApplicationRepository.findApplications.mockResolvedValue([makeApplication({ status: "SUBMITTED" })]);
    mockApplicationRepository.countApplications.mockResolvedValue(1);

    const { listApplications } = await import("@/modules/applications/applications.service.js");
    await listApplications(userId, { page: 1, limit: 20, status: "SUBMITTED" });
    expect(mockApplicationRepository.findApplications).toHaveBeenCalled();
  });

  it("filters by jobId", async () => {
    mockApplicationRepository.findApplications.mockResolvedValue([]);
    mockApplicationRepository.countApplications.mockResolvedValue(0);

    const { listApplications } = await import("@/modules/applications/applications.service.js");
    await listApplications(userId, { page: 1, limit: 20, jobId });
    expect(mockApplicationRepository.findApplications).toHaveBeenCalled();
  });

  it("returns empty array when no applications match", async () => {
    mockApplicationRepository.findApplications.mockResolvedValue([]);
    mockApplicationRepository.countApplications.mockResolvedValue(0);

    const { listApplications } = await import("@/modules/applications/applications.service.js");
    const result = await listApplications(userId, { page: 1, limit: 20 });

    expect(result.data).toHaveLength(0);
    expect(result.meta.total).toBe(0);
  });
});

describe("getApplication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an application by id", async () => {
    mockApplicationRepository.findApplicationById.mockResolvedValue(makeApplication());

    const { getApplication } = await import("@/modules/applications/applications.service.js");
    const result = await getApplication(userId, appId);

    expect(result.id).toBe(appId);
  });

  it("throws 404 when not found", async () => {
    mockApplicationRepository.findApplicationById.mockResolvedValue(null);

    const { getApplication } = await import("@/modules/applications/applications.service.js");
    await expect(getApplication(userId, appId)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("updateApplication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates notes", async () => {
    mockApplicationRepository.findApplicationById.mockResolvedValue(makeApplication());
    mockApplicationRepository.updateApplication.mockResolvedValue(makeApplication({ notes: "Updated" }));

    const { updateApplication } = await import("@/modules/applications/applications.service.js");
    const result = await updateApplication(userId, appId, { notes: "Updated" });

    expect(result.notes).toBe("Updated");
  });

  it("throws 404 when not found", async () => {
    mockApplicationRepository.findApplicationById.mockResolvedValue(null);

    const { updateApplication } = await import("@/modules/applications/applications.service.js");
    await expect(updateApplication(userId, appId, { notes: "Test" })).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe("deleteApplication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("soft deletes an application", async () => {
    mockApplicationRepository.findApplicationById.mockResolvedValue(makeApplication());
    mockApplicationRepository.softDeleteApplication.mockResolvedValue(makeApplication({ deletedAt: new Date() }));

    const { deleteApplication } = await import("@/modules/applications/applications.service.js");
    await deleteApplication(userId, appId);

    expect(mockApplicationRepository.softDeleteApplication).toHaveBeenCalledWith(appId);
  });

  it("throws 404 when not found", async () => {
    mockApplicationRepository.findApplicationById.mockResolvedValue(null);

    const { deleteApplication } = await import("@/modules/applications/applications.service.js");
    await expect(deleteApplication(userId, appId)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("updateApplicationStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates application status", async () => {
    mockApplicationRepository.findApplicationById.mockResolvedValue(makeApplication());
    mockApplicationRepository.updateApplication.mockResolvedValue(makeApplication({ status: "INTERVIEW" }));

    const { updateApplicationStatus } = await import("@/modules/applications/applications.service.js");
    const result = await updateApplicationStatus(userId, appId, "INTERVIEW");

    expect(result.status).toBe("INTERVIEW");
  });

  it("throws 404 when not found", async () => {
    mockApplicationRepository.findApplicationById.mockResolvedValue(null);

    const { updateApplicationStatus } = await import("@/modules/applications/applications.service.js");
    await expect(updateApplicationStatus(userId, appId, "INTERVIEW")).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe("scheduleFollowUp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets follow-up date", async () => {
    const futureDate = new Date("2026-07-15T10:00:00Z");
    mockApplicationRepository.findApplicationById.mockResolvedValue(makeApplication());
    mockApplicationRepository.updateApplication.mockResolvedValue(makeApplication({ followUpDate: futureDate }));

    const { scheduleFollowUp } = await import("@/modules/applications/applications.service.js");
    const result = await scheduleFollowUp(userId, appId, futureDate.toISOString());

    expect(result.followUpDate).toEqual(futureDate);
  });

  it("throws 404 when not found", async () => {
    mockApplicationRepository.findApplicationById.mockResolvedValue(null);

    const { scheduleFollowUp } = await import("@/modules/applications/applications.service.js");
    await expect(
      scheduleFollowUp(userId, appId, "2026-07-15T10:00:00Z"),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("updateApplicationNotes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates notes", async () => {
    mockApplicationRepository.findApplicationById.mockResolvedValue(makeApplication());
    mockApplicationRepository.updateApplication.mockResolvedValue(makeApplication({ notes: "New note" }));

    const { updateApplicationNotes } = await import("@/modules/applications/applications.service.js");
    const result = await updateApplicationNotes(userId, appId, "New note");

    expect(result.notes).toBe("New note");
  });

  it("clears notes when undefined", async () => {
    mockApplicationRepository.findApplicationById.mockResolvedValue(makeApplication({ notes: "Old note" }));
    mockApplicationRepository.updateApplication.mockResolvedValue(makeApplication({ notes: null }));

    const { updateApplicationNotes } = await import("@/modules/applications/applications.service.js");
    const result = await updateApplicationNotes(userId, appId, undefined);

    expect(result.notes).toBeNull();
  });

  it("throws 404 when not found", async () => {
    mockApplicationRepository.findApplicationById.mockResolvedValue(null);

    const { updateApplicationNotes } = await import("@/modules/applications/applications.service.js");
    await expect(
      updateApplicationNotes(userId, appId, "Notes"),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
