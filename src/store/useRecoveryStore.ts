import { create } from 'zustand';
import type { RecoveryRecord, RegionStats, ChannelStats, UserRole } from '@/types';
import { mockRecoveryRecords } from '@/data/mockRecoveryRecords';
import { getUserById } from '@/data/mockUsers';

interface RecoveryState {
  records: RecoveryRecord[];
  recoveryRecords: RecoveryRecord[];
  loading: boolean;
  setRecoveryRecords: (records: RecoveryRecord[]) => void;
  getRecoveryRecordsByRecallId: (recallTaskId: string) => RecoveryRecord[];
  getRecoveryRecordByNotificationId: (notificationId: string) => RecoveryRecord | undefined;
  getStatistics: (recallTaskId?: string) => {
    totalStock: number;
    totalSold: number;
    totalRecovered: number;
    totalUnits: number;
    submittedUnits: number;
    recoveryRate: number;
    responseRate: number;
  };
  fetchRecords: (recallTaskId?: string) => void;
  submitRecord: (id: string | null, data: Omit<RecoveryRecord, 'id' | 'submittedAt'>) => void;
  getRecordsByRecallId: (recallTaskId: string) => RecoveryRecord[];
  getRecordsBySubmitter: (unitId: string) => RecoveryRecord[];
  getRecordsByRegion: (recallTaskId?: string) => RegionStats[];
  getRecordsByChannel: (recallTaskId?: string) => ChannelStats[];
  getRecoveryStats: (recallTaskId?: string) => {
    totalStock: number;
    totalSold: number;
    totalRecovered: number;
    recoveryRate: number;
    responseRate: number;
  };
}

export const useRecoveryStore = create<RecoveryState>((set, get) => ({
  records: mockRecoveryRecords,
  recoveryRecords: mockRecoveryRecords,
  loading: false,

  setRecoveryRecords: (records: RecoveryRecord[]) => {
    set({ records, recoveryRecords: records });
  },

  getRecoveryRecordsByRecallId: (recallTaskId: string) => {
    return get().records.filter((r) => r.recallTaskId === recallTaskId);
  },

  getRecoveryRecordByNotificationId: (notificationId: string) => {
    return get().records.find((r) => r.notificationId === notificationId);
  },

  getStatistics: (recallTaskId) => {
    const records = recallTaskId
      ? get().records.filter((r) => r.recallTaskId === recallTaskId)
      : get().records;

    const totalStock = records.reduce((sum, r) => sum + r.stockQuantity, 0);
    const totalSold = records.reduce((sum, r) => sum + r.soldQuantity, 0);
    const totalRecovered = records.reduce((sum, r) => sum + r.recoveredQuantity, 0);
    const totalUnits = new Set(records.map((r) => r.unitId)).size;
    const submittedUnits = records.length;

    return {
      totalStock,
      totalSold,
      totalRecovered,
      totalUnits,
      submittedUnits,
      recoveryRate: totalStock > 0 ? Math.round((totalRecovered / totalStock) * 100) : 0,
      responseRate: totalUnits > 0 ? Math.round((submittedUnits / totalUnits) * 100) : 0,
    };
  },

  fetchRecords: (recallTaskId) => {
    set({ loading: true });
    setTimeout(() => {
      if (recallTaskId) {
        set({
          records: mockRecoveryRecords.filter((r) => r.recallTaskId === recallTaskId),
          loading: false,
        });
      } else {
        set({ records: mockRecoveryRecords, loading: false });
      }
    }, 200);
  },

  submitRecord: (id, data) => {
    const user = getUserById(data.unitId);
    if (id) {
      set((state) => {
        const newRecords = state.records.map((r) =>
          r.id === id
            ? {
                ...r,
                ...data,
                submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
                unitName: user?.name || data.unitName,
                unitRegion: user?.region || data.unitRegion,
              }
            : r
        );
        return { records: newRecords, recoveryRecords: newRecords };
      });
    } else {
      const newRecord: RecoveryRecord = {
        ...data,
        id: `record-${Date.now()}`,
        submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        unitName: user?.name || data.unitName,
        unitRegion: user?.region || data.unitRegion,
      };
      set((state) => {
        const newRecords = [newRecord, ...state.records];
        return { records: newRecords, recoveryRecords: newRecords };
      });
    }
  },

  getRecordsByRecallId: (recallTaskId) => {
    return get().records.filter((r) => r.recallTaskId === recallTaskId);
  },

  getRecordsBySubmitter: (unitId) => {
    return get().records.filter((r) => r.unitId === unitId);
  },

  getRecordsByRegion: (recallTaskId) => {
    const allRecords = get().records;
    const records = recallTaskId
      ? allRecords.filter((r) => r.recallTaskId === recallTaskId)
      : allRecords;
    const regionMap = new Map<string, RegionStats>();

    records.forEach((r) => {
      const key = r.unitRegion;
      if (!regionMap.has(key)) {
        regionMap.set(key, {
          province: '',
          city: '',
          totalUnits: 0,
          respondedUnits: 0,
          responseRate: 0,
          totalStock: 0,
          totalRecovered: 0,
          recoveryRate: 0,
        });
      }
      const stat = regionMap.get(key)!;
      stat.totalUnits++;
      stat.respondedUnits++;
      stat.totalStock += r.stockQuantity;
      stat.totalRecovered += r.recoveredQuantity;
    });

    return Array.from(regionMap.entries()).map(([region, stat]) => ({
      ...stat,
      province: region,
      responseRate: stat.totalUnits > 0 ? Math.round((stat.respondedUnits / stat.totalUnits) * 100) : 0,
      recoveryRate: stat.totalStock > 0 ? Math.round((stat.totalRecovered / stat.totalStock) * 100) : 0,
    }));
  },

  getRecordsByChannel: (recallTaskId) => {
    const allRecords = get().records;
    const records = recallTaskId
      ? allRecords.filter((r) => r.recallTaskId === recallTaskId)
      : allRecords;
    const channelMap = new Map<string, ChannelStats>();

    records.forEach((r) => {
      const user = getUserById(r.unitId);
      const key = user?.channel || '其他';
      if (!channelMap.has(key)) {
        channelMap.set(key, {
          channel: key,
          role: r.unitRole,
          roleName: r.unitRole === 'distributor' ? '经销商' : '门店',
          totalUnits: 0,
          respondedUnits: 0,
          responseRate: 0,
          totalStock: 0,
          totalRecovered: 0,
          recoveryRate: 0,
        });
      }
      const stat = channelMap.get(key)!;
      stat.totalUnits++;
      stat.respondedUnits++;
      stat.totalStock += r.stockQuantity;
      stat.totalRecovered += r.recoveredQuantity;
    });

    return Array.from(channelMap.values()).map((stat) => ({
      ...stat,
      responseRate: stat.totalUnits > 0 ? Math.round((stat.respondedUnits / stat.totalUnits) * 100) : 0,
      recoveryRate: stat.totalStock > 0 ? Math.round((stat.totalRecovered / stat.totalStock) * 100) : 0,
    }));
  },

  getRecoveryStats: (recallTaskId) => {
    const records = recallTaskId
      ? get().records.filter((r) => r.recallTaskId === recallTaskId)
      : get().records;

    const totalStock = records.reduce((sum, r) => sum + r.stockQuantity, 0);
    const totalSold = records.reduce((sum, r) => sum + r.soldQuantity, 0);
    const totalRecovered = records.reduce((sum, r) => sum + r.recoveredQuantity, 0);

    return {
      totalStock,
      totalSold,
      totalRecovered,
      recoveryRate: totalStock > 0 ? Math.round((totalRecovered / totalStock) * 100) : 0,
      responseRate: records.length > 0 ? Math.round((records.length / records.length) * 100) : 0,
    };
  },
}));
