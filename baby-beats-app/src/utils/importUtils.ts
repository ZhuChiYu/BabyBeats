import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert } from 'react-native';
import { Feeding, Sleep, Diaper, Pumping, GrowthRecord, Vaccine, Milestone, Medication, MedicalVisit } from '../types';
import { FeedingService } from '../services/feedingService';
import { SleepService } from '../services/sleepService';
import { DiaperService } from '../services/diaperService';
import { PumpingService } from '../services/pumpingService';
import { GrowthService } from '../services/growthService';

/**
 * 导入数据的返回类型
 */
export interface ImportResult {
  success: boolean;
  message: string;
  stats?: {
    feedingCount: number;
    sleepCount: number;
    diaperCount: number;
    pumpingCount: number;
    growthCount: number;
    temperatureCount: number;
    vaccineCount: number;
    milestoneCount: number;
    medicationCount: number;
    medicalVisitCount: number;
  };
}

/**
 * 验证导入的数据格式
 */
const validateImportData = (data: any): boolean => {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  // 检查是否有baby信息
  if (!data.baby || !data.baby.id) {
    return false;
  }
  
  return true;
};

/**
 * 导入JSON格式的数据
 */
export const importFromJSON = async (currentBabyId: string): Promise<ImportResult> => {
  try {
    // 选择文件
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });
    
    if (result.canceled) {
      return {
        success: false,
        message: '取消导入',
      };
    }

    const fileUri = result.assets[0].uri;
    
    // 读取文件内容
    const content = await FileSystem.readAsStringAsync(fileUri);
    const data = JSON.parse(content);
    
    // 验证数据格式
    if (!validateImportData(data)) {
      return {
        success: false,
        message: '文件格式错误，请选择正确的导出文件',
      };
    }
    
    // 动态导入服务
    const { TemperatureService } = await import('../services/temperatureService');
    const { VaccineService } = await import('../services/vaccineService');
    const { MilestoneService } = await import('../services/milestoneService');
    const { MedicationService } = await import('../services/medicationService');
    const { MedicalVisitService } = await import('../services/medicalVisitService');
    
    // 导入各类数据（覆盖baby_id为当前宝宝ID）
    let stats = {
      feedingCount: 0,
      sleepCount: 0,
      diaperCount: 0,
      pumpingCount: 0,
      growthCount: 0,
      temperatureCount: 0,
      vaccineCount: 0,
      milestoneCount: 0,
      medicationCount: 0,
      medicalVisitCount: 0,
    };
    
    // 导入喂养记录
    if (data.feedings && Array.isArray(data.feedings)) {
      for (const feeding of data.feedings) {
        await FeedingService.create({
          ...feeding,
          baby_id: currentBabyId,
          id: undefined, // 让数据库生成新的ID
        });
        stats.feedingCount++;
      }
    }
    
    // 导入睡眠记录
    if (data.sleeps && Array.isArray(data.sleeps)) {
      for (const sleep of data.sleeps) {
        await SleepService.create({
          ...sleep,
          baby_id: currentBabyId,
          id: undefined,
        });
        stats.sleepCount++;
      }
    }
    
    // 导入尿布记录
    if (data.diapers && Array.isArray(data.diapers)) {
      for (const diaper of data.diapers) {
        await DiaperService.create({
          ...diaper,
          baby_id: currentBabyId,
          id: undefined,
        });
        stats.diaperCount++;
      }
    }
    
    // 导入挤奶记录
    if (data.pumpings && Array.isArray(data.pumpings)) {
      for (const pumping of data.pumpings) {
        await PumpingService.create({
          ...pumping,
          baby_id: currentBabyId,
          id: undefined,
        });
        stats.pumpingCount++;
      }
    }
    
    // 导入成长记录
    if (data.growthRecords && Array.isArray(data.growthRecords)) {
      for (const growth of data.growthRecords) {
        await GrowthService.create({
          ...growth,
          baby_id: currentBabyId,
          id: undefined,
        });
        stats.growthCount++;
      }
    }
    
    // 导入体温记录
    if (data.temperatures && Array.isArray(data.temperatures)) {
      for (const temp of data.temperatures) {
        await TemperatureService.create({
          ...temp,
          baby_id: currentBabyId,
          id: undefined,
        });
        stats.temperatureCount++;
      }
    }
    
    // 导入疫苗记录
    if (data.vaccines && Array.isArray(data.vaccines)) {
      for (const vaccine of data.vaccines) {
        await VaccineService.create({
          ...vaccine,
          baby_id: currentBabyId,
          id: undefined,
        });
        stats.vaccineCount++;
      }
    }
    
    // 导入里程碑记录
    if (data.milestones && Array.isArray(data.milestones)) {
      for (const milestone of data.milestones) {
        await MilestoneService.create({
          ...milestone,
          baby_id: currentBabyId,
          id: undefined,
        });
        stats.milestoneCount++;
      }
    }
    
    // 导入用药记录
    if (data.medications && Array.isArray(data.medications)) {
      for (const medication of data.medications) {
        await MedicationService.create({
          ...medication,
          baby_id: currentBabyId,
          id: undefined,
        });
        stats.medicationCount++;
      }
    }
    
    // 导入就医记录
    if (data.medicalVisits && Array.isArray(data.medicalVisits)) {
      for (const visit of data.medicalVisits) {
        await MedicalVisitService.create({
          ...visit,
          baby_id: currentBabyId,
          id: undefined,
        });
        stats.medicalVisitCount++;
      }
    }
    
    const totalCount = Object.values(stats).reduce((sum, count) => sum + count, 0);
    
    return {
      success: true,
      message: `成功导入 ${totalCount} 条记录`,
      stats,
    };
  } catch (error) {
    console.error('Import error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '导入失败，请检查文件格式',
    };
  }
};

/**
 * 显示导入统计信息
 */
export const showImportStats = (stats: ImportResult['stats']) => {
  if (!stats) return '';
  
  const items: string[] = [];
  
  if (stats.feedingCount > 0) items.push(`喂养: ${stats.feedingCount}条`);
  if (stats.sleepCount > 0) items.push(`睡眠: ${stats.sleepCount}条`);
  if (stats.diaperCount > 0) items.push(`尿布: ${stats.diaperCount}条`);
  if (stats.pumpingCount > 0) items.push(`挤奶: ${stats.pumpingCount}条`);
  if (stats.growthCount > 0) items.push(`成长: ${stats.growthCount}条`);
  if (stats.temperatureCount > 0) items.push(`体温: ${stats.temperatureCount}条`);
  if (stats.vaccineCount > 0) items.push(`疫苗: ${stats.vaccineCount}条`);
  if (stats.milestoneCount > 0) items.push(`里程碑: ${stats.milestoneCount}条`);
  if (stats.medicationCount > 0) items.push(`用药: ${stats.medicationCount}条`);
  if (stats.medicalVisitCount > 0) items.push(`就医: ${stats.medicalVisitCount}条`);
  
  return items.join('\n');
};

