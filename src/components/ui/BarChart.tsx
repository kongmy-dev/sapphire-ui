import { cn } from '../../lib/utils';

interface BarChartProps {
  data: number[];
  height?: string | number;
  className?: string;
  labels?: string[];
  tooltipSuffix?: string;
}

export function BarChart({ 
  data, 
  height = '12rem', 
  className, 
  labels,
  tooltipSuffix = ''
}: BarChartProps) {
  return (
    <div className={cn("flex items-end gap-3 border-b border-border pt-4", className)} style={{ height }}>
      {data.map((val, i) => (
        <div key={i} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
          <div 
            className="relative w-full rounded-t-sm bg-accent/30 transition-colors group-hover:bg-accent/50" 
            style={{ height: `${val}%` }}
          >
            <div className="absolute -top-7 left-1/2 z-10 -translate-x-1/2 rounded-sm bg-(--color-text-strong) px-1.5 py-0.5 font-mono text-[10px] whitespace-nowrap text-surface opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
              {val}{tooltipSuffix}
            </div>
          </div>
          {labels && labels[i] && (
            <span className="text-text-muted mt-1 font-mono text-[10px]">{labels[i]}</span>
          )}
        </div>
      ))}
    </div>
  );
}
