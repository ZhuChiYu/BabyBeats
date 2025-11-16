import { create } from 'zustand';
import { Baby } from '../types';

interface BabyStore {
  // 状态
  babies: Baby[];
  currentBabyId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // 计算属性 getters
  getCurrentBaby: () => Baby | null;
  getActiveBabies: () => Baby[];
  getArchivedBabies: () => Baby[];
  
  // 操作 actions
  setBabies: (babies: Baby[]) => void;
  setCurrentBaby: (babyId: string | null) => void;
  addBaby: (baby: Baby) => void;
  updateBaby: (babyId: string, updates: Partial<Baby>) => void;
  removeBaby: (babyId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useBabyStore = create<BabyStore>((set, get) => ({
  // 初始状态
  babies: [],
  currentBabyId: null,
  isLoading: false,
  error: null,
  
  // Getters
  getCurrentBaby: () => {
    const { babies, currentBabyId } = get();
    return babies.find(b => b.id === currentBabyId) || null;
  },
  
  getActiveBabies: () => {
    const { babies } = get();
    return babies.filter(b => !b.isArchived);
  },
  
  getArchivedBabies: () => {
    const { babies } = get();
    return babies.filter(b => b.isArchived);
  },
  
  // Actions
  setBabies: (babies) => {
    set({ babies });
    // 如果当前没有选中宝宝，自动选中第一个活跃的宝宝
    const { currentBabyId } = get();
    if (!currentBabyId && babies.length > 0) {
      const firstActive = babies.find(b => !b.isArchived);
      if (firstActive) {
        set({ currentBabyId: firstActive.id });
      }
    }
  },
  
  setCurrentBaby: (babyId) => set({ currentBabyId: babyId }),
  
  addBaby: (baby) => set((state) => ({ 
    babies: [...state.babies, baby] 
  })),
  
  updateBaby: (babyId, updates) => set((state) => ({
    babies: state.babies.map(b => 
      b.id === babyId ? { ...b, ...updates, updatedAt: Date.now() } : b
    )
  })),
  
  removeBaby: (babyId) => set((state) => {
    const newBabies = state.babies.filter(b => b.id !== babyId);
    const newCurrentId = state.currentBabyId === babyId 
      ? (newBabies[0]?.id || null) 
      : state.currentBabyId;
    
    return {
      babies: newBabies,
      currentBabyId: newCurrentId
    };
  }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
}));

