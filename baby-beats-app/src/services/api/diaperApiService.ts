// Diaper API Service - 尿布记录云端API适配
import { api } from './apiClient';
import { Diaper } from '../../types';

export interface DiaperApiData {
  id: string;
  baby_id: string;
  time: number;
  type: string;
  poop_consistency?: string;
  poop_color?: string;
  poop_amount?: string;
  pee_amount?: string;
  has_abnormality: boolean;
  notes?: string;
  created_at: number;
  updated_at: number;
}

const mapApiDataToDiaper = (data: DiaperApiData): Diaper => ({
  id: data.id,
  babyId: data.baby_id,
  time: data.time,
  type: data.type as any,
  poopConsistency: data.poop_consistency as any,
  poopColor: data.poop_color as any,
  poopAmount: data.poop_amount as any,
  peeAmount: data.pee_amount as any,
  hasAbnormality: data.has_abnormality,
  notes: data.notes,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
});

const mapDiaperToApiData = (diaper: Partial<Diaper>) => ({
  id: diaper.id,
  babyId: diaper.babyId,
  time: diaper.time,
  type: diaper.type,
  poopConsistency: diaper.poopConsistency,
  poopColor: diaper.poopColor,
  poopAmount: diaper.poopAmount,
  peeAmount: diaper.peeAmount,
  hasAbnormality: diaper.hasAbnormality,
  notes: diaper.notes,
});

export const DiaperApiService = {
  getAll: async (babyId?: string, startDate?: Date, endDate?: Date): Promise<Diaper[]> => {
    let url = '/diapers?';
    if (babyId) url += `babyId=${babyId}&`;
    if (startDate) url += `startDate=${startDate.toISOString()}&`;
    if (endDate) url += `endDate=${endDate.toISOString()}&`;
    
    const response = await api.get<{ diapers: DiaperApiData[] }>(url);
    return response.diapers.map(mapApiDataToDiaper);
  },

  create: async (diaper: Omit<Diaper, 'createdAt' | 'updatedAt'>): Promise<Diaper> => {
    const response = await api.post<{ diaper: DiaperApiData }>('/diapers', mapDiaperToApiData(diaper));
    return mapApiDataToDiaper(response.diaper);
  },

  update: async (id: string, diaper: Partial<Diaper>): Promise<Diaper> => {
    const response = await api.put<{ diaper: DiaperApiData }>(`/diapers/${id}`, mapDiaperToApiData(diaper));
    return mapApiDataToDiaper(response.diaper);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/diapers/${id}`);
  },
};

