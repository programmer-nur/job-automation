import { Router } from "express";
import { authenticate } from "@/middleware/auth.js";
import * as controller from "./jobs.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", controller.create);
router.get("/", controller.list);
router.get("/:id", controller.getById);
router.patch("/:id", controller.update);
router.delete("/:id", controller.remove);
router.patch("/:id/status", controller.changeStatus);
router.patch("/:id/favorite", controller.favorite);

export { router as jobRouter };
