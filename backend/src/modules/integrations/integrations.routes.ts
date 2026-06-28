import { Router, type Router as RouterType } from 'express';

import { authenticate } from '@/middleware/authenticate';
import {
  googleSheetsController,
  trelloController,
} from '@/modules/integrations/integrations.controller';

export const googleSheetsRouter: RouterType = Router();
export const trelloRouter: RouterType = Router();

googleSheetsRouter.use(authenticate);
googleSheetsRouter.post('/sync', googleSheetsController.sync);
googleSheetsRouter.post('/jobs/:jobId', googleSheetsController.syncJob);
googleSheetsRouter.get('/export', googleSheetsController.exportData);

trelloRouter.use(authenticate);
trelloRouter.post('/sync', trelloController.sync);
trelloRouter.post('/cards', trelloController.createCard);
trelloRouter.patch('/cards/:cardId', trelloController.moveCard);
trelloRouter.delete('/cards/:cardId', trelloController.deleteCard);
