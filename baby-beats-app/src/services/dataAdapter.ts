// 数据同步适配器 - 统一管理本地数据库和云端API
import { Baby, Feeding, Sleep, Diaper, GrowthRecord } from '../types';
import { BabyService } from './babyService';
import { FeedingService } from './feedingService';
import { SleepService } from './sleepService';
import { DiaperService } from './diaperService';
import { GrowthService } from './growthService';
import { BabyApiService } from './api/babyApiService';
import { FeedingApiService } from './api/feedingApiService';
import { SleepApiService } from './api/sleepApiService';
import { DiaperApiService } from './api/diaperApiService';
import { GrowthApiService } from './api/growthApiService';
import { useAuthStore } from '../store/authStore';

// 检查是否已登录
const isLoggedIn = () => {
  return useAuthStore.getState().isAuthenticated;
};

/**
 * 数据同步适配器 - 优先使用云端API，失败时降级到本地数据库
 * 
 * 工作原理:
 * 1. 如果用户已登录，优先调用云端API
 * 2. 同时写入本地数据库作为缓存
 * 3. 如果云端API失败，使用本地数据库
 */

// ============== Baby 宝宝数据 ==============
export const BabyDataAdapter = {
  async getAll(userId: string): Promise<Baby[]> {
    if (isLoggedIn()) {
      try {
        const babies = await BabyApiService.getAll();
        // 同步到本地数据库作为缓存
        return babies;
      } catch (error) {
        console.warn('云端API失败，使用本地数据:', error);
        return BabyService.getAll(userId);
      }
    } else {
      return BabyService.getAll(userId);
    }
  },

  async getById(id: string): Promise<Baby | null> {
    if (isLoggedIn()) {
      try {
        return await BabyApiService.getById(id);
      } catch (error) {
        console.warn('云端API失败，使用本地数据:', error);
        return BabyService.getById(id);
      }
    } else {
      return BabyService.getById(id);
    }
  },

  async create(baby: Omit<Baby, 'id' | 'createdAt' | 'updatedAt'>): Promise<Baby> {
    // 先在本地创建（生成ID和时间戳）
    const localBaby = await BabyService.create(baby);
    
    // 如果已登录，同步到云端
    if (isLoggedIn()) {
      try {
        await BabyApiService.create(localBaby);
      } catch (error) {
        console.warn('云端同步失败，数据已保存到本地:', error);
      }
    }
    
    return localBaby;
  },

  async update(id: string, baby: Partial<Baby>): Promise<Baby> {
    // 先更新本地
    const localBaby = await BabyService.update(id, baby);
    
    // 如果已登录，同步到云端
    if (isLoggedIn()) {
      try {
        await BabyApiService.update(id, baby);
      } catch (error) {
        console.warn('云端同步失败，数据已保存到本地:', error);
      }
    }
    
    return localBaby;
  },

  async delete(id: string): Promise<void> {
    // 先删除本地
    await BabyService.delete(id);
    
    // 如果已登录，同步到云端
    if (isLoggedIn()) {
      try {
        await BabyApiService.delete(id);
      } catch (error) {
        console.warn('云端同步失败，数据已从本地删除:', error);
      }
    }
  },
};

// ============== Feeding 喂养记录 ==============
export const FeedingDataAdapter = {
  async getAll(babyId: string, startDate?: Date, endDate?: Date): Promise<Feeding[]> {
    if (isLoggedIn()) {
      try {
        return await FeedingApiService.getAll(babyId, startDate, endDate);
      } catch (error) {
        console.warn('云端API失败，使用本地数据:', error);
        return FeedingService.getByBabyId(babyId);
      }
    } else {
      return FeedingService.getByBabyId(babyId);
    }
  },

  async create(feeding: Omit<Feeding, 'id' | 'createdAt' | 'updatedAt'>): Promise<Feeding> {
    const localFeeding = await FeedingService.create(feeding);
    
    if (isLoggedIn()) {
      try {
        await FeedingApiService.create(localFeeding);
      } catch (error) {
        console.warn('云端同步失败，数据已保存到本地:', error);
      }
    }
    
    return localFeeding;
  },

  async update(id: string, feeding: Partial<Feeding>): Promise<Feeding> {
    const localFeeding = await FeedingService.update(id, feeding);
    
    if (isLoggedIn()) {
      try {
        await FeedingApiService.update(id, feeding);
      } catch (error) {
        console.warn('云端同步失败，数据已保存到本地:', error);
      }
    }
    
    return localFeeding;
  },

  async delete(id: string): Promise<void> {
    await FeedingService.delete(id);
    
    if (isLoggedIn()) {
      try {
        await FeedingApiService.delete(id);
      } catch (error) {
        console.warn('云端同步失败，数据已从本地删除:', error);
      }
    }
  },
};

// ============== Sleep 睡眠记录 ==============
export const SleepDataAdapter = {
  async getAll(babyId: string, startDate?: Date, endDate?: Date): Promise<Sleep[]> {
    if (isLoggedIn()) {
      try {
        return await SleepApiService.getAll(babyId, startDate, endDate);
      } catch (error) {
        console.warn('云端API失败，使用本地数据:', error);
        return SleepService.getByBabyId(babyId);
      }
    } else {
      return SleepService.getByBabyId(babyId);
    }
  },

  async create(sleep: Omit<Sleep, 'id' | 'createdAt' | 'updatedAt'>): Promise<Sleep> {
    const localSleep = await SleepService.create(sleep);
    
    if (isLoggedIn()) {
      try {
        await SleepApiService.create(localSleep);
      } catch (error) {
        console.warn('云端同步失败，数据已保存到本地:', error);
      }
    }
    
    return localSleep;
  },

  async update(id: string, sleep: Partial<Sleep>): Promise<Sleep> {
    const localSleep = await SleepService.update(id, sleep);
    
    if (isLoggedIn()) {
      try {
        await SleepApiService.update(id, sleep);
      } catch (error) {
        console.warn('云端同步失败，数据已保存到本地:', error);
      }
    }
    
    return localSleep;
  },

  async delete(id: string): Promise<void> {
    await SleepService.delete(id);
    
    if (isLoggedIn()) {
      try {
        await SleepApiService.delete(id);
      } catch (error) {
        console.warn('云端同步失败，数据已从本地删除:', error);
      }
    }
  },
};

// ============== Diaper 尿布记录 ==============
export const DiaperDataAdapter = {
  async getAll(babyId: string, startDate?: Date, endDate?: Date): Promise<Diaper[]> {
    if (isLoggedIn()) {
      try {
        return await DiaperApiService.getAll(babyId, startDate, endDate);
      } catch (error) {
        console.warn('云端API失败，使用本地数据:', error);
        return DiaperService.getByBabyId(babyId);
      }
    } else {
      return DiaperService.getByBabyId(babyId);
    }
  },

  async create(diaper: Omit<Diaper, 'id' | 'createdAt' | 'updatedAt'>): Promise<Diaper> {
    const localDiaper = await DiaperService.create(diaper);
    
    if (isLoggedIn()) {
      try {
        await DiaperApiService.create(localDiaper);
      } catch (error) {
        console.warn('云端同步失败，数据已保存到本地:', error);
      }
    }
    
    return localDiaper;
  },

  async update(id: string, diaper: Partial<Diaper>): Promise<Diaper> {
    const localDiaper = await DiaperService.update(id, diaper);
    
    if (isLoggedIn()) {
      try {
        await DiaperApiService.update(id, diaper);
      } catch (error) {
        console.warn('云端同步失败，数据已保存到本地:', error);
      }
    }
    
    return localDiaper;
  },

  async delete(id: string): Promise<void> {
    await DiaperService.delete(id);
    
    if (isLoggedIn()) {
      try {
        await DiaperApiService.delete(id);
      } catch (error) {
        console.warn('云端同步失败，数据已从本地删除:', error);
      }
    }
  },
};

// ============== Growth 成长记录 ==============
export const GrowthDataAdapter = {
  async getAll(babyId: string): Promise<GrowthRecord[]> {
    if (isLoggedIn()) {
      try {
        return await GrowthApiService.getAll(babyId);
      } catch (error) {
        console.warn('云端API失败，使用本地数据:', error);
        return GrowthService.getByBabyId(babyId);
      }
    } else {
      return GrowthService.getByBabyId(babyId);
    }
  },

  async create(growth: Omit<GrowthRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<GrowthRecord> {
    const localGrowth = await GrowthService.create(growth);
    
    if (isLoggedIn()) {
      try {
        await GrowthApiService.create(localGrowth);
      } catch (error) {
        console.warn('云端同步失败，数据已保存到本地:', error);
      }
    }
    
    return localGrowth;
  },

  async update(id: string, growth: Partial<GrowthRecord>): Promise<GrowthRecord> {
    const localGrowth = await GrowthService.update(id, growth);
    
    if (isLoggedIn()) {
      try {
        await GrowthApiService.update(id, growth);
      } catch (error) {
        console.warn('云端同步失败，数据已保存到本地:', error);
      }
    }
    
    return localGrowth;
  },

  async delete(id: string): Promise<void> {
    await GrowthService.delete(id);
    
    if (isLoggedIn()) {
      try {
        await GrowthApiService.delete(id);
      } catch (error) {
        console.warn('云端同步失败，数据已从本地删除:', error);
      }
    }
  },
};

