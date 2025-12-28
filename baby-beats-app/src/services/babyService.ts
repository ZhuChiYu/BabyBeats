import { Baby } from '../types';
import { getDatabase, generateId, getCurrentTimestamp } from '../database';

export class BabyService {
  // 创建宝宝
  static async create(data: Omit<Baby, 'id' | 'createdAt' | 'updatedAt'>): Promise<Baby> {
    const db = await getDatabase();
    const now = getCurrentTimestamp();
    const baby: Baby = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    
    await db.runAsync(
      `INSERT INTO babies (
        id, user_id, name, gender, birthday, due_date, 
        blood_type, birth_height, birth_weight, birth_head_circ,
        avatar, is_archived, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        baby.id,
        baby.userId,
        baby.name,
        baby.gender,
        baby.birthday,
        baby.dueDate || null,
        baby.bloodType || null,
        baby.birthHeight || null,
        baby.birthWeight || null,
        baby.birthHeadCirc || null,
        baby.avatar || null,
        baby.isArchived ? 1 : 0,
        baby.createdAt,
        baby.updatedAt,
      ]
    );
    
    return baby;
  }
  
  // 获取所有宝宝
  static async getAll(userId: string): Promise<Baby[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM babies WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    return rows.map(row => this.mapRowToBaby(row));
  }
  
  // 根据ID获取宝宝
  static async getById(id: string): Promise<Baby | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM babies WHERE id = ?',
      [id]
    );
    
    return row ? this.mapRowToBaby(row) : null;
  }
  
  // 更新宝宝
  static async update(id: string, updates: Partial<Baby>): Promise<void> {
    const db = await getDatabase();
    const now = getCurrentTimestamp();
    
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.gender !== undefined) {
      fields.push('gender = ?');
      values.push(updates.gender);
    }
    if (updates.birthday !== undefined) {
      fields.push('birthday = ?');
      values.push(updates.birthday);
    }
    if (updates.dueDate !== undefined) {
      fields.push('due_date = ?');
      values.push(updates.dueDate);
    }
    if (updates.bloodType !== undefined) {
      fields.push('blood_type = ?');
      values.push(updates.bloodType);
    }
    if (updates.birthHeight !== undefined) {
      fields.push('birth_height = ?');
      values.push(updates.birthHeight);
    }
    if (updates.birthWeight !== undefined) {
      fields.push('birth_weight = ?');
      values.push(updates.birthWeight);
    }
    if (updates.birthHeadCirc !== undefined) {
      fields.push('birth_head_circ = ?');
      values.push(updates.birthHeadCirc);
    }
    if (updates.avatar !== undefined) {
      fields.push('avatar = ?');
      values.push(updates.avatar);
    }
    if (updates.isArchived !== undefined) {
      fields.push('is_archived = ?');
      values.push(updates.isArchived ? 1 : 0);
    }
    
    fields.push('updated_at = ?');
    values.push(now);
    
    values.push(id);
    
    await db.runAsync(
      `UPDATE babies SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }
  
  // 删除宝宝
  static async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM babies WHERE id = ?', [id]);
  }
  
  // 归档宝宝
  static async archive(id: string): Promise<void> {
    await this.update(id, { isArchived: true });
  }
  
  // 取消归档
  static async unarchive(id: string): Promise<void> {
    await this.update(id, { isArchived: false });
  }
  
  // 辅助函数：将数据库行映射到Baby对象
  private static mapRowToBaby(row: any): Baby {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      gender: row.gender,
      birthday: row.birthday,
      dueDate: row.due_date,
      bloodType: row.blood_type,
      birthHeight: row.birth_height,
      birthWeight: row.birth_weight,
      birthHeadCirc: row.birth_head_circ,
      avatar: row.avatar,
      isArchived: row.is_archived === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      syncedAt: row.synced_at,
    };
  }
}

