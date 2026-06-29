import { Router } from "express";
import { authenticate } from "@/middleware/auth.js";
import * as controller from "./dashboard.controller.js";

const router = Router();

router.use(authenticate);

router.get("/summary", controller.summary);
router.get("/monthly", controller.monthly);
router.get("/match-scores", controller.matchScores);
router.get("/sources", controller.sources);

export { router as dashboardRouter };
