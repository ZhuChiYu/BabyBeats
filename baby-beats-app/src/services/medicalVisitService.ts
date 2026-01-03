import { getDatabase, generateId, getCurrentTimestamp } from '../database';
import { MedicalVisit } from '../types';
import { validateAndFixBabyId } from '../utils/babyValidation';

export class MedicalVisitService {
  /**
   * 创建就诊记录
   */
  static async create(data: {
    babyId: string;
    visitTime: number;
    hospital?: string;
    department?: string;
    doctorName?: string;
    symptoms?: string;
    diagnosis?: string;
    doctorAdvice?: string;
    notes?: string;
  }): Promise<MedicalVisit> {
    const db = await getDatabase();
    const id = generateId();
    const now = getCurrentTimestamp();
    
    // 验证并修正 baby_id
    const validBabyId = await validateAndFixBabyId(data.babyId);

    await db.runAsync(
      `INSERT INTO medical_visits (
        id, baby_id, visit_time, hospital, department, doctor_name,
        symptoms, diagnosis, doctor_advice, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        validBabyId,
        data.visitTime,
        data.hospital || null,
        data.department || null,
        data.doctorName || null,
        data.symptoms || null,
        data.diagnosis || null,
        data.doctorAdvice || null,
        data.notes || null,
        now,
        now,
      ]
    );

    return {
      id,
      babyId: validBabyId,
      visitTime: data.visitTime,
      hospital: data.hospital,
      department: data.department,
      doctorName: data.doctorName,
      symptoms: data.symptoms,
      diagnosis: data.diagnosis,
      doctorAdvice: data.doctorAdvice,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * 获取宝宝的所有就诊记录
   */
  static async getByBabyId(babyId: string, limit?: number): Promise<MedicalVisit[]> {
    const db = await getDatabase();
    const sql = `
      SELECT * FROM medical_visits 
      WHERE baby_id = ? 
      ORDER BY visit_time DESC
      ${limit ? `LIMIT ${limit}` : ''}
    `;
    
    const results = await db.getAllAsync(sql, [babyId]) as any[];

    return results.map(row => this.mapRowToMedicalVisit(row));
  }

  /**
   * 获取单个就诊记录
   */
  static async getById(id: string): Promise<MedicalVisit | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync(
      'SELECT * FROM medical_visits WHERE id = ?',
      [id]
    ) as any;

    if (!result) return null;
    return this.mapRowToMedicalVisit(result);
  }

  /**
   * 更新就诊记录
   */
  static async update(id: string, data: Partial<MedicalVisit>): Promise<void> {
    const db = await getDatabase();
    const now = getCurrentTimestamp();

    const updates: string[] = [];
    const values: any[] = [];

    if (data.visitTime !== undefined) {
      updates.push('visit_time = ?');
      values.push(data.visitTime);
    }
    if (data.hospital !== undefined) {
      updates.push('hospital = ?');
      values.push(data.hospital);
    }
    if (data.department !== undefined) {
      updates.push('department = ?');
      values.push(data.department);
    }
    if (data.doctorName !== undefined) {
      updates.push('doctor_name = ?');
      values.push(data.doctorName);
    }
    if (data.symptoms !== undefined) {
      updates.push('symptoms = ?');
      values.push(data.symptoms);
    }
    if (data.diagnosis !== undefined) {
      updates.push('diagnosis = ?');
      values.push(data.diagnosis);
    }
    if (data.doctorAdvice !== undefined) {
      updates.push('doctor_advice = ?');
      values.push(data.doctorAdvice);
    }
    if (data.notes !== undefined) {
      updates.push('notes = ?');
      values.push(data.notes);
    }

    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);

    await db.runAsync(
      `UPDATE medical_visits SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }

  /**
   * 删除就诊记录
   */
  static async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM medical_visits WHERE id = ?', [id]);
  }

  /**
   * 获取就诊统计
   */
  static async getStats(babyId: string): Promise<{
    totalCount: number;
    recentCount: number;
  }> {
    const db = await getDatabase();
    
    const totalResult = await db.getFirstAsync(
      'SELECT COUNT(*) as count FROM medical_visits WHERE baby_id = ?',
      [babyId]
    ) as any;

    // 最近30天的就诊次数
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentResult = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM medical_visits 
       WHERE baby_id = ? AND visit_time > ?`,
      [babyId, thirtyDaysAgo]
    ) as any;

    return {
      totalCount: totalResult?.count || 0,
      recentCount: recentResult?.count || 0,
    };
  }

  /**
   * 按医院统计就诊次数
   */
  static async getStatsByHospital(babyId: string): Promise<Array<{
    hospital: string;
    count: number;
  }>> {
    const db = await getDatabase();
    const results = await db.getAllAsync(
      `SELECT hospital, COUNT(*) as count 
       FROM medical_visits 
       WHERE baby_id = ? AND hospital IS NOT NULL 
       GROUP BY hospital 
       ORDER BY count DESC`,
      [babyId]
    ) as any[];

    return results.map(row => ({
      hospital: row.hospital,
      count: row.count,
    }));
  }

  /**
   * 按科室统计就诊次数
   */
  static async getStatsByDepartment(babyId: string): Promise<Array<{
    department: string;
    count: number;
  }>> {
    const db = await getDatabase();
    const results = await db.getAllAsync(
      `SELECT department, COUNT(*) as count 
       FROM medical_visits 
       WHERE baby_id = ? AND department IS NOT NULL 
       GROUP BY department 
       ORDER BY count DESC`,
      [babyId]
    ) as any[];

    return results.map(row => ({
      department: row.department,
      count: row.count,
    }));
  }

  /**
   * 搜索就诊记录
   */
  static async search(babyId: string, keyword: string): Promise<MedicalVisit[]> {
    const db = await getDatabase();
    const searchTerm = `%${keyword}%`;
    
    const results = await db.getAllAsync(
      `SELECT * FROM medical_visits 
       WHERE baby_id = ? AND (
         hospital LIKE ? OR 
         department LIKE ? OR 
         doctor_name LIKE ? OR 
         symptoms LIKE ? OR 
         diagnosis LIKE ?
       )
       ORDER BY visit_time DESC`,
      [babyId, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]
    ) as any[];

    return results.map(row => this.mapRowToMedicalVisit(row));
  }

  /**
   * 映射数据库行到MedicalVisit对象
   */
  private static mapRowToMedicalVisit(row: any): MedicalVisit {
    return {
      id: row.id,
      babyId: row.baby_id,
      visitTime: row.visit_time,
      hospital: row.hospital,
      department: row.department,
      doctorName: row.doctor_name,
      symptoms: row.symptoms,
      diagnosis: row.diagnosis,
      doctorAdvice: row.doctor_advice,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      syncedAt: row.synced_at,
    };
  }

  /**
   * 获取常见科室列表
   */
  static getCommonDepartments(): string[] {
    return [
      '儿科',
      '儿科门诊',
      '儿科急诊',
      '新生儿科',
      '儿童保健科',
      '小儿呼吸科',
      '小儿消化科',
      '小儿神经科',
      '小儿心脏科',
      '小儿皮肤科',
      '小儿耳鼻喉科',
      '小儿眼科',
      '小儿骨科',
      '小儿外科',
      '预防接种门诊',
    ];
  }

  /**
   * 获取常见症状列表
   */
  static getCommonSymptoms(): string[] {
    return [
      '发烧',
      '咳嗽',
      '流鼻涕',
      '鼻塞',
      '打喷嚏',
      '腹泻',
      '呕吐',
      '便秘',
      '食欲不振',
      '皮疹',
      '湿疹',
      '红屁股',
      '哭闹不止',
      '睡眠不好',
      '精神不振',
      '腹痛',
      '耳朵痛',
      '喉咙痛',
    ];
  }
}
