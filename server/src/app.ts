import express from 'express';
import cors from 'cors';
import path from 'path';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import modelsRoutes from './routes/models.routes';
import categoriesRoutes from './routes/categories.routes';
import favoritesRoutes from './routes/favorites.routes';

const app = express();
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/models', modelsRoutes);
app.use('/api/v1/categories', categoriesRoutes);
app.use('/api/v1/favorites', favoritesRoutes);

if (env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => { if (!req.path.startsWith('/api')) res.sendFile(path.join(clientDist, 'index.html')); });
}

app.use(errorHandler);
export default app;
