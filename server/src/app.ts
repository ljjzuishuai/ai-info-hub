import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import modelsRoutes from './routes/models.routes';
import categoriesRoutes from './routes/categories.routes';
import favoritesRoutes from './routes/favorites.routes';

const app = express();

// CORS：允许 Vercel 前端访问
app.use(cors({
  origin: env.CLIENT_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());

// 健康检查
app.get('/', (_req, res) => res.json({ status: 'ok', name: 'AI信息大全 API' }));

// API 路由
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/models', modelsRoutes);
app.use('/api/v1/categories', categoriesRoutes);
app.use('/api/v1/favorites', favoritesRoutes);

app.use(errorHandler);
export default app;
