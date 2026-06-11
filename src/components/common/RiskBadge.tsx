import type { RiskLevel } from '@/types';
import { RISK_LEVEL_CONFIG } from '@/types';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export const RiskBadge = ({ level, showIcon = true, size = 'md' }: RiskBadgeProps) => {
  const config = RISK_LEVEL_CONFIG[level];

  const sizeClasses = {
    sm: 'gap-1 px-2 py-0.5 text-[10px]',
    md: 'gap-1.5 px-2.5 py-1 text-xs',
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
  };

  const Icon = () => {
    switch (level) {
      case 'high':
        return <AlertTriangle className={iconSizeClasses[size]} />;
      case 'medium':
        return <AlertCircle className={iconSizeClasses[size]} />;
      case 'low':
        return <Info className={iconSizeClasses[size]} />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center ${sizeClasses[size]} rounded-full font-medium ${config.bgColor} ${config.color} transition-all duration-200`}
    >
      {showIcon && <Icon />}
      {config.label}
    </span>
  );
};
