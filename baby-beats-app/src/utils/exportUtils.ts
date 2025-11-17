import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Feeding, Sleep, Diaper, Pumping, GrowthRecord, Vaccine, Milestone, Medication, MedicalVisit } from '../types';
import { format } from 'date-fns';

/**
 * 导出为CSV格式
 */
export const exportToCSV = async (data: any[], filename: string): Promise<void> => {
  if (data.length === 0) {
    throw new Error('没有可导出的数据');
  }
  
  // 获取所有键作为表头
  const headers = Object.keys(data[0]);
  const csvHeader = headers.join(',');
  
  // 转换数据行
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // 处理包含逗号的值
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value ?? '';
    }).join(',');
  });
  
  const csvContent = [csvHeader, ...csvRows].join('\n');
  
  // 保存文件
  const fileUri = `${FileSystem.documentDirectory}${filename}.csv`;
  await FileSystem.writeAsStringAsync(fileUri, csvContent);
  
  // 分享文件
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri);
  } else {
    throw new Error('分享功能不可用');
  }
};

/**
 * 导出为JSON格式
 */
export const exportToJSON = async (data: any, filename: string): Promise<void> => {
  const jsonContent = JSON.stringify(data, null, 2);
  
  const fileUri = `${FileSystem.documentDirectory}${filename}.json`;
  await FileSystem.writeAsStringAsync(fileUri, jsonContent);
  
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri);
  } else {
    throw new Error('分享功能不可用');
  }
};

/**
 * 格式化喂养记录为CSV数据
 */
export const formatFeedingsForCSV = (feedings: Feeding[]) => {
  return feedings.map(f => ({
    时间: format(new Date(f.time), 'yyyy-MM-dd HH:mm'),
    类型: f.type === 'breast' ? '亲喂母乳' : f.type === 'bottled_breast_milk' ? '瓶喂母乳' : '配方奶',
    左侧时长分钟: f.leftDuration || 0,
    右侧时长分钟: f.rightDuration || 0,
    奶量ml: f.milkAmount || 0,
    品牌: f.milkBrand || '',
    备注: f.notes || '',
  }));
};

/**
 * 格式化睡眠记录为CSV数据
 */
export const formatSleepsForCSV = (sleeps: Sleep[]) => {
  return sleeps.map(s => ({
    开始时间: format(new Date(s.startTime), 'yyyy-MM-dd HH:mm'),
    结束时间: format(new Date(s.endTime), 'yyyy-MM-dd HH:mm'),
    时长分钟: s.duration,
    类型: s.sleepType === 'nap' ? '白天小睡' : '夜间睡眠',
    入睡方式: s.fallAsleepMethod || '',
    备注: s.notes || '',
  }));
};

/**
 * 格式化尿布记录为CSV数据
 */
export const formatDiapersForCSV = (diapers: Diaper[]) => {
  return diapers.map(d => ({
    时间: format(new Date(d.time), 'yyyy-MM-dd HH:mm'),
    类型: d.type === 'poop' ? '大便' : d.type === 'pee' ? '小便' : '都有',
    大便性质: d.poopConsistency || '',
    大便颜色: d.poopColor || '',
    大便量: d.poopAmount || '',
    小便量: d.peeAmount || '',
    是否异常: d.isAbnormal ? '是' : '否',
    备注: d.notes || '',
  }));
};

/**
 * 格式化挤奶记录为CSV数据
 */
export const formatPumpingsForCSV = (pumpings: Pumping[]) => {
  return pumpings.map(p => ({
    时间: format(new Date(p.time), 'yyyy-MM-dd HH:mm'),
    方式: p.method,
    左侧奶量ml: p.leftAmount,
    右侧奶量ml: p.rightAmount,
    总量ml: p.totalAmount,
    存放方式: p.storageMethod || '',
    备注: p.notes || '',
  }));
};

/**
 * 格式化成长记录为CSV数据
 */
export const formatGrowthForCSV = (records: GrowthRecord[]) => {
  return records.map(r => ({
    测量日期: format(new Date(r.date || r.measurementDate), 'yyyy-MM-dd'),
    体重kg: r.weight || '',
    身高cm: r.height || '',
    头围cm: r.headCirc || r.headCircumference || '',
    '体温(C)': r.temperature || '',
    BMI: r.bmi || '',
    备注: r.notes || '',
  }));
};

/**
 * 格式化体温记录为CSV数据
 */
export const formatTemperaturesForCSV = (temperatures: any[]) => {
  return temperatures.map(t => ({
    测量时间: format(new Date(t.date), 'yyyy-MM-dd HH:mm'),
    '体温(C)': t.temperature,
    测量方式: t.measurementMethod || '',
    状态: t.temperature >= 38 ? '发烧' : t.temperature >= 37.3 ? '低烧' : '正常',
    备注: t.notes || '',
  }));
};

/**
 * 格式化疫苗记录为CSV数据
 */
export const formatVaccinesForCSV = (vaccines: Vaccine[]) => {
  return vaccines.map(v => ({
    疫苗名称: v.vaccineName,
    接种日期: format(new Date(v.vaccinationDate), 'yyyy-MM-dd'),
    剂次: v.doseNumber || '',
    接种地点: v.location || '',
    批次号: v.batchNumber || '',
    下次接种: v.nextDate ? format(new Date(v.nextDate), 'yyyy-MM-dd') : '',
    提醒开关: v.reminderEnabled ? '开启' : '关闭',
    备注: v.notes || '',
  }));
};

/**
 * 格式化里程碑记录为CSV数据
 */
export const formatMilestonesForCSV = (milestones: Milestone[]) => {
  return milestones.map(m => ({
    时间: format(new Date(m.time), 'yyyy-MM-dd'),
    类别: m.milestoneType,
    标题: m.title,
    描述: m.description || '',
    有照片: m.photoUrl ? '是' : '否',
  }));
};

/**
 * 格式化用药记录为CSV数据
 */
export const formatMedicationsForCSV = (medications: Medication[]) => {
  return medications.map(m => ({
    用药时间: format(new Date(m.medicationTime), 'yyyy-MM-dd HH:mm'),
    药品名称: m.medicationName,
    剂量: m.dosage,
    频次: m.frequency || '',
    给药方式: m.administrationMethod || '',
    开始日期: m.startDate ? format(new Date(m.startDate), 'yyyy-MM-dd') : '',
    结束日期: m.endDate ? format(new Date(m.endDate), 'yyyy-MM-dd') : '',
    备注: m.notes || '',
  }));
};

/**
 * 格式化就医记录为CSV数据
 */
export const formatMedicalVisitsForCSV = (visits: MedicalVisit[]) => {
  return visits.map(v => ({
    就诊时间: format(new Date(v.visitTime), 'yyyy-MM-dd HH:mm'),
    医院: v.hospital || '',
    科室: v.department || '',
    医生: v.doctorName || '',
    症状: v.symptoms || '',
    诊断: v.diagnosis || '',
    医嘱: v.doctorAdvice || '',
    备注: v.notes || '',
  }));
};

/**
 * 导出所有数据
 */
export const exportAllData = async (data: {
  baby: any;
  feedings: Feeding[];
  sleeps: Sleep[];
  diapers: Diaper[];
  pumpings: Pumping[];
  growthRecords: GrowthRecord[];
  temperatures?: any[];
  vaccines?: Vaccine[];
  milestones?: Milestone[];
  medications?: Medication[];
  medicalVisits?: MedicalVisit[];
}, format: 'csv' | 'json' = 'json'): Promise<void> => {
  const timestamp = new Date().getTime();
  const filename = `BabyBeats_${data.baby.name}_${timestamp}`;
  
  if (format === 'json') {
    await exportToJSON(data, filename);
  } else {
    // CSV格式导出多个文件
    if (data.feedings.length > 0) {
      await exportToCSV(formatFeedingsForCSV(data.feedings), `${filename}_喂养`);
    }
    if (data.sleeps.length > 0) {
      await exportToCSV(formatSleepsForCSV(data.sleeps), `${filename}_睡眠`);
    }
    if (data.diapers.length > 0) {
      await exportToCSV(formatDiapersForCSV(data.diapers), `${filename}_尿布`);
    }
    if (data.pumpings.length > 0) {
      await exportToCSV(formatPumpingsForCSV(data.pumpings), `${filename}_挤奶`);
    }
    if (data.growthRecords.length > 0) {
      await exportToCSV(formatGrowthForCSV(data.growthRecords), `${filename}_成长`);
    }
    if (data.temperatures && data.temperatures.length > 0) {
      await exportToCSV(formatTemperaturesForCSV(data.temperatures), `${filename}_体温`);
    }
    if (data.vaccines && data.vaccines.length > 0) {
      await exportToCSV(formatVaccinesForCSV(data.vaccines), `${filename}_疫苗`);
    }
    if (data.milestones && data.milestones.length > 0) {
      await exportToCSV(formatMilestonesForCSV(data.milestones), `${filename}_里程碑`);
    }
    if (data.medications && data.medications.length > 0) {
      await exportToCSV(formatMedicationsForCSV(data.medications), `${filename}_用药`);
    }
    if (data.medicalVisits && data.medicalVisits.length > 0) {
      await exportToCSV(formatMedicalVisitsForCSV(data.medicalVisits), `${filename}_就医`);
    }
  }
};

