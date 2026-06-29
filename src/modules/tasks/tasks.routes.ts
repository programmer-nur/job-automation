import { Router } from "express";
import { authenticate } from "@/middleware/auth.js";
import * as controller from "./tasks.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", controller.create);
router.get("/", controller.list);
router.get("/:id", controller.getById);
router.patch("/:id", controller.update);
router.delete("/:id", controller.remove);
router.patch("/:id/complete", controller.complete);
router.patch("/:id/incomplete", controller.incomplete);

export { router as taskRouter };
