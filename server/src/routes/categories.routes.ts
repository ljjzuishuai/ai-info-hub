import { Router } from 'express';
import { z } from 'zod';
import * as ctrl from '../controllers/categories.controller';
import { requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();
const catSchema = z.object({ name: z.string().min(1), slug: z.string().min(1), icon: z.string().optional(), sort_order: z.number().optional() });

router.get('/', ctrl.list);
router.post('/', requireAdmin, validate(catSchema), ctrl.create);
router.put('/:id', requireAdmin, validate(catSchema), ctrl.update);
router.delete('/:id', requireAdmin, ctrl.remove);

export default router;
