import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

export async function register(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json(await authService.register(req.body)); } catch (e) { next(e); }
}
export async function login(req: Request, res: Response, next: NextFunction) {
  try { res.json(await authService.login(req.body)); } catch (e) { next(e); }
}
export function me(req: Request, res: Response, next: NextFunction) {
  try { res.json({ user: authService.getProfile(req.user!.userId) }); } catch (e) { next(e); }
}
