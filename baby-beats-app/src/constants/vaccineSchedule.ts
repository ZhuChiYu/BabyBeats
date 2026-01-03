/**
 * 中国儿童疫苗接种程序表
 * 基于国家免疫规划和非免疫规划疫苗接种指南
 */

export interface VaccineInfo {
  name: string;
  doses: number; // 第几剂
  isFree: boolean; // 是否免费（免疫规划）
  price?: number; // 参考价格（自费）
  alternativeTo?: string; // 替代方案说明
  replaces?: string[]; // 可替代的疫苗名称列表
  replacedBy?: string[]; // 可被哪些疫苗替代
  note?: string; // 特殊说明
}

export interface VaccineSchedulePoint {
  ageLabel: string; // 如 "出生24小时", "满月", "2月龄", "3月龄(体检)"
  ageMonths: number; // 月龄（用于计算）
  ageDays?: number; // 特殊情况用天数（如"出生24小时"=1天）
  isCheckup?: boolean; // 是否体检节点
  freeVaccines: VaccineInfo[]; // 免疫规划（免费）疫苗
  paidVaccines: VaccineInfo[]; // 非免疫规划（自费）疫苗
}

export const VACCINE_SCHEDULE: VaccineSchedulePoint[] = [
  // 0-1岁
  {
    ageLabel: '出生24小时',
    ageMonths: 0,
    ageDays: 1,
    freeVaccines: [
      { name: '卡介苗', doses: 1, isFree: true, note: '预防结核病' },
      { name: '乙肝', doses: 1, isFree: true },
    ],
    paidVaccines: [],
  },
  {
    ageLabel: '满月（体检）',
    ageMonths: 1,
    isCheckup: true,
    freeVaccines: [
      { name: '乙肝', doses: 2, isFree: true },
    ],
    paidVaccines: [],
  },
  {
    ageLabel: '42天',
    ageMonths: 1.5,
    freeVaccines: [],
    paidVaccines: [
      { name: '口服五价轮状', doses: 1, isFree: false, price: 314 },
    ],
  },
  {
    ageLabel: '2月龄',
    ageMonths: 2,
    freeVaccines: [
      { name: '百白破', doses: 1, isFree: true, replacedBy: ['五联'] },
      { name: '灭活脊灰', doses: 1, isFree: true, replacedBy: ['五联', '自费灭活脊灰'] },
    ],
    paidVaccines: [
      { name: '五联', doses: 1, isFree: false, price: 631, 
        alternativeTo: '可替代百白破+灭活脊灰+Hib',
        replaces: ['百白破', '灭活脊灰', 'Hib'] },
      { name: '麻腮风', doses: 2, isFree: false, price: 144 },
      { name: '甲肝减毒', doses: 1, isFree: false, price: 174 },
    ],
  },
  {
    ageLabel: '2.5月龄',
    ageMonths: 2.5,
    freeVaccines: [
      { name: '13价肺炎链球菌', doses: 1, isFree: true },
    ],
    paidVaccines: [
      { name: 'Hib', doses: 1, isFree: false, price: 144, replacedBy: ['五联'] },
      { name: '乙脑', doses: 2, isFree: false, price: 174 },
      { name: '口服五价轮状', doses: 1, isFree: false, price: 314 },
    ],
  },
  {
    ageLabel: '3月龄（体检）',
    ageMonths: 3,
    isCheckup: true,
    freeVaccines: [
      { name: '灭活脊灰', doses: 2, isFree: true, replacedBy: ['五联', '自费灭活脊灰'] },
    ],
    paidVaccines: [
      { name: '五联', doses: 2, isFree: false, price: 631, 
        alternativeTo: '可替代百白破+灭活脊灰+Hib',
        replaces: ['百白破', '灭活脊灰', 'Hib'] },
      { name: '13价肺炎链球菌', doses: 2, isFree: false, price: 634 },
      { name: '单价轮状', doses: 1, isFree: false, price: 208 },
    ],
  },
  {
    ageLabel: '3.5月龄',
    ageMonths: 3.5,
    freeVaccines: [
      { name: '口服五价轮状', doses: 3, isFree: true },
    ],
    paidVaccines: [
      { name: 'Hib', doses: 2, isFree: false, price: 144, replacedBy: ['五联'] },
      { name: '流脑AC结合', doses: 1, isFree: false, price: 152, 
        replaces: ['流脑A群'],
        note: '可替代流脑A群疫苗' },
      { name: '流脑ACYW135', doses: 1, isFree: false, price: 152, 
        replaces: ['流脑A群', '流脑A+C多糖'],
        note: '可替代流脑A群和A+C多糖疫苗' },
    ],
  },
  {
    ageLabel: '4月龄',
    ageMonths: 4,
    freeVaccines: [
      { name: '百白破', doses: 2, isFree: true, replacedBy: ['五联'] },
      { name: '口服脊灰', doses: 3, isFree: true, replacedBy: ['五联', '自费灭活脊灰'] },
    ],
    paidVaccines: [
      { name: '五联', doses: 3, isFree: false, price: 631,
        alternativeTo: '可替代百白破+口服脊灰+Hib',
        replaces: ['百白破', '口服脊灰', 'Hib'] },
      { name: '流脑AC结合', doses: 1, isFree: false, price: 144,
        replaces: ['流脑A群'] },
      { name: '自费灭活脊灰', doses: 1, isFree: false, price: 188, 
        replaces: ['口服脊灰'],
        note: '全程灭活脊灰方案，替代口服脊灰' },
    ],
  },
  {
    ageLabel: '4.5月龄',
    ageMonths: 4.5,
    freeVaccines: [
      { name: '13价肺炎链球菌', doses: 3, isFree: true },
    ],
    paidVaccines: [
      { name: 'Hib', doses: 3, isFree: false, price: 144, replacedBy: ['五联'] },
    ],
  },
  {
    ageLabel: '5月龄',
    ageMonths: 5,
    freeVaccines: [
      { name: '流脑AC结合', doses: 2, isFree: true },
    ],
    paidVaccines: [
      { name: '二价hpv', doses: 1, isFree: false, price: 611 },
      { name: '四价hpv', doses: 1, isFree: false, price: 831 },
    ],
  },
  {
    ageLabel: '6月龄（体检）',
    ageMonths: 6,
    isCheckup: true,
    freeVaccines: [
      { name: '乙肝', doses: 3, isFree: true },
      { name: '百白破', doses: 3, isFree: true, replacedBy: ['五联'] },
    ],
    paidVaccines: [
      { name: '九价hpv', doses: 1, isFree: false, price: 1331 },
      { name: '流脑A群', doses: 1, isFree: false, price: 50, 
        replacedBy: ['流脑AC结合', '流脑ACYW135'],
        note: '若选了AC结合或ACYW135，不需再打A群' },
    ],
  },
  {
    ageLabel: '7.5月龄',
    ageMonths: 7.5,
    freeVaccines: [
      { name: '流脑AC结合', doses: 3, isFree: true },
    ],
    paidVaccines: [
      { name: 'EV71', doses: 1, isFree: false, price: 224, note: '手足口疫苗' },
    ],
  },
  {
    ageLabel: '8月龄（体检）',
    ageMonths: 8,
    isCheckup: true,
    freeVaccines: [
      { name: '麻腮风', doses: 1, isFree: true },
      { name: '乙脑', doses: 1, isFree: true },
    ],
    paidVaccines: [
      { name: 'EV71', doses: 2, isFree: false, price: 224 },
    ],
  },
  {
    ageLabel: '9月龄',
    ageMonths: 9,
    freeVaccines: [
      { name: '流脑A群', doses: 2, isFree: true, 
        replacedBy: ['流脑AC结合', '流脑ACYW135'],
        note: '若选了AC结合或ACYW135，不需再打' },
    ],
    paidVaccines: [],
  },
  // 1-3岁
  {
    ageLabel: '1岁',
    ageMonths: 12,
    freeVaccines: [
      { name: '水痘', doses: 1, isFree: true },
    ],
    paidVaccines: [
      { name: 'Hib', doses: 4, isFree: false, price: 144, replacedBy: ['五联'] },
      { name: '13价肺炎链球菌', doses: 4, isFree: false, price: 634 },
    ],
  },
  {
    ageLabel: '1岁半（体检）',
    ageMonths: 18,
    isCheckup: true,
    freeVaccines: [
      { name: '麻腮风', doses: 2, isFree: true },
      { name: '甲肝减毒', doses: 1, isFree: true, replacedBy: ['甲肝灭活'] },
      { name: '百白破', doses: 4, isFree: true, replacedBy: ['五联'] },
    ],
    paidVaccines: [
      { name: '五联', doses: 4, isFree: false, price: 631,
        replaces: ['百白破', 'Hib'] },
      { name: 'Hib', doses: 4, isFree: false, price: 144, replacedBy: ['五联'] },
      { name: '甲肝灭活', doses: 1, isFree: false, price: 174,
        replaces: ['甲肝减毒'] },
    ],
  },
  {
    ageLabel: '2岁（体检）',
    ageMonths: 24,
    isCheckup: true,
    freeVaccines: [
      { name: '乙脑', doses: 2, isFree: true },
    ],
    paidVaccines: [
      { name: '23价肺炎链球菌', doses: 1, isFree: false, price: 221 },
      { name: '单价轮状', doses: 3, isFree: false, price: 208 },
    ],
  },
  {
    ageLabel: '2岁2月后',
    ageMonths: 26,
    freeVaccines: [
      { name: '13价肺炎链球菌', doses: 2, isFree: true },
    ],
    paidVaccines: [],
  },
  {
    ageLabel: '2岁半（体检）',
    ageMonths: 30,
    isCheckup: true,
    freeVaccines: [
      { name: '口服五价轮状', doses: 3, isFree: true },
    ],
    paidVaccines: [
      { name: '甲肝灭活', doses: 2, isFree: false, price: 174,
        replaces: ['甲肝减毒'] },
    ],
  },
  {
    ageLabel: '3岁（体检）',
    ageMonths: 36,
    isCheckup: true,
    freeVaccines: [
      { name: '流脑A+C多糖', doses: 1, isFree: true,
        replacedBy: ['流脑ACYW135'] },
    ],
    paidVaccines: [
      { name: '流脑ACYW135', doses: 1, isFree: false, price: 152,
        replaces: ['流脑A+C多糖'] },
    ],
  },
  // 4-6岁
  {
    ageLabel: '4岁',
    ageMonths: 48,
    freeVaccines: [
      { name: '口服脊灰', doses: 4, isFree: true,
        replacedBy: ['自费灭活脊灰'],
        note: '若选择全程灭活脊灰方案则不打' },
      { name: '水痘', doses: 2, isFree: true },
    ],
    paidVaccines: [],
  },
  {
    ageLabel: '6岁',
    ageMonths: 72,
    freeVaccines: [
      { name: '流脑A+C多糖', doses: 2, isFree: true,
        replacedBy: ['流脑ACYW135'] },
      { name: '百白破', doses: 5, isFree: true },
    ],
    paidVaccines: [
      { name: '流脑ACYW135', doses: 2, isFree: false, price: 152,
        replaces: ['流脑A+C多糖'] },
    ],
  },
  // 青少年
  {
    ageLabel: '9岁以上',
    ageMonths: 108,
    freeVaccines: [],
    paidVaccines: [
      { name: '二价hpv', doses: 1, isFree: false, price: 611 },
      { name: '四价hpv', doses: 1, isFree: false, price: 831 },
      { name: '九价hpv', doses: 1, isFree: false, price: 1331 },
    ],
  },
  {
    ageLabel: '16-26岁',
    ageMonths: 192,
    freeVaccines: [],
    paidVaccines: [
      { name: '九价hpv', doses: 1, isFree: false, price: 1331 },
    ],
  },
  {
    ageLabel: '50岁以上',
    ageMonths: 600,
    freeVaccines: [],
    paidVaccines: [
      { name: '带状疱疹疫苗', doses: 1, isFree: false, price: 1619 },
    ],
  },
];

/**
 * 根据宝宝月龄获取推荐接种的疫苗
 */
export function getRecommendedVaccinesByAge(ageInMonths: number): VaccineSchedulePoint[] {
  return VACCINE_SCHEDULE.filter(schedule => {
    const scheduleAge = schedule.ageDays ? schedule.ageDays / 30 : schedule.ageMonths;
    return scheduleAge >= ageInMonths && scheduleAge <= ageInMonths + 6;
  });
}

/**
 * 根据宝宝月龄获取即将到期的疫苗
 */
export function getUpcomingVaccines(ageInMonths: number): VaccineSchedulePoint[] {
  return VACCINE_SCHEDULE.filter(schedule => {
    const scheduleAge = schedule.ageDays ? schedule.ageDays / 30 : schedule.ageMonths;
    return scheduleAge >= ageInMonths && scheduleAge <= ageInMonths + 1;
  });
}

/**
 * 获取所有唯一的疫苗名称列表（用于选择器）
 */
export function getAllVaccineNames(): string[] {
  const names = new Set<string>();
  VACCINE_SCHEDULE.forEach(schedule => {
    schedule.freeVaccines.forEach(v => names.add(v.name));
    schedule.paidVaccines.forEach(v => names.add(v.name));
  });
  return Array.from(names).sort();
}

