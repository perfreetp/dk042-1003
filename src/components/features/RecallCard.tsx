import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/common/Card';
import { RiskBadge } from '@/components/common/RiskBadge';
import { StatusTag } from '@/components/common/StatusTag';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Button } from '@/components/common/Button';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useRecoveryStore } from '@/store/useRecoveryStore';
import { formatDate, truncateText, getDaysRemaining } from '@/utils/formatUtils';
import { Eye, Calendar, Clock, AlertTriangle } from 'lucide-react';
import type { RecallTask } from '@/types';

interface RecallCardProps {
  recall: RecallTask;
}

export const RecallCard = ({ recall }: RecallCardProps) => {
  const navigate = useNavigate();
  const { getNotificationStats } = useNotificationStore();
  const { getRecoveryStats } = useRecoveryStore();

  const notifStats = getNotificationStats(recall.id);
  const recoveryStats = getRecoveryStats(recall.id);
  const progress = notifStats.total > 0 ? (notifStats.submitted / notifStats.total) * 100 : 0;
  const daysRemaining = getDaysRemaining(recall.deadline);

  return (
    <Card hoverable className="overflow-hidden group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base mb-2 group-hover:text-blue-600 transition-colors">
              {truncateText(recall.title, 25)}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <RiskBadge level={recall.riskLevel} />
              <StatusTag type="task" status={recall.status} showIcon />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600 line-clamp-2">
          {truncateText(recall.reason, 50)}
        </p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(recall.createdAt)}</span>
          </div>
          <div
            className={`flex items-center gap-2 ${
              daysRemaining < 3 ? 'text-red-600' : 'text-slate-500'
            }`}
          >
            {daysRemaining < 3 && <AlertTriangle className="w-4 h-4" />}
            {daysRemaining >= 3 && <Clock className="w-4 h-4" />}
            <span>
              {daysRemaining > 0
                ? `剩余 ${daysRemaining} 天`
                : daysRemaining === 0
                ? '今日截止'
                : `已逾期 ${Math.abs(daysRemaining)} 天`}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-50 rounded-lg p-2">
            <p className="text-lg font-bold text-slate-800">{notifStats.total}</p>
            <p className="text-xs text-slate-500">应通知</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-2">
            <p className="text-lg font-bold text-blue-600">{notifStats.submitted}</p>
            <p className="text-xs text-slate-500">已反馈</p>
          </div>
          <div className="bg-green-50 rounded-lg p-2">
            <p className="text-lg font-bold text-green-600">{recoveryStats.recoveryRate}%</p>
            <p className="text-xs text-slate-500">回收率</p>
          </div>
        </div>

        <ProgressBar value={progress} size="sm" />
      </CardContent>
      <CardFooter>
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          leftIcon={<Eye className="w-4 h-4" />}
          onClick={() => navigate(`/recalls/${recall.id}`)}
        >
          查看详情
        </Button>
      </CardFooter>
    </Card>
  );
};
