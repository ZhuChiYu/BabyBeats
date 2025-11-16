/**
 * 验证邮箱格式
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 验证密码强度
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  message?: string;
} => {
  if (password.length < 6) {
    return { isValid: false, message: '密码至少需要6个字符' };
  }
  if (password.length > 20) {
    return { isValid: false, message: '密码最多20个字符' };
  }
  return { isValid: true };
};

/**
 * 验证宝宝名字
 */
export const validateBabyName = (name: string): {
  isValid: boolean;
  message?: string;
} => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, message: '请输入宝宝名字' };
  }
  if (name.length > 50) {
    return { isValid: false, message: '名字最多50个字符' };
  }
  return { isValid: true };
};

/**
 * 验证数值范围
 */
export const validateNumberRange = (
  value: number,
  min?: number,
  max?: number
): {
  isValid: boolean;
  message?: string;
} => {
  if (isNaN(value)) {
    return { isValid: false, message: '请输入有效的数字' };
  }
  if (min !== undefined && value < min) {
    return { isValid: false, message: `数值不能小于${min}` };
  }
  if (max !== undefined && value > max) {
    return { isValid: false, message: `数值不能大于${max}` };
  }
  return { isValid: true };
};

/**
 * 验证时间范围
 */
export const validateTimeRange = (startTime: number, endTime: number): {
  isValid: boolean;
  message?: string;
} => {
  if (endTime <= startTime) {
    return { isValid: false, message: '结束时间必须晚于开始时间' };
  }
  const maxDuration = 24 * 60 * 60 * 1000; // 24小时
  if (endTime - startTime > maxDuration) {
    return { isValid: false, message: '时间跨度不能超过24小时' };
  }
  return { isValid: true };
};

/**
 * 验证体重合理性
 */
export const validateWeight = (weight: number, ageInMonths: number): {
  isValid: boolean;
  warning?: string;
} => {
  // 新生儿正常体重范围：2.5-4.5kg
  // 每月增长约0.5-1kg
  const minWeight = 2.5 + ageInMonths * 0.3;
  const maxWeight = 4.5 + ageInMonths * 1.2;
  
  if (weight < minWeight) {
    return { isValid: true, warning: '体重可能偏轻，建议咨询医生' };
  }
  if (weight > maxWeight) {
    return { isValid: true, warning: '体重可能偏重，建议咨询医生' };
  }
  return { isValid: true };
};

/**
 * 验证温度合理性
 */
export const validateTemperature = (temp: number): {
  isValid: boolean;
  warning?: string;
} => {
  if (temp < 35) {
    return { isValid: true, warning: '体温过低，请立即就医' };
  }
  if (temp > 38.5) {
    return { isValid: true, warning: '体温较高，建议就医' };
  }
  if (temp > 37.5) {
    return { isValid: true, warning: '体温略高，注意观察' };
  }
  return { isValid: true };
};

