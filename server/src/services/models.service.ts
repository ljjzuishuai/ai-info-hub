import { getDb, saveDb } from '../config/db';
import { AppError } from '../middleware/errorHandler';

interface ModelInput {
  name: string; name_en?: string; provider: string; category_id?: number;
  description?: string; features?: string; use_cases?: string;
  access_url?: string; access_type?: string; pricing_type?: string;
  price_detail?: string; logo_url?: string; official_url?: string;
  is_featured?: number; sort_order?: number;
  context_window?: number; max_output_tokens?: number;
  input_price?: number; output_price?: number;
  avg_latency_ms?: number; tokens_per_second?: number; knowledge_cutoff?: string;
}

function mapRow(row: Record<string, unknown>) {
  return { ...row, features: typeof row.features === 'string' ? JSON.parse(row.features as string) : [] };
}

export function listModels(filters: any) {
  const db = getDb();
  const page = filters.page || 1;
  const pageSize = Math.min(filters.pageSize || 20, 100);
  const offset = (page - 1) * pageSize;

  let where = 'WHERE 1=1'; const params: unknown[] = [];
  if (filters.search) { const s = `%${filters.search}%`; where += ' AND (m.name LIKE ? OR m.provider LIKE ? OR m.description LIKE ?)'; params.push(s,s,s); }
  if (filters.categoryId) { where += ' AND m.category_id = ?'; params.push(filters.categoryId); }
  if (filters.pricingType) { where += ' AND m.pricing_type = ?'; params.push(filters.pricingType); }

  const sortMap: Record<string, string> = { newest:'m.created_at DESC', name:'m.name ASC', featured:'m.is_featured DESC, m.sort_order' };
  const orderClause = sortMap[filters.sortBy || 'featured'] || sortMap.featured;

  const countStmt = db.prepare(`SELECT COUNT(*) as c FROM ai_models m ${where}`);
  countStmt.bind(params); let total = 0; if (countStmt.step()) total = countStmt.get()[0] as number; countStmt.free();

  const stmt = db.prepare(`SELECT m.*, c.name as category_name, c.icon as category_icon FROM ai_models m LEFT JOIN categories c ON m.category_id=c.id ${where} ORDER BY ${orderClause} LIMIT ? OFFSET ?`);
  stmt.bind([...params, pageSize, offset]);
  const cols = stmt.getColumnNames(); const data: Record<string, unknown>[] = [];
  while (stmt.step()) { const vals = stmt.get(); const r: Record<string, unknown> = {}; cols.forEach((c,i) => { r[c] = vals[i]; }); data.push(mapRow(r)); }
  stmt.free();
  return { data, total, page, pageSize, totalPages: Math.ceil(total/pageSize) };
}

export function getModelById(id: number) {
  const db = getDb();
  const stmt = db.prepare(`SELECT m.*, c.name as category_name, c.icon as category_icon FROM ai_models m LEFT JOIN categories c ON m.category_id=c.id WHERE m.id=?`);
  stmt.bind([id]); if (!stmt.step()) { stmt.free(); throw new AppError(404, '模型不存在'); }
  const cols = stmt.getColumnNames(); const vals = stmt.get(); const row: Record<string, unknown> = {}; cols.forEach((c,i) => { row[c] = vals[i]; }); stmt.free();
  return mapRow(row);
}

export function createModel(input: ModelInput) {
  const db = getDb();
  const fields = 'name,name_en,provider,category_id,description,features,use_cases,access_url,access_type,pricing_type,price_detail,logo_url,official_url,is_featured,sort_order,context_window,max_output_tokens,input_price,output_price,avg_latency_ms,tokens_per_second,knowledge_cutoff';
  const vals = [input.name,input.name_en||null,input.provider,input.category_id||null,input.description||null,input.features||'[]',input.use_cases||null,input.access_url||null,input.access_type||'网页',input.pricing_type||'paid',input.price_detail||null,input.logo_url||null,input.official_url||null,input.is_featured||0,input.sort_order||0,input.context_window||0,input.max_output_tokens||0,input.input_price||0,input.output_price||0,input.avg_latency_ms||0,input.tokens_per_second||0,input.knowledge_cutoff||''];
  const stmt = db.prepare(`INSERT INTO ai_models (${fields}) VALUES (${vals.map(()=>'?').join(',')})`);
  stmt.bind(vals); while (stmt.step()) {} stmt.free();
  const idStmt = db.prepare('SELECT last_insert_rowid() as id'); idStmt.step(); const id = idStmt.get()[0] as number; idStmt.free();
  saveDb();
  return getModelById(id);
}

export function updateModel(id: number, input: ModelInput) {
  const db = getDb();
  const exist = db.prepare('SELECT id FROM ai_models WHERE id=?'); exist.bind([id]); if (!exist.step()) { exist.free(); throw new AppError(404,'模型不存在'); } exist.free();
  const stmt = db.prepare(`UPDATE ai_models SET name=?,name_en=?,provider=?,category_id=?,description=?,features=?,use_cases=?,access_url=?,access_type=?,pricing_type=?,price_detail=?,logo_url=?,official_url=?,is_featured=?,sort_order=?,context_window=?,max_output_tokens=?,input_price=?,output_price=?,avg_latency_ms=?,tokens_per_second=?,knowledge_cutoff=?,updated_at=datetime('now') WHERE id=?`);
  stmt.bind([input.name,input.name_en||null,input.provider,input.category_id||null,input.description||null,input.features||'[]',input.use_cases||null,input.access_url||null,input.access_type||'网页',input.pricing_type||'paid',input.price_detail||null,input.logo_url||null,input.official_url||null,input.is_featured||0,input.sort_order||0,input.context_window||0,input.max_output_tokens||0,input.input_price||0,input.output_price||0,input.avg_latency_ms||0,input.tokens_per_second||0,input.knowledge_cutoff||'',id]);
  while (stmt.step()) {} stmt.free(); saveDb();
  return getModelById(id);
}

export function deleteModel(id: number) { const s = getDb().prepare('DELETE FROM ai_models WHERE id=?'); s.bind([id]); while (s.step()) {} s.free(); }

export function compareModels(ids: number[]) { return ids.map(id => { try { return getModelById(id); } catch { return null; } }).filter(Boolean); }

// ===== 基准分数 =====
export function getBenchmarksArray(modelId: number) {
  const db = getDb(); const stmt = db.prepare('SELECT * FROM benchmark_scores WHERE model_id=? ORDER BY benchmark_name'); stmt.bind([modelId]);
  const cols = stmt.getColumnNames(); const data: any[] = [];
  while (stmt.step()) { const vals = stmt.get(); const r: any = {}; cols.forEach((c,i) => { r[c] = vals[i]; }); data.push(r); }
  stmt.free(); return data;
}

// ===== 评价 =====
export function getReviews(modelId: number) {
  const db = getDb(); const stmt = db.prepare(`SELECT r.*, u.username FROM reviews r JOIN users u ON r.user_id=u.id WHERE r.model_id=? ORDER BY r.created_at DESC`);
  stmt.bind([modelId]); const cols = stmt.getColumnNames(); const data: any[] = [];
  while (stmt.step()) { const vals = stmt.get(); const r: any = {}; cols.forEach((c,i) => { r[c] = vals[i]; }); data.push(r); }
  stmt.free(); return data;
}

export function addReview(userId: number, modelId: number, rating: number, comment: string) {
  const db = getDb();
  const stmt = db.prepare('INSERT INTO reviews (user_id,model_id,rating,comment) VALUES (?,?,?,?)');
  stmt.bind([userId,modelId,rating,comment||null]);
  while (stmt.step()) {}
  stmt.free();
  saveDb();
  return getReviews(modelId);
}

// ===== 性能对比 =====
export function performanceCompare(ids: number[]) {
  return ids.map(id => {
    try { const m = getModelById(id); return { ...m, benchmarks: getBenchmarksArray(id) }; } catch { return null; }
  }).filter(Boolean);
}
