/**
 * 标准尿量计算工具
 * 基于WHO和NHS临床指南
 */

// 尿量标准范围（mL/kg/hr）
export const URINE_RATE_STANDARDS = {
  MINIMUM_12_24H: 0.5, // 出生后12-24小时最低标准
  NEONATE_MIN: 2, // 新生儿最小值
  NEONATE_MAX: 3, // 新生儿最大值
  INFANT: 2, // 婴儿（<1岁）
  CHILD_MIN: 1, // 幼儿/儿童最小值
  CHILD_MAX: 2, // 幼儿/儿童最大值
};

export interface UrineStandard {
  minimum12_24h: number; // 出生后12-24h最低（g/天）
  neonateMin: number; // 新生儿最小值（g/天）
  neonateMax: number; // 新生儿最大值（g/天）
  infant: number; // 婴儿标准值（g/天）
  childMin: number; // 幼儿/儿童最小值（g/天）
  childMax: number; // 幼儿/儿童最大值（g/天）
}

export class UrineStandardService {
  /**
   * 根据体重计算标准尿量
   * @param weightKg 体重（千克）
   * @returns 各年龄段的标准尿量（g/天）
   */
  static calculateStandardUrine(weightKg: number): UrineStandard {
    return {
      minimum12_24h: Math.round(weightKg * 24 * URINE_RATE_STANDARDS.MINIMUM_12_24H),
      neonateMin: Math.round(weightKg * 24 * URINE_RATE_STANDARDS.NEONATE_MIN),
      neonateMax: Math.round(weightKg * 24 * URINE_RATE_STANDARDS.NEONATE_MAX),
      infant: Math.round(weightKg * 24 * URINE_RATE_STANDARDS.INFANT),
      childMin: Math.round(weightKg * 24 * URINE_RATE_STANDARDS.CHILD_MIN),
      childMax: Math.round(weightKg * 24 * URINE_RATE_STANDARDS.CHILD_MAX),
    };
  }

  /**
   * 根据年龄（月龄）获取推荐的标准类型
   * @param ageInMonths 月龄
   * @returns 标准类型描述
   */
  static getRecommendedStandardType(ageInMonths: number): {
    type: 'neonate' | 'infant' | 'child';
    description: string;
    rangeKey: 'neonate' | 'infant' | 'child';
  } {
    if (ageInMonths < 1) {
      return {
        type: 'neonate',
        description: '新生儿',
        rangeKey: 'neonate',
      };
    } else if (ageInMonths < 12) {
      return {
        type: 'infant',
        description: '婴儿（<1岁）',
        rangeKey: 'infant',
      };
    } else {
      return {
        type: 'child',
        description: '幼儿/儿童（1-3岁）',
        rangeKey: 'child',
      };
    }
  }

  /**
   * 获取推荐的尿量范围
   * @param weightKg 体重（千克）
   * @param ageInMonths 月龄
   * @returns 推荐的尿量范围
   */
  static getRecommendedRange(
    weightKg: number,
    ageInMonths: number
  ): { min: number; max: number; description: string } {
    const standards = this.calculateStandardUrine(weightKg);
    const standardType = this.getRecommendedStandardType(ageInMonths);

    if (standardType.type === 'neonate') {
      return {
        min: standards.neonateMin,
        max: standards.neonateMax,
        description: standardType.description,
      };
    } else if (standardType.type === 'infant') {
      return {
        min: standards.infant,
        max: standards.infant,
        description: standardType.description,
      };
    } else {
      return {
        min: standards.childMin,
        max: standards.childMax,
        description: standardType.description,
      };
    }
  }

  /**
   * 判断尿量是否正常
   * @param urineAmount 实际尿量（g/天）
   * @param weightKg 体重（千克）
   * @param ageInMonths 月龄
   * @returns 判断结果
   */
  static assessUrineAmount(
    urineAmount: number,
    weightKg: number,
    ageInMonths: number
  ): {
    status: 'low' | 'normal' | 'high';
    message: string;
    recommendation?: string;
  } {
    const range = this.getRecommendedRange(weightKg, ageInMonths);

    if (urineAmount < range.min * 0.7) {
      return {
        status: 'low',
        message: '尿量偏少',
        recommendation: '请注意观察宝宝的进水量，如持续偏少建议咨询医生',
      };
    } else if (urineAmount < range.min) {
      return {
        status: 'low',
        message: '尿量略少',
        recommendation: '建议适当增加水分摄入',
      };
    } else if (urineAmount > range.max * 1.5) {
      return {
        status: 'high',
        message: '尿量偏多',
        recommendation: '如伴有其他症状，建议咨询医生',
      };
    } else if (urineAmount > range.max) {
      return {
        status: 'high',
        message: '尿量略多',
      };
    } else {
      return {
        status: 'normal',
        message: '尿量正常',
      };
    }
  }

  /**
   * 格式化尿量范围显示
   * @param min 最小值
   * @param max 最大值
   * @returns 格式化的字符串
   */
  static formatUrineRange(min: number, max: number): string {
    if (min === max) {
      return `${min}g/天`;
    }
    return `${min}-${max}g/天`;
  }
}

