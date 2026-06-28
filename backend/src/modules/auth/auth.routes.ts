import { Router, type Router as RouterType } from 'express';

import { authenticate } from '@/middleware/authenticate';
import {
  changePassword,
  getProfile,
  login,
  logout,
  refresh,
  register,
} from '@/modules/auth/auth.controller';

const router: RouterType = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getProfile);
router.patch('/change-password', authenticate, changePassword);

export { router as authRouter };
