import { describe, it, expect, vi, beforeEach } from "vitest";

const mockTaskRepository = vi.hoisted(() => ({
  createTask: vi.fn(),
  findTaskById: vi.fn(),
  findTasks: vi.fn(),
  countTasks: vi.fn(),
  updateTask: vi.fn(),
  deleteTaskById: vi.fn(),
}));

vi.mock("@/services/prisma.js", () => ({ prisma: {} }));
vi.mock("@/modules/tasks/tasks.repository.js", () => mockTaskRepository);

const userId = "user-1";
const taskId = "task-1";

function makeTask(overrides = {}) {
  return {
    id: taskId,
    userId,
    title: "Follow up with recruiter",
    description: null,
    dueDate: null,
    completed: false,
    completedAt: null,
    createdAt: new Date(),
    ...overrides,
  };
}

describe("createTask", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("creates a task successfully", async () => {
    mockTaskRepository.createTask.mockResolvedValue(makeTask({ title: "My task" }));

    const { createTask } = await import("@/modules/tasks/tasks.service.js");
    const result = await createTask(userId, { title: "My task" });

    expect(result.title).toBe("My task");
    expect(mockTaskRepository.createTask).toHaveBeenCalledTimes(1);
  });

  it("passes optional fields", async () => {
    mockTaskRepository.createTask.mockResolvedValue(makeTask());

    const { createTask } = await import("@/modules/tasks/tasks.service.js");
    await createTask(userId, {
      title: "Task",
      description: "Details",
      dueDate: "2026-07-15T10:00:00Z",
      applicationId: "550e8400-e29b-41d4-a716-446655440000",
    });

    expect(mockTaskRepository.createTask).toHaveBeenCalled();
  });
});

describe("listTasks", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns paginated results", async () => {
    mockTaskRepository.findTasks.mockResolvedValue([makeTask()]);
    mockTaskRepository.countTasks.mockResolvedValue(1);

    const { listTasks } = await import("@/modules/tasks/tasks.service.js");
    const result = await listTasks(userId, { page: 1, limit: 20 });

    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it("filters by completed status", async () => {
    mockTaskRepository.findTasks.mockResolvedValue([]);
    mockTaskRepository.countTasks.mockResolvedValue(0);

    const { listTasks } = await import("@/modules/tasks/tasks.service.js");
    await listTasks(userId, { page: 1, limit: 20, status: "completed" });
    expect(mockTaskRepository.findTasks).toHaveBeenCalled();
  });

  it("filters by pending status", async () => {
    mockTaskRepository.findTasks.mockResolvedValue([]);
    mockTaskRepository.countTasks.mockResolvedValue(0);

    const { listTasks } = await import("@/modules/tasks/tasks.service.js");
    await listTasks(userId, { page: 1, limit: 20, status: "pending" });
    expect(mockTaskRepository.findTasks).toHaveBeenCalled();
  });
});

describe("getTask", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns a task by id", async () => {
    mockTaskRepository.findTaskById.mockResolvedValue(makeTask());

    const { getTask } = await import("@/modules/tasks/tasks.service.js");
    const result = await getTask(userId, taskId);

    expect(result.id).toBe(taskId);
  });

  it("throws 404 when not found", async () => {
    mockTaskRepository.findTaskById.mockResolvedValue(null);

    const { getTask } = await import("@/modules/tasks/tasks.service.js");
    await expect(getTask(userId, taskId)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("updateTask", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("updates task fields", async () => {
    mockTaskRepository.findTaskById.mockResolvedValue(makeTask());
    mockTaskRepository.updateTask.mockResolvedValue(makeTask({ title: "Updated" }));

    const { updateTask } = await import("@/modules/tasks/tasks.service.js");
    const result = await updateTask(userId, taskId, { title: "Updated" });

    expect(result.title).toBe("Updated");
  });

  it("throws 404 when not found", async () => {
    mockTaskRepository.findTaskById.mockResolvedValue(null);

    const { updateTask } = await import("@/modules/tasks/tasks.service.js");
    await expect(updateTask(userId, taskId, { title: "Test" })).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("completeTask", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("marks task as complete", async () => {
    mockTaskRepository.findTaskById.mockResolvedValue(makeTask());
    mockTaskRepository.updateTask.mockResolvedValue(makeTask({ completed: true, completedAt: new Date() }));

    const { completeTask } = await import("@/modules/tasks/tasks.service.js");
    const result = await completeTask(userId, taskId);

    expect(result.completed).toBe(true);
    expect(result.completedAt).toBeTruthy();
  });

  it("throws 404 when not found", async () => {
    mockTaskRepository.findTaskById.mockResolvedValue(null);

    const { completeTask } = await import("@/modules/tasks/tasks.service.js");
    await expect(completeTask(userId, taskId)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("incompleteTask", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("marks task as incomplete", async () => {
    mockTaskRepository.findTaskById.mockResolvedValue(makeTask({ completed: true, completedAt: new Date() }));
    mockTaskRepository.updateTask.mockResolvedValue(makeTask({ completed: false, completedAt: null }));

    const { incompleteTask } = await import("@/modules/tasks/tasks.service.js");
    const result = await incompleteTask(userId, taskId);

    expect(result.completed).toBe(false);
    expect(result.completedAt).toBeNull();
  });

  it("throws 404 when not found", async () => {
    mockTaskRepository.findTaskById.mockResolvedValue(null);

    const { incompleteTask } = await import("@/modules/tasks/tasks.service.js");
    await expect(incompleteTask(userId, taskId)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("deleteTask", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("hard deletes a task", async () => {
    mockTaskRepository.findTaskById.mockResolvedValue(makeTask());
    mockTaskRepository.deleteTaskById.mockResolvedValue(makeTask());

    const { deleteTask } = await import("@/modules/tasks/tasks.service.js");
    await deleteTask(userId, taskId);

    expect(mockTaskRepository.deleteTaskById).toHaveBeenCalledWith(taskId);
  });

  it("throws 404 when not found", async () => {
    mockTaskRepository.findTaskById.mockResolvedValue(null);

    const { deleteTask } = await import("@/modules/tasks/tasks.service.js");
    await expect(deleteTask(userId, taskId)).rejects.toMatchObject({ statusCode: 404 });
  });
});
