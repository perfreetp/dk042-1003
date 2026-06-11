import { create } from 'zustand';
import type { Batch } from '@/types';
import { mockBatches } from '@/data/mockBatches';
import { loadFromStorage, saveToStorage } from '@/utils/persistUtils';

const initialBatches = loadFromStorage<Batch[]>('batches', mockBatches);

interface BatchState {
  batches: Batch[];
  loading: boolean;
  setBatches: (batches: Batch[]) => void;
  fetchBatches: (recallTaskId?: string) => void;
  addBatch: (batch: Omit<Batch, 'id'>) => void;
  updateBatch: (id: string, data: Partial<Batch>) => void;
  deleteBatch: (id: string) => void;
  getBatchesByRecallId: (recallTaskId: string) => Batch[];
  getTotalQuantityByRecallId: (recallTaskId: string) => number;
}

export const useBatchStore = create<BatchState>((set, get) => ({
  batches: initialBatches,
  loading: false,

  setBatches: (batches: Batch[]) => {
    set({ batches });
    saveToStorage('batches', batches);
  },

  fetchBatches: (recallTaskId) => {
    set({ loading: true });
    setTimeout(() => {
      if (recallTaskId) {
        set({
          batches: mockBatches.filter((b) => b.recallTaskId === recallTaskId),
          loading: false,
        });
      } else {
        set({ batches: mockBatches, loading: false });
      }
    }, 200);
  },

  addBatch: (batch) => {
    const newBatch: Batch = {
      ...batch,
      id: `batch-${Date.now()}`,
    };
    set((state) => {
      const batches = [newBatch, ...state.batches];
      saveToStorage('batches', batches);
      return { batches };
    });
  },

  updateBatch: (id, data) => {
    set((state) => {
      const batches = state.batches.map((b) => (b.id === id ? { ...b, ...data } : b));
      saveToStorage('batches', batches);
      return { batches };
    });
  },

  deleteBatch: (id) => {
    set((state) => {
      const batches = state.batches.filter((b) => b.id !== id);
      saveToStorage('batches', batches);
      return { batches };
    });
  },

  getBatchesByRecallId: (recallTaskId) => {
    return get().batches.filter((b) => b.recallTaskId === recallTaskId);
  },

  getTotalQuantityByRecallId: (recallTaskId) => {
    return get()
      .batches.filter((b) => b.recallTaskId === recallTaskId)
      .reduce((sum, b) => sum + b.quantity, 0);
  },
}));
