export * from './colors';

// 应用配置
export const APP_CONFIG = {
  name: 'BabyBeats',
  version: '1.0.0',
  databaseName: 'babybeats.db',
  defaultLanguage: 'zh-CN',
};

// 数据限制
export const DATA_LIMITS = {
  maxBabies: 10,
  maxRecordsPerQuery: 100,
  maxNotesLength: 500,
  maxNameLength: 50,
  maxBrandLength: 30,
};

// 时间常量
export const TIME_CONSTANTS = {
  millisecondsPerSecond: 1000,
  secondsPerMinute: 60,
  minutesPerHour: 60,
  hoursPerDay: 24,
  daysPerWeek: 7,
  daysPerMonth: 30,
  monthsPerYear: 12,
};

// 单位换算
export const UNITS = {
  // 体重
  weight: {
    kg: 'kg',
    lb: 'lb',
    kgToLb: 2.20462,
  },
  // 身高
  height: {
    cm: 'cm',
    inch: 'inch',
    cmToInch: 0.393701,
  },
  // 体积
  volume: {
    ml: 'ml',
    oz: 'oz',
    mlToOz: 0.033814,
  },
  // 温度
  temperature: {
    celsius: '℃',
    fahrenheit: '℉',
    celsiusToFahrenheit: (c: number) => (c * 9) / 5 + 32,
    fahrenheitToCelsius: (f: number) => ((f - 32) * 5) / 9,
  },
};

// 喂养类型
export const FEEDING_TYPES = {
  breast: {
    value: 'breast',
    label: '亲喂母乳',
    icon: 'woman',
    color: '#FF9500',
  },
  bottled_breast_milk: {
    value: 'bottled_breast_milk',
    label: '瓶喂母乳',
    icon: 'water',
    color: '#34C759',
  },
  formula: {
    value: 'formula',
    label: '配方奶',
    icon: 'nutrition',
    color: '#5856D6',
  },
};

// 尿布类型
export const DIAPER_TYPES = {
  poop: {
    value: 'poop',
    label: '大便',
    icon: 'water',
    color: '#FF9500',
  },
  pee: {
    value: 'pee',
    label: '小便',
    icon: 'water-outline',
    color: '#34C759',
  },
  both: {
    value: 'both',
    label: '都有',
    icon: 'water',
    color: '#007AFF',
  },
};

// 睡眠类型
export const SLEEP_TYPES = {
  nap: {
    value: 'nap',
    label: '白天小睡',
    icon: 'sunny',
    color: '#FF9500',
  },
  night: {
    value: 'night',
    label: '夜间睡眠',
    icon: 'moon',
    color: '#5856D6',
  },
};

// 挤奶方式
export const PUMPING_METHODS = {
  electric: {
    value: 'electric',
    label: '电动',
    icon: 'flash',
  },
  manual: {
    value: 'manual',
    label: '手动',
    icon: 'hand-left',
  },
  other: {
    value: 'other',
    label: '其他',
    icon: 'ellipsis-horizontal',
  },
};

// 存放方式
export const STORAGE_METHODS = {
  refrigerate: {
    value: 'refrigerate',
    label: '冷藏',
    icon: 'snow',
  },
  freeze: {
    value: 'freeze',
    label: '冷冻',
    icon: 'snow-outline',
  },
  feed_now: {
    value: 'feed_now',
    label: '立即喂',
    icon: 'time',
  },
  other: {
    value: 'other',
    label: '其他',
    icon: 'ellipsis-horizontal',
  },
};

// 大便性质
export const POOP_CONSISTENCY = [
  { value: 'loose', label: '稀' },
  { value: 'normal', label: '正常' },
  { value: 'hard', label: '干硬' },
  { value: 'other', label: '其他' },
];

// 大便颜色
export const POOP_COLORS = [
  { value: 'yellow', label: '黄色' },
  { value: 'green', label: '绿色' },
  { value: 'dark', label: '深色' },
  { value: 'other', label: '其他' },
];

// 量级
export const AMOUNTS = [
  { value: 'small', label: '少' },
  { value: 'medium', label: '中' },
  { value: 'large', label: '多' },
];

// 里程碑类型
export const MILESTONE_TYPES = [
  { value: 'physical', label: '运动发育', icon: 'fitness', color: '#FF9500' },
  { value: 'language', label: '语言发育', icon: 'chatbubbles', color: '#5856D6' },
  { value: 'social', label: '社交发育', icon: 'people', color: '#34C759' },
  { value: 'cognitive', label: '认知发育', icon: 'bulb', color: '#FF2D55' },
  { value: 'other', label: '其他', icon: 'star', color: '#8E8E93' },
];

// 常用里程碑
export const COMMON_MILESTONES = [
  { label: '第一次抬头', type: 'physical', ageMonths: 1 },
  { label: '第一次翻身', type: 'physical', ageMonths: 3 },
  { label: '第一次坐', type: 'physical', ageMonths: 6 },
  { label: '第一次爬', type: 'physical', ageMonths: 8 },
  { label: '第一次站', type: 'physical', ageMonths: 10 },
  { label: '第一次走路', type: 'physical', ageMonths: 12 },
  { label: '叫爸爸/妈妈', type: 'language', ageMonths: 10 },
  { label: '会说简单的词', type: 'language', ageMonths: 12 },
  { label: '认生', type: 'social', ageMonths: 6 },
  { label: '会挥手再见', type: 'social', ageMonths: 9 },
];

// 疫苗清单（中国常规疫苗）
export const COMMON_VACCINES = [
  { name: '卡介苗', doses: 1, schedule: [0] },
  { name: '乙肝疫苗', doses: 3, schedule: [0, 1, 6] },
  { name: '脊灰疫苗', doses: 4, schedule: [2, 3, 4, 18] },
  { name: '百白破疫苗', doses: 4, schedule: [3, 4, 5, 18] },
  { name: '麻腮风疫苗', doses: 2, schedule: [8, 18] },
  { name: '乙脑疫苗', doses: 2, schedule: [8, 24] },
  { name: '流脑疫苗', doses: 2, schedule: [6, 9] },
  { name: '甲肝疫苗', doses: 1, schedule: [18] },
];

// 宝宝性别
export const BABY_GENDERS = [
  { value: 'male', label: '男孩', icon: 'male', color: '#007AFF' },
  { value: 'female', label: '女孩', icon: 'female', color: '#FF2D55' },
  { value: 'unknown', label: '暂不设置', icon: 'help-circle', color: '#8E8E93' },
];

// 血型
export const BLOOD_TYPES = ['A', 'B', 'AB', 'O', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// 统计时间范围
export const STATS_TIME_RANGES = [
  { value: '7days', label: '最近7天', days: 7 },
  { value: '30days', label: '最近30天', days: 30 },
  { value: '3months', label: '最近3个月', days: 90 },
  { value: '6months', label: '最近6个月', days: 180 },
  { value: '1year', label: '最近1年', days: 365 },
];

// 导出格式
export const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV 文件', extension: '.csv' },
  { value: 'json', label: 'JSON 文件', extension: '.json' },
];

// 错误消息
export const ERROR_MESSAGES = {
  networkError: '网络连接失败，请检查网络设置',
  databaseError: '数据库操作失败',
  validationError: '数据验证失败',
  notFound: '记录不存在',
  unauthorized: '未授权操作',
  serverError: '服务器错误',
  unknown: '未知错误',
};

// 成功消息
export const SUCCESS_MESSAGES = {
  saved: '保存成功',
  deleted: '删除成功',
  updated: '更新成功',
  exported: '导出成功',
  imported: '导入成功',
  synced: '同步成功',
};

