import { getDb, saveDb } from '../config/db';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';

export async function register(input: { username: string; email: string; password: string }) {
  const db = getDb();
  const exist = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?');
  exist.bind([input.email, input.username]);
  if (exist.step()) { exist.free(); throw new AppError(409, '邮箱或用户名已被使用'); }
  exist.free();

  // 检查是否首个用户 → 自动设为管理员
  const countStmt = db.prepare('SELECT COUNT(*) as c FROM users');
  countStmt.step();
  const isFirst = (countStmt.get()[0] as number) === 0;
  countStmt.free();
  const role = isFirst ? 'admin' : 'user';

  const hashed = await hashPassword(input.password);
  const stmt = db.prepare('INSERT INTO users (username, email, password, role) VALUES (?,?,?,?)');
  stmt.bind([input.username, input.email, hashed, role]);
  while (stmt.step()) {}
  stmt.free();

  const idStmt = db.prepare('SELECT last_insert_rowid() as id'); idStmt.step();
  const userId = idStmt.get()[0] as number; idStmt.free();
  saveDb();

  const token = signToken({ userId, username: input.username, role });
  return { id: userId, username: input.username, email: input.email, role, token };
}

export async function login(input: { email: string; password: string }) {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  stmt.bind([input.email]);
  if (!stmt.step()) { stmt.free(); throw new AppError(401, '邮箱或密码错误'); }
  const cols = stmt.getColumnNames(); const vals = stmt.get();
  const user: Record<string, unknown> = {}; cols.forEach((c, i) => { user[c] = vals[i]; });
  stmt.free();

  const valid = await comparePassword(input.password, user.password as string);
  if (!valid) throw new AppError(401, '邮箱或密码错误');

  const token = signToken({ userId: user.id as number, username: user.username as string, role: user.role as string });
  return { id: user.id, username: user.username, email: user.email, role: user.role, token };
}

export function getProfile(userId: number) {
  const db = getDb();
  const stmt = db.prepare('SELECT id, username, email, role, created_at FROM users WHERE id = ?');
  stmt.bind([userId]);
  if (!stmt.step()) { stmt.free(); throw new AppError(404, '用户不存在'); }
  const cols = stmt.getColumnNames(); const vals = stmt.get();
  const user: Record<string, unknown> = {}; cols.forEach((c, i) => { user[c] = vals[i]; });
  stmt.free();
  return user;
}
