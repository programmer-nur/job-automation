import "express-async-errors";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { config } from "@/config/env.js";
import { logger } from "@/services/logger.js";
import { errorHandler } from "@/middleware/error-handler.js";
import { authLimiter } from "@/middleware/rate-limiter.js";
import { healthRouter } from "@/modules/health/health.routes.js";
import { authRouter } from "@/modules/auth/auth.routes.js";
import { jobRouter } from "@/modules/jobs/jobs.routes.js";
import { applicationRouter } from "@/modules/applications/applications.routes.js";
import { resumeRouter } from "@/modules/resumes/resumes.routes.js";
import { coverLetterRouter } from "@/modules/cover-letters/cover-letters.routes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use((req, _res, next) => {
  logger.info({ method: req.method, url: req.url }, "request");
  next();
});

app.use("/health", healthRouter);
app.use("/api/v1/auth", authLimiter, authRouter);
app.use("/api/v1/jobs", jobRouter);
app.use("/api/v1/applications", applicationRouter);
app.use("/api/v1/resumes", resumeRouter);
app.use("/api/v1/cover-letters", coverLetterRouter);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Not found" });
});

app.use(errorHandler);

export { app };
