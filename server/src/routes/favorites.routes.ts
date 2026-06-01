import { Router } from 'express';
import * as ctrl from '../controllers/favorites.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, ctrl.list);
router.post('/:modelId', requireAuth, ctrl.toggle);
router.get('/check/:modelId', requireAuth, ctrl.check);

export default router;
