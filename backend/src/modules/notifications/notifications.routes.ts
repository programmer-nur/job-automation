import { Router, type Router as RouterType } from 'express';

import { authenticate } from '@/middleware/authenticate';
import {
  createNotification,
  listNotifications,
  getNotification,
  markAllAsRead,
  markAsRead,
} from '@/modules/notifications/notifications.controller';

const router: RouterType = Router();

router.post('/', authenticate, createNotification);
router.get('/', authenticate, listNotifications);
router.get('/:id', authenticate, getNotification);
router.patch('/:id/read', authenticate, markAsRead);
router.patch('/read-all', authenticate, markAllAsRead);

export { router as notificationRouter };
