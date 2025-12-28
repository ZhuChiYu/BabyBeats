import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimerState } from '../types';

interface TimerStore extends TimerState {
  // 操作
  startTimer: (side: 'left' | 'right') => void;
  stopTimer: () => number;
  resetTimer: () => void;
  getCurrentDuration: () => number;
  getSessionStartTime: () => number | null; // 获取本次哺乳会话的开始时间
  sessionStartTime: number | null; // 本次哺乳会话的开始时间（第一次按下开始的时间）
}

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      isRunning: false,
      side: null,
      startTime: null,
      leftDuration: 0,
      rightDuration: 0,
      sessionStartTime: null,
      
      // 开始计时
      startTimer: (side) => {
        const currentState = get();
        const now = Date.now();
        
        set({
          isRunning: true,
          side,
          startTime: now,
          // 如果是首次开始，记录会话开始时间
          sessionStartTime: currentState.sessionStartTime || now,
        });
      },
      
      // 停止计时并返回elapsed时间(秒)
      stopTimer: () => {
        const { startTime, side } = get();
        if (!startTime || !side) return 0;
        
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        
        set((state) => ({
          isRunning: false,
          side: null,
          startTime: null,
          leftDuration: side === 'left' ? state.leftDuration + elapsed : state.leftDuration,
          rightDuration: side === 'right' ? state.rightDuration + elapsed : state.rightDuration,
        }));
        
        return elapsed;
      },
      
      // 重置计时器
      resetTimer: () => {
        set({
          isRunning: false,
          side: null,
          startTime: null,
          leftDuration: 0,
          rightDuration: 0,
          sessionStartTime: null,
        });
      },
      
      // 获取当前计时时长（秒）
      getCurrentDuration: () => {
        const { isRunning, startTime } = get();
        if (!isRunning || !startTime) return 0;
        return Math.floor((Date.now() - startTime) / 1000);
      },
      
      // 获取会话开始时间
      getSessionStartTime: () => {
        return get().sessionStartTime;
      },
    }),
    {
      name: 'timer-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

