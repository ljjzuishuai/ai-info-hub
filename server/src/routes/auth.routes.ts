import { Router } from 'express';
import { z } from 'zod';
import * as ctrl from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.post('/register', validate(z.object({
  username: z.string().min(3).max(30), email: z.string().email(), password: z.string().min(6),
})), ctrl.register);

router.post('/login', validate(z.object({
  email: z.string().email(), password: z.string().min(1),
})), ctrl.login);

router.get('/me', requireAuth, ctrl.me);

export default router;
