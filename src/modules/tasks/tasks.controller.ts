import type { Request, Response } from "express";
import { success } from "@/common/response.js";
import * as taskService from "./tasks.service.js";
import {
  createTaskSchema,
  updateTaskSchema,
  taskListQuerySchema,
} from "./tasks.validation.js";

export async function create(req: Request, res: Response) {
  const parsed = createTaskSchema.parse(req.body);
  const task = await taskService.createTask(req.user!.userId, parsed);
  res.status(201).json(success(task, "Task created"));
}

export async function list(req: Request, res: Response) {
  const query = taskListQuerySchema.parse(req.query);
  const result = await taskService.listTasks(req.user!.userId, query);
  res.json(success(result.data, "Tasks retrieved", result.meta));
}

export async function getById(req: Request, res: Response) {
  const id = req.params.id as string;
  const task = await taskService.getTask(req.user!.userId, id);
  res.json(success(task, "Task retrieved"));
}

export async function update(req: Request, res: Response) {
  const id = req.params.id as string;
  const parsed = updateTaskSchema.parse(req.body);
  const task = await taskService.updateTask(req.user!.userId, id, parsed);
  res.json(success(task, "Task updated"));
}

export async function remove(req: Request, res: Response) {
  const id = req.params.id as string;
  await taskService.deleteTask(req.user!.userId, id);
  res.status(204).send();
}

export async function complete(req: Request, res: Response) {
  const id = req.params.id as string;
  const task = await taskService.completeTask(req.user!.userId, id);
  res.json(success(task, "Task completed"));
}

export async function incomplete(req: Request, res: Response) {
  const id = req.params.id as string;
  const task = await taskService.incompleteTask(req.user!.userId, id);
  res.json(success(task, "Task marked incomplete"));
}
