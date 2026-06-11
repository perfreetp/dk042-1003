import { create } from 'zustand';
import type { RecoveryRecord, RegionStats, ChannelStats, UserRole } from '@/types';
import { mockRecoveryRecords } from '@/data/mockRecoveryRecords';
import { getUserById } from '@/data/mockUsers';
import { loadFromStorage, saveToStorage } from '@/utils/persistUtils';
import { useOperationLogStore } from '@/store/useOperationLogStore';

const initialRecords = loadFromStorage<RecoveryRecord[]>('recoveryRecords', mockRecoveryRecords);

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
  saveDraft: (id: string | null, data: Omit<RecoveryRecord, 'id' | 'submittedAt'>) => void;
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
  getDraftRecords: (unitId?: string) => RecoveryRecord[];
  getFormalRecordsByRecallId: (recallTaskId: string) => RecoveryRecord[];
}

export const useRecoveryStore = create<RecoveryState>((set, get) => ({
  records: initialRecords,
  recoveryRecords: initialRecords,
  loading: false,

  setRecoveryRecords: (records: RecoveryRecord[]) => {
    set({ records, recoveryRecords: records });
    saveToStorage('recoveryRecords', records);
  },

  getRecoveryRecordsByRecallId: (recallTaskId: string) => {
    return get().records.filter((r) => r.recallTaskId === recallTaskId);
  },

  getRecoveryRecordByNotificationId: (notificationId: string) => {
    return get().records.find((r) => r.notificationId === notificationId);
  },

  getStatistics: (recallTaskId) => {
    const records = recallTaskId
      ? get().records.filter((r) => r.recallTaskId === recallTaskId && !r.isDraft)
      : get().records.filter((r) => !r.isDraft);

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
    const region = user?.province && user?.city ? `${user.province}${user.city}` : user?.region || data.unitRegion;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    if (id) {
      set((state) => {
        const newRecords = state.records.map((r) =>
          r.id === id
            ? {
                ...r,
                ...data,
                submittedAt: now,
                unitName: user?.name || data.unitName,
                unitRegion: region,
                isDraft: false,
                updatedAt: now,
              }
            : r
        );
        saveToStorage('recoveryRecords', newRecords);
        return { records: newRecords, recoveryRecords: newRecords };
      });
    } else {
      const newRecord: RecoveryRecord = {
        ...data,
        id: `record-${Date.now()}`,
        submittedAt: now,
        unitName: user?.name || data.unitName,
        unitRegion: region,
        isDraft: false,
        updatedAt: now,
      };
      set((state) => {
        const newRecords = [newRecord, ...state.records];
        saveToStorage('recoveryRecords', newRecords);
        return { records: newRecords, recoveryRecords: newRecords };
      });
    }

    const unitName = user?.name || data.unitName;
    const roleName = data.unitRole === 'distributor' ? '经销商' : '门店';
    useOperationLogStore.getState().addOperationLog({
      recallTaskId: data.recallTaskId,
      operator: unitName,
      operation: 'submit_recovery',
      details: `${roleName}提交回收登记：库存${data.stockQuantity}盒，已售${data.soldQuantity}盒，已回收${data.recoveredQuantity}盒`,
    });
  },

  saveDraft: (id, data) => {
    const user = getUserById(data.unitId);
    const region = user?.province && user?.city ? `${user.province}${user.city}` : user?.region || data.unitRegion;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    if (id) {
      set((state) => {
        const newRecords = state.records.map((r) =>
          r.id === id
            ? {
                ...r,
                ...data,
                unitName: user?.name || data.unitName,
                unitRegion: region,
                isDraft: true,
                updatedAt: now,
              }
            : r
        );
        saveToStorage('recoveryRecords', newRecords);
        return { records: newRecords, recoveryRecords: newRecords };
      });
    } else {
      const newRecord: RecoveryRecord = {
        ...data,
        id: `record-${Date.now()}`,
        submittedAt: now,
        unitName: user?.name || data.unitName,
        unitRegion: region,
        isDraft: true,
        updatedAt: now,
      };
      set((state) => {
        const newRecords = [newRecord, ...state.records];
        saveToStorage('recoveryRecords', newRecords);
        return { records: newRecords, recoveryRecords: newRecords };
      });
    }

    const unitName = user?.name || data.unitName;
    const roleName = data.unitRole === 'distributor' ? '经销商' : '门店';
    useOperationLogStore.getState().addOperationLog({
      recallTaskId: data.recallTaskId,
      operator: unitName,
      operation: 'save_draft',
      details: `${roleName}保存回收登记草稿，库存数量：${data.stockQuantity}盒`,
    });
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

    const extractProvince = (region: string): string => {
      if (region.includes('省')) {
        return region.substring(0, region.indexOf('省') + 1).replace('省', '');
      } else if (region.includes('市')) {
        return region.substring(0, region.indexOf('市') + 1).replace('市', '');
      }
      return region;
    };

    records.forEach((r) => {
      const key = extractProvince(r.unitRegion);
      if (!regionMap.has(key)) {
        regionMap.set(key, {
          province: key,
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

    return Array.from(regionMap.values()).map((stat) => ({
      ...stat,
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
      ? get().records.filter((r) => r.recallTaskId === recallTaskId && !r.isDraft)
      : get().records.filter((r) => !r.isDraft);

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

  getDraftRecords: (unitId) => {
    const records = get().records.filter((r) => r.isDraft === true);
    if (unitId) {
      return records.filter((r) => r.unitId === unitId);
    }
    return records;
  },

  getFormalRecordsByRecallId: (recallTaskId: string) => {
    return get().records.filter((r) => r.recallTaskId === recallTaskId && r.isDraft !== true);
  },
}));
