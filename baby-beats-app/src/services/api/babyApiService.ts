// Baby API Service - 宝宝数据云端API适配
import { api } from './apiClient';
import { Baby } from '../../types';

export interface BabyApiData {
  id: string;
  user_id: string;
  name: string;
  gender: string;
  birthday: number;
  due_date?: number;
  blood_type?: string;
  birth_height?: number;
  birth_weight?: number;
  birth_head_circ?: number;
  avatar?: string;
  is_archived: boolean;
  created_at: number;
  updated_at: number;
}

// 将API数据转换为前端Baby类型
const mapApiDataToBaby = (data: BabyApiData): Baby => ({
  id: data.id,
  userId: data.user_id,
  name: data.name,
  gender: data.gender as any,
  birthday: data.birthday,
  dueDate: data.due_date,
  bloodType: data.blood_type,
  birthHeight: data.birth_height,
  birthWeight: data.birth_weight,
  birthHeadCirc: data.birth_head_circ,
  avatar: data.avatar,
  isArchived: data.is_archived,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
});

// 将前端Baby类型转换为API数据
const mapBabyToApiData = (baby: Partial<Baby>) => ({
  id: baby.id,
  user_id: baby.userId,
  name: baby.name,
  gender: baby.gender,
  birthday: baby.birthday,
  dueDate: baby.dueDate,
  bloodType: baby.bloodType,
  birthHeight: baby.birthHeight,
  birthWeight: baby.birthWeight,
  birthHeadCirc: baby.birthHeadCirc,
  avatar: baby.avatar,
  isArchived: baby.isArchived,
});

export const BabyApiService = {
  // 获取所有宝宝
  getAll: async (): Promise<Baby[]> => {
    const response = await api.get<{ babies: BabyApiData[] }>('/babies');
    return response.babies.map(mapApiDataToBaby);
  },

  // 根据ID获取宝宝
  getById: async (id: string): Promise<Baby> => {
    const response = await api.get<{ baby: BabyApiData }>(`/babies/${id}`);
    return mapApiDataToBaby(response.baby);
  },

  // 创建宝宝
  create: async (baby: Omit<Baby, 'createdAt' | 'updatedAt'>): Promise<Baby> => {
    const response = await api.post<{ baby: BabyApiData }>('/babies', mapBabyToApiData(baby));
    return mapApiDataToBaby(response.baby);
  },

  // 更新宝宝
  update: async (id: string, baby: Partial<Baby>): Promise<Baby> => {
    const response = await api.put<{ baby: BabyApiData }>(`/babies/${id}`, mapBabyToApiData(baby));
    return mapApiDataToBaby(response.baby);
  },

  // 删除宝宝
  delete: async (id: string): Promise<void> => {
    await api.delete(`/babies/${id}`);
  },
};

