/**
 * WS/T 423-2022 女童体重-年龄标准数据（0-84月龄）
 * 数据来源：国家卫健委 WS/T 423-2022 标准
 * 单位：kg
 */

import { SDPoint } from './types';

export const WST423_2022_FEMALE_WEIGHT_FOR_AGE: SDPoint[] = [
  { x: 0, SD_neg3: 2.3, SD_neg2: 2.6, SD_neg1: 3.0, SD0: 3.3, SD_pos1: 3.7, SD_pos2: 4.1, SD_pos3: 4.6 },
  { x: 1, SD_neg3: 3.0, SD_neg2: 3.4, SD_neg1: 3.8, SD0: 4.3, SD_pos1: 4.8, SD_pos2: 5.3, SD_pos3: 5.9 },
  { x: 2, SD_neg3: 3.8, SD_neg2: 4.3, SD_neg1: 4.8, SD0: 5.4, SD_pos1: 6.0, SD_pos2: 6.7, SD_pos3: 7.4 },
  { x: 3, SD_neg3: 4.5, SD_neg2: 5.0, SD_neg1: 5.6, SD0: 6.2, SD_pos1: 6.9, SD_pos2: 7.7, SD_pos3: 8.6 },
  { x: 4, SD_neg3: 5.0, SD_neg2: 5.5, SD_neg1: 6.2, SD0: 6.9, SD_pos1: 7.7, SD_pos2: 8.6, SD_pos3: 9.6 },
  { x: 5, SD_neg3: 5.4, SD_neg2: 6.0, SD_neg1: 6.6, SD0: 7.4, SD_pos1: 8.2, SD_pos2: 9.2, SD_pos3: 10.3 },
  { x: 6, SD_neg3: 5.7, SD_neg2: 6.3, SD_neg1: 7.0, SD0: 7.8, SD_pos1: 8.7, SD_pos2: 9.7, SD_pos3: 10.9 },
  { x: 7, SD_neg3: 6.0, SD_neg2: 6.6, SD_neg1: 7.3, SD0: 8.1, SD_pos1: 9.1, SD_pos2: 10.2, SD_pos3: 11.5 },
  { x: 8, SD_neg3: 6.2, SD_neg2: 6.9, SD_neg1: 7.6, SD0: 8.4, SD_pos1: 9.4, SD_pos2: 10.6, SD_pos3: 11.9 },
  { x: 9, SD_neg3: 6.4, SD_neg2: 7.1, SD_neg1: 7.8, SD0: 8.7, SD_pos1: 9.7, SD_pos2: 10.9, SD_pos3: 12.3 },
  { x: 10, SD_neg3: 6.6, SD_neg2: 7.3, SD_neg1: 8.1, SD0: 9.0, SD_pos1: 10.0, SD_pos2: 11.2, SD_pos3: 12.7 },
  { x: 11, SD_neg3: 6.8, SD_neg2: 7.5, SD_neg1: 8.3, SD0: 9.2, SD_pos1: 10.3, SD_pos2: 11.5, SD_pos3: 13.0 },
  { x: 12, SD_neg3: 6.9, SD_neg2: 7.7, SD_neg1: 8.5, SD0: 9.4, SD_pos1: 10.5, SD_pos2: 11.8, SD_pos3: 13.3 },
  { x: 13, SD_neg3: 7.1, SD_neg2: 7.8, SD_neg1: 8.7, SD0: 9.6, SD_pos1: 10.7, SD_pos2: 12.1, SD_pos3: 13.6 },
  { x: 14, SD_neg3: 7.3, SD_neg2: 8.0, SD_neg1: 8.8, SD0: 9.8, SD_pos1: 11.0, SD_pos2: 12.3, SD_pos3: 13.9 },
  { x: 15, SD_neg3: 7.4, SD_neg2: 8.2, SD_neg1: 9.0, SD0: 10.0, SD_pos1: 11.2, SD_pos2: 12.6, SD_pos3: 14.2 },
  { x: 16, SD_neg3: 7.6, SD_neg2: 8.3, SD_neg1: 9.2, SD0: 10.3, SD_pos1: 11.5, SD_pos2: 12.9, SD_pos3: 14.5 },
  { x: 17, SD_neg3: 7.7, SD_neg2: 8.5, SD_neg1: 9.4, SD0: 10.5, SD_pos1: 11.7, SD_pos2: 13.1, SD_pos3: 14.9 },
  { x: 18, SD_neg3: 7.9, SD_neg2: 8.7, SD_neg1: 9.6, SD0: 10.7, SD_pos1: 11.9, SD_pos2: 13.4, SD_pos3: 15.2 },
  { x: 19, SD_neg3: 8.1, SD_neg2: 8.9, SD_neg1: 9.8, SD0: 10.9, SD_pos1: 12.2, SD_pos2: 13.7, SD_pos3: 15.5 },
  { x: 20, SD_neg3: 8.2, SD_neg2: 9.0, SD_neg1: 10.0, SD0: 11.1, SD_pos1: 12.4, SD_pos2: 13.9, SD_pos3: 15.8 },
  { x: 21, SD_neg3: 8.4, SD_neg2: 9.2, SD_neg1: 10.2, SD0: 11.3, SD_pos1: 12.6, SD_pos2: 14.2, SD_pos3: 16.1 },
  { x: 22, SD_neg3: 8.5, SD_neg2: 9.4, SD_neg1: 10.4, SD0: 11.5, SD_pos1: 12.9, SD_pos2: 14.5, SD_pos3: 16.4 },
  { x: 23, SD_neg3: 8.7, SD_neg2: 9.5, SD_neg1: 10.6, SD0: 11.7, SD_pos1: 13.1, SD_pos2: 14.8, SD_pos3: 16.7 },
  { x: 24, SD_neg3: 8.8, SD_neg2: 9.7, SD_neg1: 10.7, SD0: 11.9, SD_pos1: 13.3, SD_pos2: 15.0, SD_pos3: 17.0 },
  { x: 27, SD_neg3: 9.2, SD_neg2: 10.1, SD_neg1: 11.2, SD0: 12.5, SD_pos1: 14.0, SD_pos2: 15.8, SD_pos3: 17.9 },
  { x: 30, SD_neg3: 9.6, SD_neg2: 10.6, SD_neg1: 11.7, SD0: 13.0, SD_pos1: 14.6, SD_pos2: 16.5, SD_pos3: 18.7 },
  { x: 33, SD_neg3: 10.0, SD_neg2: 11.0, SD_neg1: 12.2, SD0: 13.6, SD_pos1: 15.2, SD_pos2: 17.2, SD_pos3: 19.6 },
  { x: 36, SD_neg3: 10.3, SD_neg2: 11.4, SD_neg1: 12.6, SD0: 14.1, SD_pos1: 15.9, SD_pos2: 17.9, SD_pos3: 20.5 },
  { x: 39, SD_neg3: 10.7, SD_neg2: 11.8, SD_neg1: 13.1, SD0: 14.7, SD_pos1: 16.5, SD_pos2: 18.7, SD_pos3: 21.3 },
  { x: 42, SD_neg3: 11.1, SD_neg2: 12.2, SD_neg1: 13.6, SD0: 15.2, SD_pos1: 17.1, SD_pos2: 19.4, SD_pos3: 22.2 },
  { x: 45, SD_neg3: 11.4, SD_neg2: 12.6, SD_neg1: 14.0, SD0: 15.7, SD_pos1: 17.7, SD_pos2: 20.1, SD_pos3: 23.0 },
  { x: 48, SD_neg3: 11.7, SD_neg2: 13.0, SD_neg1: 14.5, SD0: 16.2, SD_pos1: 18.3, SD_pos2: 20.8, SD_pos3: 23.8 },
  { x: 51, SD_neg3: 12.0, SD_neg2: 13.3, SD_neg1: 14.9, SD0: 16.7, SD_pos1: 18.9, SD_pos2: 21.5, SD_pos3: 24.6 },
  { x: 54, SD_neg3: 12.3, SD_neg2: 13.7, SD_neg1: 15.3, SD0: 17.2, SD_pos1: 19.5, SD_pos2: 22.2, SD_pos3: 25.5 },
  { x: 57, SD_neg3: 12.7, SD_neg2: 14.1, SD_neg1: 15.8, SD0: 17.8, SD_pos1: 20.2, SD_pos2: 23.0, SD_pos3: 26.4 },
  { x: 60, SD_neg3: 13.0, SD_neg2: 14.5, SD_neg1: 16.3, SD0: 18.4, SD_pos1: 20.9, SD_pos2: 23.8, SD_pos3: 27.4 },
  { x: 63, SD_neg3: 13.3, SD_neg2: 14.9, SD_neg1: 16.8, SD0: 19.0, SD_pos1: 21.6, SD_pos2: 24.7, SD_pos3: 28.4 },
  { x: 66, SD_neg3: 13.7, SD_neg2: 15.3, SD_neg1: 17.3, SD0: 19.6, SD_pos1: 22.3, SD_pos2: 25.5, SD_pos3: 29.5 },
  { x: 69, SD_neg3: 14.0, SD_neg2: 15.7, SD_neg1: 17.8, SD0: 20.2, SD_pos1: 23.0, SD_pos2: 26.4, SD_pos3: 30.5 },
  { x: 72, SD_neg3: 14.3, SD_neg2: 16.1, SD_neg1: 18.2, SD0: 20.7, SD_pos1: 23.7, SD_pos2: 27.3, SD_pos3: 31.5 },
  { x: 75, SD_neg3: 14.5, SD_neg2: 16.4, SD_neg1: 18.7, SD0: 21.3, SD_pos1: 24.4, SD_pos2: 28.1, SD_pos3: 32.6 },
  { x: 78, SD_neg3: 14.8, SD_neg2: 16.8, SD_neg1: 19.1, SD0: 21.8, SD_pos1: 25.1, SD_pos2: 28.9, SD_pos3: 33.6 },
  { x: 81, SD_neg3: 15.0, SD_neg2: 17.1, SD_neg1: 19.5, SD0: 22.4, SD_pos1: 25.8, SD_pos2: 29.8, SD_pos3: 34.6 },
];
