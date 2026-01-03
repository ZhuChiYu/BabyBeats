import { getDatabase } from '../database';

/**
 * 数据库迁移：添加尿布记录的尿量字段
 */
export async function migrateAddUrineFields(): Promise<void> {
  const db = await getDatabase();
  
  try {
    console.log('🔄 开始迁移：添加尿量字段...');
    
    // 检查字段是否已存在
    const tableInfo = await db.getAllAsync('PRAGMA table_info(diapers)') as any[];
    const hasWetWeight = tableInfo.some(col => col.name === 'wet_weight');
    
    if (hasWetWeight) {
      console.log('✅ 尿量字段已存在，跳过迁移');
      return;
    }
    
    // 添加新字段
    await db.execAsync(`
      ALTER TABLE diapers ADD COLUMN wet_weight REAL;
      ALTER TABLE diapers ADD COLUMN dry_weight REAL;
      ALTER TABLE diapers ADD COLUMN urine_amount REAL;
    `);
    
    // 创建索引
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_diapers_urine_amount 
      ON diapers(baby_id, time, urine_amount);
    `);
    
    console.log('✅ 迁移完成：尿量字段已添加');
  } catch (error) {
    console.error('❌ 迁移失败:', error);
    throw error;
  }
}

