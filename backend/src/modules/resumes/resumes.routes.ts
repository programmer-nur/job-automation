import { Router, type Router as RouterType } from 'express';

import { authenticate } from '@/middleware/authenticate';
import {
  createResume,
  listResumes,
  getResume,
  updateResume,
  deleteResume,
  setActiveResume,
  tailorResume,
} from '@/modules/resumes/resumes.controller';

const router: RouterType = Router();

router.post('/', authenticate, createResume);
router.get('/', authenticate, listResumes);
router.get('/:id', authenticate, getResume);
router.patch('/:id', authenticate, updateResume);
router.delete('/:id', authenticate, deleteResume);
router.patch('/:id/active', authenticate, setActiveResume);
router.post('/:id/tailor', authenticate, tailorResume);

export { router as resumeRouter };
