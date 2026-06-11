import { useState } from 'react';
import { Bell, ChevronDown, LogOut, User, Settings, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationStore } from '@/store/useNotificationStore';
import { formatDateTime } from '@/utils/formatUtils';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { StatusTag } from '@/components/common/StatusTag';
import type { UserRole } from '@/types';

export const Header = () => {
  const { currentUser, logout, users, switchRole } = useAuth();
  const { notifications, getNotificationStats } = useNotificationStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitch, setShowRoleSwitch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const stats = getNotificationStats();
  const unreadCount = stats.unread + stats.overdue;

  const recentNotifications = notifications
    .filter((n) => n.status === 'unread' || n.status === 'overdue')
    .slice(0, 5);

  const handleSwitchRole = (userId: string) => {
    switchRole(userId);
    setShowRoleSwitch(false);
    setShowUserMenu(false);
  };

  const roleOptions: { role: UserRole; label: string }[] = [
    { role: 'pharma', label: '药企' },
    { role: 'distributor', label: '经销商' },
    { role: 'store', label: '门店' },
  ];

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-slate-800">药品召回协同管理平台</h2>
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
            <span className="text-xs text-blue-600 font-medium">当前角色:</span>
            {currentUser && <StatusTag type="role" status={currentUser.role} />}
            <button
              onClick={() => setShowRoleSwitch(true)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium ml-1"
            >
              切换
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNotifications(true)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-700">
                  {currentUser?.name || '未登录'}
                </p>
                <p className="text-xs text-slate-500">{currentUser?.contact || ''}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-lg py-2 z-50">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-700">{currentUser?.name}</p>
                  <p className="text-xs text-slate-500">{currentUser?.phone}</p>
                </div>
                <button
                  onClick={() => setShowRoleSwitch(true)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  切换角色
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                  <Settings className="w-4 h-4" />
                  系统设置
                </button>
                <div className="border-t border-slate-100 mt-2 pt-2">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    退出登录
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <Modal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        title="通知消息"
        size="lg"
      >
        <div className="space-y-3">
          {recentNotifications.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>暂无未读通知</p>
            </div>
          ) : (
            recentNotifications.map((notification) => (
              <div
                key={notification.id}
                className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <StatusTag type="role" status={notification.recipientRole} />
                    <span className="text-sm font-medium text-slate-700">
                      {notification.recipientName}
                    </span>
                  </div>
                  <StatusTag type="notification" status={notification.status} showIcon />
                </div>
                <p className="text-sm text-slate-600 mb-1">
                  召回任务通知，请及时处理反馈
                </p>
                <p className="text-xs text-slate-400">
                  发送时间: {formatDateTime(notification.sentAt)}
                </p>
              </div>
            ))
          )}
        </div>
      </Modal>

      <Modal
        isOpen={showRoleSwitch}
        onClose={() => setShowRoleSwitch(false)}
        title="切换角色"
        size="md"
      >
        <p className="text-sm text-slate-600 mb-4">
          选择不同角色体验不同的功能权限
        </p>
        <div className="space-y-3">
          {roleOptions.map((roleOpt) => {
            const roleUsers = users.filter((u) => u.role === roleOpt.role).slice(0, 3);
            return (
              <div key={roleOpt.role} className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <StatusTag type="role" status={roleOpt.role} />
                  <span className="text-sm font-medium text-slate-700">{roleOpt.label}</span>
                </div>
                <div className="space-y-2 pl-2">
                  {roleUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSwitchRole(user.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        currentUser?.id === user.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{user.name}</p>
                          <p className="text-xs text-slate-500">
                            {user.region} · {user.city}
                          </p>
                        </div>
                        {currentUser?.id === user.id && (
                          <span className="text-xs text-blue-600 font-medium">当前</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
    </>
  );
};
