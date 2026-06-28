import { Router, type Router as RouterType } from 'express';

import { authenticate } from '@/middleware/authenticate';
import {
  detectSkillGap,
  generateCoverLetter,
  interviewPrep,
  parseJob,
  scoreJob,
  tailorResume,
} from '@/modules/ai/ai.controller';

const router: RouterType = Router();

router.post('/parse-job', authenticate, parseJob);
router.post('/score-job', authenticate, scoreJob);
router.post('/tailor-resume', authenticate, tailorResume);
router.post('/generate-cover-letter', authenticate, generateCoverLetter);
router.post('/skill-gap', authenticate, detectSkillGap);
router.post('/interview-prep', authenticate, interviewPrep);

export { router as aiRouter };
