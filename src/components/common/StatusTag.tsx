import type { TaskStatus, NotificationStatus, UserRole } from '@/types';
import { TASK_STATUS_CONFIG, NOTIFICATION_STATUS_CONFIG, USER_ROLE_CONFIG } from '@/types';

interface StatusTagProps {
  type: 'task' | 'notification' | 'role';
  status: TaskStatus | NotificationStatus | UserRole;
  showIcon?: boolean;
}

export const StatusTag = ({ type, status, showIcon = false }: StatusTagProps) => {
  let config;
  switch (type) {
    case 'task':
      config = TASK_STATUS_CONFIG[status as TaskStatus];
      break;
    case 'notification':
      config = NOTIFICATION_STATUS_CONFIG[status as NotificationStatus];
      break;
    case 'role':
      config = USER_ROLE_CONFIG[status as UserRole];
      break;
    default:
      config = { label: status, color: 'text-gray-700', bgColor: 'bg-gray-100' };
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color} transition-all duration-200`}
    >
      {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {config.label}
    </span>
  );
};
