import { Router, type Router as RouterType } from 'express';

import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';
import { adminController } from '@/modules/admin/admin.controller';

const router: RouterType = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/users', adminController.listUsers);
router.get('/jobs', adminController.listJobs);
router.get('/ai', adminController.getAiStats);
router.get('/audit-logs', adminController.listAuditLogs);

export { router as adminRouter };
