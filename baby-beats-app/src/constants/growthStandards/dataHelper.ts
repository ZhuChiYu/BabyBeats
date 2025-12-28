/**
 * 生长标准数据获取工具
 * 用于根据指标和性别获取对应的标准数据集
 */

import {
  WST423_2022_MALE_WEIGHT_FOR_AGE,
  WST423_2022_FEMALE_WEIGHT_FOR_AGE,
  WST423_2022_MALE_HEIGHT_FOR_AGE,
  WST423_2022_FEMALE_HEIGHT_FOR_AGE,
  WST423_2022_MALE_HEAD_FOR_AGE,
  WST423_2022_FEMALE_HEAD_FOR_AGE,
} from './index';
import { GrowthMetric, Sex, StandardDataset, SDPoint } from './types';
import { convertSDToPercentile } from '../../utils/percentileCalculator';

/**
 * 根据指标和性别获取标准数据集
 * @param metric 生长指标
 * @param sex 性别
 * @param standard 标准名称（默认 WS/T 423-2022）
 * @returns 标准数据集，如果不存在则返回 null
 */
export function getStandardDataset(
  metric: GrowthMetric,
  sex: Sex,
  standard: 'WST423-2022' | 'WHO-2006' = 'WST423-2022'
): StandardDataset | null {
  // 目前仅支持 WS/T 423-2022 标准
  if (standard !== 'WST423-2022') {
    return null;
  }

  let sdPoints: SDPoint[] = [];
  let xAxis: 'ageMonth' | 'heightCm' = 'ageMonth';
  let xLabel = '月龄 (月)';
  let yLabel = '';

  // 根据指标和性别选择对应的数据
  switch (metric) {
    case 'weight_for_age':
      sdPoints = sex === 'male' ? WST423_2022_MALE_WEIGHT_FOR_AGE : WST423_2022_FEMALE_WEIGHT_FOR_AGE;
      yLabel = '体重 (kg)';
      break;
    
    case 'height_for_age':
      sdPoints = sex === 'male' ? WST423_2022_MALE_HEIGHT_FOR_AGE : WST423_2022_FEMALE_HEIGHT_FOR_AGE;
      yLabel = '身长/身高 (cm)';
      break;
    
    case 'head_for_age':
      sdPoints = sex === 'male' ? WST423_2022_MALE_HEAD_FOR_AGE : WST423_2022_FEMALE_HEAD_FOR_AGE;
      yLabel = '头围 (cm)';
      break;
    
    // 暂不支持这些指标
    case 'bmi_for_age':
    case 'weight_for_height':
      return null;
    
    default:
      return null;
  }

  if (sdPoints.length === 0) {
    return null;
  }

  // 将 SD 数据转换为百分位数据（用于图表显示）
  const percentilePoints = convertSDToPercentile(sdPoints);

  return {
    standard: 'WST423-2022',
    metric,
    sex,
    xAxis,
    xLabel,
    yLabel,
    sdPoints,
    points: percentilePoints,
  };
}

