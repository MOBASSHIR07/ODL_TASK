import { Router } from 'express';
import { createBookingController } from './booking.controller.js';
import { auth } from '../../middleware/auth.middleware.js';

const router = Router();


router.post('/', auth('ORG_ADMIN', 'EMPLOYEE'), createBookingController);

export default router;
