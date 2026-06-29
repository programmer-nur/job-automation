import type { Request, Response } from "express";
import { success } from "@/common/response.js";
import * as resumeService from "./resumes.service.js";
import {
  createResumeSchema,
  updateResumeSchema,
  tailorSchema,
  resumeListQuerySchema,
} from "./resumes.validation.js";

export async function create(req: Request, res: Response) {
  const parsed = createResumeSchema.parse(req.body);
  const resume = await resumeService.createResume(req.user!.userId, parsed);
  res.status(201).json(success(resume, "Resume created"));
}

export async function list(req: Request, res: Response) {
  const query = resumeListQuerySchema.parse(req.query);
  const result = await resumeService.listResumes(req.user!.userId, query);
  res.json(success(result.data, "Resumes retrieved", result.meta));
}

export async function getById(req: Request, res: Response) {
  const id = req.params.id as string;
  const resume = await resumeService.getResume(req.user!.userId, id);
  res.json(success(resume, "Resume retrieved"));
}

export async function update(req: Request, res: Response) {
  const id = req.params.id as string;
  const parsed = updateResumeSchema.parse(req.body);
  const resume = await resumeService.updateResume(req.user!.userId, id, parsed);
  res.json(success(resume, "Resume updated"));
}

export async function remove(req: Request, res: Response) {
  const id = req.params.id as string;
  await resumeService.deleteResume(req.user!.userId, id);
  res.status(204).send();
}

export async function setActive(req: Request, res: Response) {
  const id = req.params.id as string;
  const resume = await resumeService.setActiveResume(req.user!.userId, id);
  res.json(success(resume, "Resume set as active"));
}

export async function tailor(req: Request, res: Response) {
  const id = req.params.id as string;
  const parsed = tailorSchema.parse(req.body);
  const resume = await resumeService.tailorResume(req.user!.userId, id, parsed.jobId);
  res.json(success(resume, "Resume tailored"));
}
