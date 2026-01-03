import { getDatabase } from '../database';

/**
 * 调试工具：检查数据库状态
 */
export async function debugDatabaseState() {
  const db = await getDatabase();
  
  console.log('=== 数据库调试信息 ===');
  
  // 检查外键设置
  const foreignKeysResult = await db.getFirstAsync('PRAGMA foreign_keys');
  console.log('外键约束状态:', foreignKeysResult);
  
  // 检查所有表
  const tables = await db.getAllAsync(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  ) as any[];
  console.log('数据库中的表:', tables.map(t => t.name));
  
  // 检查宝宝表
  const babies = await db.getAllAsync('SELECT id, name, user_id FROM babies') as any[];
  console.log('宝宝表记录数:', babies.length);
  if (babies.length > 0) {
    console.log('宝宝列表:', babies);
  } else {
    console.warn('⚠️ 宝宝表为空！');
  }
  
  // 检查喂养记录表
  const feedings = await db.getAllAsync('SELECT id, baby_id, type FROM feedings LIMIT 10') as any[];
  console.log('喂养记录数（最多10条）:', feedings.length);
  
  // 检查是否有孤立的记录（外键不匹配）
  const orphanedFeedings = await db.getAllAsync(`
    SELECT f.id, f.baby_id, f.type 
    FROM feedings f 
    LEFT JOIN babies b ON f.baby_id = b.id 
    WHERE b.id IS NULL
    LIMIT 5
  `) as any[];
  
  if (orphanedFeedings.length > 0) {
    console.warn('⚠️ 发现孤立的喂养记录（baby_id不存在）:', orphanedFeedings);
  }
  
  console.log('=== 调试信息结束 ===');
}

/**
 * 修复数据库外键问题
 */
export async function fixForeignKeyIssues() {
  const db = await getDatabase();
  
  console.log('开始修复外键问题...');
  
  // 临时禁用外键约束
  await db.execAsync('PRAGMA foreign_keys = OFF');
  
  // 删除所有孤立的记录
  const orphanedCounts: any = {};
  
  // 检查并删除孤立的喂养记录
  const deletedFeedings = await db.runAsync(`
    DELETE FROM feedings 
    WHERE baby_id NOT IN (SELECT id FROM babies)
  `);
  orphanedCounts.feedings = deletedFeedings.changes;
  
  // 检查并删除孤立的尿布记录
  const deletedDiapers = await db.runAsync(`
    DELETE FROM diapers 
    WHERE baby_id NOT IN (SELECT id FROM babies)
  `);
  orphanedCounts.diapers = deletedDiapers.changes;
  
  // 检查并删除孤立的睡眠记录
  const deletedSleeps = await db.runAsync(`
    DELETE FROM sleeps 
    WHERE baby_id NOT IN (SELECT id FROM babies)
  `);
  orphanedCounts.sleeps = deletedSleeps.changes;
  
  // 检查并删除孤立的挤奶记录
  const deletedPumpings = await db.runAsync(`
    DELETE FROM pumpings 
    WHERE baby_id NOT IN (SELECT id FROM babies)
  `);
  orphanedCounts.pumpings = deletedPumpings.changes;
  
  // 检查并删除孤立的成长记录
  const deletedGrowth = await db.runAsync(`
    DELETE FROM growth_records 
    WHERE baby_id NOT IN (SELECT id FROM babies)
  `);
  orphanedCounts.growth_records = deletedGrowth.changes;
  
  // 检查并删除孤立的里程碑记录
  const deletedMilestones = await db.runAsync(`
    DELETE FROM milestones 
    WHERE baby_id NOT IN (SELECT id FROM babies)
  `);
  orphanedCounts.milestones = deletedMilestones.changes;
  
  // 重新启用外键约束
  await db.execAsync('PRAGMA foreign_keys = ON');
  
  console.log('修复完成，删除的孤立记录:', orphanedCounts);
  
  return orphanedCounts;
}

