import { getDatabase, generateId, getCurrentTimestamp } from '../database';
import { GrowthRecord } from '../types';
import { validateAndFixBabyId } from '../utils/babyValidation';

export interface TemperatureRecord {
  id: string;
  babyId: string;
  date: number;
  temperature: number;
  measurementMethod?: 'forehead' | 'ear' | 'armpit' | 'rectal' | 'oral';
  notes?: string;
  createdAt: number;
  updatedAt: number;
  syncedAt?: number;
}

export class TemperatureService {
  /**
   * 创建体温记录（通过growth_records表）
   */
  static async create(data: {
    babyId: string;
    date: number;
    temperature: number;
    measurementMethod?: string;
    notes?: string;
  }): Promise<TemperatureRecord> {
    const db = await getDatabase();
    const id = generateId();
    const now = getCurrentTimestamp();
    
    // 验证并修正 baby_id
    const validBabyId = await validateAndFixBabyId(data.babyId);

    await db.runAsync(
      `INSERT INTO growth_records (
        id, baby_id, date, temperature, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, validBabyId, data.date, data.temperature, data.notes || null, now, now]
    );

    return {
      id,
      babyId: validBabyId,
      date: data.date,
      temperature: data.temperature,
      measurementMethod: data.measurementMethod as any,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * 获取宝宝的所有体温记录
   */
  static async getByBabyId(babyId: string, limit?: number): Promise<TemperatureRecord[]> {
    const db = await getDatabase();
    const sql = `
      SELECT * FROM growth_records 
      WHERE baby_id = ? AND temperature IS NOT NULL 
      ORDER BY date DESC
      ${limit ? `LIMIT ${limit}` : ''}
    `;
    
    const results = await db.getAllAsync(sql, [babyId]) as any[];
    
    return results.map(row => ({
      id: row.id,
      babyId: row.baby_id,
      date: row.date,
      temperature: row.temperature,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      syncedAt: row.synced_at,
    }));
  }

  /**
   * 获取最新体温记录
   */
  static async getLatest(babyId: string): Promise<TemperatureRecord | null> {
    const records = await this.getByBabyId(babyId, 1);
    return records.length > 0 ? records[0] : null;
  }

  /**
   * 获取今日体温记录
   */
  static async getTodayRecords(babyId: string): Promise<TemperatureRecord[]> {
    const db = await getDatabase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();

    const results = await db.getAllAsync(
      `SELECT * FROM growth_records 
       WHERE baby_id = ? AND temperature IS NOT NULL AND date >= ? 
       ORDER BY date DESC`,
      [babyId, todayStart]
    ) as any[];

    return results.map(row => ({
      id: row.id,
      babyId: row.baby_id,
      date: row.date,
      temperature: row.temperature,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      syncedAt: row.synced_at,
    }));
  }

  /**
   * 更新体温记录
   */
  static async update(id: string, data: {
    date?: number;
    temperature?: number;
    notes?: string;
  }): Promise<void> {
    const db = await getDatabase();
    const now = getCurrentTimestamp();

    const updates: string[] = [];
    const values: any[] = [];

    if (data.date !== undefined) {
      updates.push('date = ?');
      values.push(data.date);
    }
    if (data.temperature !== undefined) {
      updates.push('temperature = ?');
      values.push(data.temperature);
    }
    if (data.notes !== undefined) {
      updates.push('notes = ?');
      values.push(data.notes);
    }

    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);

    await db.runAsync(
      `UPDATE growth_records SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }

  /**
   * 删除体温记录
   */
  static async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM growth_records WHERE id = ?', [id]);
  }

  /**
   * 检查是否发烧
   */
  static isFever(temperature: number, method: string = 'forehead'): boolean {
    const thresholds: { [key: string]: number } = {
      forehead: 37.5,
      ear: 37.5,
      armpit: 37.0,
      rectal: 38.0,
      oral: 37.5,
    };
    return temperature >= (thresholds[method] || 37.5);
  }

  /**
   * 获取体温状态
   */
  static getTemperatureStatus(temperature: number): {
    status: 'low' | 'normal' | 'slight_fever' | 'fever' | 'high_fever';
    label: string;
    color: string;
  } {
    if (temperature < 36.0) {
      return { status: 'low', label: '偏低', color: '#5AC8FA' };
    } else if (temperature < 37.3) {
      return { status: 'normal', label: '正常', color: '#34C759' };
    } else if (temperature < 38.0) {
      return { status: 'slight_fever', label: '低烧', color: '#FF9500' };
    } else if (temperature < 39.0) {
      return { status: 'fever', label: '发烧', color: '#FF6B6B' };
    } else {
      return { status: 'high_fever', label: '高烧', color: '#FF3B30' };
    }
  }
}
