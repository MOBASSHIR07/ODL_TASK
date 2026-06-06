import { Router } from 'express';
import { createEmployeeController, getAllEmployeesController } from './user.controller.js';
import { auth } from '../../middleware/auth.middleware.js';

const router = Router();


router.post('/', auth('ORG_ADMIN'), createEmployeeController);
router.get('/', auth('ORG_ADMIN'), getAllEmployeesController);

export default router;
