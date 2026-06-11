import type { InternalNote } from '@/types';

export const mockInternalNotes: InternalNote[] = [
  {
    id: 'note-001',
    recallTaskId: 'recall-001',
    targetId: 'notif-001',
    targetType: 'notification',
    content: '该经销商反馈库存较大，需要协调物流支持回收。',
    operator: '华润制药集团',
    operatorRole: 'pharma',
    createdAt: '2024-01-15 10:30:00',
  },
  {
    id: 'note-002',
    recallTaskId: 'recall-001',
    targetId: 'record-001',
    targetType: 'recovery_record',
    content: '该门店回收进度较慢，已电话催促。',
    operator: '华润制药集团',
    operatorRole: 'pharma',
    createdAt: '2024-01-16 14:20:00',
  },
];
