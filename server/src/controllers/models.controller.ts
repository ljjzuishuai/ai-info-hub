import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/models.service';

export function list(req: Request, res: Response, next: NextFunction) {
  try { res.json(svc.listModels(req.query as any)); } catch (e) { next(e); }
}
export function getById(req: Request, res: Response, next: NextFunction) {
  try { res.json(svc.getModelById(Number(req.params.id))); } catch (e) { next(e); }
}
export function create(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json(svc.createModel(req.body)); } catch (e) { next(e); }
}
export function update(req: Request, res: Response, next: NextFunction) {
  try { res.json(svc.updateModel(Number(req.params.id), req.body)); } catch (e) { next(e); }
}
export function remove(req: Request, res: Response, next: NextFunction) {
  try { svc.deleteModel(Number(req.params.id)); res.json({ success: true }); } catch (e) { next(e); }
}
export function compare(req: Request, res: Response, next: NextFunction) {
  try { res.json(svc.compareModels(req.body.ids || [])); } catch (e) { next(e); }
}
export function getBenchmarks(req: Request, res: Response, next: NextFunction) {
  try { res.json(svc.getBenchmarksArray(Number(req.params.id))); } catch (e) { next(e); }
}
export function getReviews(req: Request, res: Response, next: NextFunction) {
  try { res.json(svc.getReviews(Number(req.params.id))); } catch (e) { next(e); }
}
export function addReview(req: Request, res: Response, next: NextFunction) {
  try { res.json(svc.addReview(req.user!.userId, Number(req.params.id), req.body.rating, req.body.comment)); } catch (e) { next(e); }
}
export function performanceCompare(req: Request, res: Response, next: NextFunction) {
  try { const ids = (req.query.ids as string).split(',').map(Number).filter(Boolean); res.json(svc.performanceCompare(ids)); } catch (e) { next(e); }
}
