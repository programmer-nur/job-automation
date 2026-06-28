import type { Request, Response } from "express";
import { prisma } from "@/services/prisma.js";
import { success } from "@/common/response.js";

export async function getHealth(_req: Request, res: Response) {
  let dbStatus = "connected";
  let redisStatus = "disconnected";
  let queueStatus = "healthy";

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = "error";
    queueStatus = "degraded";
  }

  res.json(
    success({
      status: dbStatus === "connected" ? "ok" : "degraded",
      database: dbStatus,
      redis: redisStatus,
      queue: queueStatus,
      timestamp: new Date().toISOString(),
    }),
  );
}
