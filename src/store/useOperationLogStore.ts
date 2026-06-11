import { create } from 'zustand';
import { loadFromStorage, saveToStorage } from '@/utils/persistUtils';
import type { OperationLog } from '@/types';
import { mockOperationLogs } from '@/data/mockOperationLogs';

interface OperationLogState {
  operationLogs: OperationLog[];
  setOperationLogs: (logs: OperationLog[]) => void;
  addOperationLog: (log: Omit<OperationLog, 'id' | 'timestamp'>) => void;
  getLogsByRecallId: (recallTaskId: string) => OperationLog[];
  clearLogs: () => void;
}

const initialOperationLogs = loadFromStorage('operationLogs', mockOperationLogs);

export const useOperationLogStore = create<OperationLogState>((set, get) => ({
  operationLogs: initialOperationLogs,

  setOperationLogs: (logs: OperationLog[]) => {
    set({ operationLogs: logs });
    saveToStorage('operationLogs', logs);
  },

  addOperationLog: (log: Omit<OperationLog, 'id' | 'timestamp'>) => {
    const id = `log-${Date.now()}`;
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newLog: OperationLog = {
      ...log,
      id,
      timestamp,
    };
    set((state) => {
      const newLogs = [...state.operationLogs, newLog];
      saveToStorage('operationLogs', newLogs);
      return { operationLogs: newLogs };
    });
  },

  getLogsByRecallId: (recallTaskId: string) => {
    return get()
      .operationLogs.filter((l) => l.recallTaskId === recallTaskId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },

  clearLogs: () => {
    set({ operationLogs: [] });
    saveToStorage('operationLogs', []);
  },
}));
