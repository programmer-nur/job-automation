import type { Request, Response } from "express";
import { success } from "@/common/response.js";
import * as jobService from "./jobs.service.js";
import { createJobSchema, updateJobSchema, jobStatusSchema, favoriteSchema, jobListQuerySchema } from "./jobs.validation.js";

export async function create(req: Request, res: Response) {
  const parsed = createJobSchema.parse(req.body);
  const job = await jobService.createJob(req.user!.userId, parsed);
  res.status(201).json(success(job, "Job created"));
}

export async function list(req: Request, res: Response) {
  const query = jobListQuerySchema.parse(req.query);
  const result = await jobService.listJobs(req.user!.userId, query);
  res.json(success(result.data, "Jobs retrieved", result.meta));
}

export async function getById(req: Request, res: Response) {
  const id = req.params.id as string;
  const job = await jobService.getJob(req.user!.userId, id);
  res.json(success(job, "Job retrieved"));
}

export async function update(req: Request, res: Response) {
  const id = req.params.id as string;
  const parsed = updateJobSchema.parse(req.body);
  const job = await jobService.updateJob(req.user!.userId, id, parsed);
  res.json(success(job, "Job updated"));
}

export async function remove(req: Request, res: Response) {
  const id = req.params.id as string;
  await jobService.deleteJob(req.user!.userId, id);
  res.status(204).send();
}

export async function changeStatus(req: Request, res: Response) {
  const id = req.params.id as string;
  const parsed = jobStatusSchema.parse(req.body);
  const job = await jobService.updateJobStatus(req.user!.userId, id, parsed.status);
  res.json(success(job, "Job status updated"));
}

export async function favorite(req: Request, res: Response) {
  const id = req.params.id as string;
  const parsed = favoriteSchema.parse(req.body);
  const job = await jobService.toggleFavorite(req.user!.userId, id, parsed.isFavorite);
  res.json(success(job, "Job favorite updated"));
}
