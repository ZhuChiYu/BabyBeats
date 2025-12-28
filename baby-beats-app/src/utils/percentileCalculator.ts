/**
 * 百分位计算工具
 * 使用线性插值法计算宝宝测量值对应的百分位
 */

import { PercentilePoint, PercentileResult } from '../constants/growthStandards/types';

/**
 * 线性插值函数
 */
function linearInterpolate(x: number, x0: number, x1: number, y0: number, y1: number): number {
  if (x1 === x0) return y0;
  return y0 + (y1 - y0) * ((x - x0) / (x1 - x0));
}

/**
 * 在百分位点数组中查找相邻的两个点
 */
function findAdjacentPoints(
  points: PercentilePoint[],
  x: number
): [PercentilePoint, PercentilePoint] | null {
  if (points.length === 0) return null;

  // 如果 x 小于第一个点
  if (x <= points[0].x) {
    return [points[0], points[0]];
  }

  // 如果 x 大于最后一个点
  if (x >= points[points.length - 1].x) {
    return [points[points.length - 1], points[points.length - 1]];
  }

  // 查找相邻的两个点
  for (let i = 0; i < points.length - 1; i++) {
    if (x >= points[i].x && x <= points[i + 1].x) {
      return [points[i], points[i + 1]];
    }
  }

  return null;
}

/**
 * 通过插值获取某个 x 值对应的所有百分位曲线值
 */
export function interpolatePercentiles(
  points: PercentilePoint[],
  x: number
): Omit<PercentilePoint, 'x'> | null {
  const adjacent = findAdjacentPoints(points, x);
  if (!adjacent) return null;

  const [p0, p1] = adjacent;

  // 如果是边界点，直接返回
  if (p0.x === p1.x) {
    return {
      P3: p0.P3,
      P10: p0.P10,
      P25: p0.P25,
      P50: p0.P50,
      P75: p0.P75,
      P90: p0.P90,
      P97: p0.P97,
    };
  }

  // 线性插值计算每条百分位曲线的值
  return {
    P3: linearInterpolate(x, p0.x, p1.x, p0.P3, p1.P3),
    P10: linearInterpolate(x, p0.x, p1.x, p0.P10, p1.P10),
    P25: linearInterpolate(x, p0.x, p1.x, p0.P25, p1.P25),
    P50: linearInterpolate(x, p0.x, p1.x, p0.P50, p1.P50),
    P75: linearInterpolate(x, p0.x, p1.x, p0.P75, p1.P75),
    P90: linearInterpolate(x, p0.x, p1.x, p0.P90, p1.P90),
    P97: linearInterpolate(x, p0.x, p1.x, p0.P97, p1.P97),
  };
}

/**
 * 计算测量值对应的百分位
 * @param points 百分位点数组
 * @param x 横轴值（月龄或身高等）
 * @param y 测量值（体重、身高等）
 * @returns 百分位计算结果
 */
export function calculatePercentile(
  points: PercentilePoint[],
  x: number,
  y: number
): PercentileResult {
  const percentiles = interpolatePercentiles(points, x);

  if (!percentiles) {
    return {
      value: y,
      percentile: 50,
      status: 'unknown',
      description: '无法计算百分位',
    };
  }

  let percentile = 50;
  let status: 'low' | 'normal' | 'high' | 'unknown' = 'normal';

  // 判断在哪两条百分位曲线之间
  if (y < percentiles.P3) {
    percentile = (y / percentiles.P3) * 3;
    status = 'low';
  } else if (y >= percentiles.P3 && y < percentiles.P10) {
    percentile = 3 + ((y - percentiles.P3) / (percentiles.P10 - percentiles.P3)) * 7;
  } else if (y >= percentiles.P10 && y < percentiles.P25) {
    percentile = 10 + ((y - percentiles.P10) / (percentiles.P25 - percentiles.P10)) * 15;
  } else if (y >= percentiles.P25 && y < percentiles.P50) {
    percentile = 25 + ((y - percentiles.P25) / (percentiles.P50 - percentiles.P25)) * 25;
  } else if (y >= percentiles.P50 && y < percentiles.P75) {
    percentile = 50 + ((y - percentiles.P50) / (percentiles.P75 - percentiles.P50)) * 25;
  } else if (y >= percentiles.P75 && y < percentiles.P90) {
    percentile = 75 + ((y - percentiles.P75) / (percentiles.P90 - percentiles.P75)) * 15;
  } else if (y >= percentiles.P90 && y < percentiles.P97) {
    percentile = 90 + ((y - percentiles.P90) / (percentiles.P97 - percentiles.P90)) * 7;
  } else {
    percentile = 97 + ((y - percentiles.P97) / percentiles.P97) * 3;
    if (percentile > 100) percentile = 100;
    status = 'high';
  }

  // 判断状态
  if (percentile < 3) {
    status = 'low';
  } else if (percentile > 97) {
    status = 'high';
  } else {
    status = 'normal';
  }

  // 生成描述
  const description = generateDescription(percentile, status);

  return {
    value: y,
    percentile: Math.round(percentile * 10) / 10, // 保留一位小数
    status,
    description,
  };
}

/**
 * 生成百分位描述文字
 */
function generateDescription(percentile: number, status: 'low' | 'normal' | 'high' | 'unknown'): string {
  const p = Math.round(percentile);

  if (status === 'low') {
    return `低于同龄约${100 - p}%的宝宝`;
  } else if (status === 'high') {
    return `超过同龄约${p}%的宝宝`;
  } else {
    return `超过同龄约${p}%的宝宝`;
  }
}

/**
 * 生成评估建议
 */
export function generateSuggestions(
  metric: string,
  result: PercentileResult,
  previousResults?: PercentileResult[]
): string[] {
  const suggestions: string[] = [];

  // 低于 P3 的建议
  if (result.status === 'low') {
    suggestions.push('测量值偏低，建议咨询儿科医生或儿保专家');
    suggestions.push('注意观察宝宝的饮食和生长情况');
  }

  // 高于 P97 的建议
  if (result.status === 'high') {
    suggestions.push('测量值偏高，建议咨询儿科医生或儿保专家');
    if (metric === 'weight_for_age' || metric === 'bmi_for_age') {
      suggestions.push('注意控制饮食，保持适当运动');
    }
  }

  // 跨越多条百分位曲线的建议
  if (previousResults && previousResults.length >= 2) {
    const lastResult = previousResults[previousResults.length - 1];
    const percentileDiff = Math.abs(result.percentile - lastResult.percentile);

    if (percentileDiff > 25) {
      suggestions.push('生长速度变化较大，建议持续观察并咨询医生');
    }
  }

  // P3-P97 之间的正常提示
  if (result.status === 'normal' && suggestions.length === 0) {
    suggestions.push('生长发育在正常范围内，继续保持良好的饮食和作息');
  }

  return suggestions;
}



