import type { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service.js";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  changePasswordSchema,
} from "./auth.validation.js";
import { success } from "@/common/response.js";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input);
    res.status(201).json(success(result, "Registration successful"));
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    res.json(success(result, "Login successful"));
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const input = refreshSchema.parse(req.body);
    const tokens = await authService.refresh(input.refreshToken);
    res.json(success(tokens, "Token refreshed"));
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    await authService.logout(req.user!.userId, refreshToken);
    res.json(success(null, "Logged out successfully"));
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getProfile(req.user!.userId);
    res.json(success(user));
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const input = changePasswordSchema.parse(req.body);
    await authService.changePassword(req.user!.userId, input.currentPassword, input.newPassword);
    res.json(success(null, "Password changed successfully"));
  } catch (err) {
    next(err);
  }
}
