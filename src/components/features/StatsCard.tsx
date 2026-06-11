import { type ReactNode } from 'react';
import { Card, CardContent } from '@/components/common/Card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?:
    | {
        value: number;
        isPositive: boolean;
      }
    | string;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  subtitle?: string;
}

export const StatsCard = ({
  title,
  value,
  icon,
  trend,
  color = 'blue',
  subtitle,
}: StatsCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  const bgGradient = {
    blue: 'from-blue-500/10 to-blue-600/5',
    green: 'from-green-500/10 to-green-600/5',
    amber: 'from-amber-500/10 to-amber-600/5',
    red: 'from-red-500/10 to-red-600/5',
    purple: 'from-purple-500/10 to-purple-600/5',
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <p
              className={cn(
                'text-3xl font-bold tracking-tight',
                color === 'blue' && 'text-blue-600',
                color === 'green' && 'text-green-600',
                color === 'amber' && 'text-amber-600',
                color === 'red' && 'text-red-600',
                color === 'purple' && 'text-purple-600'
              )}
            >
              {value}
            </p>
            {trend && (
              <div
                className={`flex items-center gap-1 mt-2 text-sm ${
                  typeof trend === 'string' ? 'text-slate-600' : trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {typeof trend === 'string' ? (
                  <span className="font-medium">{trend}</span>
                ) : (
                  <>
                    {trend.isPositive ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span className="font-medium">{Math.abs(trend.value)}%</span>
                    <span className="text-slate-500">较上周</span>
                  </>
                )}
              </div>
            )}
            {subtitle && <p className="text-xs text-slate-400 mt-2">{subtitle}</p>}
          </div>
          <div
            className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br',
              bgGradient[color],
              colorClasses[color]
            )}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
