import { useState, useEffect, useCallback } from 'react';
import { useBabyStore } from '../store/babyStore';
import { FeedingService } from '../services/feedingService';
import { SleepService } from '../services/sleepService';
import { DiaperService } from '../services/diaperService';
import { PumpingService } from '../services/pumpingService';

export interface DailyStats {
  feeding: {
    totalCount: number;
    breastCount: number;
    bottleCount: number;
    formulaCount: number;
    totalAmount: number;
    totalDuration: number;
  };
  sleep: {
    totalCount: number;
    totalDuration: number;
    napDuration: number;
    nightDuration: number;
  };
  diaper: {
    totalCount: number;
    poopCount: number;
    peeCount: number;
    bothCount: number;
  };
  pumping: {
    totalCount: number;
    totalAmount: number;
    averageAmount: number;
  };
}

export function useStats(autoLoad: boolean = true) {
  const { getCurrentBaby } = useBabyStore();
  const currentBaby = getCurrentBaby();
  
  const [stats, setStats] = useState<DailyStats>({
    feeding: {
      totalCount: 0,
      breastCount: 0,
      bottleCount: 0,
      formulaCount: 0,
      totalAmount: 0,
      totalDuration: 0,
    },
    sleep: {
      totalCount: 0,
      totalDuration: 0,
      napDuration: 0,
      nightDuration: 0,
    },
    diaper: {
      totalCount: 0,
      poopCount: 0,
      peeCount: 0,
      bothCount: 0,
    },
    pumping: {
      totalCount: 0,
      totalAmount: 0,
      averageAmount: 0,
    },
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const loadStats = useCallback(async () => {
    if (!currentBaby) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [feedingData, sleepData, diaperData, pumpingData] = await Promise.all([
        FeedingService.getTodayStats(currentBaby.id),
        SleepService.getTodayStats(currentBaby.id),
        DiaperService.getTodayStats(currentBaby.id),
        PumpingService.getTodayStats(currentBaby.id),
      ]);
      
      setStats({
        feeding: feedingData,
        sleep: sleepData,
        diaper: diaperData,
        pumping: pumpingData,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载统计失败');
    } finally {
      setLoading(false);
    }
  }, [currentBaby?.id]);
  
  useEffect(() => {
    if (autoLoad && currentBaby) {
      loadStats();
    }
  }, [autoLoad, currentBaby?.id, loadStats]);
  
  return {
    stats,
    loading,
    error,
    refresh: loadStats,
  };
}

