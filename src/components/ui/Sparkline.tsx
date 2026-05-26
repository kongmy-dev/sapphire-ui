import { cn } from '../../lib/utils';

export interface SparklineDataPoint {
  status: 'success' | 'warning' | 'error' | 'neutral';
  tooltip?: string;
}

export interface SparklineProps {
  data: SparklineDataPoint[];
  height?: string | number;
  className?: string;
}

export function Sparkline({ data, height = '2rem', className }: SparklineProps) {
  const getStatusColor = (status: SparklineDataPoint['status']) => {
    switch(status) {
      case 'success': return 'var(--color-success)';
      case 'warning': return 'var(--color-warning)';
      case 'error': return 'var(--color-error)';
      case 'neutral': return 'var(--color-border)';
      default: return 'var(--color-success)';
    }
  };

  return (
    <div className={cn("flex w-full gap-1.5", className)} style={{ height }}>
      {data.map((point, i) => (
        <div 
          key={i} 
          className="flex-1 cursor-help rounded-[2px] opacity-60 transition-colors hover:opacity-100"
          style={{ backgroundColor: getStatusColor(point.status) }}
          title={point.tooltip}
        />
      ))}
    </div>
  );
}
