import { Sleep } from '../types';
import { getDatabase, generateId, getCurrentTimestamp } from '../database';
import { syncManager } from './syncManager';
import { validateAndFixBabyId } from '../utils/babyValidation';

export class SleepService {
  // 创建睡眠记录
  static async create(data: Omit<Sleep, 'id' | 'createdAt' | 'updatedAt' | 'duration'>): Promise<Sleep> {
    const db = await getDatabase();
    const now = getCurrentTimestamp();
    
    // 验证并修正 baby_id
    const validBabyId = await validateAndFixBabyId(data.babyId);
    
    // 自动计算时长（分钟）
    const duration = Math.floor((data.endTime - data.startTime) / 60000);
    
    const sleep: Sleep = {
      ...data,
      babyId: validBabyId,
      duration,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    
    console.log('😴 创建睡眠记录:', sleep.id, '时长:', duration, '分钟');
    
    await db.runAsync(
      `INSERT INTO sleeps (
        id, baby_id, start_time, end_time, duration, sleep_type,
        fall_asleep_method, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sleep.id,
        sleep.babyId,
        sleep.startTime,
        sleep.endTime,
        sleep.duration,
        sleep.sleepType,
        sleep.fallAsleepMethod || null,
        sleep.notes || null,
        sleep.createdAt,
        sleep.updatedAt,
      ]
    );
    
    // 自动同步到服务器
    this.autoSync(sleep).catch(err => {
      console.warn('睡眠记录自动同步失败（不影响本地保存）:', err);
    });
    
    return sleep;
  }
  
  // 自动同步单个记录到服务器
  private static async autoSync(sleep: Sleep): Promise<void> {
    if (!syncManager.isAutoSyncEnabled()) {
      console.log('⏭️ 自动同步未启用，跳过睡眠记录同步');
      return;
    }
    
    console.log('🔄 自动同步睡眠记录到服务器:', sleep.id);
    await syncManager.syncSleepToServer(sleep);
    console.log('✅ 睡眠记录已自动同步到服务器');
  }
  
  // 获取宝宝的所有睡眠记录
  static async getByBabyId(babyId: string, limit?: number): Promise<Sleep[]> {
    const db = await getDatabase();
    const query = limit
      ? 'SELECT * FROM sleeps WHERE baby_id = ? ORDER BY start_time DESC LIMIT ?'
      : 'SELECT * FROM sleeps WHERE baby_id = ? ORDER BY start_time DESC';
    
    const params = limit ? [babyId, limit] : [babyId];
    const rows = await db.getAllAsync<any>(query, params);
    
    return rows.map(row => this.mapRowToSleep(row));
  }
  
  // 获取指定日期范围的睡眠记录
  static async getByDateRange(
    babyId: string,
    startTime: number,
    endTime: number
  ): Promise<Sleep[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM sleeps WHERE baby_id = ? AND start_time >= ? AND start_time <= ? ORDER BY start_time DESC',
      [babyId, startTime, endTime]
    );
    
    return rows.map(row => this.mapRowToSleep(row));
  }
  
  // 获取今天的睡眠记录
  static async getToday(babyId: string): Promise<Sleep[]> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;
    
    return this.getByDateRange(babyId, startOfDay, endOfDay);
  }
  
  // 更新睡眠记录
  static async update(id: string, updates: Partial<Sleep>): Promise<void> {
    const db = await getDatabase();
    const now = getCurrentTimestamp();
    
    console.log('✏️ 更新睡眠记录:', id);
    
    // 如果更新了开始或结束时间，重新计算时长
    if (updates.startTime || updates.endTime) {
      const current = await this.getById(id);
      if (current) {
        const newStartTime = updates.startTime || current.startTime;
        const newEndTime = updates.endTime || current.endTime;
        updates.duration = Math.floor((newEndTime - newStartTime) / 60000);
      }
    }
    
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updates.startTime !== undefined) {
      fields.push('start_time = ?');
      values.push(updates.startTime);
    }
    if (updates.endTime !== undefined) {
      fields.push('end_time = ?');
      values.push(updates.endTime);
    }
    if (updates.duration !== undefined) {
      fields.push('duration = ?');
      values.push(updates.duration);
    }
    if (updates.sleepType !== undefined) {
      fields.push('sleep_type = ?');
      values.push(updates.sleepType);
    }
    if (updates.fallAsleepMethod !== undefined) {
      fields.push('fall_asleep_method = ?');
      values.push(updates.fallAsleepMethod);
    }
    if (updates.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updates.notes);
    }
    
    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);
    
    await db.runAsync(
      `UPDATE sleeps SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    // 自动同步更新到服务器
    const updated = await this.getById(id);
    if (updated) {
      this.autoSync(updated).catch(err => {
        console.warn('睡眠记录更新同步失败（不影响本地保存）:', err);
      });
    }
  }
  
  // 删除睡眠记录
  static async delete(id: string): Promise<void> {
    const db = await getDatabase();
    console.log('🗑️ 删除睡眠记录:', id);
    await db.runAsync('DELETE FROM sleeps WHERE id = ?', [id]);
    
    // TODO: 实现删除记录的同步（需要在服务器端添加删除接口）
    if (syncManager.isAutoSyncEnabled()) {
      console.log('💡 提示：删除操作需要手动同步才能同步到服务器');
    }
  }
  
  // 根据ID获取睡眠记录
  static async getById(id: string): Promise<Sleep | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM sleeps WHERE id = ?',
      [id]
    );
    
    return row ? this.mapRowToSleep(row) : null;
  }
  
  // 获取今日统计
  static async getTodayStats(babyId: string): Promise<{
    totalCount: number;
    totalDuration: number;
    napDuration: number;
    nightDuration: number;
  }> {
    const sleeps = await this.getToday(babyId);
    
    return {
      totalCount: sleeps.length,
      totalDuration: sleeps.reduce((sum, s) => sum + s.duration, 0),
      napDuration: sleeps
        .filter(s => s.sleepType === 'nap')
        .reduce((sum, s) => sum + s.duration, 0),
      nightDuration: sleeps
        .filter(s => s.sleepType === 'night')
        .reduce((sum, s) => sum + s.duration, 0),
    };
  }
  
  // 智能建议睡眠类型
  static suggestSleepType(startTime: Date): 'nap' | 'night' {
    const hour = startTime.getHours();
    // 晚上7点到早上7点为夜间睡眠
    return (hour >= 19 || hour < 7) ? 'night' : 'nap';
  }
  
  // 辅助函数：将数据库行映射到Sleep对象
  private static mapRowToSleep(row: any): Sleep {
    return {
      id: row.id,
      babyId: row.baby_id,
      startTime: row.start_time,
      endTime: row.end_time,
      duration: row.duration,
      sleepType: row.sleep_type,
      fallAsleepMethod: row.fall_asleep_method,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      syncedAt: row.synced_at,
    };
  }
}

