import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoveryStore } from '@/store/useRecoveryStore';
import { useRecallStore } from '@/store/useRecallStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { StatusTag } from '@/components/common/StatusTag';
import { RiskBadge } from '@/components/common/RiskBadge';
import { ProgressBar } from '@/components/common/ProgressBar';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, formatPercent, formatNumber } from '@/utils/formatUtils';
import {
  ClipboardList,
  Search,
  Filter,
  X,
  Plus,
  FileText,
  ArrowRight,
} from 'lucide-react';

export const RecoveryList = () => {
  const navigate = useNavigate();
  const { recoveryRecords, getStatistics, getRecoveryRecordByNotificationId, getDraftRecords } = useRecoveryStore();
  const { recalls } = useRecallStore();
  const { notifications } = useNotificationStore();
  const { currentUser, canEditRecall } = useAuth();
  const [keyword, setKeyword] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [recallFilter, setRecallFilter] = useState('');

  const myRecords = useMemo(() => {
    if (!currentUser) return [];
    return recoveryRecords.filter((r) =>
      currentUser.role === 'pharma' ? true : r.unitId === currentUser.id
    );
  }, [recoveryRecords, currentUser]);

  const myDraftRecords = useMemo(() => {
    if (!currentUser || currentUser.role === 'pharma') return [];
    return getDraftRecords(currentUser.id);
  }, [getDraftRecords, currentUser]);

  const pendingNotifications = useMemo(() => {
    if (!currentUser || currentUser.role === 'pharma') return [];
    return notifications.filter(
      (n) =>
        n.recipientId === currentUser.id &&
        (n.status === 'unread' || n.status === 'read')
    );
  }, [notifications, currentUser]);

  const filteredRecords = useMemo(() => {
    return myRecords.filter((r) => {
      const recall = recalls.find((rec) => rec.id === r.recallTaskId);
      const matchKeyword =
        r.unitName.includes(keyword) ||
        recall?.title.includes(keyword) ||
        recall?.reason.includes(keyword);
      const matchRecall = !recallFilter || r.recallTaskId === recallFilter;
      return matchKeyword && matchRecall;
    });
  }, [myRecords, keyword, recallFilter, recalls]);

  const formalFilteredRecords = useMemo(() => {
    return filteredRecords.filter((r) => !r.isDraft);
  }, [filteredRecords]);

  const overallStats = useMemo(() => {
    if (formalFilteredRecords.length === 0) {
      return { totalStock: 0, totalSold: 0, totalRecovered: 0 };
    }
    return formalFilteredRecords.reduce(
      (acc, r) => ({
        totalStock: acc.totalStock + r.stockQuantity,
        totalSold: acc.totalSold + r.soldQuantity,
        totalRecovered: acc.totalRecovered + r.recoveredQuantity,
      }),
      { totalStock: 0, totalSold: 0, totalRecovered: 0 }
    );
  }, [formalFilteredRecords]);

  const clearFilters = () => {
    setKeyword('');
    setRecallFilter('');
  };

  const getRecallInfo = (recallTaskId: string) => {
    return recalls.find((r) => r.id === recallTaskId);
  };

  const hasActiveFilters = recallFilter || keyword;
  const totalQuantity = overallStats.totalStock + overallStats.totalSold;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">回收登记</h1>
          <p className="text-slate-500 mt-1">管理回收登记记录，跟踪药品回收进度</p>
        </div>
        {currentUser?.role !== 'pharma' && pendingNotifications.length > 0 && (
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate(`/recovery/submit/${pendingNotifications[0].id}`)}
          >
            新增登记
          </Button>
        )}
      </div>

      {pendingNotifications.length > 0 && currentUser?.role !== 'pharma' && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">待处理的召回通知</p>
          {pendingNotifications.map((notif) => {
            const recall = getRecallInfo(notif.recallTaskId);
            const existingRecord = getRecoveryRecordByNotificationId(notif.id);
            const hasDraft = existingRecord?.isDraft === true;
            return (
              <Card
                key={notif.id}
                className={`cursor-pointer transition-colors ${
                  hasDraft
                    ? 'border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                    : 'border-amber-300 bg-amber-50/50 hover:bg-amber-50'
                }`}
                onClick={() => navigate(`/recovery/submit/${notif.id}`)}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        hasDraft ? 'bg-slate-100' : 'bg-amber-100'
                      }`}>
                        <ClipboardList className={`w-6 h-6 ${hasDraft ? 'text-slate-600' : 'text-amber-600'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-800">{notif.recallTitle}</h3>
                          {recall && <RiskBadge level={recall.riskLevel} size="sm" />}
                          <StatusTag type="notification" status={notif.status} />
                          {hasDraft && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-700">
                              草稿中
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">{notif.recallReason}</p>
                      </div>
                    </div>
                    <Button variant="ghost" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      {hasDraft ? '继续编辑' : '去登记'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {myDraftRecords.length > 0 && currentUser?.role !== 'pharma' && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">我的草稿</p>
          {myDraftRecords.map((record) => {
            const recall = getRecallInfo(record.recallTaskId);
            return (
              <Card
                key={record.id}
                className="cursor-pointer transition-colors border-amber-300 bg-amber-50/50 hover:bg-amber-50"
                onClick={() => navigate(`/recovery/submit/${record.notificationId}`)}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-100">
                        <FileText className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-800">{recall?.title || record.recallTaskId}</h3>
                          {recall && <RiskBadge level={recall.riskLevel} size="sm" />}
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-700">
                            草稿
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mb-1">
                          库存 {formatNumber(record.stockQuantity)} 盒 · 已售 {formatNumber(record.soldQuantity)} 盒
                        </p>
                        <p className="text-xs text-slate-400">最后更新：{formatDate(record.updatedAt || record.submittedAt)}</p>
                      </div>
                    </div>
                    <Button variant="ghost" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      继续编辑
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">登记记录</p>
                <p className="text-2xl font-bold text-slate-800">{formalFilteredRecords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">库存总数</p>
                <p className="text-2xl font-bold text-amber-600">{formatNumber(overallStats.totalStock)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">已回收总数</p>
                <p className="text-2xl font-bold text-green-600">{formatNumber(overallStats.totalRecovered)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">总回收率</p>
                <p className="text-2xl font-bold text-teal-600">
                  {formatPercent(overallStats.totalRecovered, totalQuantity)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="搜索单位名称、召回任务..."
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
            <label className="block text-sm font-medium text-slate-700 mb-2">关联召回任务</label>
            <select
              value={recallFilter}
              onChange={(e) => setRecallFilter(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">全部任务</option>
              {recalls.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
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
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">上报单位</th>
                  )}
                  {currentUser?.role === 'pharma' && (
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">角色</th>
                  )}
                  <th className="text-right py-4 px-6 text-sm font-semibold text-slate-600">库存</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-slate-600">已售</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-slate-600">已回收</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">回收率</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">提交时间</th>
                  {currentUser?.role !== 'pharma' && (
                    <th className="text-right py-4 px-6 text-sm font-semibold text-slate-600">操作</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={currentUser?.role === 'pharma' ? 8 : 7} className="py-16 text-center">
                      <ClipboardList className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">暂无回收登记记录</p>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => {
                    const recall = getRecallInfo(record.recallTaskId);
                    const total = record.stockQuantity + record.soldQuantity;
                    return (
                      <tr
                        key={record.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-800">{recall?.title}</span>
                              {record.isDraft && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-700">
                                  草稿
                                </span>
                              )}
                            </div>
                            {recall && <RiskBadge level={recall.riskLevel} size="sm" />}
                          </div>
                        </td>
                        {currentUser?.role === 'pharma' && (
                          <td className="py-4 px-6 font-medium text-slate-700">{record.unitName}</td>
                        )}
                        {currentUser?.role === 'pharma' && (
                          <td className="py-4 px-6">
                            <StatusTag type="role" status={record.unitRole} />
                          </td>
                        )}
                        <td className="py-4 px-6 text-right font-medium text-slate-700">
                          {formatNumber(record.stockQuantity)}
                        </td>
                        <td className="py-4 px-6 text-right font-medium text-slate-700">
                          {formatNumber(record.soldQuantity)}
                        </td>
                        <td className="py-4 px-6 text-right font-medium text-green-600">
                          {formatNumber(record.recoveredQuantity)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="w-32">
                            <ProgressBar
                              value={record.recoveredQuantity}
                              max={total || 1}
                              colorScheme="green"
                              showLabel
                            />
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-500 text-sm">
                          {formatDate(record.submittedAt)}
                        </td>
                        {currentUser?.role !== 'pharma' && record.isDraft && (
                          <td className="py-4 px-6 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/recovery/submit/${record.notificationId}`)}
                            >
                              继续编辑
                            </Button>
                          </td>
                        )}
                        {currentUser?.role !== 'pharma' && !record.isDraft && (
                          <td className="py-4 px-6 text-right" />
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
