import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error(`[ERROR] ${err.message}`);
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
  } else {
    res.status(500).json({ error: '服务器内部错误' });
  }
}
