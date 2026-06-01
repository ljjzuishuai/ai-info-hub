import app from './app';
import { env } from './config/env';
import { initDatabase, saveDb } from './config/db';
import { createTables, seedData } from './models';

async function start() {
  console.log('📦 初始化数据库...');
  await initDatabase();
  createTables();
  seedData();
  saveDb();
  console.log('✅ 数据库就绪 (30+ AI模型已加载)');

  app.listen(env.PORT, () => {
    console.log(`\n🚀 AI信息大全 已启动: http://localhost:${env.PORT}`);
    console.log(`   API: http://localhost:${env.PORT}/api/v1\n`);
  });
}

start().catch(err => { console.error('❌ 启动失败:', err); process.exit(1); });
