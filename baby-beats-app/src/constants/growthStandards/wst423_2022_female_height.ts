/**
 * WS/T 423-2022 女童身长/身高-年龄标准数据（0-84月龄）
 * 数据来源：国家卫健委 WS/T 423-2022 标准
 * 单位：cm
 */

import { SDPoint } from './types';

export const WST423_2022_FEMALE_HEIGHT_FOR_AGE: SDPoint[] = [
  { x: 0, SD_neg3: 44.7, SD_neg2: 46.6, SD_neg1: 48.4, SD0: 50.3, SD_pos1: 52.2, SD_pos2: 54.1, SD_pos3: 55.9 },
  { x: 1, SD_neg3: 48.2, SD_neg2: 50.1, SD_neg1: 52.1, SD0: 54.1, SD_pos1: 56.1, SD_pos2: 58.1, SD_pos3: 60.0 },
  { x: 2, SD_neg3: 51.5, SD_neg2: 53.5, SD_neg1: 55.6, SD0: 57.7, SD_pos1: 59.8, SD_pos2: 61.9, SD_pos3: 63.9 },
  { x: 3, SD_neg3: 54.3, SD_neg2: 56.4, SD_neg1: 58.6, SD0: 60.8, SD_pos1: 62.9, SD_pos2: 65.1, SD_pos3: 67.2 },
  { x: 4, SD_neg3: 56.6, SD_neg2: 58.8, SD_neg1: 61.0, SD0: 63.3, SD_pos1: 65.5, SD_pos2: 67.7, SD_pos3: 69.9 },
  { x: 5, SD_neg3: 58.5, SD_neg2: 60.7, SD_neg1: 63.0, SD0: 65.3, SD_pos1: 67.6, SD_pos2: 69.9, SD_pos3: 72.2 },
  { x: 6, SD_neg3: 60.1, SD_neg2: 62.4, SD_neg1: 64.7, SD0: 67.1, SD_pos1: 69.4, SD_pos2: 71.7, SD_pos3: 74.1 },
  { x: 7, SD_neg3: 61.5, SD_neg2: 63.9, SD_neg1: 66.3, SD0: 68.7, SD_pos1: 71.0, SD_pos2: 73.4, SD_pos3: 75.8 },
  { x: 8, SD_neg3: 62.8, SD_neg2: 65.3, SD_neg1: 67.7, SD0: 70.1, SD_pos1: 72.5, SD_pos2: 75.0, SD_pos3: 77.4 },
  { x: 9, SD_neg3: 64.1, SD_neg2: 66.5, SD_neg1: 69.0, SD0: 71.5, SD_pos1: 73.9, SD_pos2: 76.4, SD_pos3: 78.9 },
  { x: 10, SD_neg3: 65.3, SD_neg2: 67.8, SD_neg1: 70.3, SD0: 72.8, SD_pos1: 75.3, SD_pos2: 77.8, SD_pos3: 80.3 },
  { x: 11, SD_neg3: 66.4, SD_neg2: 68.9, SD_neg1: 71.5, SD0: 74.0, SD_pos1: 76.6, SD_pos2: 79.1, SD_pos3: 81.7 },
  { x: 12, SD_neg3: 67.5, SD_neg2: 70.1, SD_neg1: 72.6, SD0: 75.2, SD_pos1: 77.8, SD_pos2: 80.4, SD_pos3: 83.0 },
  { x: 13, SD_neg3: 68.5, SD_neg2: 71.1, SD_neg1: 73.8, SD0: 76.4, SD_pos1: 79.0, SD_pos2: 81.7, SD_pos3: 84.3 },
  { x: 14, SD_neg3: 69.5, SD_neg2: 72.2, SD_neg1: 74.9, SD0: 77.5, SD_pos1: 80.2, SD_pos2: 82.9, SD_pos3: 85.6 },
  { x: 15, SD_neg3: 70.5, SD_neg2: 73.2, SD_neg1: 75.9, SD0: 78.6, SD_pos1: 81.4, SD_pos2: 84.1, SD_pos3: 86.8 },
  { x: 16, SD_neg3: 71.5, SD_neg2: 74.2, SD_neg1: 77.0, SD0: 79.7, SD_pos1: 82.5, SD_pos2: 85.2, SD_pos3: 88.0 },
  { x: 17, SD_neg3: 72.4, SD_neg2: 75.2, SD_neg1: 78.0, SD0: 80.8, SD_pos1: 83.6, SD_pos2: 86.4, SD_pos3: 89.2 },
  { x: 18, SD_neg3: 73.3, SD_neg2: 76.2, SD_neg1: 79.0, SD0: 81.9, SD_pos1: 84.7, SD_pos2: 87.5, SD_pos3: 90.4 },
  { x: 19, SD_neg3: 74.3, SD_neg2: 77.1, SD_neg1: 80.0, SD0: 82.9, SD_pos1: 85.8, SD_pos2: 88.6, SD_pos3: 91.5 },
  { x: 20, SD_neg3: 75.1, SD_neg2: 78.1, SD_neg1: 81.0, SD0: 83.9, SD_pos1: 86.8, SD_pos2: 89.7, SD_pos3: 92.6 },
  { x: 21, SD_neg3: 76.0, SD_neg2: 79.0, SD_neg1: 81.9, SD0: 84.9, SD_pos1: 87.8, SD_pos2: 90.8, SD_pos3: 93.7 },
  { x: 22, SD_neg3: 76.9, SD_neg2: 79.9, SD_neg1: 82.8, SD0: 85.8, SD_pos1: 88.8, SD_pos2: 91.8, SD_pos3: 94.8 },
  { x: 23, SD_neg3: 77.7, SD_neg2: 80.7, SD_neg1: 83.7, SD0: 86.8, SD_pos1: 89.8, SD_pos2: 92.8, SD_pos3: 95.9 },
  { x: 24, SD_neg3: 77.8, SD_neg2: 80.8, SD_neg1: 83.9, SD0: 87.0, SD_pos1: 90.1, SD_pos2: 93.1, SD_pos3: 96.2 },
  { x: 27, SD_neg3: 80.0, SD_neg2: 83.2, SD_neg1: 86.4, SD0: 89.5, SD_pos1: 92.7, SD_pos2: 95.9, SD_pos3: 99.1 },
  { x: 30, SD_neg3: 82.1, SD_neg2: 85.3, SD_neg1: 88.6, SD0: 91.9, SD_pos1: 95.2, SD_pos2: 98.5, SD_pos3: 101.7 },
  { x: 33, SD_neg3: 84.0, SD_neg2: 87.3, SD_neg1: 90.7, SD0: 94.1, SD_pos1: 97.5, SD_pos2: 100.9, SD_pos3: 104.2 },
  { x: 36, SD_neg3: 85.8, SD_neg2: 89.3, SD_neg1: 92.7, SD0: 96.2, SD_pos1: 99.7, SD_pos2: 103.2, SD_pos3: 106.6 },
  { x: 39, SD_neg3: 87.5, SD_neg2: 91.1, SD_neg1: 94.6, SD0: 98.2, SD_pos1: 101.8, SD_pos2: 105.3, SD_pos3: 108.9 },
  { x: 42, SD_neg3: 89.1, SD_neg2: 92.8, SD_neg1: 96.4, SD0: 100.1, SD_pos1: 103.7, SD_pos2: 107.4, SD_pos3: 111.0 },
  { x: 45, SD_neg3: 90.7, SD_neg2: 94.4, SD_neg1: 98.2, SD0: 101.9, SD_pos1: 105.6, SD_pos2: 109.4, SD_pos3: 113.1 },
  { x: 48, SD_neg3: 92.2, SD_neg2: 96.0, SD_neg1: 99.8, SD0: 103.7, SD_pos1: 107.5, SD_pos2: 111.3, SD_pos3: 115.1 },
  { x: 51, SD_neg3: 93.7, SD_neg2: 97.6, SD_neg1: 101.5, SD0: 105.4, SD_pos1: 109.3, SD_pos2: 113.2, SD_pos3: 117.2 },
  { x: 54, SD_neg3: 95.2, SD_neg2: 99.2, SD_neg1: 103.2, SD0: 107.2, SD_pos1: 111.2, SD_pos2: 115.2, SD_pos3: 119.2 },
  { x: 57, SD_neg3: 96.8, SD_neg2: 100.8, SD_neg1: 104.9, SD0: 109.0, SD_pos1: 113.1, SD_pos2: 117.2, SD_pos3: 121.2 },
  { x: 60, SD_neg3: 98.3, SD_neg2: 102.5, SD_neg1: 106.6, SD0: 110.8, SD_pos1: 115.0, SD_pos2: 119.1, SD_pos3: 123.3 },
  { x: 63, SD_neg3: 99.8, SD_neg2: 104.1, SD_neg1: 108.3, SD0: 112.6, SD_pos1: 116.8, SD_pos2: 121.1, SD_pos3: 125.3 },
  { x: 66, SD_neg3: 101.2, SD_neg2: 105.6, SD_neg1: 109.9, SD0: 114.3, SD_pos1: 118.6, SD_pos2: 123.0, SD_pos3: 127.3 },
  { x: 69, SD_neg3: 102.6, SD_neg2: 107.1, SD_neg1: 111.5, SD0: 115.9, SD_pos1: 120.4, SD_pos2: 124.8, SD_pos3: 129.2 },
  { x: 72, SD_neg3: 104.0, SD_neg2: 108.5, SD_neg1: 113.0, SD0: 117.5, SD_pos1: 122.0, SD_pos2: 126.5, SD_pos3: 131.0 },
  { x: 75, SD_neg3: 105.3, SD_neg2: 109.9, SD_neg1: 114.5, SD0: 119.1, SD_pos1: 123.7, SD_pos2: 128.2, SD_pos3: 132.8 },
  { x: 78, SD_neg3: 106.6, SD_neg2: 111.3, SD_neg1: 115.9, SD0: 120.6, SD_pos1: 125.3, SD_pos2: 129.9, SD_pos3: 134.6 },
  { x: 81, SD_neg3: 107.9, SD_neg2: 112.6, SD_neg1: 117.3, SD0: 122.1, SD_pos1: 126.8, SD_pos2: 131.6, SD_pos3: 136.3 },
];
