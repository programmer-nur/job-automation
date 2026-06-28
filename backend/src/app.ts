import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { env } from '@/config/env';
import { errorHandler } from '@/middleware/error-handler';
import { notFoundHandler } from '@/middleware/not-found';
import { authLimiter } from '@/middleware/rate-limiter';
import { requestLogger } from '@/middleware/request-logger';
import { adminRouter } from '@/modules/admin';
import { aiRouter } from '@/modules/ai';
import { applicationRouter } from '@/modules/applications';
import { authRouter } from '@/modules/auth';
import { coverLetterRouter } from '@/modules/cover-letters';
import { dashboardRouter } from '@/modules/dashboard';
import { healthRouter } from '@/modules/health';
import { googleSheetsRouter, trelloRouter } from '@/modules/integrations';
import { jobRouter } from '@/modules/jobs';
import { notificationRouter } from '@/modules/notifications';
import { resumeRouter } from '@/modules/resumes';
import { taskRouter } from '@/modules/tasks';

export function createApp(): express.Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(requestLogger);

  app.use(
    (err: Error, _req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (err instanceof SyntaxError && 'body' in err) {
        res.status(400).json({ success: false, message: 'Invalid JSON in request body' });
        return;
      }
      next(err);
    },
  );

  app.use(healthRouter);
  app.use('/api/v1/admin', adminRouter);
  app.use('/api/v1/ai', aiRouter);
  app.use('/api/v1/auth', authLimiter, authRouter);
  app.use('/api/v1/jobs', jobRouter);
  app.use('/api/v1/applications', applicationRouter);
  app.use('/api/v1/resumes', resumeRouter);
  app.use('/api/v1/cover-letters', coverLetterRouter);
  app.use('/api/v1/dashboard', dashboardRouter);
  app.use('/api/v1/google-sheets', googleSheetsRouter);
  app.use('/api/v1/notifications', notificationRouter);
  app.use('/api/v1/tasks', taskRouter);
  app.use('/api/v1/trello', trelloRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
