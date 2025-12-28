/**
 * 生长标准数据索引
 * WS/T 423-2022 《7岁以下儿童生长标准》
 */

export * from './types';
export * from './wst423_2022_male_weight';
export * from './wst423_2022_female_weight';
export * from './wst423_2022_male_height';
export * from './wst423_2022_female_height';
export * from './wst423_2022_male_head';
export * from './wst423_2022_female_head';

import { StandardDataset, GrowthMetric, Sex } from './types';
import { WST423_2022_MALE_WEIGHT_FOR_AGE } from './wst423_2022_male_weight';
import { WST423_2022_FEMALE_WEIGHT_FOR_AGE } from './wst423_2022_female_weight';
import { WST423_2022_MALE_HEIGHT_FOR_AGE } from './wst423_2022_male_height';
import { WST423_2022_FEMALE_HEIGHT_FOR_AGE } from './wst423_2022_female_height';
import { WST423_2022_MALE_HEAD_FOR_AGE } from './wst423_2022_male_head';
import { WST423_2022_FEMALE_HEAD_FOR_AGE } from './wst423_2022_female_head';

/**
 * 获取标准数据集
 */
export function getStandardDataset(
  metric: GrowthMetric,
  sex: Sex
): StandardDataset | null {
  const standard = 'WST423-2022';

  switch (metric) {
    case 'weight_for_age':
      return {
        standard,
        metric,
        sex,
        xAxis: 'ageMonth',
        xLabel: '月龄',
        yLabel: '体重 (kg)',
        points: sex === 'male' ? WST423_2022_MALE_WEIGHT_FOR_AGE : WST423_2022_FEMALE_WEIGHT_FOR_AGE,
      };

    case 'height_for_age':
      return {
        standard,
        metric,
        sex,
        xAxis: 'ageMonth',
        xLabel: '月龄',
        yLabel: '身高 (cm)',
        points: sex === 'male' ? WST423_2022_MALE_HEIGHT_FOR_AGE : WST423_2022_FEMALE_HEIGHT_FOR_AGE,
      };

    case 'head_for_age':
      return {
        standard,
        metric,
        sex,
        xAxis: 'ageMonth',
        xLabel: '月龄',
        yLabel: '头围 (cm)',
        points: sex === 'male' ? WST423_2022_MALE_HEAD_FOR_AGE : WST423_2022_FEMALE_HEAD_FOR_AGE,
      };

    default:
      return null;
  }
}



