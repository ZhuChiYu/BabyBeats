// 基础类型
export interface BaseEntity {
  id: string;
  createdAt: number;
  updatedAt: number;
  syncedAt?: number;
}

// 用户
export interface User extends BaseEntity {
  email: string;
  name?: string;
}

// 宝宝
export interface Baby extends BaseEntity {
  userId: string;
  name: string;
  gender: 'male' | 'female' | 'unknown';
  birthday: number;
  dueDate?: number;
  bloodType?: string;
  birthHeight?: number;
  birthWeight?: number;
  birthHeadCirc?: number;
  avatar?: string;
  isArchived: boolean;
}

// 喂养记录
export interface Feeding extends BaseEntity {
  babyId: string;
  time: number;
  type: 'breast' | 'bottled_breast_milk' | 'formula';
  // breast: 亲喂母乳
  leftDuration?: number;  // 左侧哺乳时长（分钟）
  rightDuration?: number; // 右侧哺乳时长（分钟）
  // bottled_breast_milk/formula: 瓶喂母乳或配方奶
  milkAmount?: number;    // 奶量（ml）
  milkBrand?: string;     // 奶粉品牌（仅配方奶）
  notes?: string;
}

// 尿布记录
export interface Diaper extends BaseEntity {
  babyId: string;
  time: number;
  type: 'poop' | 'pee' | 'both';
  poopConsistency?: 'loose' | 'normal' | 'hard' | 'other';
  poopColor?: 'yellow' | 'green' | 'dark' | 'black' | 'red' | 'brown' | 'white' | 'orange' | 'other';
  poopAmount?: 'small' | 'medium' | 'large';
  peeAmount?: 'small' | 'medium' | 'large';
  hasAbnormality: boolean;
  notes?: string;
}

// 睡眠记录
export interface Sleep extends BaseEntity {
  babyId: string;
  startTime: number;     // 睡眠开始时间
  endTime: number;       // 睡眠结束时间
  duration: number;      // 睡眠时长（分钟），自动计算
  sleepType: 'nap' | 'night'; // nap: 白天小睡, night: 夜间睡眠
  fallAsleepMethod?: string;  // 入睡方式（可选）
  notes?: string;
}

// 挤奶记录
export interface Pumping extends BaseEntity {
  babyId: string;
  time: number;
  method: 'electric' | 'manual' | 'other';
  leftAmount: number;
  rightAmount: number;
  totalAmount: number;
  storageMethod: 'refrigerate' | 'freeze' | 'feed_now' | 'other';
  notes?: string;
}

// 成长记录
export interface GrowthRecord extends BaseEntity {
  babyId: string;
  date: number;
  height?: number;
  weight?: number;
  headCirc?: number;
  temperature?: number;
  bmi?: number;
  notes?: string;
}

// 里程碑
export interface Milestone extends BaseEntity {
  babyId: string;
  time: number;
  milestoneType: string;
  title: string;
  description?: string;
  photoUrl?: string;
}

// 就诊记录
export interface MedicalVisit extends BaseEntity {
  babyId: string;
  visitTime: number;
  hospital?: string;
  department?: string;
  doctorName?: string;
  symptoms?: string;
  diagnosis?: string;
  doctorAdvice?: string;
  notes?: string;
}

// 用药记录
export interface Medication extends BaseEntity {
  babyId: string;
  medicationTime: number;
  medicationName: string;
  dosage: string;
  frequency?: string;
  startDate?: number;
  endDate?: number;
  administrationMethod?: string;
  visitId?: string;
  notes?: string;
}

// 疫苗记录
export interface Vaccine extends BaseEntity {
  babyId: string;
  vaccineName: string;
  vaccinationDate: number;
  doseNumber?: number;
  location?: string;
  batchNumber?: string;
  nextDate?: number;
  reminderEnabled: boolean;
  notes?: string;
}

// 统计数据类型
export interface DailySummary {
  date: number;
  babyId: string;
  feedingCount: number;
  feedingTotalAmount?: number;
  diaperPoopCount: number;
  diaperPeeCount: number;
  sleepTotalDuration: number;
  sleepNapDuration: number;
  sleepNightDuration: number;
  pumpingTotalAmount?: number;
}

// 计时器状态
export interface TimerState {
  isRunning: boolean;
  side: 'left' | 'right' | null;
  startTime: number | null;
  leftDuration: number; // 秒
  rightDuration: number; // 秒
}

