import { api } from './apiClient';

export interface SyncData {
  tableName: string;
  records: any[];
}

export interface SyncPullResponse {
  syncTime: string;
  data: {
    babies: any[];
    feedings: any[];
    diapers: any[];
    sleeps: any[];
    pumpings: any[];
    growth_records: any[];
    milestones: any[];
    medical_visits: any[];
    medications: any[];
    vaccines: any[];
  };
}

export interface SyncPushResponse {
  success: any[];
  conflicts: any[];
  errors: any[];
}

export interface SyncLog {
  id: string;
  deviceId: string;
  lastSyncTime: string;
  syncStatus: 'success' | 'failed' | 'partial';
  errorMessage?: string;
}

export const SyncApiService = {
  // 拉取服务器数据
  pull: async (lastSyncTime?: string): Promise<SyncPullResponse> => {
    const params = lastSyncTime ? `?lastSyncTime=${lastSyncTime}` : '';
    return api.get<SyncPullResponse>(`/sync/pull${params}`);
  },

  // 推送本地数据
  push: async (data: SyncData[]): Promise<SyncPushResponse> => {
    return api.post<SyncPushResponse>('/sync/push', { data });
  },

  // 获取同步状态
  getStatus: async (): Promise<SyncLog[]> => {
    const response = await api.get<{ syncLogs: SyncLog[] }>('/sync/status');
    return response.syncLogs;
  },
};

