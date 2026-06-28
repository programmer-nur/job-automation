import { Router, type Router as RouterType } from 'express';

import { getHealth } from '@/modules/health/health.controller';

const router: RouterType = Router();

router.get('/health', getHealth);

export { router as healthRouter };
