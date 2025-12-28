import { getDatabase, generateId, getCurrentTimestamp } from '../database';
import { Vaccine } from '../types';
import { NotificationService } from './notificationService';

export class VaccineService {
  /**
   * 创建疫苗记录
   */
  static async create(data: {
    babyId: string;
    vaccineName: string;
    vaccinationDate: number;
    doseNumber?: number;
    location?: string;
    batchNumber?: string;
    nextDate?: number;
    reminderEnabled?: boolean;
    notes?: string;
  }): Promise<Vaccine> {
    const db = await getDatabase();
    const id = generateId();
    const now = getCurrentTimestamp();
    
    await db.runAsync(
      `INSERT INTO vaccines (
        id, baby_id, vaccine_name, vaccination_date, dose_number,
        location, batch_number, next_date, reminder_enabled, notes,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.babyId,
        data.vaccineName,
        data.vaccinationDate,
        data.doseNumber || null,
        data.location || null,
        data.batchNumber || null,
        data.nextDate || null,
        data.reminderEnabled ? 1 : 0,
        data.notes || null,
        now,
        now,
      ]
    );
    
    const vaccine: Vaccine = {
      id,
      babyId: data.babyId,
      vaccineName: data.vaccineName,
      vaccinationDate: data.vaccinationDate,
      doseNumber: data.doseNumber,
      location: data.location,
      batchNumber: data.batchNumber,
      nextDate: data.nextDate,
      reminderEnabled: data.reminderEnabled || false,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    };

    // 如果启用了提醒，设置通知
    if (vaccine.reminderEnabled && vaccine.nextDate) {
      try {
        // 获取宝宝名称用于通知
        const babyResult = await db.getFirstAsync(
          'SELECT name FROM babies WHERE id = ?',
          [data.babyId]
        ) as any;
        
        if (babyResult) {
          await NotificationService.scheduleVaccineReminder(vaccine, babyResult.name);
        }
      } catch (error) {
        console.error('设置疫苗提醒失败:', error);
      }
    }

    return vaccine;
  }
  
  /**
   * 获取宝宝的所有疫苗记录
   */
  static async getByBabyId(babyId: string): Promise<Vaccine[]> {
    const db = await getDatabase();
    const results = await db.getAllAsync(
      'SELECT * FROM vaccines WHERE baby_id = ? ORDER BY vaccination_date DESC',
      [babyId]
    ) as any[];
    
    return results.map(row => ({
      id: row.id,
      babyId: row.baby_id,
      vaccineName: row.vaccine_name,
      vaccinationDate: row.vaccination_date,
      doseNumber: row.dose_number,
      location: row.location,
      batchNumber: row.batch_number,
      nextDate: row.next_date,
      reminderEnabled: row.reminder_enabled === 1,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      syncedAt: row.synced_at,
    }));
  }
  
  /**
   * 获取单个疫苗记录
   */
  static async getById(id: string): Promise<Vaccine | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync(
      'SELECT * FROM vaccines WHERE id = ?',
      [id]
    ) as any;
    
    if (!result) return null;
    
    return {
      id: result.id,
      babyId: result.baby_id,
      vaccineName: result.vaccine_name,
      vaccinationDate: result.vaccination_date,
      doseNumber: result.dose_number,
      location: result.location,
      batchNumber: result.batch_number,
      nextDate: result.next_date,
      reminderEnabled: result.reminder_enabled === 1,
      notes: result.notes,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
      syncedAt: result.synced_at,
    };
  }
  
  /**
   * 更新疫苗记录
   */
  static async update(id: string, data: Partial<Vaccine>): Promise<void> {
    const db = await getDatabase();
    const now = getCurrentTimestamp();
    
    const updates: string[] = [];
    const values: any[] = [];
    
    if (data.vaccineName !== undefined) {
      updates.push('vaccine_name = ?');
      values.push(data.vaccineName);
    }
    if (data.vaccinationDate !== undefined) {
      updates.push('vaccination_date = ?');
      values.push(data.vaccinationDate);
    }
    if (data.doseNumber !== undefined) {
      updates.push('dose_number = ?');
      values.push(data.doseNumber);
    }
    if (data.location !== undefined) {
      updates.push('location = ?');
      values.push(data.location);
    }
    if (data.batchNumber !== undefined) {
      updates.push('batch_number = ?');
      values.push(data.batchNumber);
    }
    if (data.nextDate !== undefined) {
      updates.push('next_date = ?');
      values.push(data.nextDate);
    }
    if (data.reminderEnabled !== undefined) {
      updates.push('reminder_enabled = ?');
      values.push(data.reminderEnabled ? 1 : 0);
    }
    if (data.notes !== undefined) {
      updates.push('notes = ?');
      values.push(data.notes);
    }
    
    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);
    
    await db.runAsync(
      `UPDATE vaccines SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }
  
  /**
   * 删除疫苗记录
   */
  static async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM vaccines WHERE id = ?', [id]);
  }
  
  /**
   * 获取即将到期的疫苗（7天内）
   */
  static async getUpcoming(babyId: string, days: number = 7): Promise<Vaccine[]> {
    const db = await getDatabase();
    const now = getCurrentTimestamp();
    const future = now + days * 24 * 60 * 60 * 1000;
    
    const results = await db.getAllAsync(
      `SELECT * FROM vaccines 
       WHERE baby_id = ? AND next_date IS NOT NULL 
       AND next_date > ? AND next_date <= ? 
       ORDER BY next_date ASC`,
      [babyId, now, future]
    ) as any[];
    
    return results.map(row => ({
      id: row.id,
      babyId: row.baby_id,
      vaccineName: row.vaccine_name,
      vaccinationDate: row.vaccination_date,
      doseNumber: row.dose_number,
      location: row.location,
      batchNumber: row.batch_number,
      nextDate: row.next_date,
      reminderEnabled: row.reminder_enabled === 1,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      syncedAt: row.synced_at,
    }));
  }
  
  /**
   * 获取疫苗统计
   */
  static async getStats(babyId: string): Promise<{
    totalCount: number;
    upcomingCount: number;
  }> {
    const db = await getDatabase();
    
    const totalResult = await db.getFirstAsync(
      'SELECT COUNT(*) as count FROM vaccines WHERE baby_id = ?',
      [babyId]
    ) as any;

    const now = getCurrentTimestamp();
    const upcomingResult = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM vaccines 
       WHERE baby_id = ? AND next_date IS NOT NULL AND next_date > ?`,
      [babyId, now]
    ) as any;
    
    return {
      totalCount: totalResult?.count || 0,
      upcomingCount: upcomingResult?.count || 0,
    };
  }
  
  /**
   * 获取常见疫苗列表（中国疫苗接种计划）
   */
  static getCommonVaccines(): Array<{
    name: string;
    ageMonths: number[];
    description: string;
  }> {
    return [
      { name: '卡介苗', ageMonths: [0], description: '预防结核病' },
      { name: '乙肝疫苗', ageMonths: [0, 1, 6], description: '预防乙型肝炎' },
      { name: '脊灰疫苗', ageMonths: [2, 3, 4, 18], description: '预防脊髓灰质炎' },
      { name: '百白破疫苗', ageMonths: [3, 4, 5, 18], description: '预防百日咳、白喉、破伤风' },
      { name: 'A群流脑疫苗', ageMonths: [6, 9], description: '预防流行性脑脊髓膜炎' },
      { name: '麻腮风疫苗', ageMonths: [8, 18], description: '预防麻疹、腮腺炎、风疹' },
      { name: '乙脑疫苗', ageMonths: [8, 24], description: '预防流行性乙型脑炎' },
      { name: 'A+C群流脑疫苗', ageMonths: [24, 36], description: '预防流行性脑脊髓膜炎' },
      { name: '甲肝疫苗', ageMonths: [18, 24], description: '预防甲型肝炎' },
      { name: '水痘疫苗', ageMonths: [12, 48], description: '预防水痘（自费）' },
      { name: '手足口疫苗', ageMonths: [6, 12], description: '预防手足口病（自费）' },
      { name: '流感疫苗', ageMonths: [6], description: '预防流感（自费，每年接种）' },
      { name: 'HIB疫苗', ageMonths: [2, 4, 6, 12], description: '预防B型流感嗜血杆菌（自费）' },
      { name: '肺炎疫苗', ageMonths: [2, 4, 6, 12], description: '预防肺炎（自费）' },
      { name: '轮状病毒疫苗', ageMonths: [2, 4, 6], description: '预防轮状病毒（自费）' },
    ];
  }
}
