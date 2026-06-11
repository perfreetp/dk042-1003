export type UserRole = 'pharma' | 'distributor' | 'store';

export type RiskLevel = 'high' | 'medium' | 'low';

export type TaskStatus = 'draft' | 'pending' | 'in_progress' | 'completed' | 'closed';

export type NotificationStatus = 'unread' | 'read' | 'submitted' | 'overdue';

export interface RecallTask {
  id: string;
  title: string;
  reason: string;
  riskLevel: RiskLevel;
  description: string;
  status: TaskStatus;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  creatorName: string;
  closingNote?: string;
}

export interface Batch {
  id: string;
  recallTaskId: string;
  batchNumber: string;
  productionDate: string;
  expiryDate: string;
  quantity: number;
  productName: string;
  specification: string;
}

export interface Notification {
  id: string;
  recallTaskId: string;
  recallTitle: string;
  recallReason: string;
  recipientId: string;
  recipientRole: UserRole;
  recipientName: string;
  recipientRegion: string;
  status: NotificationStatus;
  sentAt: string;
  readAt: string | null;
  feedbackDeadline: string;
  isOverdue: boolean;
}

export interface RecoveryRecord {
  id: string;
  recallTaskId: string;
  notificationId: string;
  unitId: string;
  unitRole: UserRole;
  unitName: string;
  unitRegion: string;
  stockQuantity: number;
  soldQuantity: number;
  recoveredQuantity: number;
  notes: string;
  submittedAt: string;
  photos: string[];
  isDraft?: boolean;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  roleName: string;
  region: string;
  province: string;
  city: string;
  channel: string;
  contact: string;
  phone: string;
}

export interface DashboardStats {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  totalNotifications: number;
  readNotifications: number;
  submittedRecords: number;
  overdueNotifications: number;
  totalRecoveryRate: number;
}

export interface RegionStats {
  province: string;
  city: string;
  totalUnits: number;
  respondedUnits: number;
  responseRate: number;
  totalStock: number;
  totalRecovered: number;
  recoveryRate: number;
}

export interface ChannelStats {
  channel: string;
  role: UserRole;
  roleName: string;
  totalUnits: number;
  respondedUnits: number;
  responseRate: number;
  totalStock: number;
  totalRecovered: number;
  recoveryRate: number;
}

export interface OperationLog {
  id: string;
  recallTaskId: string;
  operator: string;
  operation: string;
  timestamp: string;
  details: string;
  relatedUnit?: string;
  relatedUnitRole?: UserRole;
  processingResult?: string;
}

export interface InternalNote {
  id: string;
  recallTaskId: string;
  targetId: string;
  targetType: 'notification' | 'recovery_record';
  content: string;
  operator: string;
  operatorRole: UserRole;
  createdAt: string;
}

export type RiskLevelConfig = {
  [key in RiskLevel]: { label: string; color: string; bgColor: string };
};

export type TaskStatusConfig = {
  [key in TaskStatus]: { label: string; color: string; bgColor: string };
};

export type NotificationStatusConfig = {
  [key in NotificationStatus]: { label: string; color: string; bgColor: string };
};

export type UserRoleConfig = {
  [key in UserRole]: { label: string; color: string; bgColor: string };
};

export const RISK_LEVEL_CONFIG: RiskLevelConfig = {
  high: { label: '高风险', color: 'text-red-700', bgColor: 'bg-red-100' },
  medium: { label: '中风险', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  low: { label: '低风险', color: 'text-green-700', bgColor: 'bg-green-100' },
};

export const TASK_STATUS_CONFIG: TaskStatusConfig = {
  draft: { label: '草稿', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  pending: { label: '待通知', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  in_progress: { label: '进行中', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  completed: { label: '已完成', color: 'text-green-700', bgColor: 'bg-green-100' },
  closed: { label: '已关闭', color: 'text-slate-700', bgColor: 'bg-slate-100' },
};

export const NOTIFICATION_STATUS_CONFIG: NotificationStatusConfig = {
  unread: { label: '未读', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  read: { label: '已读', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  submitted: { label: '已反馈', color: 'text-green-700', bgColor: 'bg-green-100' },
  overdue: { label: '已逾期', color: 'text-red-700', bgColor: 'bg-red-100' },
};

export const USER_ROLE_CONFIG: UserRoleConfig = {
  pharma: { label: '药企', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
  distributor: { label: '经销商', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  store: { label: '门店', color: 'text-teal-700', bgColor: 'bg-teal-100' },
};

export const OPERATION_TYPE_CONFIG: Record<string, { label: string }> = {
  create_recall: { label: '创建召回' },
  send_notifications: { label: '发送通知' },
  notification_read: { label: '通知已读' },
  submit_recovery: { label: '提交回收' },
  save_draft: { label: '保存草稿' },
  close_task: { label: '关闭任务' },
  mark_overdue: { label: '标记逾期' },
  add_note: { label: '添加备注' },
};
