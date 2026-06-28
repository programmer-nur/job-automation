import { Router, type Router as RouterType } from 'express';

import { authenticate } from '@/middleware/authenticate';
import {
  createJob,
  listJobs,
  getJob,
  updateJob,
  deleteJob,
  updateJobStatus,
  toggleJobFavorite,
} from '@/modules/jobs/jobs.controller';

const router: RouterType = Router();

router.post('/', authenticate, createJob);
router.get('/', authenticate, listJobs);
router.get('/:id', authenticate, getJob);
router.patch('/:id', authenticate, updateJob);
router.delete('/:id', authenticate, deleteJob);
router.patch('/:id/status', authenticate, updateJobStatus);
router.patch('/:id/favorite', authenticate, toggleJobFavorite);

export { router as jobRouter };
