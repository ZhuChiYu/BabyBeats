import { getDatabase } from '../database';

/**
 * 数据管理服务 - 提供清空、备份等功能
 */

export interface ClearDataOptions {
  clearBabies?: boolean;      // 是否清空宝宝信息
  clearFeedings?: boolean;     // 是否清空喂养记录
  clearSleeps?: boolean;       // 是否清空睡眠记录
  clearDiapers?: boolean;      // 是否清空尿布记录
  clearPumpings?: boolean;     // 是否清空挤奶记录
  clearGrowth?: boolean;       // 是否清空成长记录
  clearMilestones?: boolean;   // 是否清空里程碑
  clearMedical?: boolean;      // 是否清空医疗记录
}

export const DataService = {
  /**
   * 清空所有记录数据（保留用户和宝宝信息）
   */
  clearAllRecords: async (babyId?: string): Promise<void> => {
    const db = await getDatabase();
    
    try {
      await db.runAsync('BEGIN TRANSACTION');
      
      if (babyId) {
        // 只清空指定宝宝的数据
        await db.runAsync('DELETE FROM feedings WHERE baby_id = ?', [babyId]);
        await db.runAsync('DELETE FROM sleeps WHERE baby_id = ?', [babyId]);
        await db.runAsync('DELETE FROM diapers WHERE baby_id = ?', [babyId]);
        await db.runAsync('DELETE FROM pumpings WHERE baby_id = ?', [babyId]);
        await db.runAsync('DELETE FROM growth_records WHERE baby_id = ?', [babyId]);
        await db.runAsync('DELETE FROM milestones WHERE baby_id = ?', [babyId]);
        await db.runAsync('DELETE FROM medical_visits WHERE baby_id = ?', [babyId]);
        await db.runAsync('DELETE FROM medications WHERE baby_id = ?', [babyId]);
        await db.runAsync('DELETE FROM vaccines WHERE baby_id = ?', [babyId]);
      } else {
        // 清空所有数据
        await db.runAsync('DELETE FROM feedings');
        await db.runAsync('DELETE FROM sleeps');
        await db.runAsync('DELETE FROM diapers');
        await db.runAsync('DELETE FROM pumpings');
        await db.runAsync('DELETE FROM growth_records');
        await db.runAsync('DELETE FROM milestones');
        await db.runAsync('DELETE FROM medical_visits');
        await db.runAsync('DELETE FROM medications');
        await db.runAsync('DELETE FROM vaccines');
      }
      
      await db.runAsync('COMMIT');
      console.log('All records cleared successfully');
    } catch (error) {
      await db.runAsync('ROLLBACK');
      console.error('Failed to clear records:', error);
      throw error;
    }
  },

  /**
   * 清空所有数据（包括用户和宝宝）
   */
  clearAllData: async (): Promise<void> => {
    const db = await getDatabase();
    
    try {
      await db.runAsync('BEGIN TRANSACTION');
      
      // 清空所有表
      await db.runAsync('DELETE FROM feedings');
      await db.runAsync('DELETE FROM sleeps');
      await db.runAsync('DELETE FROM diapers');
      await db.runAsync('DELETE FROM pumpings');
      await db.runAsync('DELETE FROM growth_records');
      await db.runAsync('DELETE FROM milestones');
      await db.runAsync('DELETE FROM medical_visits');
      await db.runAsync('DELETE FROM medications');
      await db.runAsync('DELETE FROM vaccines');
      await db.runAsync('DELETE FROM babies');
      await db.runAsync('DELETE FROM users WHERE id != ?', ['temp-user-id']); // 保留临时用户
      
      await db.runAsync('COMMIT');
      console.log('All data cleared successfully');
    } catch (error) {
      await db.runAsync('ROLLBACK');
      console.error('Failed to clear all data:', error);
      throw error;
    }
  },

  /**
   * 按选项清空数据
   */
  clearDataByOptions: async (options: ClearDataOptions, babyId?: string): Promise<void> => {
    const db = await getDatabase();
    
    try {
      await db.runAsync('BEGIN TRANSACTION');
      
      if (options.clearFeedings) {
        if (babyId) {
          await db.runAsync('DELETE FROM feedings WHERE baby_id = ?', [babyId]);
        } else {
          await db.runAsync('DELETE FROM feedings');
        }
      }
      
      if (options.clearSleeps) {
        if (babyId) {
          await db.runAsync('DELETE FROM sleeps WHERE baby_id = ?', [babyId]);
        } else {
          await db.runAsync('DELETE FROM sleeps');
        }
      }
      
      if (options.clearDiapers) {
        if (babyId) {
          await db.runAsync('DELETE FROM diapers WHERE baby_id = ?', [babyId]);
        } else {
          await db.runAsync('DELETE FROM diapers');
        }
      }
      
      if (options.clearPumpings) {
        if (babyId) {
          await db.runAsync('DELETE FROM pumpings WHERE baby_id = ?', [babyId]);
        } else {
          await db.runAsync('DELETE FROM pumpings');
        }
      }
      
      if (options.clearGrowth) {
        if (babyId) {
          await db.runAsync('DELETE FROM growth_records WHERE baby_id = ?', [babyId]);
        } else {
          await db.runAsync('DELETE FROM growth_records');
        }
      }
      
      if (options.clearMilestones) {
        if (babyId) {
          await db.runAsync('DELETE FROM milestones WHERE baby_id = ?', [babyId]);
        } else {
          await db.runAsync('DELETE FROM milestones');
        }
      }
      
      if (options.clearMedical) {
        if (babyId) {
          await db.runAsync('DELETE FROM medical_visits WHERE baby_id = ?', [babyId]);
          await db.runAsync('DELETE FROM medications WHERE baby_id = ?', [babyId]);
          await db.runAsync('DELETE FROM vaccines WHERE baby_id = ?', [babyId]);
        } else {
          await db.runAsync('DELETE FROM medical_visits');
          await db.runAsync('DELETE FROM medications');
          await db.runAsync('DELETE FROM vaccines');
        }
      }
      
      if (options.clearBabies) {
        if (babyId) {
          await db.runAsync('DELETE FROM babies WHERE id = ?', [babyId]);
        } else {
          await db.runAsync('DELETE FROM babies');
        }
      }
      
      await db.runAsync('COMMIT');
      console.log('Data cleared by options successfully');
    } catch (error) {
      await db.runAsync('ROLLBACK');
      console.error('Failed to clear data by options:', error);
      throw error;
    }
  },

  /**
   * 获取数据统计信息
   */
  getDataStats: async (babyId?: string): Promise<{
    feedingCount: number;
    sleepCount: number;
    diaperCount: number;
    pumpingCount: number;
    growthCount: number;
    milestoneCount: number;
    medicalCount: number;
  }> => {
    const db = await getDatabase();
    
    try {
      const whereClause = babyId ? 'WHERE baby_id = ?' : '';
      const params = babyId ? [babyId] : [];
      
      const [
        feedingResult,
        sleepResult,
        diaperResult,
        pumpingResult,
        growthResult,
        milestoneResult,
        medicalResult,
      ] = await Promise.all([
        db.getFirstAsync<{ count: number }>(`SELECT COUNT(*) as count FROM feedings ${whereClause}`, params),
        db.getFirstAsync<{ count: number }>(`SELECT COUNT(*) as count FROM sleeps ${whereClause}`, params),
        db.getFirstAsync<{ count: number }>(`SELECT COUNT(*) as count FROM diapers ${whereClause}`, params),
        db.getFirstAsync<{ count: number }>(`SELECT COUNT(*) as count FROM pumpings ${whereClause}`, params),
        db.getFirstAsync<{ count: number }>(`SELECT COUNT(*) as count FROM growth_records ${whereClause}`, params),
        db.getFirstAsync<{ count: number }>(`SELECT COUNT(*) as count FROM milestones ${whereClause}`, params),
        db.getFirstAsync<{ count: number }>(`SELECT COUNT(*) as count FROM medical_visits ${whereClause}`, params),
      ]);
      
      return {
        feedingCount: feedingResult?.count || 0,
        sleepCount: sleepResult?.count || 0,
        diaperCount: diaperResult?.count || 0,
        pumpingCount: pumpingResult?.count || 0,
        growthCount: growthResult?.count || 0,
        milestoneCount: milestoneResult?.count || 0,
        medicalCount: medicalResult?.count || 0,
      };
    } catch (error) {
      console.error('Failed to get data stats:', error);
      throw error;
    }
  },

  /**
   * 优化数据库（VACUUM）
   */
  optimizeDatabase: async (): Promise<void> => {
    const db = await getDatabase();
    
    try {
      await db.runAsync('VACUUM');
      console.log('Database optimized successfully');
    } catch (error) {
      console.error('Failed to optimize database:', error);
      throw error;
    }
  },
};

