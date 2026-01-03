import { Feeding } from '../types';
import { getDatabase, generateId, getCurrentTimestamp } from '../database';
import { syncManager } from './syncManager';
import { validateAndFixBabyId } from '../utils/babyValidation';

export class FeedingService {
  // 创建喂养记录
  static async create(data: Omit<Feeding, 'id' | 'createdAt' | 'updatedAt'>): Promise<Feeding> {
    const db = await getDatabase();
    const now = getCurrentTimestamp();
    
    // 验证并修正 baby_id
    const validBabyId = await validateAndFixBabyId(data.babyId);
    
    const feeding: Feeding = {
      ...data,
      babyId: validBabyId,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    
    console.log('📝 创建喂养记录:', feeding.id, '类型:', feeding.type, 'baby_id:', feeding.babyId);
    
    try {
    await db.runAsync(
      `INSERT INTO feedings (
        id, baby_id, time, type, left_duration, right_duration,
        milk_amount, milk_brand, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        feeding.id,
        feeding.babyId,
        feeding.time,
        feeding.type,
        feeding.leftDuration || 0,
        feeding.rightDuration || 0,
        feeding.milkAmount || 0,
        feeding.milkBrand || null,
        feeding.notes || null,
        feeding.createdAt,
        feeding.updatedAt,
      ]
    );
      console.log('✅ 喂养记录插入成功');
    } catch (error) {
      console.error('❌ 插入喂养记录失败:', error);
      throw error;
    }
    
    // 自动同步到服务器（异步，不阻塞）
    this.autoSync(feeding).catch(err => {
      console.warn('喂养记录自动同步失败（不影响本地保存）:', err);
    });
    
    return feeding;
  }
  
  // 自动同步单个记录到服务器
  private static async autoSync(feeding: Feeding): Promise<void> {
    if (!syncManager.isAutoSyncEnabled()) {
      console.log('⏭️ 自动同步未启用，跳过喂养记录同步');
      return;
    }
    
    console.log('🔄 自动同步喂养记录到服务器:', feeding.id);
    await syncManager.syncFeedingToServer(feeding);
    console.log('✅ 喂养记录已自动同步到服务器');
  }
  
  // 获取单条记录
  static async getById(id: string): Promise<Feeding | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM feedings WHERE id = ?',
      [id]
    );
    
    return row ? this.mapRowToFeeding(row) : null;
  }
  
  // 获取宝宝的所有喂养记录
  static async getByBabyId(babyId: string, limit?: number): Promise<Feeding[]> {
    const db = await getDatabase();
    const query = limit
      ? 'SELECT * FROM feedings WHERE baby_id = ? ORDER BY time DESC LIMIT ?'
      : 'SELECT * FROM feedings WHERE baby_id = ? ORDER BY time DESC';
    
    const params = limit ? [babyId, limit] : [babyId];
    const rows = await db.getAllAsync<any>(query, params);
    
    return rows.map(row => this.mapRowToFeeding(row));
  }
  
  // 获取指定日期范围的喂养记录
  static async getByDateRange(
    babyId: string,
    startTime: number,
    endTime: number
  ): Promise<Feeding[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM feedings WHERE baby_id = ? AND time >= ? AND time <= ? ORDER BY time DESC',
      [babyId, startTime, endTime]
    );
    
    return rows.map(row => this.mapRowToFeeding(row));
  }
  
  // 获取今天的喂养记录
  static async getToday(babyId: string): Promise<Feeding[]> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;
    
    return this.getByDateRange(babyId, startOfDay, endOfDay);
  }
  
  // 更新喂养记录
  static async update(id: string, updates: Partial<Feeding>): Promise<void> {
    const db = await getDatabase();
    const now = getCurrentTimestamp();
    
    console.log('✏️ 更新喂养记录:', id);
    
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updates.time !== undefined) {
      fields.push('time = ?');
      values.push(updates.time);
    }
    if (updates.type !== undefined) {
      fields.push('type = ?');
      values.push(updates.type);
    }
    if (updates.leftDuration !== undefined) {
      fields.push('left_duration = ?');
      values.push(updates.leftDuration);
    }
    if (updates.rightDuration !== undefined) {
      fields.push('right_duration = ?');
      values.push(updates.rightDuration);
    }
    if (updates.milkAmount !== undefined) {
      fields.push('milk_amount = ?');
      values.push(updates.milkAmount);
    }
    if (updates.milkBrand !== undefined) {
      fields.push('milk_brand = ?');
      values.push(updates.milkBrand);
    }
    if (updates.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updates.notes);
    }
    
    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);
    
    await db.runAsync(
      `UPDATE feedings SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    // 自动同步更新到服务器
    const updated = await this.getById(id);
    if (updated) {
      this.autoSync(updated).catch(err => {
        console.warn('喂养记录更新同步失败（不影响本地保存）:', err);
      });
    }
  }
  
  // 删除喂养记录
  static async delete(id: string): Promise<void> {
    const db = await getDatabase();
    console.log('🗑️ 删除喂养记录:', id);
    await db.runAsync('DELETE FROM feedings WHERE id = ?', [id]);
    
    // TODO: 实现删除记录的同步（需要在服务器端添加删除接口）
    if (syncManager.isAutoSyncEnabled()) {
      console.log('💡 提示：删除操作需要手动同步才能同步到服务器');
    }
  }
  
  // 获取今日统计
  static async getTodayStats(babyId: string): Promise<{
    totalCount: number;
    breastCount: number;
    bottleCount: number;
    formulaCount: number;
    totalAmount: number;
    totalDuration: number;
  }> {
    const feedings = await this.getToday(babyId);
    
    return {
      totalCount: feedings.length,
      breastCount: feedings.filter(f => f.type === 'breast').length,
      bottleCount: feedings.filter(f => f.type === 'bottled_breast_milk').length,
      formulaCount: feedings.filter(f => f.type === 'formula').length,
      totalAmount: feedings.reduce((sum, f) => sum + (f.milkAmount || 0), 0),
      totalDuration: feedings.reduce(
        (sum, f) => sum + (f.leftDuration || 0) + (f.rightDuration || 0),
        0
      ),
    };
  }
  
  // 辅助函数：将数据库行映射到Feeding对象
  private static mapRowToFeeding(row: any): Feeding {
    return {
      id: row.id,
      babyId: row.baby_id,
      time: row.time,
      type: row.type,
      leftDuration: row.left_duration,
      rightDuration: row.right_duration,
      milkAmount: row.milk_amount,
      milkBrand: row.milk_brand,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      syncedAt: row.synced_at,
    };
  }
}

