import { useState, useEffect, useCallback } from 'react';
import { useBabyStore } from '../store/babyStore';
import { FeedingService } from '../services/feedingService';
import { SleepService } from '../services/sleepService';
import { DiaperService } from '../services/diaperService';
import { PumpingService } from '../services/pumpingService';
import { Feeding, Sleep, Diaper, Pumping } from '../types';

type RecordType = 'feeding' | 'sleep' | 'diaper' | 'pumping';

interface UseRecordsOptions {
  type: RecordType;
  limit?: number;
  autoLoad?: boolean;
}

interface UseRecordsReturn<T> {
  records: T[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
}

export function useRecords<T>(options: UseRecordsOptions): UseRecordsReturn<T> {
  const { type, limit, autoLoad = true } = options;
  const { getCurrentBaby } = useBabyStore();
  const currentBaby = getCurrentBaby();
  
  const [records, setRecords] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const loadRecords = useCallback(async () => {
    if (!currentBaby) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let data: any[] = [];
      
      switch (type) {
        case 'feeding':
          data = await FeedingService.getByBabyId(currentBaby.id, limit);
          break;
        case 'sleep':
          data = await SleepService.getByBabyId(currentBaby.id, limit);
          break;
        case 'diaper':
          data = await DiaperService.getByBabyId(currentBaby.id, limit);
          break;
        case 'pumping':
          data = await PumpingService.getByBabyId(currentBaby.id, limit);
          break;
      }
      
      setRecords(data as T[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [currentBaby?.id, type, limit]);
  
  const deleteRecord = useCallback(async (id: string) => {
    try {
      switch (type) {
        case 'feeding':
          await FeedingService.delete(id);
          break;
        case 'sleep':
          await SleepService.delete(id);
          break;
        case 'diaper':
          await DiaperService.delete(id);
          break;
        case 'pumping':
          await PumpingService.delete(id);
          break;
      }
      
      await loadRecords();
    } catch (err) {
      throw new Error('删除失败');
    }
  }, [type, loadRecords]);
  
  useEffect(() => {
    if (autoLoad && currentBaby) {
      loadRecords();
    }
  }, [autoLoad, currentBaby?.id, loadRecords]);
  
  return {
    records,
    loading,
    error,
    refresh: loadRecords,
    deleteRecord,
  };
}

