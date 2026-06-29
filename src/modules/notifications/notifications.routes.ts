import { Router } from "express";
import { authenticate } from "@/middleware/auth.js";
import * as controller from "./notifications.controller.js";

const router = Router();

router.use(authenticate);

router.patch("/read-all", controller.markAllAsRead);
router.post("/", controller.create);
router.get("/", controller.list);
router.get("/:id", controller.getById);
router.patch("/:id/read", controller.markAsRead);

export { router as notificationRouter };
