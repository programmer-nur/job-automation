import { Router } from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  changePassword,
} from "./auth.controller.js";
import { authenticate } from "@/middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getMe);
router.patch("/change-password", authenticate, changePassword);

export { router as authRouter };
