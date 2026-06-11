import { useState, useMemo } from 'react';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useRecallStore } from '@/store/useRecallStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { StatusTag } from '@/components/common/StatusTag';
import { RiskBadge } from '@/components/common/RiskBadge';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, formatPercent } from '@/utils/formatUtils';
import type { NotificationStatus } from '@/types';
import {
  Bell,
  Search,
  Filter,
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageSquare,
  Eye,
} from 'lucide-react';

export const NotificationManagement = () => {
  const { notifications, markAsRead, sendReminder } = useNotificationStore();
  const { recalls } = useRecallStore();
  const { currentUser, canEditRecall } = useAuth();
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<NotificationStatus | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  const myNotifications = useMemo(() => {
    if (!currentUser) return [];
    return notifications.filter((n) =>
      currentUser.role === 'pharma' ? true : n.recipientId === currentUser.id
    );
  }, [notifications, currentUser]);

  const filteredNotifications = useMemo(() => {
    return myNotifications.filter((n) => {
      const matchKeyword =
        n.recipientName.includes(keyword) ||
        n.recallTitle?.includes(keyword) ||
        n.recallReason?.includes(keyword);
      const matchStatus = !statusFilter || n.status === statusFilter;
      return matchKeyword && matchStatus;
    });
  }, [myNotifications, keyword, statusFilter]);

  const stats = useMemo(() => {
    const total = myNotifications.length;
    const unread = myNotifications.filter((n) => n.status === 'unread').length;
    const read = myNotifications.filter((n) => n.status === 'read').length;
    const submitted = myNotifications.filter((n) => n.status === 'submitted').length;
    const overdue = myNotifications.filter((n) => n.status === 'overdue').length;
    return { total, unread, read, submitted, overdue };
  }, [myNotifications]);

  const clearFilters = () => {
    setKeyword('');
    setStatusFilter('');
  };

  const getRecallInfo = (recallTaskId: string) => {
    return recalls.find((r) => r.id === recallTaskId);
  };

  const statusOptions: { value: NotificationStatus | ''; label: string }[] = [
    { value: '', label: '全部状态' },
    { value: 'unread', label: '未读' },
    { value: 'read', label: '已读' },
    { value: 'submitted', label: '已提交' },
    { value: 'overdue', label: '已逾期' },
  ];

  const hasActiveFilters = statusFilter || keyword;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">下游通知</h1>
        <p className="text-slate-500 mt-1">跟踪召回通知的发送、阅读和反馈状态</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">全部通知</p>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">未读</p>
                <p className="text-2xl font-bold text-amber-600">{stats.unread}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">已读</p>
                <p className="text-2xl font-bold text-blue-600">{stats.read}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">已提交</p>
                <p className="text-2xl font-bold text-green-600">{stats.submitted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">逾期</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-center gap-8 py-2">
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-600">
            {formatPercent(stats.unread + stats.read + stats.submitted, stats.total)}
          </p>
          <p className="text-sm text-slate-500">阅读率</p>
        </div>
        <div className="w-px h-12 bg-slate-200" />
        <div className="text-center">
          <p className="text-3xl font-bold text-green-600">
            {formatPercent(stats.submitted, stats.total)}
          </p>
          <p className="text-sm text-slate-500">反馈率</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="搜索通知对象、召回任务..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant={showFilters ? 'primary' : 'secondary'}
              leftIcon={<Filter className="w-4 h-4" />}
              onClick={() => setShowFilters(!showFilters)}
            >
              筛选
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                leftIcon={<X className="w-4 h-4" />}
                onClick={clearFilters}
              >
                清除
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-2">通知状态</label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === opt.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">召回任务</th>
                  {currentUser?.role === 'pharma' && (
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">通知对象</th>
                  )}
                  {currentUser?.role === 'pharma' && (
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">角色</th>
                  )}
                  {currentUser?.role === 'pharma' && (
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">地区</th>
                  )}
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">风险等级</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">状态</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">发送时间</th>
                  {canEditRecall() && (
                    <th className="text-right py-4 px-6 text-sm font-semibold text-slate-600">操作</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredNotifications.length === 0 ? (
                  <tr>
                    <td colSpan={currentUser?.role === 'pharma' ? 8 : 5} className="py-16 text-center">
                      <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">暂无通知记录</p>
                    </td>
                  </tr>
                ) : (
                  filteredNotifications.map((notif) => {
                    const recall = getRecallInfo(notif.recallTaskId);
                    return (
                      <tr
                        key={notif.id}
                        className={`border-b border-slate-100 transition-colors ${
                          notif.status === 'unread' ? 'bg-blue-50/30' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-4 px-6">
                          <p className="font-medium text-slate-800">{notif.recallTitle}</p>
                          <p className="text-sm text-slate-500">{notif.recallReason}</p>
                        </td>
                        {currentUser?.role === 'pharma' && (
                          <td className="py-4 px-6 font-medium text-slate-700">
                            {notif.recipientName}
                          </td>
                        )}
                        {currentUser?.role === 'pharma' && (
                          <td className="py-4 px-6">
                            <StatusTag type="role" status={notif.recipientRole} />
                          </td>
                        )}
                        {currentUser?.role === 'pharma' && (
                          <td className="py-4 px-6 text-slate-600">{notif.recipientRegion}</td>
                        )}
                        <td className="py-4 px-6">
                          {recall && <RiskBadge level={recall.riskLevel} size="sm" />}
                        </td>
                        <td className="py-4 px-6">
                          <StatusTag type="notification" status={notif.status} />
                        </td>
                        <td className="py-4 px-6 text-slate-600 text-sm">
                          {formatDate(notif.sentAt)}
                        </td>
                        {canEditRecall() && (
                          <td className="py-4 px-6">
                            <div className="flex justify-end gap-2">
                              {notif.status === 'unread' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  leftIcon={<MessageSquare className="w-4 h-4" />}
                                  onClick={() => sendReminder(notif.id)}
                                >
                                  催办
                                </Button>
                              )}
                              {notif.status !== 'submitted' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  leftIcon={<Eye className="w-4 h-4" />}
                                  onClick={() => markAsRead(notif.id)}
                                >
                                  标记已读
                                </Button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
