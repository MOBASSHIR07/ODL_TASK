import { Router } from 'express';
import { createBookingController, getBookingsController } from './booking.controller.js';
import { auth } from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/', auth('ORG_ADMIN', 'EMPLOYEE'), createBookingController);
router.get('/', auth('ORG_ADMIN', 'EMPLOYEE'), getBookingsController);

export default router;
