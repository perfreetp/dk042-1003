import { create } from 'zustand';
import type { RecallTask, RiskLevel, TaskStatus } from '@/types';
import { mockRecalls } from '@/data/mockRecalls';
import { loadFromStorage, saveToStorage } from '@/utils/persistUtils';

interface RecallState {
  recalls: RecallTask[];
  currentRecall: RecallTask | null;
  loading: boolean;
  error: string | null;
  setRecalls: (recalls: RecallTask[]) => void;
  getRecallById: (id: string) => RecallTask | undefined;
  updateStatus: (id: string, status: TaskStatus) => void;
  fetchRecalls: () => void;
  fetchRecallById: (id: string) => void;
  createRecall: (data: Omit<RecallTask, 'id' | 'createdAt' | 'updatedAt' | 'creatorId' | 'creatorName'>) => string;
  updateRecall: (id: string, data: Partial<RecallTask>) => void;
  closeRecall: (id: string, closingNote?: string) => void;
  getFilteredRecalls: (filters: {
    status?: TaskStatus;
    riskLevel?: RiskLevel;
    keyword?: string;
    startDate?: string;
    endDate?: string;
  }) => RecallTask[];
  clearCurrentRecall: () => void;
}

const initialRecalls = loadFromStorage('recalls', mockRecalls);

export const useRecallStore = create<RecallState>((set, get) => ({
  recalls: initialRecalls,
  currentRecall: null,
  loading: false,
  error: null,

  setRecalls: (recalls: RecallTask[]) => {
    set({ recalls });
    saveToStorage('recalls', recalls);
  },

  getRecallById: (id: string) => {
    return get().recalls.find((r) => r.id === id);
  },

  updateStatus: (id: string, status: TaskStatus) => {
    get().updateRecall(id, { status });
  },

  fetchRecalls: () => {
    set({ loading: true });
    setTimeout(() => {
      set({ recalls: mockRecalls, loading: false });
    }, 300);
  },

  fetchRecallById: (id: string) => {
    set({ loading: true });
    const recall = get().recalls.find((r) => r.id === id);
    setTimeout(() => {
      set({ currentRecall: recall || null, loading: false });
    }, 200);
  },

  createRecall: (data) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const id = `recall-${Date.now()}`;
    const newRecall: RecallTask = {
      ...data,
      id,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      creatorId: currentUser?.id || 'u001',
      creatorName: currentUser?.name || '华润制药集团',
    };
    set((state) => {
      const newRecalls = [newRecall, ...state.recalls];
      saveToStorage('recalls', newRecalls);
      return { recalls: newRecalls };
    });
    return id;
  },

  updateRecall: (id, data) => {
    set((state) => {
      const newRecalls = state.recalls.map((r) =>
        r.id === id
          ? { ...r, ...data, updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) }
          : r
      );
      saveToStorage('recalls', newRecalls);
      return {
        recalls: newRecalls,
        currentRecall:
          state.currentRecall?.id === id
            ? {
                ...state.currentRecall,
                ...data,
                updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
              }
            : state.currentRecall,
      };
    });
  },

  closeRecall: (id, closingNote) => {
    get().updateRecall(id, { status: 'closed', closingNote });
  },

  getFilteredRecalls: (filters) => {
    let result = [...get().recalls];

    if (filters.status) {
      result = result.filter((r) => r.status === filters.status);
    }
    if (filters.riskLevel) {
      result = result.filter((r) => r.riskLevel === filters.riskLevel);
    }
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(keyword) ||
          r.reason.toLowerCase().includes(keyword) ||
          r.description.toLowerCase().includes(keyword)
      );
    }
    if (filters.startDate) {
      result = result.filter((r) => r.createdAt >= filters.startDate!);
    }
    if (filters.endDate) {
      result = result.filter((r) => r.createdAt <= filters.endDate! + ' 23:59:59');
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  clearCurrentRecall: () => {
    set({ currentRecall: null });
  },
}));
