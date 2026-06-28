import { Router, type Router as RouterType } from 'express';

import { authenticate } from '@/middleware/authenticate';
import {
  createCoverLetter,
  listCoverLetters,
  getCoverLetter,
  updateCoverLetter,
  deleteCoverLetter,
  generateCoverLetter,
} from '@/modules/cover-letters/cover-letters.controller';

const router: RouterType = Router();

router.post('/', authenticate, createCoverLetter);
router.get('/', authenticate, listCoverLetters);
router.get('/:id', authenticate, getCoverLetter);
router.patch('/:id', authenticate, updateCoverLetter);
router.delete('/:id', authenticate, deleteCoverLetter);
router.post('/generate', authenticate, generateCoverLetter);

export { router as coverLetterRouter };
