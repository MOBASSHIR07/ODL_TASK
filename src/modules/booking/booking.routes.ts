import { Router } from 'express';
import { createBookingController, getBookingsController, cancelBookingController } from './booking.controller.js';
import { auth } from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/', auth('ORG_ADMIN', 'EMPLOYEE'), createBookingController);
router.get('/', auth('ORG_ADMIN', 'EMPLOYEE'), getBookingsController);
router.patch('/:id/cancel', auth('ORG_ADMIN', 'EMPLOYEE'), cancelBookingController);

export default router;
