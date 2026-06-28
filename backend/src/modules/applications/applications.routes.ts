import { Router, type Router as RouterType } from 'express';

import { authenticate } from '@/middleware/authenticate';
import {
  createApplication,
  listApplications,
  getApplication,
  updateApplication,
  deleteApplication,
  updateApplicationStatus,
  scheduleFollowUp,
  updateApplicationNotes,
} from '@/modules/applications/applications.controller';

const router: RouterType = Router();

router.post('/', authenticate, createApplication);
router.get('/', authenticate, listApplications);
router.get('/:id', authenticate, getApplication);
router.patch('/:id', authenticate, updateApplication);
router.delete('/:id', authenticate, deleteApplication);
router.patch('/:id/status', authenticate, updateApplicationStatus);
router.patch('/:id/follow-up', authenticate, scheduleFollowUp);
router.patch('/:id/notes', authenticate, updateApplicationNotes);

export { router as applicationRouter };
