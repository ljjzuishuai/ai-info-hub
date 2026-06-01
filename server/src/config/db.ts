import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { env } from './env';

let db: SqlJsDatabase;

export function getDb(): SqlJsDatabase {
  if (!db) throw new Error('数据库未初始化');
  return db;
}

export function saveDb(): void {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  const dbPath = path.resolve(env.DB_PATH);
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
  fs.writeFileSync(dbPath, buffer);
}

export async function initDatabase(): Promise<SqlJsDatabase> {
  const SQL = await initSqlJs();
  const dbPath = path.resolve(env.DB_PATH);
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }
  db.run('PRAGMA foreign_keys = ON');
  return db;
}
