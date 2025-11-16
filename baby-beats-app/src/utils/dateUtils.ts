import { format, differenceInDays, differenceInMonths, differenceInYears, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 格式化日期时间
 */
export const formatDateTime = (timestamp: number, formatStr: string = 'yyyy-MM-dd HH:mm'): string => {
  return format(new Date(timestamp), formatStr, { locale: zhCN });
};

/**
 * 格式化日期
 */
export const formatDate = (timestamp: number): string => {
  return format(new Date(timestamp), 'yyyy-MM-dd', { locale: zhCN });
};

/**
 * 格式化时间
 */
export const formatTime = (timestamp: number): string => {
  return format(new Date(timestamp), 'HH:mm', { locale: zhCN });
};

/**
 * 格式化为友好的日期显示
 */
export const formatFriendlyDate = (timestamp: number): string => {
  const today = new Date();
  const date = new Date(timestamp);
  
  if (date.toDateString() === today.toDateString()) {
    return '今天';
  }
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return '昨天';
  }
  
  const daysDiff = differenceInDays(today, date);
  if (daysDiff < 7) {
    return format(date, 'EEEE', { locale: zhCN });
  }
  
  return format(date, 'MM月dd日', { locale: zhCN });
};

/**
 * 计算宝宝年龄
 */
export const calculateAge = (birthday: number): { years: number; months: number; days: number } => {
  const now = new Date();
  const birth = new Date(birthday);
  
  const years = differenceInYears(now, birth);
  const months = differenceInMonths(now, birth) % 12;
  
  // 计算剩余天数
  const lastBirthdayMonth = new Date(birth);
  lastBirthdayMonth.setFullYear(now.getFullYear());
  lastBirthdayMonth.setMonth(birth.getMonth() + differenceInMonths(now, birth));
  const days = differenceInDays(now, lastBirthdayMonth);
  
  return { years, months, days };
};

/**
 * 格式化年龄显示
 */
export const formatAge = (birthday: number): string => {
  const { years, months, days } = calculateAge(birthday);
  
  if (years > 0) {
    return `${years}岁${months}个月`;
  } else if (months > 0) {
    return `${months}个月${days}天`;
  } else {
    return `${days}天`;
  }
};

/**
 * 获取今天的开始和结束时间戳
 */
export const getTodayRange = (): { start: number; end: number } => {
  const now = new Date();
  return {
    start: startOfDay(now).getTime(),
    end: endOfDay(now).getTime(),
  };
};

/**
 * 获取本周的开始和结束时间戳
 */
export const getThisWeekRange = (): { start: number; end: number } => {
  const now = new Date();
  return {
    start: startOfWeek(now, { weekStartsOn: 1 }).getTime(),
    end: endOfWeek(now, { weekStartsOn: 1 }).getTime(),
  };
};

/**
 * 获取本月的开始和结束时间戳
 */
export const getThisMonthRange = (): { start: number; end: number } => {
  const now = new Date();
  return {
    start: startOfMonth(now).getTime(),
    end: endOfMonth(now).getTime(),
  };
};

/**
 * 获取最近N天的时间范围
 */
export const getLastNDaysRange = (days: number): { start: number; end: number } => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - days + 1);
  
  return {
    start: startOfDay(start).getTime(),
    end: endOfDay(now).getTime(),
  };
};

/**
 * 格式化时长（分钟）
 */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}小时${mins}分钟`;
  }
  return `${mins}分钟`;
};

/**
 * 格式化时长（秒）
 */
export const formatDurationSeconds = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * 判断是否是今天
 */
export const isToday = (timestamp: number): boolean => {
  const today = new Date();
  const date = new Date(timestamp);
  return date.toDateString() === today.toDateString();
};

/**
 * 判断是否是本周
 */
export const isThisWeek = (timestamp: number): boolean => {
  const { start, end } = getThisWeekRange();
  return timestamp >= start && timestamp <= end;
};

/**
 * 判断是否是本月
 */
export const isThisMonth = (timestamp: number): boolean => {
  const { start, end } = getThisMonthRange();
  return timestamp >= start && timestamp <= end;
};

