// Feeding API Service - 喂养记录云端API适配
import { api } from './apiClient';
import { Feeding } from '../../types';

export interface FeedingApiData {
  id: string;
  baby_id: string;
  time: number;
  type: string;
  left_duration: number;
  right_duration: number;
  milk_amount: number;
  milk_brand?: string;
  notes?: string;
  created_at: number;
  updated_at: number;
}

const mapApiDataToFeeding = (data: FeedingApiData): Feeding => ({
  id: data.id,
  babyId: data.baby_id,
  time: data.time,
  type: data.type as any,
  leftDuration: data.left_duration,
  rightDuration: data.right_duration,
  milkAmount: data.milk_amount,
  milkBrand: data.milk_brand,
  notes: data.notes,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
});

const mapFeedingToApiData = (feeding: Partial<Feeding>) => ({
  id: feeding.id,
  babyId: feeding.babyId,
  time: feeding.time,
  type: feeding.type,
  leftDuration: feeding.leftDuration,
  rightDuration: feeding.rightDuration,
  milkAmount: feeding.milkAmount,
  milkBrand: feeding.milkBrand,
  notes: feeding.notes,
});

export const FeedingApiService = {
  getAll: async (babyId?: string, startDate?: Date, endDate?: Date): Promise<Feeding[]> => {
    let url = '/feedings?';
    if (babyId) url += `babyId=${babyId}&`;
    if (startDate) url += `startDate=${startDate.toISOString()}&`;
    if (endDate) url += `endDate=${endDate.toISOString()}&`;
    
    const response = await api.get<{ feedings: FeedingApiData[] }>(url);
    return response.feedings.map(mapApiDataToFeeding);
  },

  create: async (feeding: Omit<Feeding, 'createdAt' | 'updatedAt'>): Promise<Feeding> => {
    const response = await api.post<{ feeding: FeedingApiData }>('/feedings', mapFeedingToApiData(feeding));
    return mapApiDataToFeeding(response.feeding);
  },

  update: async (id: string, feeding: Partial<Feeding>): Promise<Feeding> => {
    const response = await api.put<{ feeding: FeedingApiData }>(`/feedings/${id}`, mapFeedingToApiData(feeding));
    return mapApiDataToFeeding(response.feeding);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/feedings/${id}`);
  },
};

