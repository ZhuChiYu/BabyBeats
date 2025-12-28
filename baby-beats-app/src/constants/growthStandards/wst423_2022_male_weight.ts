/**
 * WS/T 423-2022 男童体重-年龄标准数据（0-84月龄）
 * 数据来源：国家卫健委 WS/T 423-2022 标准
 * 单位：kg
 */

import { SDPoint } from './types';

export const WST423_2022_MALE_WEIGHT_FOR_AGE: SDPoint[] = [
  { x: 0, SD_neg3: 2.4, SD_neg2: 2.7, SD_neg1: 3.1, SD0: 3.5, SD_pos1: 3.9, SD_pos2: 4.3, SD_pos3: 4.7 },
  { x: 1, SD_neg3: 3.2, SD_neg2: 3.6, SD_neg1: 4.1, SD0: 4.6, SD_pos1: 5.1, SD_pos2: 5.6, SD_pos3: 6.2 },
  { x: 2, SD_neg3: 4.1, SD_neg2: 4.6, SD_neg1: 5.2, SD0: 5.8, SD_pos1: 6.5, SD_pos2: 7.2, SD_pos3: 8.0 },
  { x: 3, SD_neg3: 4.9, SD_neg2: 5.5, SD_neg1: 6.1, SD0: 6.8, SD_pos1: 7.6, SD_pos2: 8.4, SD_pos3: 9.3 },
  { x: 4, SD_neg3: 5.4, SD_neg2: 6.0, SD_neg1: 6.7, SD0: 7.5, SD_pos1: 8.3, SD_pos2: 9.3, SD_pos3: 10.3 },
  { x: 5, SD_neg3: 5.8, SD_neg2: 6.5, SD_neg1: 7.2, SD0: 8.0, SD_pos1: 8.9, SD_pos2: 9.9, SD_pos3: 11.1 },
  { x: 6, SD_neg3: 6.1, SD_neg2: 6.8, SD_neg1: 7.6, SD0: 8.4, SD_pos1: 9.4, SD_pos2: 10.5, SD_pos3: 11.7 },
  { x: 7, SD_neg3: 6.4, SD_neg2: 7.1, SD_neg1: 7.9, SD0: 8.8, SD_pos1: 9.8, SD_pos2: 10.9, SD_pos3: 12.1 },
  { x: 8, SD_neg3: 6.7, SD_neg2: 7.4, SD_neg1: 8.2, SD0: 9.1, SD_pos1: 10.1, SD_pos2: 11.3, SD_pos3: 12.6 },
  { x: 9, SD_neg3: 6.9, SD_neg2: 7.6, SD_neg1: 8.4, SD0: 9.4, SD_pos1: 10.4, SD_pos2: 11.6, SD_pos3: 12.9 },
  { x: 10, SD_neg3: 7.1, SD_neg2: 7.8, SD_neg1: 8.7, SD0: 9.6, SD_pos1: 10.7, SD_pos2: 11.9, SD_pos3: 13.3 },
  { x: 11, SD_neg3: 7.2, SD_neg2: 8.0, SD_neg1: 8.9, SD0: 9.8, SD_pos1: 10.9, SD_pos2: 12.2, SD_pos3: 13.6 },
  { x: 12, SD_neg3: 7.4, SD_neg2: 8.2, SD_neg1: 9.1, SD0: 10.1, SD_pos1: 11.2, SD_pos2: 12.4, SD_pos3: 13.9 },
  { x: 13, SD_neg3: 7.5, SD_neg2: 8.3, SD_neg1: 9.2, SD0: 10.3, SD_pos1: 11.4, SD_pos2: 12.7, SD_pos3: 14.1 },
  { x: 14, SD_neg3: 7.7, SD_neg2: 8.5, SD_neg1: 9.4, SD0: 10.5, SD_pos1: 11.6, SD_pos2: 12.9, SD_pos3: 14.4 },
  { x: 15, SD_neg3: 7.8, SD_neg2: 8.7, SD_neg1: 9.6, SD0: 10.7, SD_pos1: 11.8, SD_pos2: 13.2, SD_pos3: 14.7 },
  { x: 16, SD_neg3: 8.0, SD_neg2: 8.8, SD_neg1: 9.8, SD0: 10.9, SD_pos1: 12.1, SD_pos2: 13.4, SD_pos3: 15.0 },
  { x: 17, SD_neg3: 8.2, SD_neg2: 9.0, SD_neg1: 10.0, SD0: 11.1, SD_pos1: 12.3, SD_pos2: 13.7, SD_pos3: 15.3 },
  { x: 18, SD_neg3: 8.3, SD_neg2: 9.2, SD_neg1: 10.2, SD0: 11.3, SD_pos1: 12.5, SD_pos2: 14.0, SD_pos3: 15.6 },
  { x: 19, SD_neg3: 8.5, SD_neg2: 9.4, SD_neg1: 10.4, SD0: 11.5, SD_pos1: 12.8, SD_pos2: 14.2, SD_pos3: 15.9 },
  { x: 20, SD_neg3: 8.6, SD_neg2: 9.5, SD_neg1: 10.6, SD0: 11.7, SD_pos1: 13.0, SD_pos2: 14.5, SD_pos3: 16.2 },
  { x: 21, SD_neg3: 8.8, SD_neg2: 9.7, SD_neg1: 10.8, SD0: 11.9, SD_pos1: 13.3, SD_pos2: 14.8, SD_pos3: 16.5 },
  { x: 22, SD_neg3: 9.0, SD_neg2: 9.9, SD_neg1: 11.0, SD0: 12.2, SD_pos1: 13.5, SD_pos2: 15.0, SD_pos3: 16.8 },
  { x: 23, SD_neg3: 9.1, SD_neg2: 10.1, SD_neg1: 11.1, SD0: 12.4, SD_pos1: 13.7, SD_pos2: 15.3, SD_pos3: 17.1 },
  { x: 24, SD_neg3: 9.3, SD_neg2: 10.2, SD_neg1: 11.3, SD0: 12.6, SD_pos1: 14.0, SD_pos2: 15.6, SD_pos3: 17.4 },
  { x: 27, SD_neg3: 9.7, SD_neg2: 10.7, SD_neg1: 11.8, SD0: 13.1, SD_pos1: 14.6, SD_pos2: 16.3, SD_pos3: 18.2 },
  { x: 30, SD_neg3: 10.1, SD_neg2: 11.1, SD_neg1: 12.3, SD0: 13.7, SD_pos1: 15.2, SD_pos2: 17.0, SD_pos3: 19.0 },
  { x: 33, SD_neg3: 10.4, SD_neg2: 11.5, SD_neg1: 12.7, SD0: 14.2, SD_pos1: 15.8, SD_pos2: 17.6, SD_pos3: 19.8 },
  { x: 36, SD_neg3: 10.8, SD_neg2: 11.9, SD_neg1: 13.2, SD0: 14.6, SD_pos1: 16.3, SD_pos2: 18.3, SD_pos3: 20.5 },
  { x: 39, SD_neg3: 11.1, SD_neg2: 12.3, SD_neg1: 13.6, SD0: 15.2, SD_pos1: 16.9, SD_pos2: 19.0, SD_pos3: 21.3 },
  { x: 42, SD_neg3: 11.5, SD_neg2: 12.7, SD_neg1: 14.1, SD0: 15.7, SD_pos1: 17.5, SD_pos2: 19.7, SD_pos3: 22.2 },
  { x: 45, SD_neg3: 11.8, SD_neg2: 13.1, SD_neg1: 14.5, SD0: 16.2, SD_pos1: 18.1, SD_pos2: 20.4, SD_pos3: 23.0 },
  { x: 48, SD_neg3: 12.2, SD_neg2: 13.5, SD_neg1: 15.0, SD0: 16.7, SD_pos1: 18.8, SD_pos2: 21.1, SD_pos3: 23.9 },
  { x: 51, SD_neg3: 12.5, SD_neg2: 13.9, SD_neg1: 15.5, SD0: 17.3, SD_pos1: 19.4, SD_pos2: 21.9, SD_pos3: 24.9 },
  { x: 54, SD_neg3: 12.8, SD_neg2: 14.3, SD_neg1: 15.9, SD0: 17.9, SD_pos1: 20.1, SD_pos2: 22.7, SD_pos3: 25.9 },
  { x: 57, SD_neg3: 13.2, SD_neg2: 14.7, SD_neg1: 16.4, SD0: 18.4, SD_pos1: 20.8, SD_pos2: 23.6, SD_pos3: 27.0 },
  { x: 60, SD_neg3: 13.6, SD_neg2: 15.1, SD_neg1: 16.9, SD0: 19.1, SD_pos1: 21.6, SD_pos2: 24.5, SD_pos3: 28.1 },
  { x: 63, SD_neg3: 13.9, SD_neg2: 15.6, SD_neg1: 17.5, SD0: 19.7, SD_pos1: 22.3, SD_pos2: 25.5, SD_pos3: 29.3 },
  { x: 66, SD_neg3: 14.3, SD_neg2: 16.0, SD_neg1: 18.0, SD0: 20.3, SD_pos1: 23.1, SD_pos2: 26.4, SD_pos3: 30.5 },
  { x: 69, SD_neg3: 14.6, SD_neg2: 16.4, SD_neg1: 18.5, SD0: 21.0, SD_pos1: 23.9, SD_pos2: 27.4, SD_pos3: 31.7 },
  { x: 72, SD_neg3: 14.9, SD_neg2: 16.8, SD_neg1: 19.0, SD0: 21.6, SD_pos1: 24.7, SD_pos2: 28.4, SD_pos3: 32.9 },
  { x: 75, SD_neg3: 15.3, SD_neg2: 17.2, SD_neg1: 19.5, SD0: 22.2, SD_pos1: 25.5, SD_pos2: 29.4, SD_pos3: 34.1 },
  { x: 78, SD_neg3: 15.5, SD_neg2: 17.6, SD_neg1: 20.0, SD0: 22.8, SD_pos1: 26.2, SD_pos2: 30.3, SD_pos3: 35.3 },
  { x: 81, SD_neg3: 15.8, SD_neg2: 17.9, SD_neg1: 20.4, SD0: 23.4, SD_pos1: 26.9, SD_pos2: 31.2, SD_pos3: 36.4 },
];
