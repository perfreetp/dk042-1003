import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'danger';
  colorScheme?: 'blue' | 'green' | 'amber' | 'red';
  className?: string;
}

export const ProgressBar = ({
  value,
  max = 100,
  showLabel = true,
  size = 'md',
  color = 'primary',
  colorScheme,
  className,
}: ProgressBarProps) => {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  const colorSchemeMap = {
    blue: 'primary',
    green: 'success',
    amber: 'warning',
    red: 'danger',
  };

  const actualColor = colorScheme ? colorSchemeMap[colorScheme] : color;

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  const colorClasses = {
    primary: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-amber-500',
    danger: 'bg-red-600',
  };

  const getColor = () => {
    if (actualColor !== 'primary') return colorClasses[actualColor];
    if (percentage >= 80) return colorClasses.success;
    if (percentage >= 50) return colorClasses.warning;
    if (percentage < 30) return colorClasses.danger;
    return colorClasses.primary;
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-1">
        {showLabel && (
          <span className="text-xs font-medium text-slate-600">完成进度</span>
        )}
        {showLabel && (
          <span className="text-xs font-semibold text-slate-700">{percentage}%</span>
        )}
      </div>
      <div
        className={cn(
          'w-full bg-slate-200 rounded-full overflow-hidden',
          heightClasses[size]
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            getColor()
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
