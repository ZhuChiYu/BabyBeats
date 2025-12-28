/**
 * WS/T 423-2022 男童头围-年龄标准数据（0-36月龄）
 * 数据来源：国家卫健委 WS/T 423-2022 标准
 * 单位：cm
 */

import { SDPoint } from './types';

export const WST423_2022_MALE_HEAD_FOR_AGE: SDPoint[] = [
  { x: 0, SD_neg3: 30.4, SD_neg2: 31.7, SD_neg1: 33.0, SD0: 34.3, SD_pos1: 35.6, SD_pos2: 36.9, SD_pos3: 38.3 },
  { x: 1, SD_neg3: 33.4, SD_neg2: 34.6, SD_neg1: 35.8, SD0: 37.0, SD_pos1: 38.2, SD_pos2: 39.4, SD_pos3: 40.6 },
  { x: 2, SD_neg3: 35.7, SD_neg2: 36.8, SD_neg1: 37.9, SD0: 39.1, SD_pos1: 40.2, SD_pos2: 41.4, SD_pos3: 42.6 },
  { x: 3, SD_neg3: 37.1, SD_neg2: 38.2, SD_neg1: 39.3, SD0: 40.5, SD_pos1: 41.6, SD_pos2: 42.8, SD_pos3: 44.1 },
  { x: 4, SD_neg3: 38.1, SD_neg2: 39.3, SD_neg1: 40.4, SD0: 41.6, SD_pos1: 42.8, SD_pos2: 44.0, SD_pos3: 45.3 },
  { x: 5, SD_neg3: 39.0, SD_neg2: 40.2, SD_neg1: 41.3, SD0: 42.5, SD_pos1: 43.8, SD_pos2: 45.0, SD_pos3: 46.3 },
  { x: 6, SD_neg3: 39.8, SD_neg2: 41.0, SD_neg1: 42.1, SD0: 43.4, SD_pos1: 44.6, SD_pos2: 45.9, SD_pos3: 47.2 },
  { x: 7, SD_neg3: 40.5, SD_neg2: 41.7, SD_neg1: 42.8, SD0: 44.0, SD_pos1: 45.3, SD_pos2: 46.6, SD_pos3: 47.9 },
  { x: 8, SD_neg3: 41.1, SD_neg2: 42.2, SD_neg1: 43.4, SD0: 44.6, SD_pos1: 45.9, SD_pos2: 47.2, SD_pos3: 48.5 },
  { x: 9, SD_neg3: 41.5, SD_neg2: 42.7, SD_neg1: 43.9, SD0: 45.1, SD_pos1: 46.4, SD_pos2: 47.7, SD_pos3: 49.0 },
  { x: 10, SD_neg3: 41.9, SD_neg2: 43.1, SD_neg1: 44.3, SD0: 45.5, SD_pos1: 46.8, SD_pos2: 48.1, SD_pos3: 49.4 },
  { x: 11, SD_neg3: 42.3, SD_neg2: 43.4, SD_neg1: 44.6, SD0: 45.8, SD_pos1: 47.1, SD_pos2: 48.4, SD_pos3: 49.8 },
  { x: 12, SD_neg3: 42.5, SD_neg2: 43.7, SD_neg1: 44.9, SD0: 46.1, SD_pos1: 47.4, SD_pos2: 48.7, SD_pos3: 50.1 },
  { x: 13, SD_neg3: 42.8, SD_neg2: 44.0, SD_neg1: 45.1, SD0: 46.4, SD_pos1: 47.7, SD_pos2: 49.0, SD_pos3: 50.3 },
  { x: 14, SD_neg3: 43.0, SD_neg2: 44.2, SD_neg1: 45.4, SD0: 46.6, SD_pos1: 47.9, SD_pos2: 49.2, SD_pos3: 50.6 },
  { x: 15, SD_neg3: 43.2, SD_neg2: 44.4, SD_neg1: 45.6, SD0: 46.8, SD_pos1: 48.1, SD_pos2: 49.4, SD_pos3: 50.8 },
  { x: 16, SD_neg3: 43.4, SD_neg2: 44.6, SD_neg1: 45.8, SD0: 47.0, SD_pos1: 48.3, SD_pos2: 49.6, SD_pos3: 51.0 },
  { x: 17, SD_neg3: 43.6, SD_neg2: 44.7, SD_neg1: 45.9, SD0: 47.2, SD_pos1: 48.5, SD_pos2: 49.8, SD_pos3: 51.2 },
  { x: 18, SD_neg3: 43.8, SD_neg2: 44.9, SD_neg1: 46.1, SD0: 47.4, SD_pos1: 48.7, SD_pos2: 50.0, SD_pos3: 51.4 },
  { x: 19, SD_neg3: 43.9, SD_neg2: 45.1, SD_neg1: 46.3, SD0: 47.5, SD_pos1: 48.8, SD_pos2: 50.2, SD_pos3: 51.6 },
  { x: 20, SD_neg3: 44.1, SD_neg2: 45.3, SD_neg1: 46.5, SD0: 47.7, SD_pos1: 49.0, SD_pos2: 50.4, SD_pos3: 51.7 },
  { x: 21, SD_neg3: 44.3, SD_neg2: 45.4, SD_neg1: 46.6, SD0: 47.9, SD_pos1: 49.2, SD_pos2: 50.5, SD_pos3: 51.9 },
  { x: 22, SD_neg3: 44.4, SD_neg2: 45.6, SD_neg1: 46.8, SD0: 48.1, SD_pos1: 49.4, SD_pos2: 50.7, SD_pos3: 52.1 },
  { x: 23, SD_neg3: 44.6, SD_neg2: 45.7, SD_neg1: 47.0, SD0: 48.2, SD_pos1: 49.5, SD_pos2: 50.9, SD_pos3: 52.3 },
  { x: 24, SD_neg3: 44.7, SD_neg2: 45.9, SD_neg1: 47.1, SD0: 48.3, SD_pos1: 49.6, SD_pos2: 51.0, SD_pos3: 52.4 },
  { x: 27, SD_neg3: 45.0, SD_neg2: 46.2, SD_neg1: 47.4, SD0: 48.7, SD_pos1: 50.0, SD_pos2: 51.3, SD_pos3: 52.7 },
  { x: 30, SD_neg3: 45.3, SD_neg2: 46.4, SD_neg1: 47.7, SD0: 48.9, SD_pos1: 50.3, SD_pos2: 51.6, SD_pos3: 53.0 },
  { x: 33, SD_neg3: 45.5, SD_neg2: 46.7, SD_neg1: 47.9, SD0: 49.2, SD_pos1: 50.5, SD_pos2: 51.9, SD_pos3: 53.3 },
  { x: 36, SD_neg3: 45.7, SD_neg2: 46.8, SD_neg1: 48.1, SD0: 49.3, SD_pos1: 50.7, SD_pos2: 52.1, SD_pos3: 53.5 },
];
