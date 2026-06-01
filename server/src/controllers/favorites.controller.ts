import { Request, Response, NextFunction } from 'express';
import { getDb, saveDb } from '../config/db';

export function list(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDb();
    const stmt = db.prepare(`SELECT m.*, c.name as category_name, c.icon as category_icon, f.created_at as favorited_at FROM favorites f JOIN ai_models m ON f.model_id = m.id LEFT JOIN categories c ON m.category_id = c.id WHERE f.user_id = ? ORDER BY f.created_at DESC`);
    stmt.bind([req.user!.userId]);
    const cols = stmt.getColumnNames();
    const data: Record<string, unknown>[] = [];
    while (stmt.step()) { const vals = stmt.get(); const r: Record<string, unknown> = {}; cols.forEach((c, i) => { r[c] = vals[i]; }); data.push(r); }
    stmt.free();
    res.json(data);
  } catch (e) { next(e); }
}

export function toggle(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDb();
    const userId = req.user!.userId;
    const modelId = Number(req.params.modelId);
    const check = db.prepare('SELECT 1 FROM favorites WHERE user_id = ? AND model_id = ?');
    check.bind([userId, modelId]);
    const exists = check.step();
    check.free();

    if (exists) {
      const del = db.prepare('DELETE FROM favorites WHERE user_id = ? AND model_id = ?');
      del.bind([userId, modelId]);
      while (del.step()) {}
      del.free();
      saveDb();
      res.json({ favorited: false });
    } else {
      const ins = db.prepare('INSERT OR IGNORE INTO favorites (user_id, model_id) VALUES (?,?)');
      ins.bind([userId, modelId]);
      while (ins.step()) {}
      ins.free();
      saveDb();
      res.json({ favorited: true });
    }
  } catch (e) { next(e); }
}

export function check(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDb();
    const stmt = db.prepare('SELECT 1 FROM favorites WHERE user_id = ? AND model_id = ?');
    stmt.bind([req.user!.userId, Number(req.params.modelId)]);
    const favorited = stmt.step();
    stmt.free();
    res.json({ favorited });
  } catch (e) { next(e); }
}
