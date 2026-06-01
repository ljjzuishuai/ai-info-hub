import { Request, Response, NextFunction } from 'express';
import { getDb, saveDb } from '../config/db';

export function list(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDb();
    const stmt = db.prepare(`SELECT c.*, (SELECT COUNT(*) FROM ai_models WHERE category_id = c.id) as model_count FROM categories c ORDER BY c.sort_order`);
    const cols = stmt.getColumnNames();
    const data: Record<string, unknown>[] = [];
    while (stmt.step()) { const vals = stmt.get(); const r: Record<string, unknown> = {}; cols.forEach((c, i) => { r[c] = vals[i]; }); data.push(r); }
    stmt.free();
    res.json(data);
  } catch (e) { next(e); }
}

export function create(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDb();
    const { name, slug, icon } = req.body;
    const stmt = db.prepare('INSERT INTO categories (name, slug, icon, sort_order) VALUES (?,?,?,0)');
    stmt.bind([name, slug, icon || '📦']);
    while (stmt.step()) {}
    stmt.free();
    saveDb();
    const idStmt = db.prepare('SELECT last_insert_rowid() as id'); idStmt.step();
    const id = idStmt.get()[0]; idStmt.free();
    res.status(201).json({ id, name, slug, icon });
  } catch (e) { next(e); }
}

export function update(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDb();
    const id = Number(req.params.id);
    const { name, slug, icon, sort_order } = req.body;
    const stmt = db.prepare('UPDATE categories SET name=?, slug=?, icon=?, sort_order=? WHERE id=?');
    stmt.bind([name, slug, icon, sort_order, id]);
    while (stmt.step()) {}
    stmt.free();
    saveDb();
    res.json({ success: true });
  } catch (e) { next(e); }
}

export function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const stmt = getDb().prepare('DELETE FROM categories WHERE id = ?');
    stmt.bind([Number(req.params.id)]);
    while (stmt.step()) {}
    stmt.free();
    saveDb();
    res.json({ success: true });
  } catch (e) { next(e); }
}
