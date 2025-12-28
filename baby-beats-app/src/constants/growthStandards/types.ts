/**
 * 生长标准类型定义
 * 基于 WS/T 423-2022 《7岁以下儿童生长标准》
 */

export type GrowthStandard = 'WST423-2022' | 'WHO-2006';

export type GrowthMetric = 
  | 'weight_for_age'      // 体重-年龄
  | 'height_for_age'      // 身高/身长-年龄
  | 'head_for_age'        // 头围-年龄
  | 'bmi_for_age'         // BMI-年龄
  | 'weight_for_height';  // 体重-身高

export type Sex = 'male' | 'female';

/**
 * 标准差数据点结构（WS/T 423-2022 官方格式）
 */
export interface SDPoint {
  x: number;              // 横轴值（月龄、身长/身高cm等）
  SD_neg3: number;        // -3SD
  SD_neg2: number;        // -2SD
  SD_neg1: number;        // -1SD
  SD0: number;            // 中位数 (0SD)
  SD_pos1: number;        // +1SD
  SD_pos2: number;        // +2SD
  SD_pos3: number;        // +3SD
}

/**
 * 百分位点数据结构（用于兼容和显示）
 * 标准差与百分位对应关系：
 * -2SD ≈ P3, -1SD ≈ P15, 0SD = P50, +1SD ≈ P85, +2SD ≈ P97
 */
export interface PercentilePoint {
  x: number;              // 横轴值（月龄、身长/身高cm等）
  P3: number;             // 第3百分位 (≈ -2SD)
  P10: number;            // 第10百分位
  P25: number;            // 第25百分位
  P50: number;            // 第50百分位（中位数）
  P75: number;            // 第75百分位
  P90: number;            // 第90百分位
  P97: number;            // 第97百分位 (≈ +2SD)
}

/**
 * 标准数据集
 */
export interface StandardDataset {
  standard: GrowthStandard;
  metric: GrowthMetric;
  sex: Sex;
  xAxis: 'ageMonth' | 'heightCm';  // 横轴类型
  xLabel: string;                   // 横轴标签
  yLabel: string;                   // 纵轴标签
  sdPoints: SDPoint[];              // 标准差点数组（原始数据）
  points: PercentilePoint[];        // 百分位点数组（用于显示）
}

/**
 * 百分位计算结果
 */
export interface PercentileResult {
  value: number;            // 测量值
  percentile: number;       // 计算出的百分位（0-100）
  status: 'low' | 'normal' | 'high' | 'unknown';  // 评估状态
  description: string;      // 描述文字
}

/**
 * 生长评估结果
 */
export interface GrowthAssessment {
  metric: GrowthMetric;
  result: PercentileResult;
  suggestions?: string[];   // 建议（如需咨询医生等）
}

