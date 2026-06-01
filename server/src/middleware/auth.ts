import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: '请先登录' });
    return;
  }
  try {
    req.user = verifyToken(header.split(' ')[1]);
    next();
  } catch {
    res.status(401).json({ error: '登录已过期' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: '需要管理员权限' });
      return;
    }
    next();
  });
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try { req.user = verifyToken(header.split(' ')[1]); } catch {}
  }
  next();
}
