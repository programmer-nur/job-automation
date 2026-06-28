import { Router, type Router as RouterType } from 'express';

import { authenticate } from '@/middleware/authenticate';
import { dashboardController } from '@/modules/dashboard/dashboard.controller';

const router: RouterType = Router();

router.use(authenticate);

router.get('/summary', dashboardController.getSummary);
router.get('/monthly', dashboardController.getMonthly);
router.get('/match-scores', dashboardController.getMatchScores);
router.get('/sources', dashboardController.getSources);

export { router as dashboardRouter };
