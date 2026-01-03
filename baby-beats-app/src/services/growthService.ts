import { GrowthRecord } from '../types';
import { getDatabase, generateId, getCurrentTimestamp } from '../database';
import { validateAndFixBabyId } from '../utils/babyValidation';

export class GrowthService {
  // 创建成长记录
  static async create(data: Omit<GrowthRecord, 'id' | 'createdAt' | 'updatedAt' | 'bmi'>): Promise<GrowthRecord> {
    const db = await getDatabase();
    const now = getCurrentTimestamp();
    
    // 验证并修正 baby_id
    const validBabyId = await validateAndFixBabyId(data.babyId);
    
    // 自动计算BMI（如果有身高和体重）
    let bmi: number | undefined;
    if (data.height && data.weight) {
      const heightInMeters = data.height / 100; // cm转换为m
      bmi = Number((data.weight / (heightInMeters * heightInMeters)).toFixed(2));
    }
    
    const record: GrowthRecord = {
      ...data,
      babyId: validBabyId,
      bmi,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    
    await db.runAsync(
      `INSERT INTO growth_records (
        id, baby_id, date, height, weight, head_circ, temperature, bmi,
        notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.id,
        record.babyId,
        record.date,
        record.height || null,
        record.weight || null,
        record.headCirc || null,
        record.temperature || null,
        record.bmi || null,
        record.notes || null,
        record.createdAt,
        record.updatedAt,
      ]
    );
    
    return record;
  }
  
  // 获取宝宝的所有成长记录
  static async getByBabyId(babyId: string): Promise<GrowthRecord[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM growth_records WHERE baby_id = ? ORDER BY date DESC',
      [babyId]
    );
    
    return rows.map(row => this.mapRowToGrowthRecord(row));
  }
  
  // 获取最新的成长记录
  static async getLatest(babyId: string): Promise<GrowthRecord | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM growth_records WHERE baby_id = ? ORDER BY date DESC LIMIT 1',
      [babyId]
    );
    
    return row ? this.mapRowToGrowthRecord(row) : null;
  }
  
  // 更新成长记录
  static async update(id: string, updates: Partial<GrowthRecord>): Promise<void> {
    const db = await getDatabase();
    const now = getCurrentTimestamp();
    
    // 如果更新了身高或体重，重新计算BMI
    if (updates.height !== undefined || updates.weight !== undefined) {
      const current = await this.getById(id);
      if (current) {
        const newHeight = updates.height !== undefined ? updates.height : current.height;
        const newWeight = updates.weight !== undefined ? updates.weight : current.weight;
        
        if (newHeight && newWeight) {
          const heightInMeters = newHeight / 100;
          updates.bmi = Number((newWeight / (heightInMeters * heightInMeters)).toFixed(2));
        }
      }
    }
    
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updates.date !== undefined) {
      fields.push('date = ?');
      values.push(updates.date);
    }
    if (updates.height !== undefined) {
      fields.push('height = ?');
      values.push(updates.height);
    }
    if (updates.weight !== undefined) {
      fields.push('weight = ?');
      values.push(updates.weight);
    }
    if (updates.headCirc !== undefined) {
      fields.push('head_circ = ?');
      values.push(updates.headCirc);
    }
    if (updates.temperature !== undefined) {
      fields.push('temperature = ?');
      values.push(updates.temperature);
    }
    if (updates.bmi !== undefined) {
      fields.push('bmi = ?');
      values.push(updates.bmi);
    }
    if (updates.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updates.notes);
    }
    
    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);
    
    await db.runAsync(
      `UPDATE growth_records SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }
  
  // 删除成长记录
  static async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM growth_records WHERE id = ?', [id]);
  }
  
  // 根据ID获取成长记录
  static async getById(id: string): Promise<GrowthRecord | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM growth_records WHERE id = ?',
      [id]
    );
    
    return row ? this.mapRowToGrowthRecord(row) : null;
  }
  
  // 获取成长趋势数据（用于图表）
  static async getGrowthTrend(babyId: string, type: 'height' | 'weight' | 'headCirc' | 'bmi'): Promise<Array<{date: number, value: number}>> {
    const records = await this.getByBabyId(babyId);
    
    return records
      .filter(r => r[type] !== undefined)
      .map(r => ({
        date: r.date,
        value: r[type] as number,
      }))
      .reverse(); // 按时间正序
  }
  
  // 辅助函数：将数据库行映射到GrowthRecord对象
  private static mapRowToGrowthRecord(row: any): GrowthRecord {
    return {
      id: row.id,
      babyId: row.baby_id,
      date: row.date,
      height: row.height,
      weight: row.weight,
      headCirc: row.head_circ,
      temperature: row.temperature,
      bmi: row.bmi,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      syncedAt: row.synced_at,
    };
  }
}

