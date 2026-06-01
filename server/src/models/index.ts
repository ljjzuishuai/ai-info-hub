import { getDb, saveDb } from '../config/db';

function dbRun(sql: string, params?: unknown[]) {
  const db = getDb();
  if (params) { const s = db.prepare(sql); s.bind(params); while (s.step()) {} s.free(); }
  else { db.run(sql); }
  saveDb();
}

function dbGet<T = Record<string, unknown>>(sql: string, params?: unknown[]): T | undefined {
  const db = getDb(); const s = db.prepare(sql); if (params) s.bind(params);
  let row: T | undefined;
  if (s.step()) { const cols = s.getColumnNames(); const vals = s.get(); row = {} as T; cols.forEach((c, i) => { (row as any)[c] = vals[i]; }); }
  s.free(); return row;
}

function dbAll<T = Record<string, unknown>>(sql: string, params?: unknown[]): T[] {
  const db = getDb(); const s = db.prepare(sql); if (params) s.bind(params);
  const rows: T[] = []; const cols = s.getColumnNames();
  while (s.step()) { const vals = s.get(); const r = {} as T; cols.forEach((c, i) => { (r as any)[c] = vals[i]; }); rows.push(r); }
  s.free(); return rows;
}

// ============ 建表 ============
export function createTables(): void {
  const db = getDb();

  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, icon TEXT DEFAULT '📦', sort_order INTEGER DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS ai_models (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, name_en TEXT, provider TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL, description TEXT, features TEXT DEFAULT '[]',
    use_cases TEXT, access_url TEXT, access_type TEXT DEFAULT '网页',
    pricing_type TEXT DEFAULT 'paid' CHECK(pricing_type IN ('free','freemium','paid')), price_detail TEXT,
    logo_url TEXT, official_url TEXT, is_featured INTEGER DEFAULT 0, sort_order INTEGER DEFAULT 0,
    context_window INTEGER DEFAULT 0, max_output_tokens INTEGER DEFAULT 0,
    input_price REAL DEFAULT 0, output_price REAL DEFAULT 0,
    avg_latency_ms INTEGER DEFAULT 0, tokens_per_second INTEGER DEFAULT 0, knowledge_cutoff TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS benchmark_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT, model_id INTEGER NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
    benchmark_name TEXT NOT NULL, score REAL NOT NULL, created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model_id INTEGER NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE, rating INTEGER NOT NULL CHECK(rating>=1 AND rating<=5),
    comment TEXT, created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL, role TEXT DEFAULT 'user' CHECK(role IN ('user','admin')), created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS favorites (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model_id INTEGER NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
    created_at TEXT DEFAULT (datetime('now')), PRIMARY KEY (user_id, model_id)
  )`);

  // 尝试为旧表添加新列（迁移兼容）
  const tryAlter = (sql: string) => { try { db.run(sql); } catch {} };
  tryAlter('ALTER TABLE ai_models ADD COLUMN context_window INTEGER DEFAULT 0');
  tryAlter('ALTER TABLE ai_models ADD COLUMN max_output_tokens INTEGER DEFAULT 0');
  tryAlter('ALTER TABLE ai_models ADD COLUMN input_price REAL DEFAULT 0');
  tryAlter('ALTER TABLE ai_models ADD COLUMN output_price REAL DEFAULT 0');
  tryAlter('ALTER TABLE ai_models ADD COLUMN avg_latency_ms INTEGER DEFAULT 0');
  tryAlter('ALTER TABLE ai_models ADD COLUMN tokens_per_second INTEGER DEFAULT 0');
  tryAlter('ALTER TABLE ai_models ADD COLUMN knowledge_cutoff TEXT DEFAULT ""');

  saveDb();
}

// ============ 种子数据 ============
export function seedData(): void {
  const catCount = dbGet<{c:number}>('SELECT COUNT(*) as c FROM categories');
  if (catCount && catCount.c > 0) return;

  const cats = [
    ['大语言模型(LLM)', 'llm', '🤖', 1], ['图片生成', 'image', '🎨', 2], ['视频生成', 'video', '🎬', 3],
    ['音频/音乐', 'audio', '🎵', 4], ['编程助手', 'code', '💻', 5], ['AI搜索', 'search', '🔍', 6], ['多模态', 'multimodal', '🌐', 7],
  ];
  for (const [n, s, i, so] of cats) dbRun('INSERT INTO categories (name,slug,icon,sort_order) VALUES (?,?,?,?)', [n,s,i,so]);

  // 模型数据: [name, name_en, provider, catId, desc, features, useCases, accessUrl, accessType, pricingType, priceDetail, officialUrl, featured, ctxWindow, maxOut, inPrice, outPrice, latency, tps, knowledge]
  const models: any[][] = [
    // ===== LLM (cat 1) =====
    ['GPT-4o', 'GPT-4o', 'OpenAI', 1, 'OpenAI最新旗舰多模态模型，支持文本、图片、音频输入输出', '["多模态输入输出","超快响应","128K上下文","函数调用","图像理解"]', '对话助手、内容创作、代码生成、数据分析、翻译', 'https://chatgpt.com', '网页/API/App', 'paid', 'Plus:$20/月\nPro:$200/月\nAPI:$2.50/1M入,$10/1M出', 'https://openai.com', 1, 128000, 16384, 2.5, 10, 1200, 80, '2024-10'],
    ['GPT-4o-mini', 'GPT-4o-mini', 'OpenAI', 1, 'OpenAI轻量级模型，性价比极高', '["性价比极高","多模态","快速轻量","128K上下文"]', '简单问答、文本摘要、分类、客服', 'https://chatgpt.com', '网页/API/App', 'freemium', '免费可用\nAPI:$0.15/1M入,$0.60/1M出', 'https://openai.com', 1, 128000, 16384, 0.15, 0.6, 600, 150, '2024-07'],
    ['Claude Opus 4.5', 'Claude Opus 4.5', 'Anthropic', 1, 'Anthropic最强模型，复杂推理和代码能力强', '["超强推理","200K上下文","安全性高","代码能力强"]', '学术研究、复杂分析、长篇写作、代码开发', 'https://claude.ai', '网页/API/App', 'paid', 'Pro:$20/月\nMax:$100/月\nAPI:$15/1M入,$75/1M出', 'https://anthropic.com', 1, 200000, 16384, 15, 75, 2500, 35, '2025-05'],
    ['Claude Sonnet 4.6', 'Claude Sonnet 4.6', 'Anthropic', 1, 'Anthropic最平衡模型，速度能力兼顾', '["速度快","性价比高","200K上下文","多语言"]', '日常对话、内容创作、代码辅助、翻译', 'https://claude.ai', '网页/API/App', 'freemium', '免费有限使用\nAPI:$3/1M入,$15/1M出', 'https://anthropic.com', 1, 200000, 8192, 3, 15, 800, 90, '2025-05'],
    ['Gemini 2.5 Pro', 'Gemini 2.5 Pro', 'Google', 1, 'Google旗舰，百万级上下文，深度整合Google生态', '["100万+上下文","深度推理","多模态原生","Google生态"]', '文档分析、学术研究、代码审查、多模态', 'https://gemini.google.com', '网页/API/App', 'freemium', '免费有限\nAdvanced:$19.99/月\nAPI按量', 'https://deepmind.google', 1, 1048576, 16384, 1.25, 5, 1500, 50, '2025-03'],
    ['DeepSeek-V3', 'DeepSeek-V3', '深度求索', 1, '国产开源旗舰，性能接近GPT-4，API价格极低', '["开源","极低API价","128K上下文","中文优秀"]', '中文对话、内容创作、代码开发、教育', 'https://chat.deepseek.com', '网页/API/App', 'freemium', '网页免费\nAPI:￥1/1M入,￥4/1M出', 'https://deepseek.com', 1, 128000, 8192, 0.14, 0.56, 1000, 60, '2024-12'],
    ['DeepSeek-R1', 'DeepSeek-R1', '深度求索', 1, '推理增强模型，数学编程顶级，展示完整思考链', '["超强推理","思考链可见","数学顶尖","编程超强","开源"]', '数学解题、编程竞赛、逻辑推理、科学研究', 'https://chat.deepseek.com', '网页/API/App', 'freemium', '网页免费\nAPI同V3定价', 'https://deepseek.com', 1, 128000, 8192, 0.14, 0.56, 3000, 30, '2025-01'],
    ['文心一言 4.0', 'ERNIE Bot 4.0', '百度', 1, '百度旗舰大模型，中文和百度生态整合', '["中文优化","百度搜索","知识图谱","多模态"]', '中文创作、搜索增强、企业办公、教育', 'https://yiyan.baidu.com', '网页/API/App', 'freemium', '免费有额度\n会员:￥59.9/月\nAPI按量', 'https://yiyan.baidu.com', 0, 128000, 8192, 2, 8, 1200, 50, '2024-10'],
    ['通义千问 2.5', 'Qwen 2.5', '阿里云', 1, '阿里云大模型，开源生态完善，企业级稳定', '["开源生态","多尺寸","中文强","阿里云整合"]', '企业客服、文档处理、代码、数据分析', 'https://tongyi.aliyun.com', '网页/API/App', 'freemium', '网页免费\nAPI有免费额度\n企业按需', 'https://tongyi.aliyun.com', 0, 131072, 8192, 0.5, 2, 800, 70, '2024-09'],
    ['Kimi', 'Kimi', '月之暗面', 1, '200万字超长上下文，擅长超长文档处理', '["200万字上下文","文件解析强","联网搜索","中文优化"]', '超长文档阅读、论文分析、合同审查', 'https://kimi.moonshot.cn', '网页/API/App/插件', 'freemium', '免费有额度\n会员:￥50/月起\nAPI按量', 'https://moonshot.cn', 1, 2000000, 8192, 0.5, 2, 1000, 60, '2024-12'],
    ['豆包', 'Doubao', '字节跳动', 1, '字节跳动AI产品，语音交互出色', '["语音交互好","多角色","抖音生态","价格实惠"]', '日常聊天、语音交流、角色扮演、创作', 'https://www.doubao.com', '网页/API/App', 'freemium', '网页App免费\nAPI按量,价低', 'https://www.doubao.com', 0, 128000, 4096, 0.1, 0.4, 500, 100, '2024-11'],
    ['Qwen3', 'Qwen3', '阿里云', 1, '阿里最新开源旗舰，支持思考模式', '["开源","思考模式","多尺寸","Agent强"]', '代码、数据分析、Agent、学术研究', 'https://tongyi.aliyun.com', '网页/API/开源', 'freemium', '开源免费\nAPI有免费额度', 'https://github.com/QwenLM/Qwen3', 1, 131072, 8192, 0.5, 2, 700, 80, '2025-04'],

    // ===== 图片生成 (cat 2) =====
    ['DALL-E 3', 'DALL-E 3', 'OpenAI', 2, 'OpenAI图片生成模型，ChatGPT集成，文字渲染准', '["文字渲染准","风格多样","ChatGPT集成","高清"]', '创意设计、广告素材、插画、概念设计', 'https://chatgpt.com', '网页', 'paid', 'Plus:$20/月含额度\nAPI按尺寸计费', 'https://openai.com', 1, 4096, 0, 0.04, 0.12, 15000, 0, '2023-10'],
    ['Midjourney V6', 'Midjourney V6', 'Midjourney Inc.', 2, '最受欢迎AI艺术生成工具，画质精美', '["画质精美","艺术风丰富","创意控制精细","社区活跃"]', '艺术创作、概念设计、品牌视觉、游戏原画', 'https://www.midjourney.com', 'Discord/网页', 'paid', 'Basic:$10/月\nStandard:$30/月\nPro:$60/月', 'https://www.midjourney.com', 1, 0, 0, 0, 0, 30000, 0, '2024-06'],
    ['Stable Diffusion 3', 'Stable Diffusion 3', 'Stability AI', 2, '最流行开源AI图片生成，LoRA/ControlNet生态丰富', '["开源免费","本地部署","LoRA/ControlNet","社区丰富"]', '本地AI绘画、游戏资产、动漫创作、艺术实验', 'https://stability.ai', '开源/API/第三方', 'free', '开源免费\nAPI按量\n工具:ComfyUI/A1111', 'https://stability.ai', 1, 0, 0, 0, 0, 5000, 0, '2024-06'],

    // ===== 视频 (cat 3) =====
    ['Sora', 'Sora', 'OpenAI', 3, 'OpenAI视频生成，1分钟高质量，物理世界理解强', '["1分钟视频","物理模拟","高质量","多风格"]', '创意视频、广告、概念演示、教育视频', 'https://sora.com', '网页', 'paid', 'Plus:$20/月(限)\nPro:$200/月(多)', 'https://sora.com', 1, 0, 0, 0, 0, 60000, 0, '2024-12'],
    ['Runway Gen-4', 'Runway Gen-4', 'Runway', 3, '专业AI视频编辑生成平台，好莱坞和广告行业使用', '["视频生成","视频编辑","风格迁移","专业工具"]', '电影后期、广告制作、创意视频、VFX', 'https://runwayml.com', '网页', 'paid', '免费有限\nStandard:$15/月\nPro:$35/月\nUnlimited:$95/月', 'https://runwayml.com', 1, 0, 0, 0, 0, 45000, 0, '2025-01'],
    ['可灵(KLING)', 'KLING', '快手', 3, '快手视频生成，中国可用，1080p输出', '["中国可用","1080p","图生视频","运动流畅"]', '短视频、广告素材、电商展示、创意表达', 'https://kling.kuaishou.com', '网页/App', 'freemium', '每日免费额度\n会员:￥66/月起', 'https://kling.kuaishou.com', 0, 0, 0, 0, 0, 40000, 0, '2024-07'],

    // ===== 音频 (cat 4) =====
    ['Suno V4', 'Suno V4', 'Suno Inc.', 4, '最流行AI音乐生成，输入歌词即可生成完整歌曲', '["完整歌曲生成","多风格","人声自然","旋律美"]', '音乐创作、歌曲Demo、背景音乐、广告配乐', 'https://suno.com', '网页/App', 'freemium', '免费5首/天\nPro:$10/月(500首)\nPremier:$30/月', 'https://suno.com', 1, 8192, 0, 0, 0, 20000, 0, '2024-12'],
    ['Udio', 'Udio', 'Udio Inc.', 4, '音质极高AI音乐生成，适合专业音乐人', '["音质极高","音乐性强","人声逼真","可编辑"]', '专业音乐制作、歌曲创作、商业配乐', 'https://www.udio.com', '网页', 'freemium', '免费有限\nStandard:$10/月\nPro:$30/月', 'https://www.udio.com', 0, 8192, 0, 0, 0, 25000, 0, '2024-08'],

    // ===== 编程 (cat 5) =====
    ['GitHub Copilot', 'GitHub Copilot', 'GitHub(Microsoft)', 5, '全球最流行AI编程助手，深度集成IDE', '["IDE深度集成","代码补全","多语言","Chat"]', '代码编写、审查、Bug修复、重构', 'https://github.com/features/copilot', 'IDE插件', 'paid', '个人:$10/月\n商业:$19/月\n企业:$39/月\n学生开源免费', 'https://github.com/features/copilot', 1, 8192, 0, 0, 0, 500, 30, '2024-08'],
    ['Cursor', 'Cursor', 'Cursor Inc.', 5, '新一代AI原生代码编辑器，基于VS Code', '["AI原生编辑器","上下文理解","多文件编辑","Agent模式"]', '全栈开发、代码重构、项目搭建、快速原型', 'https://cursor.sh', '桌面应用', 'freemium', '免费(限)\nPro:$20/月\nBusiness:$40/月', 'https://cursor.sh', 1, 32768, 0, 0, 0, 600, 40, '2024-10'],
    ['Claude Code', 'Claude Code', 'Anthropic', 5, 'Anthropic官方CLI编程工具，终端中使用Claude', '["命令行","终端原生","深度理解代码库","Git集成"]', '命令行开发、项目维护、审查、DevOps', 'https://claude.ai', 'CLI', 'paid', '通过Anthropic API\n按token计费', 'https://docs.anthropic.com/en/docs/claude-code', 0, 200000, 16384, 3, 15, 2000, 35, '2025-02'],

    // ===== AI搜索 (cat 6) =====
    ['Perplexity AI', 'Perplexity AI', 'Perplexity', 6, 'AI驱动的下一代搜索引擎，带引用答案', '["实时搜索","答案带引用","多轮追问","Pro深度搜索"]', '信息检索、学术研究、事实核查、市场调研', 'https://www.perplexity.ai', '网页/App/插件', 'freemium', '免费可用\nPro:$20/月', 'https://www.perplexity.ai', 1, 128000, 4096, 0, 0, 2000, 30, '2024-12'],
    ['秘塔AI搜索', 'Metaso', '秘塔科技', 6, '国产AI搜索，中文体验优秀，无广告', '["中文优化","无广告","答案详尽","学术搜索"]', '中文搜索、学术研究、知识整理、学习辅助', 'https://metaso.cn', '网页', 'free', '完全免费', 'https://metaso.cn', 1, 128000, 4096, 0, 0, 1500, 30, '2024-06'],

    // ===== 多模态 (cat 7) =====
    ['GPT-4.1', 'GPT-4.1', 'OpenAI', 7, 'OpenAI推理优化，编程和指令遵循新高度', '["超强编程","指令遵循精准","1M上下文","推理增强"]', '编程、复杂推理、长文档、Agent、企业应用', 'https://platform.openai.com', 'API', 'paid', 'API:$2/1M入,$8/1M出', 'https://openai.com', 0, 1048576, 32768, 2, 8, 1500, 60, '2025-04'],
    ['Gemini 2.5 Flash', 'Gemini 2.5 Flash', 'Google', 7, 'Google轻量多模态，速度快成本低', '["超快速度","低成本","多模态","1M上下文"]', '高并发API、实时对话、批量处理', 'https://ai.google.dev', 'API', 'freemium', '大量免费额度\n超出按量,价极低', 'https://deepmind.google', 0, 1048576, 8192, 0.075, 0.3, 400, 150, '2025-03'],
    ['智谱清言(GLM-4)', 'GLM-4', '智谱AI', 7, '清华系AI旗舰，多模态强，国产替代首选', '["自主GLM架构","多模态","Agent","开源生态"]', '企业AI部署、智能客服、知识库、数据分析', 'https://chatglm.cn', '网页/API/App', 'freemium', '免费日常使用\nAPI按量\n企业按需', 'https://www.zhipuai.cn', 0, 128000, 4096, 0.5, 2, 900, 50, '2024-09'],
    ['讯飞星火 4.0', 'Spark 4.0', '科大讯飞', 7, '科大讯飞大模型，语音能力行业领先', '["语音识别顶尖","多模态","教育/医疗","国产化"]', '语音交互、教育辅导、医疗辅助、智能办公', 'https://xinghuo.xfyun.cn', '网页/API/App/SDK', 'freemium', '免费有限\n会员因场景而异\n行业方案按需', 'https://xinghuo.xfyun.cn', 0, 8192, 4096, 0.3, 1.2, 800, 50, '2024-08'],
  ];

  for (const m of models) {
    dbRun(`INSERT INTO ai_models (name,name_en,provider,category_id,description,features,use_cases,access_url,access_type,pricing_type,price_detail,official_url,is_featured,context_window,max_output_tokens,input_price,output_price,avg_latency_ms,tokens_per_second,knowledge_cutoff)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, m);
  }

  // 基准分数: [model_id, benchmark, score]
  const benchmarks: [number, string, number][] = [
    [1,'MMLU',88.7],[1,'HumanEval',90.2],[1,'MATH',76.6],[1,'GSM8K',94.5],
    [2,'MMLU',82.0],[2,'HumanEval',87.2],[2,'MATH',70.2],[2,'GSM8K',91.0],
    [3,'MMLU',89.5],[3,'HumanEval',92.4],[3,'MATH',80.1],[3,'GSM8K',95.0],
    [4,'MMLU',85.0],[4,'HumanEval',88.0],[4,'MATH',72.0],[4,'GSM8K',93.0],
    [5,'MMLU',90.2],[5,'HumanEval',88.5],[5,'MATH',78.0],[5,'GSM8K',95.5],
    [6,'MMLU',85.0],[6,'HumanEval',82.5],[6,'MATH',74.0],[6,'GSM8K',90.0],
    [7,'MMLU',84.0],[7,'HumanEval',80.0],[7,'MATH',82.0],[7,'GSM8K',92.5],
    [8,'MMLU',78.0],[8,'HumanEval',72.0],[8,'MATH',65.0],[8,'GSM8K',85.0],
    [9,'MMLU',82.0],[9,'HumanEval',78.0],[9,'MATH',70.0],[9,'GSM8K',88.0],
    [10,'MMLU',80.0],[10,'HumanEval',75.0],[10,'MATH',68.0],[10,'GSM8K',87.0],
    [11,'MMLU',78.0],[11,'HumanEval',74.0],[11,'MATH',65.0],[11,'GSM8K',86.0],
    [12,'MMLU',84.0],[12,'HumanEval',80.0],[12,'MATH',72.0],[12,'GSM8K',89.0],
  ];
  for (const [mid, bm, score] of benchmarks) {
    dbRun('INSERT INTO benchmark_scores (model_id,benchmark_name,score) VALUES (?,?,?)', [mid, bm, score]);
  }

  saveDb();
}
