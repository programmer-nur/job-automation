import type { Request, Response } from "express";
import { success } from "@/common/response.js";
import * as dashboardService from "./dashboard.service.js";

export async function summary(req: Request, res: Response) {
  const data = await dashboardService.getSummary(req.user!.userId);
  res.json(success(data, "Dashboard summary retrieved"));
}

export async function monthly(req: Request, res: Response) {
  const data = await dashboardService.getMonthly(req.user!.userId);
  res.json(success(data, "Monthly analytics retrieved"));
}

export async function matchScores(req: Request, res: Response) {
  const data = await dashboardService.getMatchScores(req.user!.userId);
  res.json(success(data, "Match scores retrieved"));
}

export async function sources(req: Request, res: Response) {
  const data = await dashboardService.getSources(req.user!.userId);
  res.json(success(data, "Application sources retrieved"));
}
