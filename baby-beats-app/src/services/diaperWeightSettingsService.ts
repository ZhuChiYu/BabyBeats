import AsyncStorage from '@react-native-async-storage/async-storage';

const DIAPER_WEIGHT_KEY = '@diaper_dry_weight';

export interface DiaperWeightSettings {
  dryWeight: number; // 干尿布重量（克）
  lastUpdated: number; // 最后更新时间
}

export class DiaperWeightSettingsService {
  /**
   * 获取干尿布重量设置
   */
  static async getDryWeight(): Promise<number> {
    try {
      const data = await AsyncStorage.getItem(DIAPER_WEIGHT_KEY);
      if (data) {
        const settings: DiaperWeightSettings = JSON.parse(data);
        return settings.dryWeight;
      }
      // 默认值：30克（常见尿不湿干重）
      return 30;
    } catch (error) {
      console.error('Failed to get dry diaper weight:', error);
      return 30;
    }
  }

  /**
   * 设置干尿布重量
   */
  static async setDryWeight(weight: number): Promise<void> {
    try {
      const settings: DiaperWeightSettings = {
        dryWeight: weight,
        lastUpdated: Date.now(),
      };
      await AsyncStorage.setItem(DIAPER_WEIGHT_KEY, JSON.stringify(settings));
      console.log('✅ 干尿布重量已保存:', weight, 'g');
    } catch (error) {
      console.error('Failed to save dry diaper weight:', error);
      throw error;
    }
  }

  /**
   * 获取完整设置
   */
  static async getSettings(): Promise<DiaperWeightSettings> {
    try {
      const data = await AsyncStorage.getItem(DIAPER_WEIGHT_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return {
        dryWeight: 30,
        lastUpdated: Date.now(),
      };
    } catch (error) {
      console.error('Failed to get diaper weight settings:', error);
      return {
        dryWeight: 30,
        lastUpdated: Date.now(),
      };
    }
  }

  /**
   * 计算尿量（湿重 - 干重）
   */
  static calculateUrineAmount(wetWeight: number, dryWeight: number): number {
    return Math.max(0, wetWeight - dryWeight);
  }
}

