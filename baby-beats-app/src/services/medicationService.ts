import { getDatabase, generateId, getCurrentTimestamp } from '../database';
import { Medication } from '../types';
import { NotificationService } from './notificationService';

export class MedicationService {
  /**
   * 创建用药记录
   */
  static async create(data: {
    babyId: string;
    medicationTime: number;
    medicationName: string;
    dosage: string;
    frequency?: string;
    startDate?: number;
    endDate?: number;
    administrationMethod?: string;
    visitId?: string;
    notes?: string;
  }): Promise<Medication> {
    const db = await getDatabase();
    const id = generateId();
    const now = getCurrentTimestamp();

    await db.runAsync(
      `INSERT INTO medications (
        id, baby_id, medication_time, medication_name, dosage, 
        frequency, start_date, end_date, administration_method, 
        visit_id, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.babyId,
        data.medicationTime,
        data.medicationName,
        data.dosage,
        data.frequency || null,
        data.startDate || null,
        data.endDate || null,
        data.administrationMethod || null,
        data.visitId || null,
        data.notes || null,
        now,
        now,
      ]
    );

    const medication: Medication = {
      id,
      babyId: data.babyId,
      medicationTime: data.medicationTime,
      medicationName: data.medicationName,
      dosage: data.dosage,
      frequency: data.frequency,
      startDate: data.startDate,
      endDate: data.endDate,
      administrationMethod: data.administrationMethod,
      visitId: data.visitId,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    };

    // 如果有频次和开始日期，设置用药提醒
    if (medication.frequency && medication.startDate) {
      try {
        // 获取宝宝名称用于通知
        const babyResult = await db.getFirstAsync(
          'SELECT name FROM babies WHERE id = ?',
          [data.babyId]
        ) as any;
        
        if (babyResult) {
          await NotificationService.scheduleMedicationReminders(medication, babyResult.name);
        }
      } catch (error) {
        console.error('设置用药提醒失败:', error);
      }
    }

    return medication;
  }

  /**
   * 获取宝宝的所有用药记录
   */
  static async getByBabyId(babyId: string, limit?: number): Promise<Medication[]> {
    const db = await getDatabase();
    const sql = `
      SELECT * FROM medications 
      WHERE baby_id = ? 
      ORDER BY medication_time DESC
      ${limit ? `LIMIT ${limit}` : ''}
    `;
    
    const results = await db.getAllAsync(sql, [babyId]) as any[];

    return results.map(row => this.mapRowToMedication(row));
  }

  /**
   * 获取单个用药记录
   */
  static async getById(id: string): Promise<Medication | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync(
      'SELECT * FROM medications WHERE id = ?',
      [id]
    ) as any;

    if (!result) return null;
    return this.mapRowToMedication(result);
  }

  /**
   * 获取正在进行的用药（未结束）
   */
  static async getActive(babyId: string): Promise<Medication[]> {
    const db = await getDatabase();
    const now = getCurrentTimestamp();
    
    const results = await db.getAllAsync(
      `SELECT * FROM medications 
       WHERE baby_id = ? AND (end_date IS NULL OR end_date > ?) 
       ORDER BY start_date DESC`,
      [babyId, now]
    ) as any[];

    return results.map(row => this.mapRowToMedication(row));
  }

  /**
   * 获取关联到就诊记录的用药
   */
  static async getByVisitId(visitId: string): Promise<Medication[]> {
    const db = await getDatabase();
    const results = await db.getAllAsync(
      'SELECT * FROM medications WHERE visit_id = ? ORDER BY medication_time DESC',
      [visitId]
    ) as any[];

    return results.map(row => this.mapRowToMedication(row));
  }

  /**
   * 更新用药记录
   */
  static async update(id: string, data: Partial<Medication>): Promise<void> {
    const db = await getDatabase();
    const now = getCurrentTimestamp();

    const updates: string[] = [];
    const values: any[] = [];

    if (data.medicationTime !== undefined) {
      updates.push('medication_time = ?');
      values.push(data.medicationTime);
    }
    if (data.medicationName !== undefined) {
      updates.push('medication_name = ?');
      values.push(data.medicationName);
    }
    if (data.dosage !== undefined) {
      updates.push('dosage = ?');
      values.push(data.dosage);
    }
    if (data.frequency !== undefined) {
      updates.push('frequency = ?');
      values.push(data.frequency);
    }
    if (data.startDate !== undefined) {
      updates.push('start_date = ?');
      values.push(data.startDate);
    }
    if (data.endDate !== undefined) {
      updates.push('end_date = ?');
      values.push(data.endDate);
    }
    if (data.administrationMethod !== undefined) {
      updates.push('administration_method = ?');
      values.push(data.administrationMethod);
    }
    if (data.visitId !== undefined) {
      updates.push('visit_id = ?');
      values.push(data.visitId);
    }
    if (data.notes !== undefined) {
      updates.push('notes = ?');
      values.push(data.notes);
    }

    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);

    await db.runAsync(
      `UPDATE medications SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }

  /**
   * 删除用药记录
   */
  static async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM medications WHERE id = ?', [id]);
  }

  /**
   * 获取用药统计
   */
  static async getStats(babyId: string): Promise<{
    totalCount: number;
    activeCount: number;
  }> {
    const db = await getDatabase();
    
    const totalResult = await db.getFirstAsync(
      'SELECT COUNT(*) as count FROM medications WHERE baby_id = ?',
      [babyId]
    ) as any;

    const now = getCurrentTimestamp();
    const activeResult = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM medications 
       WHERE baby_id = ? AND (end_date IS NULL OR end_date > ?)`,
      [babyId, now]
    ) as any;

    return {
      totalCount: totalResult?.count || 0,
      activeCount: activeResult?.count || 0,
    };
  }

  /**
   * 获取今日用药记录
   */
  static async getTodayMedications(babyId: string): Promise<Medication[]> {
    const db = await getDatabase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();

    const results = await db.getAllAsync(
      `SELECT * FROM medications 
       WHERE baby_id = ? AND medication_time >= ? 
       ORDER BY medication_time DESC`,
      [babyId, todayStart]
    ) as any[];

    return results.map(row => this.mapRowToMedication(row));
  }

  /**
   * 映射数据库行到Medication对象
   */
  private static mapRowToMedication(row: any): Medication {
    return {
      id: row.id,
      babyId: row.baby_id,
      medicationTime: row.medication_time,
      medicationName: row.medication_name,
      dosage: row.dosage,
      frequency: row.frequency,
      startDate: row.start_date,
      endDate: row.end_date,
      administrationMethod: row.administration_method,
      visitId: row.visit_id,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      syncedAt: row.synced_at,
    };
  }

  /**
   * 获取常用药品列表
   */
  static getCommonMedications(): Array<{
    name: string;
    category: string;
    commonDosage: string;
  }> {
    return [
      // 退烧药
      { name: '布洛芬混悬液', category: '退烧药', commonDosage: '10mg/kg，每次' },
      { name: '对乙酰氨基酚滴剂', category: '退烧药', commonDosage: '10-15mg/kg，每次' },
      // 感冒药
      { name: '小儿氨酚黄那敏颗粒', category: '感冒药', commonDosage: '按说明书' },
      { name: '小儿感冒颗粒', category: '感冒药', commonDosage: '按说明书' },
      // 止咳药
      { name: '小儿止咳糖浆', category: '止咳药', commonDosage: '按说明书' },
      { name: '肺力咳合剂', category: '止咳药', commonDosage: '按说明书' },
      // 肠胃药
      { name: '妈咪爱', category: '肠胃药', commonDosage: '每次1袋' },
      { name: '蒙脱石散', category: '肠胃药', commonDosage: '按说明书' },
      { name: '益生菌', category: '肠胃药', commonDosage: '每次1袋' },
      // 外用药
      { name: '炉甘石洗剂', category: '外用药', commonDosage: '外用，适量' },
      { name: '红霉素眼膏', category: '外用药', commonDosage: '外用，适量' },
      // 维生素
      { name: '维生素D滴剂', category: '维生素', commonDosage: '每日400IU' },
      { name: '维生素AD滴剂', category: '维生素', commonDosage: '每日1粒' },
    ];
  }
}
