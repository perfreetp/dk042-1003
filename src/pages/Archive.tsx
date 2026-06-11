import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecallStore } from '@/store/useRecallStore';
import { useBatchStore } from '@/store/useBatchStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useRecoveryStore } from '@/store/useRecoveryStore';
import { useOperationLogStore } from '@/store/useOperationLogStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { RiskBadge } from '@/components/common/RiskBadge';
import { StatusTag } from '@/components/common/StatusTag';
import { ProgressBar } from '@/components/common/ProgressBar';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, formatPercent, formatNumber } from '@/utils/formatUtils';
import { exportRecallCertificate } from '@/utils/exportUtils';
import type { TaskStatus, RiskLevel, OperationLog } from '@/types';
import {
  Archive as ArchiveIcon,
  Search,
  Filter,
  X,
  Download,
  FileText,
  CheckCircle2,
  Calendar,
  Package,
  Users,
  ChevronRight,
  BarChart3,
  LoaderCircle,
} from 'lucide-react';

export const Archive = () => {
  const navigate = useNavigate();
  const { recalls, updateStatus } = useRecallStore();
  const { getBatchesByRecallId, batches } = useBatchStore();
  const { getNotificationsByRecallId, notifications } = useNotificationStore();
  const { getRecoveryRecordsByRecallId, getStatistics, records: recoveryRecords } = useRecoveryStore();
  const { getDistinctLogsByRecallId } = useOperationLogStore();
  const { canEditRecall } = useAuth();
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [productNameFilter, setProductNameFilter] = useState('');
  const [batchNumberFilter, setBatchNumberFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [unitNameFilter, setUnitNameFilter] = useState('');
  const [exportingAll, setExportingAll] = useState(false);

  const archivedRecalls = useMemo(() => {
    return recalls.filter(
      (r) => r.status === 'completed' || r.status === 'closed'
    );
  }, [recalls]);

  const allRegions = useMemo(() => {
    const regionSet = new Set<string>();
    const extractProvince = (region: string): string => {
      if (!region) return '';
      if (region.includes('自治区')) {
        const idx = region.indexOf('自治区');
        return region.substring(0, idx + 3);
      }
      if (region.includes('特别行政区')) {
        const idx = region.indexOf('特别行政区');
        return region.substring(0, idx + 5);
      }
      if (region.startsWith('北京市') || region.startsWith('上海市') || region.startsWith('天津市') || region.startsWith('重庆市')) {
        return region.substring(0, 3);
      }
      const provinceIdx = region.indexOf('省');
      if (provinceIdx !== -1) {
        return region.substring(0, provinceIdx + 1);
      }
      const cityIdx = region.indexOf('市');
      if (cityIdx !== -1 && cityIdx <= 3) {
        return region.substring(0, cityIdx + 1);
      }
      return region;
    };
    notifications.forEach((n) => {
      const province = extractProvince(n.recipientRegion);
      if (province) regionSet.add(province);
    });
    recoveryRecords.filter((r) => r.isDraft !== true).forEach((r) => {
      const province = extractProvince(r.unitRegion);
      if (province) regionSet.add(province);
    });
    return Array.from(regionSet).sort();
  }, [notifications, recoveryRecords]);

  const filteredRecalls = useMemo(() => {
    return archivedRecalls.filter((r) => {
      const matchKeyword =
        r.title.includes(keyword) ||
        r.reason.includes(keyword) ||
        r.description.includes(keyword);
      const matchStatus = !statusFilter || r.status === statusFilter;
      const matchRisk = !riskFilter || r.riskLevel === riskFilter;
      const matchStart = !dateRange.start || r.createdAt >= dateRange.start;
      const matchEnd = !dateRange.end || r.createdAt <= dateRange.end + 'T23:59:59.999Z';

      const recallBatches = getBatchesByRecallId(r.id);
      const matchProductName = !productNameFilter || recallBatches.some((b) => b.productName.includes(productNameFilter));
      const matchBatchNumber = !batchNumberFilter || recallBatches.some((b) => b.batchNumber.includes(batchNumberFilter));

      const recallNotifications = getNotificationsByRecallId(r.id);
      const matchRegion = !regionFilter || recallNotifications.some((n) => n.recipientRegion.includes(regionFilter));

      const recallRecords = getRecoveryRecordsByRecallId(r.id).filter((rec) => rec.isDraft !== true);
      const matchUnitName = !unitNameFilter || recallRecords.some((rec) => rec.unitName.includes(unitNameFilter));
      const matchRegionFromRecords = !regionFilter || recallRecords.some((rec) => rec.unitRegion.includes(regionFilter));

      const finalMatchRegion = !regionFilter || (matchRegion || matchRegionFromRecords);

      return matchKeyword && matchStatus && matchRisk && matchStart && matchEnd && matchProductName && matchBatchNumber && finalMatchRegion && matchUnitName;
    });
  }, [archivedRecalls, keyword, statusFilter, riskFilter, dateRange, productNameFilter, batchNumberFilter, regionFilter, unitNameFilter, getBatchesByRecallId, getNotificationsByRecallId, getRecoveryRecordsByRecallId]);

  const filterSummaryText = useMemo(() => {
    const parts: string[] = [];
    if (keyword) parts.push(`关键词：${keyword}`);
    if (statusFilter) {
      const statusLabel = statusFilter === 'completed' ? '已完成' : '已关闭';
      parts.push(`状态：${statusLabel}`);
    }
    if (riskFilter) {
      const riskLabel = riskFilter === 'high' ? '高风险' : riskFilter === 'medium' ? '中风险' : '低风险';
      parts.push(`风险等级：${riskLabel}`);
    }
    if (productNameFilter) parts.push(`药品：${productNameFilter}`);
    if (batchNumberFilter) parts.push(`批号：${batchNumberFilter}`);
    if (regionFilter) parts.push(`地区：${regionFilter}`);
    if (unitNameFilter) parts.push(`上报单位：${unitNameFilter}`);
    if (dateRange.start || dateRange.end) {
      const datePart = `创建时间：${dateRange.start || '不限'} 至 ${dateRange.end || '不限'}`;
      parts.push(datePart);
    }
    parts.push(`共筛选出 ${filteredRecalls.length} 条任务`);
    return parts.join(' | ');
  }, [keyword, statusFilter, riskFilter, productNameFilter, batchNumberFilter, regionFilter, unitNameFilter, dateRange, filteredRecalls.length]);

  const hasActiveFilters = statusFilter || riskFilter || keyword || dateRange.start || dateRange.end || productNameFilter || batchNumberFilter || regionFilter || unitNameFilter;

  const clearFilters = () => {
    setKeyword('');
    setStatusFilter('');
    setRiskFilter('');
    setDateRange({ start: '', end: '' });
    setProductNameFilter('');
    setBatchNumberFilter('');
    setRegionFilter('');
    setUnitNameFilter('');
  };

  const handleExport = async (recallId: string) => {
    const recall = recalls.find((r) => r.id === recallId);
    if (!recall) return;

    setExportingId(recallId);
    try {
      const batches = getBatchesByRecallId(recallId);
      const filteredNotifications = getNotificationsByRecallId(recallId);
      const allRecords = getRecoveryRecordsByRecallId(recallId);
      const filteredRecords = allRecords.filter((r) => r.isDraft !== true);
      const logs = getDistinctLogsByRecallId(recallId);
      await exportRecallCertificate(
        recall,
        batches,
        filteredNotifications,
        filteredRecords,
        logs,
        hasActiveFilters ? filterSummaryText : undefined,
        true
      );
    } finally {
      setExportingId(null);
    }
  };

  const handleExportAll = async () => {
    if (filteredRecalls.length === 0) return;
    setExportingAll(true);
    try {
      const allLogs: OperationLog[] = [];
      for (let i = 0; i < filteredRecalls.length; i++) {
        const recall = filteredRecalls[i];
        const batches = getBatchesByRecallId(recall.id);
        const filteredNotifications = getNotificationsByRecallId(recall.id);
        const allRecords = getRecoveryRecordsByRecallId(recall.id);
        const filteredRecords = allRecords.filter((r) => r.isDraft !== true);
        const logs = getDistinctLogsByRecallId(recall.id);
        allLogs.push(...logs);
        await exportRecallCertificate(
          recall,
          batches,
          filteredNotifications,
          filteredRecords,
          logs,
          hasActiveFilters ? filterSummaryText : undefined,
          true
        );
        if (i < filteredRecalls.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    } finally {
      setExportingAll(false);
    }
  };

  const statusOptions: { value: TaskStatus | ''; label: string }[] = [
    { value: '', label: '全部状态' },
    { value: 'completed', label: '已完成' },
    { value: 'closed', label: '已关闭' },
  ];

  const riskOptions: { value: RiskLevel | ''; label: string }[] = [
    { value: '', label: '全部风险' },
    { value: 'high', label: '高风险' },
    { value: 'medium', label: '中风险' },
    { value: 'low', label: '低风险' },
  ];

  const totalStats = useMemo(() => {
    const totalTasks = filteredRecalls.length;
    const totalBatches = filteredRecalls.reduce(
      (sum, r) => sum + getBatchesByRecallId(r.id).length,
      0
    );
    const totalNotifications = filteredRecalls.reduce(
      (sum, r) => sum + getNotificationsByRecallId(r.id).length,
      0
    );
    const totalRecovered = filteredRecalls.reduce(
      (sum, r) => sum + getStatistics(r.id).totalRecovered,
      0
    );
    return { totalTasks, totalBatches, totalNotifications, totalRecovered };
  }, [filteredRecalls, getBatchesByRecallId, getNotificationsByRecallId, getStatistics]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">结果归档</h1>
          <p className="text-slate-500 mt-1">查看历史召回任务，导出证明文件，检索归档记录</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                <ArchiveIcon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">归档任务</p>
                <p className="text-2xl font-bold text-slate-800">{totalStats.totalTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">涉及批次</p>
                <p className="text-2xl font-bold text-blue-600">{totalStats.totalBatches}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">通知单位</p>
                <p className="text-2xl font-bold text-purple-600">{totalStats.totalNotifications}</p>
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
                <p className="text-sm text-slate-500">累计回收</p>
                <p className="text-2xl font-bold text-green-600">{formatNumber(totalStats.totalRecovered)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="搜索任务名称、召回原因..."
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
          <div className="space-y-4 mt-4 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">任务状态</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">风险等级</label>
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value as RiskLevel | '')}
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  {riskOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">开始日期</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">结束日期</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">药品名称</label>
                <Input
                  placeholder="输入药品名称..."
                  value={productNameFilter}
                  onChange={(e) => setProductNameFilter(e.target.value)}
                  leftIcon={<Package className="w-4 h-4" />}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">生产批号</label>
                <Input
                  placeholder="输入生产批号..."
                  value={batchNumberFilter}
                  onChange={(e) => setBatchNumberFilter(e.target.value)}
                  leftIcon={<BarChart3 className="w-4 h-4" />}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">地区</label>
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">全部地区</option>
                  {allRegions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">上报单位</label>
                <Input
                  placeholder="输入上报单位名称..."
                  value={unitNameFilter}
                  onChange={(e) => setUnitNameFilter(e.target.value)}
                  leftIcon={<Users className="w-4 h-4" />}
                />
              </div>
            </div>
          </div>
        )}

        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <BarChart3 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">{filterSummaryText}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          共 <span className="font-semibold text-slate-700">{filteredRecalls.length}</span> 条归档记录
        </p>
        {canEditRecall() && filteredRecalls.length > 0 && (
          <Button
            variant="primary"
            leftIcon={<Download className="w-4 h-4" />}
            loading={exportingAll}
            onClick={handleExportAll}
          >
            {exportingAll ? '正在生成证明...' : `导出全部证明 (${filteredRecalls.length})`}
          </Button>
        )}
      </div>

      {exportingAll && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm mx-4">
            <LoaderCircle className="w-12 h-12 text-blue-600 animate-spin" />
            <h3 className="text-lg font-semibold text-slate-800">正在生成召回证明...</h3>
            <p className="text-sm text-slate-500 text-center">
              正在为 {filteredRecalls.length} 个召回任务生成证明文件，请稍候
            </p>
          </div>
        </div>
      )}

      {exportingId && !exportingAll && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm mx-4">
            <LoaderCircle className="w-12 h-12 text-blue-600 animate-spin" />
            <h3 className="text-lg font-semibold text-slate-800">正在生成召回证明...</h3>
            <p className="text-sm text-slate-500 text-center">
              正在生成该召回任务的证明文件，请稍候
            </p>
          </div>
        </div>
      )}

      {filteredRecalls.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ArchiveIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">暂无归档记录</h3>
            <p className="text-slate-500">
              {hasActiveFilters ? '没有找到符合条件的归档记录，请调整筛选条件' : '已完成或已关闭的召回任务将在此处显示'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRecalls.map((recall) => {
            const batches = getBatchesByRecallId(recall.id);
            const notifications = getNotificationsByRecallId(recall.id);
            const stats = getStatistics(recall.id);

            return (
              <Card key={recall.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-slate-800">{recall.title}</h3>
                        <RiskBadge level={recall.riskLevel} />
                        <StatusTag type="task" status={recall.status} />
                      </div>
                      <p className="text-slate-600 mb-4">{recall.reason}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-500">创建于</span>
                          <span className="font-medium text-slate-700">{formatDate(recall.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Package className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-500">批次</span>
                          <span className="font-medium text-slate-700">{batches.length}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-500">通知</span>
                          <span className="font-medium text-slate-700">{notifications.length}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-500">回收</span>
                          <span className="font-medium text-slate-700">
                            {formatPercent(stats.totalRecovered, stats.totalStock)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">完成进度</span>
                          <span className="font-medium text-slate-700">
                            {formatPercent(stats.submittedUnits, notifications.length)}
                          </span>
                        </div>
                        <ProgressBar
                          value={stats.submittedUnits}
                          max={notifications.length || 1}
                          colorScheme="blue"
                        />
                      </div>

                      {recall.closingNote && (
                        <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                          <p className="text-sm font-medium text-green-700 mb-1">结案说明</p>
                          <p className="text-green-600 text-sm">{recall.closingNote}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 min-w-[160px]">
                      <Button
                        variant="outline"
                        leftIcon={<FileText className="w-4 h-4" />}
                        onClick={() => navigate(`/recalls/${recall.id}`)}
                      >
                        查看详情
                      </Button>
                      {canEditRecall() && (
                        <Button
                          variant="outline"
                          leftIcon={<Download className="w-4 h-4" />}
                          loading={exportingId === recall.id}
                          onClick={() => handleExport(recall.id)}
                        >
                          导出证明
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
