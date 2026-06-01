import { Router } from 'express';
import { z } from 'zod';
import * as ctrl from '../controllers/models.controller';
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const modelSchema = z.object({
  name: z.string().min(1), name_en: z.string().optional(), provider: z.string().min(1),
  category_id: z.number().optional(), description: z.string().optional(),
  features: z.string().optional(), use_cases: z.string().optional(),
  access_url: z.string().optional(), access_type: z.string().optional(),
  pricing_type: z.enum(['free','freemium','paid']).optional(),
  price_detail: z.string().optional(), logo_url: z.string().optional(),
  official_url: z.string().optional(), is_featured: z.number().optional(), sort_order: z.number().optional(),
  context_window: z.number().optional(), max_output_tokens: z.number().optional(),
  input_price: z.number().optional(), output_price: z.number().optional(),
  avg_latency_ms: z.number().optional(), tokens_per_second: z.number().optional(),
  knowledge_cutoff: z.string().optional(),
});

// 模型CRUD
router.get('/', optionalAuth, ctrl.list);
router.get('/performance-compare', optionalAuth, ctrl.performanceCompare);
router.get('/:id', optionalAuth, ctrl.getById);
router.post('/compare', optionalAuth, ctrl.compare);
router.post('/', requireAdmin, validate(modelSchema), ctrl.create);
router.put('/:id', requireAdmin, validate(modelSchema), ctrl.update);
router.delete('/:id', requireAdmin, ctrl.remove);

// 基准分数
router.get('/:id/benchmarks', ctrl.getBenchmarks);

// 评价
router.get('/:id/reviews', ctrl.getReviews);
router.post('/:id/reviews', requireAuth, validate(z.object({ rating: z.number().min(1).max(5), comment: z.string().optional() })), ctrl.addReview);

export default router;
