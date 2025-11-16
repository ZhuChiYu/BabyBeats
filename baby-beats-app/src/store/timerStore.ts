import { create } from 'zustand';
import { TimerState } from '../types';

interface TimerStore extends TimerState {
  // 操作
  startTimer: (side: 'left' | 'right') => void;
  stopTimer: () => number;
  resetTimer: () => void;
  getCurrentDuration: () => number;
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  // 初始状态
  isRunning: false,
  side: null,
  startTime: null,
  leftDuration: 0,
  rightDuration: 0,
  
  // 开始计时
  startTimer: (side) => {
    set({
      isRunning: true,
      side,
      startTime: Date.now(),
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
      leftDuration: side === 'left' ? elapsed : state.leftDuration,
      rightDuration: side === 'right' ? elapsed : state.rightDuration,
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
    });
  },
  
  // 获取当前计时时长（秒）
  getCurrentDuration: () => {
    const { isRunning, startTime } = get();
    if (!isRunning || !startTime) return 0;
    return Math.floor((Date.now() - startTime) / 1000);
  },
}));

