/**
 * 标准差（SD）和百分位计算工具
 * 基于 WS/T 423-2022 标准差法
 * 
 * 标准差与百分位的对应关系（正态分布）：
 * -3SD ≈ P0.1
 * -2SD ≈ P2.3  (约 P3)
 * -1SD ≈ P15.9 (约 P16)
 * 0SD  = P50   (中位数)
 * +1SD ≈ P84.1 (约 P84)
 * +2SD ≈ P97.7 (约 P97)
 * +3SD ≈ P99.9
 */

import { SDPoint, PercentileResult } from '../constants/growthStandards/types';

/**
 * 线性插值函数
 */
function linearInterpolate(x: number, x0: number, x1: number, y0: number, y1: number): number {
  if (x1 === x0) return y0;
  return y0 + (y1 - y0) * ((x - x0) / (x1 - x0));
}

/**
 * 在标准差点数组中查找相邻的两个点
 */
function findAdjacentPoints(
  points: SDPoint[],
  x: number
): [SDPoint, SDPoint] | null {
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
 * 通过插值获取某个 x 值对应的所有标准差曲线值
 */
export function interpolateSD(
  points: SDPoint[],
  x: number
): Omit<SDPoint, 'x'> | null {
  const adjacent = findAdjacentPoints(points, x);
  if (!adjacent) return null;

  const [p0, p1] = adjacent;

  // 如果是边界点，直接返回
  if (p0.x === p1.x) {
    return {
      SD_neg3: p0.SD_neg3,
      SD_neg2: p0.SD_neg2,
      SD_neg1: p0.SD_neg1,
      SD0: p0.SD0,
      SD_pos1: p0.SD_pos1,
      SD_pos2: p0.SD_pos2,
      SD_pos3: p0.SD_pos3,
    };
  }

  // 线性插值计算每条标准差曲线的值
  return {
    SD_neg3: linearInterpolate(x, p0.x, p1.x, p0.SD_neg3, p1.SD_neg3),
    SD_neg2: linearInterpolate(x, p0.x, p1.x, p0.SD_neg2, p1.SD_neg2),
    SD_neg1: linearInterpolate(x, p0.x, p1.x, p0.SD_neg1, p1.SD_neg1),
    SD0: linearInterpolate(x, p0.x, p1.x, p0.SD0, p1.SD0),
    SD_pos1: linearInterpolate(x, p0.x, p1.x, p0.SD_pos1, p1.SD_pos1),
    SD_pos2: linearInterpolate(x, p0.x, p1.x, p0.SD_pos2, p1.SD_pos2),
    SD_pos3: linearInterpolate(x, p0.x, p1.x, p0.SD_pos3, p1.SD_pos3),
  };
}

/**
 * 标准正态分布的累积分布函数（CDF）近似计算
 * 用于将 Z-score 转换为百分位
 */
function normalCDF(z: number): number {
  // 使用 Zelen & Severo 近似公式
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  
  return z > 0 ? 1 - p : p;
}

/**
 * 计算测量值对应的标准差分数（Z-score）
 * @param value 测量值
 * @param sd0 中位数（0SD）
 * @param sdPos 正标准差值（用于计算标准差大小）
 * @returns Z-score
 */
function calculateZScore(value: number, sd0: number, sdPos: number): number {
  const sd = sdPos - sd0; // 标准差大小
  if (sd === 0) return 0;
  return (value - sd0) / sd;
}

/**
 * 根据 Z-score 计算百分位
 */
function zScoreToPercentile(zScore: number): number {
  const percentile = normalCDF(zScore) * 100;
  return Math.max(0, Math.min(100, percentile));
}

/**
 * 计算测量值对应的百分位（基于标准差法）
 * @param points 标准差点数组
 * @param x 横轴值（月龄或身高等）
 * @param y 测量值（体重、身高等）
 * @returns 百分位计算结果
 */
export function calculatePercentile(
  points: SDPoint[],
  x: number,
  y: number
): PercentileResult {
  const sdValues = interpolateSD(points, x);

  if (!sdValues) {
    return {
      value: y,
      percentile: 50,
      status: 'unknown',
      description: '无法计算百分位',
    };
  }

  // 计算 Z-score（使用 +1SD 来估算标准差）
  const zScore = calculateZScore(y, sdValues.SD0, sdValues.SD_pos1);
  
  // 转换为百分位
  const percentile = zScoreToPercentile(zScore);

  // 判断状态（按 WS/T 423-2022 表2标准）
  let status: 'low' | 'normal' | 'high' | 'unknown' = 'normal';
  
  // -2SD 到 +2SD 之间为正常（约 P3-P97）
  if (y < sdValues.SD_neg2) {
    status = 'low';  // 低于 -2SD（约 P3）
  } else if (y > sdValues.SD_pos2) {
    status = 'high'; // 高于 +2SD（约 P97）
  }

  // 生成描述
  const description = generateDescription(percentile, status, zScore);

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
function generateDescription(percentile: number, status: 'low' | 'normal' | 'high' | 'unknown', zScore: number): string {
  const p = Math.round(percentile);
  
  // 基于标准差的描述
  let sdDesc = '';
  if (zScore < -2) {
    sdDesc = `（低于 -2SD）`;
  } else if (zScore < -1) {
    sdDesc = `（-2SD 至 -1SD 之间）`;
  } else if (zScore < 0) {
    sdDesc = `（-1SD 至中位数之间）`;
  } else if (zScore < 1) {
    sdDesc = `（中位数至 +1SD 之间）`;
  } else if (zScore < 2) {
    sdDesc = `（+1SD 至 +2SD 之间）`;
  } else {
    sdDesc = `（高于 +2SD）`;
  }

  if (status === 'low') {
    return `低于同龄约${100 - p}%的宝宝 ${sdDesc}`;
  } else if (status === 'high') {
    return `超过同龄约${p}%的宝宝 ${sdDesc}`;
  } else {
    return `超过同龄约${p}%的宝宝 ${sdDesc}`;
  }
}

/**
 * 生成评估建议（按 WS/T 423-2022 表3标准）
 */
export function generateSuggestions(
  metric: string,
  result: PercentileResult,
  previousResults?: PercentileResult[]
): string[] {
  const suggestions: string[] = [];

  // 计算 Z-score（用于判断）
  // 注意：这里简化处理，实际应该传入 SD 值
  const percentile = result.percentile;

  // 按照 WS/T 423-2022 表3的评价方法
  if (result.status === 'low') {
    // 低于 -2SD
    if (percentile < 3) {
      // <-2SD，约 P3 以下
      if (metric === 'weight_for_age') {
        suggestions.push('体重低于正常范围（<-2SD），建议咨询儿科医生');
        suggestions.push('注意营养摄入，评估是否存在营养不良');
      } else if (metric === 'height_for_age') {
        suggestions.push('身高低于正常范围（<-2SD），建议咨询儿保医生');
        suggestions.push('可能需要评估生长激素水平');
      } else if (metric === 'head_for_age') {
        suggestions.push('头围低于正常范围（<-2SD），建议神经科评估');
      }
    }
  } else if (result.status === 'high') {
    // 高于 +2SD
    if (percentile > 97) {
      if (metric === 'weight_for_age' || metric === 'bmi_for_age') {
        suggestions.push('体重高于正常范围（>+2SD），建议咨询营养师');
        suggestions.push('注意饮食均衡，增加运动量');
      } else if (metric === 'height_for_age') {
        suggestions.push('身高超过同龄儿童，属于较高水平');
        suggestions.push('建议定期体检，关注骨龄发育');
      }
    }
  } else {
    // -2SD 到 +2SD 之间（正常范围）
    suggestions.push('生长发育在正常范围内（-2SD~+2SD）');
    suggestions.push('继续保持良好的饮食和作息习惯');
  }

  // 检查生长速度变化
  if (previousResults && previousResults.length >= 2) {
    const lastResult = previousResults[previousResults.length - 1];
    const percentileDiff = Math.abs(result.percentile - lastResult.percentile);

    // 如果短期内跨越较大百分位，提示关注
    if (percentileDiff > 25) {
      suggestions.push('⚠️ 生长速度变化较大，建议咨询医生评估');
    }
  }

  return suggestions;
}

/**
 * 将标准差数据转换为百分位数据（用于图表显示）
 * 使用正态分布近似转换
 */
export function convertSDToPercentile(sdPoints: SDPoint[]): import('../constants/growthStandards/types').PercentilePoint[] {
  return sdPoints.map(point => ({
    x: point.x,
    P3: point.SD_neg2,   // -2SD ≈ P2.3 (约 P3)
    P10: linearInterpolate(0, -2, -1, point.SD_neg2, point.SD_neg1), // -1.28SD ≈ P10
    P25: linearInterpolate(0, -1, 0, point.SD_neg1, point.SD0),      // -0.67SD ≈ P25
    P50: point.SD0,      // 0SD = P50
    P75: linearInterpolate(0, 0, 1, point.SD0, point.SD_pos1),       // +0.67SD ≈ P75
    P90: linearInterpolate(0, 1, 2, point.SD_pos1, point.SD_pos2),   // +1.28SD ≈ P90
    P97: point.SD_pos2,  // +2SD ≈ P97.7 (约 P97)
  }));
}
