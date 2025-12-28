/**
 * WS/T 423-2022 男童身长/身高-年龄标准数据（0-84月龄）
 * 数据来源：国家卫健委 WS/T 423-2022 标准
 * 单位：cm
 */

import { SDPoint } from './types';

export const WST423_2022_MALE_HEIGHT_FOR_AGE: SDPoint[] = [
  { x: 0, SD_neg3: 45.4, SD_neg2: 47.3, SD_neg1: 49.2, SD0: 51.2, SD_pos1: 53.1, SD_pos2: 55.0, SD_pos3: 56.9 },
  { x: 1, SD_neg3: 49.1, SD_neg2: 51.1, SD_neg1: 53.1, SD0: 55.1, SD_pos1: 57.2, SD_pos2: 59.2, SD_pos3: 61.2 },
  { x: 2, SD_neg3: 52.6, SD_neg2: 54.7, SD_neg1: 56.8, SD0: 59.0, SD_pos1: 61.1, SD_pos2: 63.2, SD_pos3: 65.4 },
  { x: 3, SD_neg3: 55.5, SD_neg2: 57.8, SD_neg1: 60.0, SD0: 62.2, SD_pos1: 64.4, SD_pos2: 66.6, SD_pos3: 68.9 },
  { x: 4, SD_neg3: 58.0, SD_neg2: 60.3, SD_neg1: 62.5, SD0: 64.8, SD_pos1: 67.1, SD_pos2: 69.4, SD_pos3: 71.7 },
  { x: 5, SD_neg3: 59.9, SD_neg2: 62.3, SD_neg1: 64.6, SD0: 66.9, SD_pos1: 69.3, SD_pos2: 71.6, SD_pos3: 74.0 },
  { x: 6, SD_neg3: 61.6, SD_neg2: 64.0, SD_neg1: 66.3, SD0: 68.7, SD_pos1: 71.1, SD_pos2: 73.5, SD_pos3: 75.9 },
  { x: 7, SD_neg3: 63.0, SD_neg2: 65.4, SD_neg1: 67.9, SD0: 70.3, SD_pos1: 72.7, SD_pos2: 75.1, SD_pos3: 77.6 },
  { x: 8, SD_neg3: 64.3, SD_neg2: 66.8, SD_neg1: 69.3, SD0: 71.7, SD_pos1: 74.2, SD_pos2: 76.7, SD_pos3: 79.1 },
  { x: 9, SD_neg3: 65.5, SD_neg2: 68.0, SD_neg1: 70.5, SD0: 73.1, SD_pos1: 75.6, SD_pos2: 78.1, SD_pos3: 80.6 },
  { x: 10, SD_neg3: 66.7, SD_neg2: 69.2, SD_neg1: 71.8, SD0: 74.3, SD_pos1: 76.9, SD_pos2: 79.4, SD_pos3: 82.0 },
  { x: 11, SD_neg3: 67.8, SD_neg2: 70.3, SD_neg1: 72.9, SD0: 75.5, SD_pos1: 78.1, SD_pos2: 80.7, SD_pos3: 83.3 },
  { x: 12, SD_neg3: 68.8, SD_neg2: 71.4, SD_neg1: 74.1, SD0: 76.7, SD_pos1: 79.3, SD_pos2: 81.9, SD_pos3: 84.6 },
  { x: 13, SD_neg3: 69.8, SD_neg2: 72.5, SD_neg1: 75.1, SD0: 77.8, SD_pos1: 80.5, SD_pos2: 83.1, SD_pos3: 85.8 },
  { x: 14, SD_neg3: 70.8, SD_neg2: 73.5, SD_neg1: 76.2, SD0: 78.9, SD_pos1: 81.6, SD_pos2: 84.3, SD_pos3: 87.0 },
  { x: 15, SD_neg3: 71.7, SD_neg2: 74.5, SD_neg1: 77.2, SD0: 80.0, SD_pos1: 82.7, SD_pos2: 85.5, SD_pos3: 88.2 },
  { x: 16, SD_neg3: 72.7, SD_neg2: 75.5, SD_neg1: 78.2, SD0: 81.0, SD_pos1: 83.8, SD_pos2: 86.6, SD_pos3: 89.4 },
  { x: 17, SD_neg3: 73.6, SD_neg2: 76.4, SD_neg1: 79.2, SD0: 82.1, SD_pos1: 84.9, SD_pos2: 87.7, SD_pos3: 90.5 },
  { x: 18, SD_neg3: 74.5, SD_neg2: 77.4, SD_neg1: 80.2, SD0: 83.1, SD_pos1: 86.0, SD_pos2: 88.8, SD_pos3: 91.7 },
  { x: 19, SD_neg3: 75.4, SD_neg2: 78.3, SD_neg1: 81.2, SD0: 84.1, SD_pos1: 87.0, SD_pos2: 89.9, SD_pos3: 92.8 },
  { x: 20, SD_neg3: 76.3, SD_neg2: 79.2, SD_neg1: 82.2, SD0: 85.1, SD_pos1: 88.0, SD_pos2: 91.0, SD_pos3: 93.9 },
  { x: 21, SD_neg3: 77.1, SD_neg2: 80.1, SD_neg1: 83.1, SD0: 86.1, SD_pos1: 89.1, SD_pos2: 92.0, SD_pos3: 95.0 },
  { x: 22, SD_neg3: 78.0, SD_neg2: 81.0, SD_neg1: 84.0, SD0: 87.0, SD_pos1: 90.1, SD_pos2: 93.1, SD_pos3: 96.1 },
  { x: 23, SD_neg3: 78.8, SD_neg2: 81.9, SD_neg1: 84.9, SD0: 88.0, SD_pos1: 91.0, SD_pos2: 94.1, SD_pos3: 97.2 },
  { x: 24, SD_neg3: 78.9, SD_neg2: 82.0, SD_neg1: 85.1, SD0: 88.2, SD_pos1: 91.3, SD_pos2: 94.4, SD_pos3: 97.5 },
  { x: 27, SD_neg3: 81.2, SD_neg2: 84.4, SD_neg1: 87.6, SD0: 90.8, SD_pos1: 94.0, SD_pos2: 97.2, SD_pos3: 100.4 },
  { x: 30, SD_neg3: 83.3, SD_neg2: 86.6, SD_neg1: 89.9, SD0: 93.2, SD_pos1: 96.5, SD_pos2: 99.8, SD_pos3: 103.1 },
  { x: 33, SD_neg3: 85.2, SD_neg2: 88.6, SD_neg1: 92.0, SD0: 95.4, SD_pos1: 98.8, SD_pos2: 102.2, SD_pos3: 105.6 },
  { x: 36, SD_neg3: 87.0, SD_neg2: 90.5, SD_neg1: 94.0, SD0: 97.5, SD_pos1: 101.0, SD_pos2: 104.5, SD_pos3: 108.0 },
  { x: 39, SD_neg3: 88.6, SD_neg2: 92.2, SD_neg1: 95.9, SD0: 99.5, SD_pos1: 103.1, SD_pos2: 106.7, SD_pos3: 110.3 },
  { x: 42, SD_neg3: 90.3, SD_neg2: 93.9, SD_neg1: 97.6, SD0: 101.3, SD_pos1: 105.0, SD_pos2: 108.7, SD_pos3: 112.4 },
  { x: 45, SD_neg3: 91.8, SD_neg2: 95.6, SD_neg1: 99.4, SD0: 103.1, SD_pos1: 106.9, SD_pos2: 110.7, SD_pos3: 114.5 },
  { x: 48, SD_neg3: 93.3, SD_neg2: 97.2, SD_neg1: 101.0, SD0: 104.9, SD_pos1: 108.8, SD_pos2: 112.6, SD_pos3: 116.5 },
  { x: 51, SD_neg3: 94.8, SD_neg2: 98.8, SD_neg1: 102.7, SD0: 106.6, SD_pos1: 110.6, SD_pos2: 114.5, SD_pos3: 118.5 },
  { x: 54, SD_neg3: 96.3, SD_neg2: 100.3, SD_neg1: 104.4, SD0: 108.4, SD_pos1: 112.4, SD_pos2: 116.5, SD_pos3: 120.5 },
  { x: 57, SD_neg3: 97.8, SD_neg2: 102.0, SD_neg1: 106.1, SD0: 110.2, SD_pos1: 114.3, SD_pos2: 118.4, SD_pos3: 122.5 },
  { x: 60, SD_neg3: 99.4, SD_neg2: 103.6, SD_neg1: 107.8, SD0: 112.0, SD_pos1: 116.2, SD_pos2: 120.4, SD_pos3: 124.6 },
  { x: 63, SD_neg3: 100.9, SD_neg2: 105.2, SD_neg1: 109.5, SD0: 113.7, SD_pos1: 118.0, SD_pos2: 122.3, SD_pos3: 126.6 },
  { x: 66, SD_neg3: 102.3, SD_neg2: 106.7, SD_neg1: 111.1, SD0: 115.5, SD_pos1: 119.8, SD_pos2: 124.2, SD_pos3: 128.6 },
  { x: 69, SD_neg3: 103.8, SD_neg2: 108.2, SD_neg1: 112.7, SD0: 117.1, SD_pos1: 121.6, SD_pos2: 126.1, SD_pos3: 130.5 },
  { x: 72, SD_neg3: 105.2, SD_neg2: 109.7, SD_neg1: 114.3, SD0: 118.8, SD_pos1: 123.3, SD_pos2: 127.9, SD_pos3: 132.4 },
  { x: 75, SD_neg3: 106.5, SD_neg2: 111.2, SD_neg1: 115.8, SD0: 120.4, SD_pos1: 125.0, SD_pos2: 129.7, SD_pos3: 134.3 },
  { x: 78, SD_neg3: 107.9, SD_neg2: 112.6, SD_neg1: 117.3, SD0: 122.0, SD_pos1: 126.7, SD_pos2: 131.4, SD_pos3: 136.1 },
  { x: 81, SD_neg3: 109.2, SD_neg2: 113.9, SD_neg1: 118.7, SD0: 123.5, SD_pos1: 128.3, SD_pos2: 133.1, SD_pos3: 137.9 },
];
