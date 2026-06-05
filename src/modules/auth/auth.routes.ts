import { Router } from 'express';
import { registerOrganization, login } from './auth.controller.js';
import { validate } from '../../middleware/validateMiddleware.js';
import { registerOrgSchema, loginSchema } from './auth.validation.js';

const router = Router();

router.post('/register-org', validate(registerOrgSchema), registerOrganization);
router.post('/login', validate(loginSchema), login);

export default router;
