/**
 * 生长评估服务
 * 提供生长数据的百分位评估功能
 */

import { GrowthRecord, Baby } from '../types';
import {
  GrowthMetric,
  Sex,
  GrowthAssessment,
  PercentileResult,
  getStandardDataset,
} from '../constants/growthStandards';
import { calculatePercentile, generateSuggestions } from '../utils/percentileCalculator';

/**
 * 计算月龄（从出生日期到测量日期）
 */
export function calculateAgeInMonths(birthDate: number, measurementDate: number): number {
  const diffMs = measurementDate - birthDate;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const ageMonths = diffDays / 30.44; // 平均每月 30.44 天
  return Math.max(0, ageMonths);
}

/**
 * 评估体重
 */
export function assessWeight(
  baby: Baby,
  record: GrowthRecord,
  previousRecords?: GrowthRecord[]
): GrowthAssessment | null {
  if (!record.weight) return null;

  const sex: Sex = baby.gender === 'male' ? 'male' : baby.gender === 'female' ? 'female' : 'male';
  const ageMonths = calculateAgeInMonths(baby.birthday, record.date);
  const dataset = getStandardDataset('weight_for_age', sex);

  if (!dataset) return null;

  const result = calculatePercentile(dataset.sdPoints, ageMonths, record.weight);

  // 获取历史百分位结果
  const previousResults: PercentileResult[] = [];
  if (previousRecords) {
    previousRecords.forEach(prevRecord => {
      if (prevRecord.weight) {
        const prevAgeMonths = calculateAgeInMonths(baby.birthday, prevRecord.date);
        const prevResult = calculatePercentile(dataset.sdPoints, prevAgeMonths, prevRecord.weight);
        previousResults.push(prevResult);
      }
    });
  }

  const suggestions = generateSuggestions('weight_for_age', result, previousResults);

  return {
    metric: 'weight_for_age',
    result,
    suggestions,
  };
}

/**
 * 评估身高/身长
 */
export function assessHeight(
  baby: Baby,
  record: GrowthRecord,
  previousRecords?: GrowthRecord[]
): GrowthAssessment | null {
  if (!record.height) return null;

  const sex: Sex = baby.gender === 'male' ? 'male' : baby.gender === 'female' ? 'female' : 'male';
  const ageMonths = calculateAgeInMonths(baby.birthday, record.date);
  const dataset = getStandardDataset('height_for_age', sex);

  if (!dataset) return null;

  const result = calculatePercentile(dataset.sdPoints, ageMonths, record.height);

  // 获取历史百分位结果
  const previousResults: PercentileResult[] = [];
  if (previousRecords) {
    previousRecords.forEach(prevRecord => {
      if (prevRecord.height) {
        const prevAgeMonths = calculateAgeInMonths(baby.birthday, prevRecord.date);
        const prevResult = calculatePercentile(dataset.sdPoints, prevAgeMonths, prevRecord.height);
        previousResults.push(prevResult);
      }
    });
  }

  const suggestions = generateSuggestions('height_for_age', result, previousResults);

  return {
    metric: 'height_for_age',
    result,
    suggestions,
  };
}

/**
 * 评估头围
 */
export function assessHeadCircumference(
  baby: Baby,
  record: GrowthRecord,
  previousRecords?: GrowthRecord[]
): GrowthAssessment | null {
  if (!record.headCirc) return null;

  const sex: Sex = baby.gender === 'male' ? 'male' : baby.gender === 'female' ? 'female' : 'male';
  const ageMonths = calculateAgeInMonths(baby.birthday, record.date);
  const dataset = getStandardDataset('head_for_age', sex);

  if (!dataset) return null;

  const result = calculatePercentile(dataset.sdPoints, ageMonths, record.headCirc);

  // 获取历史百分位结果
  const previousResults: PercentileResult[] = [];
  if (previousRecords) {
    previousRecords.forEach(prevRecord => {
      if (prevRecord.headCirc) {
        const prevAgeMonths = calculateAgeInMonths(baby.birthday, prevRecord.date);
        const prevResult = calculatePercentile(dataset.sdPoints, prevAgeMonths, prevRecord.headCirc);
        previousResults.push(prevResult);
      }
    });
  }

  const suggestions = generateSuggestions('head_for_age', result, previousResults);

  return {
    metric: 'head_for_age',
    result,
    suggestions,
  };
}

/**
 * 完整评估一条成长记录
 */
export function assessGrowthRecord(
  baby: Baby,
  record: GrowthRecord,
  previousRecords?: GrowthRecord[]
): {
  weight?: GrowthAssessment;
  height?: GrowthAssessment;
  head?: GrowthAssessment;
} {
  return {
    weight: assessWeight(baby, record, previousRecords) || undefined,
    height: assessHeight(baby, record, previousRecords) || undefined,
    head: assessHeadCircumference(baby, record, previousRecords) || undefined,
  };
}



