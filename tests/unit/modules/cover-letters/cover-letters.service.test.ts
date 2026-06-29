import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCoverLetterRepository = vi.hoisted(() => ({
  createCoverLetter: vi.fn(),
  findCoverLetterById: vi.fn(),
  findCoverLetters: vi.fn(),
  countCoverLetters: vi.fn(),
  updateCoverLetter: vi.fn(),
  deleteCoverLetterById: vi.fn(),
}));

const mockJobRepository = vi.hoisted(() => ({
  findJobById: vi.fn(),
}));

vi.mock("@/services/prisma.js", () => ({ prisma: {} }));
vi.mock("@/modules/cover-letters/cover-letters.repository.js", () => mockCoverLetterRepository);
vi.mock("@/modules/jobs/jobs.repository.js", () => mockJobRepository);

const userId = "user-1";
const letterId = "letter-1";
const jobId = "job-1";

function makeLetter(overrides = {}) {
  return {
    id: letterId,
    userId,
    jobId: null,
    content: "Dear hiring manager...",
    storageUrl: null,
    createdByAi: false,
    createdAt: new Date(),
    ...overrides,
  };
}

describe("createCoverLetter", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("creates a cover letter successfully", async () => {
    mockCoverLetterRepository.createCoverLetter.mockResolvedValue(makeLetter());

    const { createCoverLetter } = await import("@/modules/cover-letters/cover-letters.service.js");
    const result = await createCoverLetter(userId, { content: "Dear hiring manager..." });

    expect(result.content).toBe("Dear hiring manager...");
    expect(mockCoverLetterRepository.createCoverLetter).toHaveBeenCalledTimes(1);
  });
});

describe("listCoverLetters", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns paginated results", async () => {
    mockCoverLetterRepository.findCoverLetters.mockResolvedValue([makeLetter()]);
    mockCoverLetterRepository.countCoverLetters.mockResolvedValue(1);

    const { listCoverLetters } = await import("@/modules/cover-letters/cover-letters.service.js");
    const result = await listCoverLetters(userId, { page: 1, limit: 20 });

    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it("returns empty array when none exist", async () => {
    mockCoverLetterRepository.findCoverLetters.mockResolvedValue([]);
    mockCoverLetterRepository.countCoverLetters.mockResolvedValue(0);

    const { listCoverLetters } = await import("@/modules/cover-letters/cover-letters.service.js");
    const result = await listCoverLetters(userId, { page: 1, limit: 20 });

    expect(result.data).toHaveLength(0);
  });
});

describe("getCoverLetter", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns by id", async () => {
    mockCoverLetterRepository.findCoverLetterById.mockResolvedValue(makeLetter());

    const { getCoverLetter } = await import("@/modules/cover-letters/cover-letters.service.js");
    const result = await getCoverLetter(userId, letterId);

    expect(result.id).toBe(letterId);
  });

  it("throws 404 when not found", async () => {
    mockCoverLetterRepository.findCoverLetterById.mockResolvedValue(null);

    const { getCoverLetter } = await import("@/modules/cover-letters/cover-letters.service.js");
    await expect(getCoverLetter(userId, letterId)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("updateCoverLetter", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("updates content", async () => {
    mockCoverLetterRepository.findCoverLetterById.mockResolvedValue(makeLetter());
    mockCoverLetterRepository.updateCoverLetter.mockResolvedValue(makeLetter({ content: "Updated" }));

    const { updateCoverLetter } = await import("@/modules/cover-letters/cover-letters.service.js");
    const result = await updateCoverLetter(userId, letterId, { content: "Updated" });

    expect(result.content).toBe("Updated");
  });

  it("throws 404 when not found", async () => {
    mockCoverLetterRepository.findCoverLetterById.mockResolvedValue(null);

    const { updateCoverLetter } = await import("@/modules/cover-letters/cover-letters.service.js");
    await expect(updateCoverLetter(userId, letterId, { content: "Hi" })).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("deleteCoverLetter", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("hard deletes a cover letter", async () => {
    mockCoverLetterRepository.findCoverLetterById.mockResolvedValue(makeLetter());
    mockCoverLetterRepository.deleteCoverLetterById.mockResolvedValue(makeLetter());

    const { deleteCoverLetter } = await import("@/modules/cover-letters/cover-letters.service.js");
    await deleteCoverLetter(userId, letterId);

    expect(mockCoverLetterRepository.deleteCoverLetterById).toHaveBeenCalledWith(letterId);
  });

  it("throws 404 when not found", async () => {
    mockCoverLetterRepository.findCoverLetterById.mockResolvedValue(null);

    const { deleteCoverLetter } = await import("@/modules/cover-letters/cover-letters.service.js");
    await expect(deleteCoverLetter(userId, letterId)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("generateCoverLetter", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("throws 501 when called", async () => {
    mockJobRepository.findJobById.mockResolvedValue({ id: jobId });

    const { generateCoverLetter } = await import("@/modules/cover-letters/cover-letters.service.js");
    await expect(generateCoverLetter(userId, { jobId })).rejects.toMatchObject({ statusCode: 501 });
  });

  it("throws 404 when job not found", async () => {
    mockJobRepository.findJobById.mockResolvedValue(null);

    const { generateCoverLetter } = await import("@/modules/cover-letters/cover-letters.service.js");
    await expect(generateCoverLetter(userId, { jobId })).rejects.toMatchObject({ statusCode: 404 });
  });
});
