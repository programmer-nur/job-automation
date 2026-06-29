import { Router } from "express";
import { authenticate } from "@/middleware/auth.js";
import * as controller from "./cover-letters.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", controller.create);
router.get("/", controller.list);
router.get("/:id", controller.getById);
router.patch("/:id", controller.update);
router.delete("/:id", controller.remove);
router.post("/generate", controller.generate);

export { router as coverLetterRouter };
