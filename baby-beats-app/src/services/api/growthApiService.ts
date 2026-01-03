// Growth API Service - 成长记录云端API适配
import { api } from './apiClient';
import { GrowthRecord } from '../../types';

export interface GrowthApiData {
  id: string;
  baby_id: string;
  date: number;
  height?: number;
  weight?: number;
  head_circ?: number;
  temperature?: number;
  bmi?: number;
  notes?: string;
  created_at: number;
  updated_at: number;
}

const mapApiDataToGrowth = (data: GrowthApiData): GrowthRecord => ({
  id: data.id,
  babyId: data.baby_id,
  date: data.date,
  height: data.height,
  weight: data.weight,
  headCirc: data.head_circ,
  temperature: data.temperature,
  bmi: data.bmi,
  notes: data.notes,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
});

const mapGrowthToApiData = (growth: Partial<GrowthRecord>) => ({
  id: growth.id,
  babyId: growth.babyId,
  date: growth.date,
  height: growth.height,
  weight: growth.weight,
  headCirc: growth.headCirc,
  temperature: growth.temperature,
  bmi: growth.bmi,
  notes: growth.notes,
});

export const GrowthApiService = {
  getAll: async (babyId?: string): Promise<GrowthRecord[]> => {
    let url = '/growth?';
    if (babyId) url += `babyId=${babyId}&`;
    
    const response = await api.get<{ growthRecords: GrowthApiData[] }>(url);
    return response.growthRecords.map(mapApiDataToGrowth);
  },

  create: async (growth: Omit<GrowthRecord, 'createdAt' | 'updatedAt'>): Promise<GrowthRecord> => {
    const response = await api.post<{ growthRecord: GrowthApiData }>('/growth', mapGrowthToApiData(growth));
    return mapApiDataToGrowth(response.growthRecord);
  },

  update: async (id: string, growth: Partial<GrowthRecord>): Promise<GrowthRecord> => {
    const response = await api.put<{ growthRecord: GrowthApiData }>(`/growth/${id}`, mapGrowthToApiData(growth));
    return mapApiDataToGrowth(response.growthRecord);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/growth/${id}`);
  },
};

