import { Diaper } from '../types';
import { getDatabase, generateId, getCurrentTimestamp } from '../database';
import { syncManager } from './syncManager';

export class DiaperService {
  // 创建尿布记录
  static async create(data: Omit<Diaper, 'id' | 'createdAt' | 'updatedAt'>): Promise<Diaper> {
    const db = await getDatabase();
    const now = getCurrentTimestamp();
    const diaper: Diaper = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    
    console.log('💩 创建尿布记录:', diaper.id, '类型:', diaper.type);
    
    await db.runAsync(
      `INSERT INTO diapers (
        id, baby_id, time, type, poop_consistency, poop_color, poop_amount,
        pee_amount, has_abnormality, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        diaper.id,
        diaper.babyId,
        diaper.time,
        diaper.type,
        diaper.poopConsistency || null,
        diaper.poopColor || null,
        diaper.poopAmount || null,
        diaper.peeAmount || null,
        diaper.hasAbnormality ? 1 : 0,
        diaper.notes || null,
        diaper.createdAt,
        diaper.updatedAt,
      ]
    );
    
    // 自动同步到服务器
    this.autoSync(diaper).catch(err => {
      console.warn('尿布记录自动同步失败（不影响本地保存）:', err);
    });
    
    return diaper;
  }
  
  // 自动同步单个记录到服务器
  private static async autoSync(diaper: Diaper): Promise<void> {
    if (!syncManager.isAutoSyncEnabled()) {
      console.log('⏭️ 自动同步未启用，跳过尿布记录同步');
      return;
    }
    
    console.log('🔄 自动同步尿布记录到服务器:', diaper.id);
    await syncManager.syncDiaperToServer(diaper);
    console.log('✅ 尿布记录已自动同步到服务器');
  }
  
  // 获取宝宝的所有尿布记录
  static async getByBabyId(babyId: string, limit?: number): Promise<Diaper[]> {
    const db = await getDatabase();
    const query = limit
      ? 'SELECT * FROM diapers WHERE baby_id = ? ORDER BY time DESC LIMIT ?'
      : 'SELECT * FROM diapers WHERE baby_id = ? ORDER BY time DESC';
    
    const params = limit ? [babyId, limit] : [babyId];
    const rows = await db.getAllAsync<any>(query, params);
    
    return rows.map(row => this.mapRowToDiaper(row));
  }
  
  // 获取指定日期范围的尿布记录
  static async getByDateRange(
    babyId: string,
    startTime: number,
    endTime: number
  ): Promise<Diaper[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM diapers WHERE baby_id = ? AND time >= ? AND time <= ? ORDER BY time DESC',
      [babyId, startTime, endTime]
    );
    
    return rows.map(row => this.mapRowToDiaper(row));
  }
  
  // 获取今天的尿布记录
  static async getToday(babyId: string): Promise<Diaper[]> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;
    
    return this.getByDateRange(babyId, startOfDay, endOfDay);
  }
  
  // 获取单条记录
  static async getById(id: string): Promise<Diaper | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM diapers WHERE id = ?',
      [id]
    );
    
    return row ? this.mapRowToDiaper(row) : null;
  }
  
  // 更新尿布记录
  static async update(id: string, updates: Partial<Diaper>): Promise<void> {
    const db = await getDatabase();
    const now = getCurrentTimestamp();
    
    console.log('✏️ 更新尿布记录:', id);
    
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
    if (updates.poopConsistency !== undefined) {
      fields.push('poop_consistency = ?');
      values.push(updates.poopConsistency);
    }
    if (updates.poopColor !== undefined) {
      fields.push('poop_color = ?');
      values.push(updates.poopColor);
    }
    if (updates.poopAmount !== undefined) {
      fields.push('poop_amount = ?');
      values.push(updates.poopAmount);
    }
    if (updates.peeAmount !== undefined) {
      fields.push('pee_amount = ?');
      values.push(updates.peeAmount);
    }
    if (updates.hasAbnormality !== undefined) {
      fields.push('has_abnormality = ?');
      values.push(updates.hasAbnormality ? 1 : 0);
    }
    if (updates.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updates.notes);
    }
    
    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);
    
    await db.runAsync(
      `UPDATE diapers SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    // 自动同步更新到服务器
    const updated = await this.getById(id);
    if (updated) {
      this.autoSync(updated).catch(err => {
        console.warn('尿布记录更新同步失败（不影响本地保存）:', err);
      });
    }
  }
  
  // 删除尿布记录
  static async delete(id: string): Promise<void> {
    const db = await getDatabase();
    console.log('🗑️ 删除尿布记录:', id);
    await db.runAsync('DELETE FROM diapers WHERE id = ?', [id]);
    
    // TODO: 实现删除记录的同步（需要在服务器端添加删除接口）
    if (syncManager.isAutoSyncEnabled()) {
      console.log('💡 提示：删除操作需要手动同步才能同步到服务器');
    }
  }
  
  // 获取今日统计
  static async getTodayStats(babyId: string): Promise<{
    totalCount: number;
    poopCount: number;
    peeCount: number;
    bothCount: number;
  }> {
    const diapers = await this.getToday(babyId);
    
    return {
      totalCount: diapers.length,
      poopCount: diapers.filter(d => d.type === 'poop' || d.type === 'both').length,
      peeCount: diapers.filter(d => d.type === 'pee' || d.type === 'both').length,
      bothCount: diapers.filter(d => d.type === 'both').length,
    };
  }
  
  // 辅助函数：将数据库行映射到Diaper对象
  private static mapRowToDiaper(row: any): Diaper {
    return {
      id: row.id,
      babyId: row.baby_id,
      time: row.time,
      type: row.type,
      poopConsistency: row.poop_consistency,
      poopColor: row.poop_color,
      poopAmount: row.poop_amount,
      peeAmount: row.pee_amount,
      hasAbnormality: row.has_abnormality === 1,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      syncedAt: row.synced_at,
    };
  }
}

