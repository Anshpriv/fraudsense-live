import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'success' | 'warning' | 'anomaly';
}

const variantStyles = {
  default: 'bg-primary/20 text-primary',
  success: 'bg-success/20 text-success',
  warning: 'bg-warning/20 text-warning',
  anomaly: 'bg-anomaly/20 text-anomaly',
};

export function MetricsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
}: MetricsCardProps) {
  return (
    <div className="glass rounded-xl p-5 gradient-border group hover:scale-[1.02] transition-transform duration-300">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground font-mono">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-xl transition-all duration-300 group-hover:scale-110',
          variantStyles[variant]
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
