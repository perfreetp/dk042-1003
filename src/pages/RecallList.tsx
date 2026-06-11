import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecallStore } from '@/store/useRecallStore';
import { RecallCard } from '@/components/features/RecallCard';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useAuth } from '@/hooks/useAuth';
import type { TaskStatus, RiskLevel } from '@/types';
import { Search, Plus, Filter, X } from 'lucide-react';

export const RecallList = () => {
  const navigate = useNavigate();
  const { canCreateRecall } = useAuth();
  const { getFilteredRecalls } = useRecallStore();
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredRecalls = useMemo(() => {
    return getFilteredRecalls({
      keyword: keyword || undefined,
      status: statusFilter || undefined,
      riskLevel: riskFilter || undefined,
    });
  }, [keyword, statusFilter, riskFilter, getFilteredRecalls]);

  const clearFilters = () => {
    setKeyword('');
    setStatusFilter('');
    setRiskFilter('');
  };

  const statusOptions: { value: TaskStatus | ''; label: string }[] = [
    { value: '', label: '全部状态' },
    { value: 'draft', label: '草稿' },
    { value: 'pending', label: '待通知' },
    { value: 'in_progress', label: '进行中' },
    { value: 'completed', label: '已完成' },
    { value: 'closed', label: '已关闭' },
  ];

  const riskOptions: { value: RiskLevel | ''; label: string }[] = [
    { value: '', label: '全部风险' },
    { value: 'high', label: '高风险' },
    { value: 'medium', label: '中风险' },
    { value: 'low', label: '低风险' },
  ];

  const hasActiveFilters = statusFilter || riskFilter || keyword;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">召回任务</h1>
          <p className="text-slate-500 mt-1">管理所有药品召回任务，跟踪处理进度</p>
        </div>
        {canCreateRecall() && (
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/recalls/create')}
          >
            发起召回
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="搜索任务名称、原因..."
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                任务状态
              </label>
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                风险等级
              </label>
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
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          共 <span className="font-semibold text-slate-700">{filteredRecalls.length}</span> 条记录
        </p>
      </div>

      {filteredRecalls.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 border-dashed">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-700 mb-2">暂无召回任务</h3>
          <p className="text-slate-500 mb-6">
            {hasActiveFilters ? '没有找到符合条件的任务，请调整筛选条件' : '点击"发起召回"创建新的召回任务'}
          </p>
          {canCreateRecall() && !hasActiveFilters && (
            <Button
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/recalls/create')}
            >
              发起召回
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecalls.map((recall) => (
            <RecallCard key={recall.id} recall={recall} />
          ))}
        </div>
      )}
    </div>
  );
};
