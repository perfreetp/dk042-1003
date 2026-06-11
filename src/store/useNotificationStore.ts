import { create } from 'zustand';
import type { Notification, NotificationStatus } from '@/types';
import { mockNotifications } from '@/data/mockNotifications';
import { getUserById } from '@/data/mockUsers';
import { mockRecalls } from '@/data/mockRecalls';
import { useRecallStore } from '@/store/useRecallStore';
import { useOperationLogStore } from '@/store/useOperationLogStore';
import { loadFromStorage, saveToStorage } from '@/utils/persistUtils';

const initialNotifications = loadFromStorage<Notification[]>('notifications', mockNotifications);

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  setNotifications: (notifications: Notification[]) => void;
  getNotificationById: (id: string) => Notification | undefined;
  markAsSubmitted: (id: string) => void;
  fetchNotifications: (recallTaskId?: string) => void;
  sendNotifications: (recallTaskId: string, recipientIds: string[]) => void;
  markAsRead: (id: string) => void;
  sendReminder: (id: string) => void;
  checkOverdue: () => void;
  getNotificationsByRecallId: (recallTaskId: string) => Notification[];
  getNotificationsByStatus: (status: NotificationStatus) => Notification[];
  getNotificationStats: (recallTaskId?: string) => {
    total: number;
    unread: number;
    read: number;
    submitted: number;
    overdue: number;
  };
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: initialNotifications,
  loading: false,

  setNotifications: (notifications: Notification[]) => {
    set({ notifications });
    saveToStorage('notifications', notifications);
  },

  getNotificationById: (id: string) => {
    return get().notifications.find((n) => n.id === id);
  },

  markAsSubmitted: (id: string) => {
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id
          ? {
              ...n,
              status: 'submitted' as NotificationStatus,
            }
          : n
      );
      saveToStorage('notifications', notifications);
      return { notifications };
    });
  },

  fetchNotifications: (recallTaskId) => {
    set({ loading: true });
    setTimeout(() => {
      if (recallTaskId) {
        set({
          notifications: mockNotifications.filter((n) => n.recallTaskId === recallTaskId),
          loading: false,
        });
      } else {
        set({ notifications: mockNotifications, loading: false });
      }
    }, 200);
  },

  sendNotifications: (recallTaskId, recipientIds) => {
    const recallStore = useRecallStore.getState();
    const recall = recallStore.getRecallById(recallTaskId) || mockRecalls.find((r) => r.id === recallTaskId);
    const newNotifications: Notification[] = recipientIds.map((recipientId) => {
      const user = getUserById(recipientId);
      return {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        recallTaskId,
        recallTitle: recall?.title || '',
        recallReason: recall?.reason || '',
        recipientId,
        recipientRole: user?.role || 'store',
        recipientName: user?.name || '未知单位',
        recipientRegion: user?.province && user?.city ? `${user.province}${user.city}` : user?.region || '',
        status: 'unread' as NotificationStatus,
        sentAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        readAt: null,
        feedbackDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
        isOverdue: false,
      };
    });

    set((state) => {
      const notifications = [...newNotifications, ...state.notifications];
      saveToStorage('notifications', notifications);
      return { notifications };
    });

    useOperationLogStore.getState().addOperationLog({
      recallTaskId,
      operator: recall?.creatorName || '系统',
      operation: 'send_notifications',
      details: `向${recipientIds.length}家经销商及门店发送召回通知`,
    });
  },

  markAsRead: (id) => {
    const notification = get().getNotificationById(id);
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id
          ? {
              ...n,
              status: 'read' as NotificationStatus,
              readAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
            }
          : n
      );
      saveToStorage('notifications', notifications);
      return { notifications };
    });

    if (notification) {
      useOperationLogStore.getState().addOperationLog({
        recallTaskId: notification.recallTaskId,
        operator: notification.recipientName,
        operation: 'notification_read',
        details: `${notification.recipientRole === 'distributor' ? '经销商' : '门店'}已阅读召回通知`,
      });
    }
  },

  sendReminder: (id) => {
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id
          ? {
              ...n,
              sentAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
            }
          : n
      );
      saveToStorage('notifications', notifications);
      return { notifications };
    });
  },

  checkOverdue: () => {
    const now = new Date();
    set((state) => {
      const notifications = state.notifications.map((n) => {
        const deadline = new Date(n.feedbackDeadline);
        const isOverdue = now > deadline && n.status !== 'submitted';
        return {
          ...n,
          isOverdue,
          status: isOverdue && n.status !== 'submitted' ? 'overdue' : n.status,
        };
      });
      saveToStorage('notifications', notifications);
      return { notifications };
    });
  },

  getNotificationsByRecallId: (recallTaskId) => {
    return get().notifications.filter((n) => n.recallTaskId === recallTaskId);
  },

  getNotificationsByStatus: (status) => {
    return get().notifications.filter((n) => n.status === status);
  },

  getNotificationStats: (recallTaskId) => {
    const notifications = recallTaskId
      ? get().notifications.filter((n) => n.recallTaskId === recallTaskId)
      : get().notifications;

    return {
      total: notifications.length,
      unread: notifications.filter((n) => n.status === 'unread').length,
      read: notifications.filter((n) => n.status === 'read').length,
      submitted: notifications.filter((n) => n.status === 'submitted').length,
      overdue: notifications.filter((n) => n.status === 'overdue').length,
    };
  },
}));
