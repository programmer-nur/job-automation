import type { NextFunction, Request, Response } from 'express';

import { AppError } from '@/common/errors';
import { success } from '@/common/response';
import { taskService } from '@/modules/tasks/tasks.service';
import {
  createTaskSchema,
  taskListQuerySchema,
  updateTaskSchema,
} from '@/modules/tasks/tasks.validation';

function getUserId(req: Request): string {
  const userId = req.user?.userId;
  if (!userId) {
    throw AppError.unauthorized();
  }
  return userId;
}

function getParamId(req: Request): string {
  return req.params.id as string;
}

export async function createTask(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const data = createTaskSchema.parse(req.body);
    const task = await taskService.create(userId, data);
    res.status(201).json(success(task, 'Task created'));
  } catch (err) {
    next(err);
  }
}

export async function listTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const params = taskListQuerySchema.parse(req.query);
    const result = await taskService.list(userId, params);
    res.status(200).json(success(result.data, undefined, result.meta));
  } catch (err) {
    next(err);
  }
}

export async function getTask(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const task = await taskService.getById(userId, getParamId(req));
    res.status(200).json(success(task));
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const data = updateTaskSchema.parse(req.body);
    const task = await taskService.update(userId, getParamId(req), data);
    res.status(200).json(success(task));
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    await taskService.delete(userId, getParamId(req));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function completeTask(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const task = await taskService.complete(userId, getParamId(req));
    res.status(200).json(success(task));
  } catch (err) {
    next(err);
  }
}

export async function incompleteTask(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const task = await taskService.incomplete(userId, getParamId(req));
    res.status(200).json(success(task));
  } catch (err) {
    next(err);
  }
}
