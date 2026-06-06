import { Router } from 'express';
import {
  createResourceController,
  getAllResourcesController,
  getResourceByIdController,
  updateResourceController,
  deleteResourceController,
} from './resource.controller.js';
import { auth } from '../../middleware/auth.middleware.js';
import { getAvailabilityController } from '../booking/booking.controller.js';

const router = Router();

router.post('/', auth('ORG_ADMIN'), createResourceController);
router.get('/', auth(), getAllResourcesController);

router.get('/:id', auth(), getResourceByIdController);
router.patch('/:id', auth('ORG_ADMIN'), updateResourceController);
router.delete('/:id', auth('ORG_ADMIN'), deleteResourceController);
router.get('/:id/availability', auth('ORG_ADMIN', 'EMPLOYEE'), getAvailabilityController);

export default router;
