// Sleep API Service - 睡眠记录云端API适配
import { api } from './apiClient';
import { Sleep } from '../../types';

export interface SleepApiData {
  id: string;
  baby_id: string;
  start_time: number;
  end_time: number;
  duration: number;
  sleep_type: string;
  fall_asleep_method?: string;
  notes?: string;
  created_at: number;
  updated_at: number;
}

const mapApiDataToSleep = (data: SleepApiData): Sleep => ({
  id: data.id,
  babyId: data.baby_id,
  startTime: data.start_time,
  endTime: data.end_time,
  duration: data.duration,
  sleepType: data.sleep_type as any,
  fallAsleepMethod: data.fall_asleep_method,
  notes: data.notes,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
});

const mapSleepToApiData = (sleep: Partial<Sleep>) => ({
  id: sleep.id,
  babyId: sleep.babyId,
  startTime: sleep.startTime,
  endTime: sleep.endTime,
  duration: sleep.duration,
  sleepType: sleep.sleepType,
  fallAsleepMethod: sleep.fallAsleepMethod,
  notes: sleep.notes,
});

export const SleepApiService = {
  getAll: async (babyId?: string, startDate?: Date, endDate?: Date): Promise<Sleep[]> => {
    let url = '/sleeps?';
    if (babyId) url += `babyId=${babyId}&`;
    if (startDate) url += `startDate=${startDate.toISOString()}&`;
    if (endDate) url += `endDate=${endDate.toISOString()}&`;
    
    const response = await api.get<{ sleeps: SleepApiData[] }>(url);
    return response.sleeps.map(mapApiDataToSleep);
  },

  create: async (sleep: Omit<Sleep, 'createdAt' | 'updatedAt'>): Promise<Sleep> => {
    const response = await api.post<{ sleep: SleepApiData }>('/sleeps', mapSleepToApiData(sleep));
    return mapApiDataToSleep(response.sleep);
  },

  update: async (id: string, sleep: Partial<Sleep>): Promise<Sleep> => {
    const response = await api.put<{ sleep: SleepApiData }>(`/sleeps/${id}`, mapSleepToApiData(sleep));
    return mapApiDataToSleep(response.sleep);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/sleeps/${id}`);
  },
};

