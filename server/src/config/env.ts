import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret',
  DB_PATH: process.env.DB_PATH || './data/app.db',
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
} as const;
