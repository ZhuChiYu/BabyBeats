import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setAuthToken } from './api/apiClient';
import { BabyService } from './babyService';
import { FeedingService } from './feedingService';
import { SleepService } from './sleepService';
import { DiaperService } from './diaperService';
import { PumpingService } from './pumpingService';
import { GrowthService } from './growthService';
import { Alert } from 'react-native';

/**
 * 数据同步管理器 - 处理本地和服务器之间的数据同步
 */

interface SyncConfig {
  isLoggedIn: boolean;
  autoSync: boolean;
  lastSyncTime: number | null;
  email: string;
  deviceId: string;
}

class SyncManager {
  private syncConfig: SyncConfig = {
    isLoggedIn: false,
    autoSync: false,
    lastSyncTime: null,
    email: '',
    deviceId: '',
  };

  private isInitialized = false;

  /**
   * 初始化同步管理器
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // 加载同步配置
      const configStr = await AsyncStorage.getItem('syncConfig');
      if (configStr) {
        this.syncConfig = JSON.parse(configStr);
      }

      // 加载并设置认证token
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        setAuthToken(token);
      }

      this.isInitialized = true;
      console.log('SyncManager initialized:', this.syncConfig);
    } catch (error) {
      console.error('Failed to initialize SyncManager:', error);
    }
  }

  /**
   * 检查是否已登录
   */
  isLoggedIn(): boolean {
    return this.syncConfig.isLoggedIn;
  }

  /**
   * 检查是否启用自动同步
   */
  isAutoSyncEnabled(): boolean {
    return this.syncConfig.isLoggedIn && this.syncConfig.autoSync;
  }

  /**
   * 从服务器拉取所有数据并更新本地
   */
  async pullFromServer(babyId?: string): Promise<void> {
    if (!this.isLoggedIn()) {
      console.log('Not logged in, skipping pull');
      return;
    }

    try {
      console.log('============ 开始从服务器拉取数据 ============');
      console.log('Pull 参数 - babyId:', babyId);

      // 使用统一的同步 API
      // 注意：为了确保数据完整性，暂时不使用增量同步，每次都拉取所有数据
      // 后续可以优化为增量同步
      const lastSyncTimeStr = undefined; // 暂时禁用增量同步，总是获取全部数据
      
      console.log('同步模式:', lastSyncTimeStr ? '增量同步' : '全量同步');
      console.log('Last sync time:', lastSyncTimeStr || '获取全部数据');

      const response = await api.get<any>(`/sync/pull${lastSyncTimeStr ? `?lastSyncTime=${lastSyncTimeStr}` : ''}`);
      
      console.log('服务器原始返回:', JSON.stringify(response, null, 2));

      // API 客户端可能已经解包了外层的 { status, data }
      // 服务器返回: { status: 'success', data: { syncTime, data: { babies, feedings, ... } } }
      // api.get 返回: { syncTime, data: { babies, feedings, ... } }
      let syncData;
      
      if (response.data && response.data.data) {
        // 格式1: response = { status, data: { syncTime, data: {...} } }
        syncData = response.data.data;
        console.log('使用格式1解析数据');
      } else if (response.data && typeof response.data === 'object' && 'babies' in response.data) {
        // 格式2: response = { syncTime, data: { babies, ... } } 或 response = { data: { babies, ... } }
        syncData = response.data;
        console.log('使用格式2解析数据');
      } else if (response.babies !== undefined) {
        // 格式3: response = { babies, feedings, ... }
        syncData = response;
        console.log('使用格式3解析数据');
      } else {
        console.warn('服务器返回的数据格式无法识别:', response);
        console.warn('response.data:', response.data);
        return;
      }

      const { babies, feedings, diapers, sleeps, pumpings, growth_records } = syncData;

      console.log('准备写入本地数据库:');
      console.log('- Babies:', babies?.length || 0);
      console.log('- Feedings:', feedings?.length || 0);
      console.log('- Diapers:', diapers?.length || 0);
      console.log('- Sleeps:', sleeps?.length || 0);
      console.log('- Pumpings:', pumpings?.length || 0);
      console.log('- Growth records:', growth_records?.length || 0);

      // 获取数据库
      const db = await require('../database').getDatabase();

      // 更新本地数据库 - 使用 REPLACE 策略
      if (babies && babies.length > 0) {
        console.log('开始同步宝宝数据...');
        for (const baby of babies) {
          try {
            console.log('同步宝宝:', baby.id, baby.name);
            await db.runAsync(
              `INSERT OR REPLACE INTO babies (
                id, user_id, name, gender, birthday, due_date, 
                blood_type, birth_height, birth_weight, birth_head_circ,
                avatar, is_archived, created_at, updated_at, synced_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                baby.id,
                baby.user_id,
                baby.name,
                baby.gender,
                baby.birthday,
                baby.due_date || null,
                baby.blood_type || null,
                baby.birth_height || null,
                baby.birth_weight || null,
                baby.birth_head_circ || null,
                baby.avatar || null,
                baby.is_archived ? 1 : 0,
                baby.created_at,
                baby.updated_at,
                new Date().toISOString(),
              ]
            );
            console.log('✓ 宝宝数据已同步:', baby.name);
          } catch (error) {
            console.error('同步宝宝失败:', baby.id, error);
          }
        }
      }

      // 同步喂养记录
      if (feedings && feedings.length > 0) {
        console.log('开始同步喂养记录...');
        for (const feeding of feedings) {
          try {
            await db.runAsync(
              `INSERT OR REPLACE INTO feedings (
                id, baby_id, type, amount, unit, duration_left, duration_right, 
                duration_total, start_time, end_time, notes, created_at, updated_at, synced_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                feeding.id,
                feeding.baby_id,
                feeding.type,
                feeding.amount || null,
                feeding.unit || null,
                feeding.duration_left || null,
                feeding.duration_right || null,
                feeding.duration_total || null,
                feeding.start_time,
                feeding.end_time || null,
                feeding.notes || null,
                feeding.created_at,
                feeding.updated_at,
                new Date().toISOString(),
              ]
            );
          } catch (error) {
            console.error('同步喂养记录失败:', feeding.id, error);
          }
        }
        console.log('✓ 喂养记录已同步:', feedings.length, '条');
      }

      // 同步睡眠记录
      if (sleeps && sleeps.length > 0) {
        console.log('开始同步睡眠记录...');
        for (const sleep of sleeps) {
          try {
            await db.runAsync(
              `INSERT OR REPLACE INTO sleeps (
                id, baby_id, start_time, end_time, duration, quality, 
                notes, created_at, updated_at, synced_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                sleep.id,
                sleep.baby_id,
                sleep.start_time,
                sleep.end_time || null,
                sleep.duration || null,
                sleep.quality || null,
                sleep.notes || null,
                sleep.created_at,
                sleep.updated_at,
                new Date().toISOString(),
              ]
            );
          } catch (error) {
            console.error('同步睡眠记录失败:', sleep.id, error);
          }
        }
        console.log('✓ 睡眠记录已同步:', sleeps.length, '条');
      }

      // 同步尿布记录
      if (diapers && diapers.length > 0) {
        console.log('开始同步尿布记录...');
        for (const diaper of diapers) {
          try {
            await db.runAsync(
              `INSERT OR REPLACE INTO diapers (
                id, baby_id, type, time, notes, created_at, updated_at, synced_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                diaper.id,
                diaper.baby_id,
                diaper.type,
                diaper.time,
                diaper.notes || null,
                diaper.created_at,
                diaper.updated_at,
                new Date().toISOString(),
              ]
            );
          } catch (error) {
            console.error('同步尿布记录失败:', diaper.id, error);
          }
        }
        console.log('✓ 尿布记录已同步:', diapers.length, '条');
      }

      // 同步挤奶记录
      if (pumpings && pumpings.length > 0) {
        console.log('开始同步挤奶记录...');
        for (const pumping of pumpings) {
          try {
            await db.runAsync(
              `INSERT OR REPLACE INTO pumpings (
                id, baby_id, amount, unit, duration, start_time, 
                notes, created_at, updated_at, synced_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                pumping.id,
                pumping.baby_id,
                pumping.amount,
                pumping.unit || 'ml',
                pumping.duration || null,
                pumping.start_time,
                pumping.notes || null,
                pumping.created_at,
                pumping.updated_at,
                new Date().toISOString(),
              ]
            );
          } catch (error) {
            console.error('同步挤奶记录失败:', pumping.id, error);
          }
        }
        console.log('✓ 挤奶记录已同步:', pumpings.length, '条');
      }

      // 同步成长记录
      if (growth_records && growth_records.length > 0) {
        console.log('开始同步成长记录...');
        for (const growth of growth_records) {
          try {
            await db.runAsync(
              `INSERT OR REPLACE INTO growth_records (
                id, baby_id, date, height, weight, head_circ, notes, 
                created_at, updated_at, synced_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                growth.id,
                growth.baby_id,
                growth.date,
                growth.height || null,
                growth.weight || null,
                growth.head_circ || null,
                growth.notes || null,
                growth.created_at,
                growth.updated_at,
                new Date().toISOString(),
              ]
            );
          } catch (error) {
            console.error('同步成长记录失败:', growth.id, error);
          }
        }
        console.log('✓ 成长记录已同步:', growth_records.length, '条');
      }

      console.log('============ 数据拉取完成 ============');
      
      // 更新同步时间
      await this.updateSyncTime();
    } catch (error) {
      console.error('❌ 从服务器拉取数据失败:', error);
      if (error instanceof Error) {
        console.error('错误详情:', error.message);
        console.error('错误堆栈:', error.stack);
      }
      throw error;
    }
  }

  /**
   * 推送本地数据到服务器
   */
  async pushToServer(babyId?: string): Promise<void> {
    if (!this.isLoggedIn()) {
      console.log('Not logged in, skipping push');
      return;
    }

    try {
      console.log('============ 开始推送数据到服务器 ============');
      console.log('Push 参数 - babyId:', babyId);

      // 获取本地数据
      const babies = babyId ? [await BabyService.getById(babyId)].filter(Boolean) : await BabyService.getAll('temp-user-id');

      console.log('准备推送的宝宝数量:', babies.length);

      // 准备要同步的数据
      const syncData: any[] = [];

      for (const baby of babies) {
        if (!baby) continue;

        console.log('正在处理宝宝:', baby.name, baby.id);

        const [feedings, sleeps, diapers, pumpings, growthRecords] = await Promise.all([
          FeedingService.getByBabyId(baby.id),
          SleepService.getByBabyId(baby.id),
          DiaperService.getByBabyId(baby.id),
          PumpingService.getByBabyId(baby.id),
          GrowthService.getByBabyId(baby.id),
        ]);

        console.log('宝宝数据统计:');
        console.log('- Feedings:', feedings.length);
        console.log('- Sleeps:', sleeps.length);
        console.log('- Diapers:', diapers.length);
        console.log('- Pumpings:', pumpings.length);
        console.log('- Growth records:', growthRecords.length);

        // 转换字段名（从 camelCase 到 snake_case）
        const convertBabyToServerFormat = (baby: any) => ({
          id: baby.id,
          user_id: baby.userId,
          name: baby.name,
          gender: baby.gender,
          birthday: baby.birthday,
          due_date: baby.dueDate || null,
          blood_type: baby.bloodType || null,
          birth_height: baby.birthHeight || null,
          birth_weight: baby.birthWeight || null,
          birth_head_circ: baby.birthHeadCirc || null,
          avatar: baby.avatar || null,
          is_archived: baby.isArchived ? true : false,
          created_at: baby.createdAt,
          updated_at: baby.updatedAt,
        });

        const convertFeedingToServerFormat = (feeding: any) => ({
          id: feeding.id,
          baby_id: feeding.babyId,
          type: feeding.type,
          amount: feeding.amount || null,
          unit: feeding.unit || null,
          duration_left: feeding.durationLeft || null,
          duration_right: feeding.durationRight || null,
          duration_total: feeding.durationTotal || null,
          start_time: feeding.startTime,
          end_time: feeding.endTime || null,
          notes: feeding.notes || null,
          created_at: feeding.createdAt,
          updated_at: feeding.updatedAt,
        });

        const convertSleepToServerFormat = (sleep: any) => ({
          id: sleep.id,
          baby_id: sleep.babyId,
          start_time: sleep.startTime,
          end_time: sleep.endTime || null,
          duration: sleep.duration || null,
          sleep_type: sleep.sleepType || 'nap',
          fall_asleep_method: sleep.fallAsleepMethod || null,
          notes: sleep.notes || null,
          created_at: sleep.createdAt,
          updated_at: sleep.updatedAt,
        });

        const convertDiaperToServerFormat = (diaper: any) => ({
          id: diaper.id,
          baby_id: diaper.babyId,
          type: diaper.type,
          time: diaper.time,
          notes: diaper.notes || null,
          created_at: diaper.createdAt,
          updated_at: diaper.updatedAt,
        });

        const convertPumpingToServerFormat = (pumping: any) => ({
          id: pumping.id,
          baby_id: pumping.babyId,
          amount: pumping.amount,
          unit: pumping.unit || 'ml',
          duration: pumping.duration || null,
          start_time: pumping.startTime,
          notes: pumping.notes || null,
          created_at: pumping.createdAt,
          updated_at: pumping.updatedAt,
        });

        const convertGrowthToServerFormat = (growth: any) => ({
          id: growth.id,
          baby_id: growth.babyId,
          date: growth.date,
          height: growth.height || null,
          weight: growth.weight || null,
          head_circ: growth.headCirc || null,
          notes: growth.notes || null,
          created_at: growth.createdAt,
          updated_at: growth.updatedAt,
        });

        // 添加数据到同步列表
        syncData.push({
          tableName: 'babies',
          records: [convertBabyToServerFormat(baby)],
        });

        if (feedings.length > 0) {
          syncData.push({
            tableName: 'feedings',
            records: feedings.map(convertFeedingToServerFormat),
          });
        }

        if (sleeps.length > 0) {
          syncData.push({
            tableName: 'sleeps',
            records: sleeps.map(convertSleepToServerFormat),
          });
        }

        if (diapers.length > 0) {
          syncData.push({
            tableName: 'diapers',
            records: diapers.map(convertDiaperToServerFormat),
          });
        }

        if (pumpings.length > 0) {
          syncData.push({
            tableName: 'pumpings',
            records: pumpings.map(convertPumpingToServerFormat),
          });
        }

        if (growthRecords.length > 0) {
          syncData.push({
            tableName: 'growth_records',
            records: growthRecords.map(convertGrowthToServerFormat),
          });
        }
      }

      console.log('准备推送的数据表数量:', syncData.length);
      console.log('推送数据概览:', syncData.map(d => `${d.tableName}: ${d.records.length}条`).join(', '));

      // 使用统一的同步 API 推送数据
      if (syncData.length > 0) {
        const response = await api.post<any>('/sync/push', { data: syncData });
        console.log('服务器响应:', JSON.stringify(response, null, 2));

        if (response.data?.errors && response.data.errors.length > 0) {
          console.warn('推送时遇到错误:', response.data.errors);
        }

        if (response.data?.conflicts && response.data.conflicts.length > 0) {
          console.warn('推送时遇到冲突:', response.data.conflicts);
        }

        console.log('✓ 推送成功的记录数:', response.data?.success?.length || 0);
      } else {
        console.log('没有数据需要推送');
      }

      console.log('============ 数据推送完成 ============');
      
      // 更新同步时间
      await this.updateSyncTime();
    } catch (error) {
      console.error('❌ 推送数据到服务器失败:', error);
      if (error instanceof Error) {
        console.error('错误详情:', error.message);
        console.error('错误堆栈:', error.stack);
      }
      throw error;
    }
  }

  /**
   * 同步单个喂养记录到服务器
   * 使用批量同步API来同步单个记录
   */
  async syncFeedingToServer(feeding: any): Promise<void> {
    if (!this.isAutoSyncEnabled()) return;

    try {
      // 转换为服务器格式
      const serverFeeding = {
        id: feeding.id,
        baby_id: feeding.babyId,
        type: feeding.type,
        amount: feeding.milkAmount || null,
        unit: 'ml',
        duration_left: feeding.leftDuration || null,
        duration_right: feeding.rightDuration || null,
        duration_total: (feeding.leftDuration || 0) + (feeding.rightDuration || 0) || null,
        start_time: feeding.time,
        end_time: null,
        notes: feeding.notes || null,
        created_at: feeding.createdAt,
        updated_at: feeding.updatedAt,
      };

      // 使用批量同步API
      await api.post('/sync/push', { 
        data: [{
          tableName: 'feedings',
          records: [serverFeeding]
        }]
      });
      console.log('✓ Feeding synced to server:', feeding.id);
    } catch (error) {
      console.warn('Failed to sync feeding to server:', error);
      throw error; // 重新抛出错误以便调用者知道同步失败
    }
  }

  /**
   * 同步单个睡眠记录到服务器
   * 使用批量同步API来同步单个记录
   */
  async syncSleepToServer(sleep: any): Promise<void> {
    if (!this.isAutoSyncEnabled()) return;

    try {
      // 转换为服务器格式
      // 注意：数据库中没有 quality 字段，只有 sleep_type 和 fall_asleep_method
      const serverSleep = {
        id: sleep.id,
        baby_id: sleep.babyId,
        start_time: sleep.startTime,
        end_time: sleep.endTime || null,
        duration: sleep.duration || null,
        sleep_type: sleep.sleepType || 'nap',
        fall_asleep_method: sleep.fallAsleepMethod || null,
        notes: sleep.notes || null,
        created_at: sleep.createdAt,
        updated_at: sleep.updatedAt,
      };

      // 使用批量同步API
      await api.post('/sync/push', { 
        data: [{
          tableName: 'sleeps',
          records: [serverSleep]
        }]
      });
      console.log('✓ Sleep synced to server:', sleep.id);
    } catch (error) {
      console.warn('Failed to sync sleep to server:', error);
      throw error;
    }
  }

  /**
   * 同步单个尿布记录到服务器
   * 使用批量同步API来同步单个记录
   */
  async syncDiaperToServer(diaper: any): Promise<void> {
    if (!this.isAutoSyncEnabled()) return;

    try {
      // 转换为服务器格式
      const serverDiaper = {
        id: diaper.id,
        baby_id: diaper.babyId,
        type: diaper.type,
        time: diaper.time,
        notes: diaper.notes || null,
        created_at: diaper.createdAt,
        updated_at: diaper.updatedAt,
      };

      // 使用批量同步API
      await api.post('/sync/push', { 
        data: [{
          tableName: 'diapers',
          records: [serverDiaper]
        }]
      });
      console.log('✓ Diaper synced to server:', diaper.id);
    } catch (error) {
      console.warn('Failed to sync diaper to server:', error);
      throw error;
    }
  }

  /**
   * 同步单个挤奶记录到服务器
   * 使用批量同步API来同步单个记录
   */
  async syncPumpingToServer(pumping: any): Promise<void> {
    if (!this.isAutoSyncEnabled()) return;

    try {
      // 转换为服务器格式
      const serverPumping = {
        id: pumping.id,
        baby_id: pumping.babyId,
        amount: pumping.amount,
        unit: pumping.unit || 'ml',
        duration: pumping.duration || null,
        start_time: pumping.startTime || pumping.time,
        notes: pumping.notes || null,
        created_at: pumping.createdAt,
        updated_at: pumping.updatedAt,
      };

      // 使用批量同步API
      await api.post('/sync/push', { 
        data: [{
          tableName: 'pumpings',
          records: [serverPumping]
        }]
      });
      console.log('✓ Pumping synced to server:', pumping.id);
    } catch (error) {
      console.warn('Failed to sync pumping to server:', error);
      throw error;
    }
  }

  /**
   * 同步单个成长记录到服务器
   * 使用批量同步API来同步单个记录
   */
  async syncGrowthToServer(growth: any): Promise<void> {
    if (!this.isAutoSyncEnabled()) return;

    try {
      // 转换为服务器格式
      const serverGrowth = {
        id: growth.id,
        baby_id: growth.babyId,
        date: growth.date,
        height: growth.height || null,
        weight: growth.weight || null,
        head_circ: growth.headCirc || null,
        notes: growth.notes || null,
        created_at: growth.createdAt,
        updated_at: growth.updatedAt,
      };

      // 使用批量同步API
      await api.post('/sync/push', { 
        data: [{
          tableName: 'growth_records',
          records: [serverGrowth]
        }]
      });
      console.log('✓ Growth synced to server:', growth.id);
    } catch (error) {
      console.warn('Failed to sync growth to server:', error);
      throw error;
    }
  }

  // 私有方法：批量同步（已废弃，使用统一的 push API）
  private async syncBabyToServer(baby: any): Promise<void> {
    console.log('syncBabyToServer 已废弃，请使用 pushToServer');
  }

  private async syncFeedingsToServer(feedings: any[]): Promise<void> {
    for (const feeding of feedings) {
      await this.syncFeedingToServer(feeding);
    }
  }

  private async syncSleepsToServer(sleeps: any[]): Promise<void> {
    for (const sleep of sleeps) {
      await this.syncSleepToServer(sleep);
    }
  }

  private async syncDiapersToServer(diapers: any[]): Promise<void> {
    for (const diaper of diapers) {
      await this.syncDiaperToServer(diaper);
    }
  }

  private async syncPumpingsToServer(pumpings: any[]): Promise<void> {
    for (const pumping of pumpings) {
      await this.syncPumpingToServer(pumping);
    }
  }

  private async syncGrowthToServer(growthRecords: any[]): Promise<void> {
    for (const growth of growthRecords) {
      await this.syncGrowthToServer(growth);
    }
  }

  /**
   * 更新同步时间
   */
  private async updateSyncTime(): Promise<void> {
    try {
      this.syncConfig.lastSyncTime = Date.now();
      await AsyncStorage.setItem('syncConfig', JSON.stringify(this.syncConfig));
    } catch (error) {
      console.error('Failed to update sync time:', error);
    }
  }

  /**
   * 重新加载配置
   */
  async reloadConfig(): Promise<void> {
    this.isInitialized = false;
    await this.initialize();
  }
}

// 导出单例
export const syncManager = new SyncManager();

// 自动初始化
syncManager.initialize();

