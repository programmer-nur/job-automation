import type { Request, Response } from "express";
import { success } from "@/common/response.js";
import * as applicationService from "./applications.service.js";
import {
  createApplicationSchema,
  updateApplicationSchema,
  applicationStatusSchema,
  followUpSchema,
  notesSchema,
  applicationListQuerySchema,
} from "./applications.validation.js";

export async function create(req: Request, res: Response) {
  const parsed = createApplicationSchema.parse(req.body);
  const application = await applicationService.createApplication(req.user!.userId, parsed);
  res.status(201).json(success(application, "Application created"));
}

export async function list(req: Request, res: Response) {
  const query = applicationListQuerySchema.parse(req.query);
  const result = await applicationService.listApplications(req.user!.userId, query);
  res.json(success(result.data, "Applications retrieved", result.meta));
}

export async function getById(req: Request, res: Response) {
  const id = req.params.id as string;
  const application = await applicationService.getApplication(req.user!.userId, id);
  res.json(success(application, "Application retrieved"));
}

export async function update(req: Request, res: Response) {
  const id = req.params.id as string;
  const parsed = updateApplicationSchema.parse(req.body);
  const application = await applicationService.updateApplication(req.user!.userId, id, parsed);
  res.json(success(application, "Application updated"));
}

export async function remove(req: Request, res: Response) {
  const id = req.params.id as string;
  await applicationService.deleteApplication(req.user!.userId, id);
  res.status(204).send();
}

export async function changeStatus(req: Request, res: Response) {
  const id = req.params.id as string;
  const parsed = applicationStatusSchema.parse(req.body);
  const application = await applicationService.updateApplicationStatus(req.user!.userId, id, parsed.status);
  res.json(success(application, "Application status updated"));
}

export async function scheduleFollowUp(req: Request, res: Response) {
  const id = req.params.id as string;
  const parsed = followUpSchema.parse(req.body);
  const application = await applicationService.scheduleFollowUp(req.user!.userId, id, parsed.followUpDate);
  res.json(success(application, "Follow-up date scheduled"));
}

export async function updateNotes(req: Request, res: Response) {
  const id = req.params.id as string;
  const parsed = notesSchema.parse(req.body);
  const application = await applicationService.updateApplicationNotes(req.user!.userId, id, parsed.notes);
  res.json(success(application, "Application notes updated"));
}
