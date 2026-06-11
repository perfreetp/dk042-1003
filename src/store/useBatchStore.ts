import { create } from 'zustand';
import type { Batch } from '@/types';
import { mockBatches } from '@/data/mockBatches';

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
  batches: mockBatches,
  loading: false,

  setBatches: (batches: Batch[]) => {
    set({ batches });
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
    set((state) => ({
      batches: [newBatch, ...state.batches],
    }));
  },

  updateBatch: (id, data) => {
    set((state) => ({
      batches: state.batches.map((b) => (b.id === id ? { ...b, ...data } : b)),
    }));
  },

  deleteBatch: (id) => {
    set((state) => ({
      batches: state.batches.filter((b) => b.id !== id),
    }));
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
