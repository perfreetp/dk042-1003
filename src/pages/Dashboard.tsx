import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecallStore } from '@/store/useRecallStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useRecoveryStore } from '@/store/useRecoveryStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { StatsCard } from '@/components/features/StatsCard';
import { RegionChart } from '@/components/features/RegionChart';
import { ChannelChart } from '@/components/features/ChannelChart';
import { RiskBadge } from '@/components/common/RiskBadge';
import { StatusTag } from '@/components/common/StatusTag';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, formatPercent, formatNumber } from '@/utils/formatUtils';
import type { RecallTask } from '@/types';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Package,
  TrendingUp,
  Users,
  ChevronRight,
  BarChart3,
} from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { recalls } = useRecallStore();
  const { notifications } = useNotificationStore();
  const { recoveryRecords } = useRecoveryStore();
  const { currentUser, canEditRecall } = useAuth();

  const stats = useMemo(() => {
    const activeRecalls = recalls.filter((r) => r.status === 'in_progress').length;
    const completedRecalls = recalls.filter((r) => r.status === 'completed' || r.status === 'closed').length;
    const draftRecalls = recalls.filter((r) => r.status === 'draft').length;

    const totalNotifications = notifications.length;
    const unreadNotifications = notifications.filter((n) => n.status === 'unread').length;
    const submittedNotifications = notifications.filter((n) => n.status === 'submitted').length;
    const overdueNotifications = notifications.filter((n) => n.status === 'overdue').length;

    const totalStock = recoveryRecords.reduce((sum, r) => sum + r.stockQuantity, 0);
    const totalSold = recoveryRecords.reduce((sum, r) => sum + r.soldQuantity, 0);
    const totalRecovered = recoveryRecords.reduce((sum, r) => sum + r.recoveredQuantity, 0);
    const totalQuantity = totalStock + totalSold;

    const myNotifications =
      currentUser?.role !== 'pharma'
        ? notifications.filter((n) => n.recipientId === currentUser?.id)
        : [];
    const myPending = myNotifications.filter(
      (n) => n.status === 'unread' || n.status === 'read'
    ).length;

    return {
      totalRecalls: recalls.length,
      activeRecalls,
      completedRecalls,
      draftRecalls,
      totalNotifications,
      unreadNotifications,
      submittedNotifications,
      overdueNotifications,
      totalStock,
      totalSold,
      totalRecovered,
      totalQuantity,
      recoveryRate: totalQuantity > 0 ? (totalRecovered / totalQuantity) * 100 : 0,
      myPending,
    };
  }, [recalls, notifications, recoveryRecords, currentUser]);

  const regionData = useMemo(() => {
    const provinceMap = new Map<string, { notifications: typeof notifications; records: typeof recoveryRecords }>();
    
    notifications.forEach((n) => {
      let province = n.recipientRegion;
      if (province.includes('省')) {
        province = province.substring(0, province.indexOf('省') + 1);
      } else if (province.includes('市')) {
        province = province.substring(0, province.indexOf('市') + 1);
      }
      province = province.replace(/省|市/g, '');
      
      if (!provinceMap.has(province)) {
        provinceMap.set(province, { notifications: [], records: [] });
      }
      provinceMap.get(province)!.notifications.push(n);
    });
    
    recoveryRecords.forEach((r) => {
      let province = r.unitRegion;
      if (province.includes('省')) {
        province = province.substring(0, province.indexOf('省') + 1);
      } else if (province.includes('市')) {
        province = province.substring(0, province.indexOf('市') + 1);
      }
      province = province.replace(/省|市/g, '');
      
      if (!provinceMap.has(province)) {
        provinceMap.set(province, { notifications: [], records: [] });
      }
      provinceMap.get(province)!.records.push(r);
    });
    
    return Array.from(provinceMap.entries()).map(([region, data]) => {
      const regionNotifications = data.notifications;
      const submitted = regionNotifications.filter((n) => n.status === 'submitted').length;
      const regionRecords = data.records;
      const stock = regionRecords.reduce((sum, r) => sum + r.stockQuantity, 0);
      const sold = regionRecords.reduce((sum, r) => sum + r.soldQuantity, 0);
      const recovered = regionRecords.reduce((sum, r) => sum + r.recoveredQuantity, 0);
      const total = stock + sold;

      return {
        name: region,
        回复率: regionNotifications.length > 0 ? (submitted / regionNotifications.length) * 100 : 0,
        回收率: total > 0 ? (recovered / total) * 100 : 0,
      };
    });
  }, [notifications, recoveryRecords]);

  const channelData = useMemo(() => {
    const distributorCount = notifications.filter(
      (n) => n.recipientRole === 'distributor'
    ).length;
    const storeCount = notifications.filter((n) => n.recipientRole === 'store').length;
    const distributorSubmitted = notifications.filter(
      (n) => n.recipientRole === 'distributor' && n.status === 'submitted'
    ).length;
    const storeSubmitted = notifications.filter(
      (n) => n.recipientRole === 'store' && n.status === 'submitted'
    ).length;

    return [
      {
        name: '经销商',
        value: distributorCount,
        响应率: distributorCount > 0 ? (distributorSubmitted / distributorCount) * 100 : 0,
      },
      {
        name: '门店',
        value: storeCount,
        响应率: storeCount > 0 ? (storeSubmitted / storeCount) * 100 : 0,
      },
    ];
  }, [notifications]);

  const activeRecalls = useMemo(
    () => recalls.filter((r) => r.status === 'in_progress').slice(0, 5),
    [recalls]
  );

  const overdueList = useMemo(() => {
    return notifications
      .filter((n) => n.status === 'overdue')
      .slice(0, 5)
      .map((n) => {
        const recall = recalls.find((r) => r.id === n.recallTaskId);
        return { ...n, recall };
      });
  }, [notifications, recalls]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">进度看板</h1>
          <p className="text-slate-500 mt-1">实时监控召回进度，追踪各单位反馈情况</p>
        </div>
        {canEditRecall() && (
          <Button
            leftIcon={<BarChart3 className="w-4 h-4" />}
            onClick={() => navigate('/recalls/create')}
          >
            发起召回
          </Button>
        )}
      </div>

      {stats.myPending > 0 && currentUser?.role !== 'pharma' && (
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-amber-700">您有 {stats.myPending} 条待处理的召回通知</p>
              <p className="text-sm text-amber-600">请及时查看并提交回收登记信息</p>
            </div>
          </div>
          <Button variant="secondary" onClick={() => navigate('/recovery')}>
            去处理
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="召回任务总数"
          value={stats.totalRecalls}
          icon={<Package className="w-6 h-6" />}
          color="blue"
          trend={`${stats.activeRecalls} 个进行中`}
        />
        <StatsCard
          title="通知总数"
          value={stats.totalNotifications}
          icon={<Users className="w-6 h-6" />}
          color="purple"
          trend={`${formatPercent(stats.submittedNotifications, stats.totalNotifications)} 反馈率`}
        />
        <StatsCard
          title="已回收数量"
          value={formatNumber(stats.totalRecovered)}
          icon={<CheckCircle2 className="w-6 h-6" />}
          color="green"
          subtitle="盒"
          trend={`${stats.recoveryRate.toFixed(1)}% 回收率`}
        />
        <StatsCard
          title="逾期未反馈"
          value={stats.overdueNotifications}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="red"
          trend="需紧急处理"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>各地区进度对比</CardTitle>
            <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
              查看详情
            </Button>
          </CardHeader>
          <CardContent>
            <RegionChart data={regionData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>渠道分布与响应</CardTitle>
            <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
              查看详情
            </Button>
          </CardHeader>
          <CardContent>
            <ChannelChart data={channelData} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>进行中的召回</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ChevronRight className="w-4 h-4" />}
              onClick={() => navigate('/')}
            >
              查看全部
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {activeRecalls.length === 0 ? (
              <div className="py-12 text-center">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">暂无进行中的召回任务</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activeRecalls.map((recall) => (
                  <RecallProgressItem key={recall.id} recall={recall} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-red-600">逾期未反馈</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ChevronRight className="w-4 h-4" />}
              onClick={() => navigate('/notifications')}
            >
              查看全部
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {overdueList.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-slate-500">暂无逾期未反馈的单位</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {overdueList.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/notifications`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-800">{item.recipientName}</span>
                      <StatusTag type="notification" status="overdue" />
                    </div>
                    <p className="text-sm text-slate-500 mb-2">{item.recallTitle}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>{item.recipientRegion}</span>
                      <span>发送于 {formatDate(item.sentAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const RecallProgressItem = ({ recall }: { recall: RecallTask }) => {
  const navigate = useNavigate();
  const { getNotificationsByRecallId } = useNotificationStore();
  const { getStatistics } = useRecoveryStore();
  const notifications = getNotificationsByRecallId(recall.id);
  const stats = getStatistics(recall.id);

  const progress = notifications.length > 0 ? (stats.submittedUnits / notifications.length) * 100 : 0;

  return (
    <div
      className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
      onClick={() => navigate(`/recalls/${recall.id}`)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-slate-800">{recall.title}</h4>
          <RiskBadge level={recall.riskLevel} size="sm" />
        </div>
        <span className="text-xs text-slate-400">
          截止 {formatDate(recall.deadline)}
        </span>
      </div>
      <div className="flex items-center gap-6 text-sm text-slate-500 mb-3">
        <span className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          {stats.submittedUnits}/{notifications.length} 已反馈
        </span>
        <span className="flex items-center gap-1">
          <Package className="w-4 h-4" />
          {formatPercent(stats.totalRecovered, stats.totalStock)} 回收率
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
