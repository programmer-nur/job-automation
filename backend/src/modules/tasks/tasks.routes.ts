import { Router, type Router as RouterType } from 'express';

import { authenticate } from '@/middleware/authenticate';
import {
  completeTask,
  createTask,
  deleteTask,
  getTask,
  incompleteTask,
  listTasks,
  updateTask,
} from '@/modules/tasks/tasks.controller';

const router: RouterType = Router();

router.post('/', authenticate, createTask);
router.get('/', authenticate, listTasks);
router.get('/:id', authenticate, getTask);
router.patch('/:id', authenticate, updateTask);
router.delete('/:id', authenticate, deleteTask);
router.patch('/:id/complete', authenticate, completeTask);
router.patch('/:id/incomplete', authenticate, incompleteTask);

export { router as taskRouter };
