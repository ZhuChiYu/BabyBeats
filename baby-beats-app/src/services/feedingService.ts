import { Feeding } from '../types';
import { getDatabase, generateId, getCurrentTimestamp } from '../database';

export class FeedingService {
  // 创建喂养记录
  static async create(data: Omit<Feeding, 'id' | 'createdAt' | 'updatedAt'>): Promise<Feeding> {
    const db = await getDatabase();
    const now = getCurrentTimestamp();
    const feeding: Feeding = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    
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
    
    return feeding;
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
  }
  
  // 删除喂养记录
  static async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM feedings WHERE id = ?', [id]);
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

