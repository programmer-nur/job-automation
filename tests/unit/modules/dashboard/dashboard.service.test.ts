import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  job: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
  application: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
  task: {
    count: vi.fn(),
  },
  notification: {
    count: vi.fn(),
  },
  resumeVersion: {
    count: vi.fn(),
  },
}));

vi.mock("@/services/prisma.js", () => ({ prisma: mockPrisma }));

const userId = "user-1";

describe("getSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns aggregated counts", async () => {
    mockPrisma.job.count.mockResolvedValue(10);
    mockPrisma.application.count
      .mockResolvedValueOnce(8)  // totalApplications
      .mockResolvedValueOnce(3)  // interviews
      .mockResolvedValueOnce(2)  // offers
      .mockResolvedValueOnce(1)  // rejections
      .mockResolvedValueOnce(1); // closed
    mockPrisma.task.count.mockResolvedValue(4);
    mockPrisma.notification.count.mockResolvedValue(2);
    mockPrisma.resumeVersion.count.mockResolvedValue(1);

    const { getSummary } = await import("@/modules/dashboard/dashboard.service.js");
    const result = await getSummary(userId);

    expect(result.totalJobs).toBe(10);
    expect(result.totalApplications).toBe(8);
    expect(result.activeApplications).toBe(4); // 8 - 2 - 1 - 1
    expect(result.interviews).toBe(3);
    expect(result.offers).toBe(2);
    expect(result.rejections).toBe(1);
    expect(result.pendingTasks).toBe(4);
    expect(result.unreadNotifications).toBe(2);
    expect(result.activeResumes).toBe(1);
  });
});

describe("getMonthly", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns monthly grouped analytics", async () => {
    mockPrisma.application.findMany.mockResolvedValue([
      { appliedAt: new Date("2026-01-15"), status: "APPLIED" },
      { appliedAt: new Date("2026-01-20"), status: "INTERVIEW" },
      { appliedAt: new Date("2026-02-10"), status: "OFFER" },
    ]);

    const { getMonthly } = await import("@/modules/dashboard/dashboard.service.js");
    const result = await getMonthly(userId);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ month: "2026-01", applications: 2, interviews: 1, offers: 0 });
    expect(result[1]).toMatchObject({ month: "2026-02", applications: 1, interviews: 0, offers: 1 });
  });

  it("returns empty array when no applications", async () => {
    mockPrisma.application.findMany.mockResolvedValue([]);

    const { getMonthly } = await import("@/modules/dashboard/dashboard.service.js");
    const result = await getMonthly(userId);

    expect(result).toHaveLength(0);
  });
});

describe("getMatchScores", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns bucketed match scores", async () => {
    mockPrisma.job.findMany.mockResolvedValue([
      { matchScore: 15 },
      { matchScore: 35 },
      { matchScore: 55 },
      { matchScore: 75 },
      { matchScore: 95 },
    ]);

    const { getMatchScores } = await import("@/modules/dashboard/dashboard.service.js");
    const result = await getMatchScores(userId);

    expect(result).toHaveLength(5);
    expect(result[0]).toMatchObject({ range: "0-20", count: 1 });
    expect(result[1]).toMatchObject({ range: "21-40", count: 1 });
    expect(result[2]).toMatchObject({ range: "41-60", count: 1 });
    expect(result[3]).toMatchObject({ range: "61-80", count: 1 });
    expect(result[4]).toMatchObject({ range: "81-100", count: 1 });
  });
});

describe("getSources", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns grouped sources sorted by count desc", async () => {
    mockPrisma.job.findMany.mockResolvedValue([
      { source: "LinkedIn" },
      { source: "LinkedIn" },
      { source: "Indeed" },
      { source: "LinkedIn" },
    ]);

    const { getSources } = await import("@/modules/dashboard/dashboard.service.js");
    const result = await getSources(userId);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ source: "LinkedIn", count: 3 });
    expect(result[1]).toMatchObject({ source: "Indeed", count: 1 });
  });
});
