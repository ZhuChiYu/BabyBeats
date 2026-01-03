import { Pumping } from '../types';
import { getDatabase, generateId, getCurrentTimestamp } from '../database';
import { validateAndFixBabyId } from '../utils/babyValidation';

export class PumpingService {
  // 创建挤奶记录
  static async create(data: Omit<Pumping, 'id' | 'createdAt' | 'updatedAt' | 'totalAmount'>): Promise<Pumping> {
    const db = await getDatabase();
    const now = getCurrentTimestamp();
    
    // 验证并修正 baby_id
    const validBabyId = await validateAndFixBabyId(data.babyId);
    
    // 自动计算总量
    const totalAmount = data.leftAmount + data.rightAmount;
    
    const pumping: Pumping = {
      ...data,
      babyId: validBabyId,
      totalAmount,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    
    await db.runAsync(
      `INSERT INTO pumpings (
        id, baby_id, time, method, left_amount, right_amount, total_amount,
        storage_method, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pumping.id,
        pumping.babyId,
        pumping.time,
        pumping.method,
        pumping.leftAmount,
        pumping.rightAmount,
        pumping.totalAmount,
        pumping.storageMethod,
        pumping.notes || null,
        pumping.createdAt,
        pumping.updatedAt,
      ]
    );
    
    return pumping;
  }
  
  // 获取宝宝的所有挤奶记录
  static async getByBabyId(babyId: string, limit?: number): Promise<Pumping[]> {
    const db = await getDatabase();
    const query = limit
      ? 'SELECT * FROM pumpings WHERE baby_id = ? ORDER BY time DESC LIMIT ?'
      : 'SELECT * FROM pumpings WHERE baby_id = ? ORDER BY time DESC';
    
    const params = limit ? [babyId, limit] : [babyId];
    const rows = await db.getAllAsync<any>(query, params);
    
    return rows.map(row => this.mapRowToPumping(row));
  }
  
  // 获取指定日期范围的挤奶记录
  static async getByDateRange(
    babyId: string,
    startTime: number,
    endTime: number
  ): Promise<Pumping[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM pumpings WHERE baby_id = ? AND time >= ? AND time <= ? ORDER BY time DESC',
      [babyId, startTime, endTime]
    );
    
    return rows.map(row => this.mapRowToPumping(row));
  }
  
  // 获取今天的挤奶记录
  static async getToday(babyId: string): Promise<Pumping[]> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;
    
    return this.getByDateRange(babyId, startOfDay, endOfDay);
  }
  
  // 更新挤奶记录
  static async update(id: string, updates: Partial<Pumping>): Promise<void> {
    const db = await getDatabase();
    const now = getCurrentTimestamp();
    
    // 如果更新了左侧或右侧量，重新计算总量
    if (updates.leftAmount !== undefined || updates.rightAmount !== undefined) {
      const current = await this.getById(id);
      if (current) {
        const newLeftAmount = updates.leftAmount !== undefined ? updates.leftAmount : current.leftAmount;
        const newRightAmount = updates.rightAmount !== undefined ? updates.rightAmount : current.rightAmount;
        updates.totalAmount = newLeftAmount + newRightAmount;
      }
    }
    
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updates.time !== undefined) {
      fields.push('time = ?');
      values.push(updates.time);
    }
    if (updates.method !== undefined) {
      fields.push('method = ?');
      values.push(updates.method);
    }
    if (updates.leftAmount !== undefined) {
      fields.push('left_amount = ?');
      values.push(updates.leftAmount);
    }
    if (updates.rightAmount !== undefined) {
      fields.push('right_amount = ?');
      values.push(updates.rightAmount);
    }
    if (updates.totalAmount !== undefined) {
      fields.push('total_amount = ?');
      values.push(updates.totalAmount);
    }
    if (updates.storageMethod !== undefined) {
      fields.push('storage_method = ?');
      values.push(updates.storageMethod);
    }
    if (updates.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updates.notes);
    }
    
    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);
    
    await db.runAsync(
      `UPDATE pumpings SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }
  
  // 删除挤奶记录
  static async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM pumpings WHERE id = ?', [id]);
  }
  
  // 根据ID获取挤奶记录
  static async getById(id: string): Promise<Pumping | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM pumpings WHERE id = ?',
      [id]
    );
    
    return row ? this.mapRowToPumping(row) : null;
  }
  
  // 获取今日统计
  static async getTodayStats(babyId: string): Promise<{
    totalCount: number;
    totalAmount: number;
    averageAmount: number;
  }> {
    const pumpings = await this.getToday(babyId);
    const totalAmount = pumpings.reduce((sum, p) => sum + p.totalAmount, 0);
    
    return {
      totalCount: pumpings.length,
      totalAmount,
      averageAmount: pumpings.length > 0 ? Math.round(totalAmount / pumpings.length) : 0,
    };
  }
  
  // 辅助函数：将数据库行映射到Pumping对象
  private static mapRowToPumping(row: any): Pumping {
    return {
      id: row.id,
      babyId: row.baby_id,
      time: row.time,
      method: row.method,
      leftAmount: row.left_amount,
      rightAmount: row.right_amount,
      totalAmount: row.total_amount,
      storageMethod: row.storage_method,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      syncedAt: row.synced_at,
    };
  }
}

