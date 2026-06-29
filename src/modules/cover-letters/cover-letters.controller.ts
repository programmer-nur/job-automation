import type { Request, Response } from "express";
import { success } from "@/common/response.js";
import * as coverLetterService from "./cover-letters.service.js";
import {
  createCoverLetterSchema,
  updateCoverLetterSchema,
  generateCoverLetterSchema,
  coverLetterListQuerySchema,
} from "./cover-letters.validation.js";

export async function create(req: Request, res: Response) {
  const parsed = createCoverLetterSchema.parse(req.body);
  const cl = await coverLetterService.createCoverLetter(req.user!.userId, parsed);
  res.status(201).json(success(cl, "Cover letter created"));
}

export async function list(req: Request, res: Response) {
  const query = coverLetterListQuerySchema.parse(req.query);
  const result = await coverLetterService.listCoverLetters(req.user!.userId, query);
  res.json(success(result.data, "Cover letters retrieved", result.meta));
}

export async function getById(req: Request, res: Response) {
  const id = req.params.id as string;
  const cl = await coverLetterService.getCoverLetter(req.user!.userId, id);
  res.json(success(cl, "Cover letter retrieved"));
}

export async function update(req: Request, res: Response) {
  const id = req.params.id as string;
  const parsed = updateCoverLetterSchema.parse(req.body);
  const cl = await coverLetterService.updateCoverLetter(req.user!.userId, id, parsed);
  res.json(success(cl, "Cover letter updated"));
}

export async function remove(req: Request, res: Response) {
  const id = req.params.id as string;
  await coverLetterService.deleteCoverLetter(req.user!.userId, id);
  res.status(204).send();
}

export async function generate(req: Request, res: Response) {
  const parsed = generateCoverLetterSchema.parse(req.body);
  const cl = await coverLetterService.generateCoverLetter(req.user!.userId, parsed);
  res.json(success(cl, "Cover letter generated"));
}
