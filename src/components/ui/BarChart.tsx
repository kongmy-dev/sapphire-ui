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
    <div className={cn("flex items-end gap-3 pt-4 border-b border-border", className)} style={{ height }}>
      {data.map((val, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
          <div 
            className="w-full bg-accent/30 rounded-t-sm relative group-hover:bg-accent/50 transition-colors" 
            style={{ height: `${val}%` }}
          >
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity bg-(--color-text-strong) text-(--color-surface) px-1.5 py-0.5 rounded shadow-sm z-10 whitespace-nowrap">
              {val}{tooltipSuffix}
            </div>
          </div>
          {labels && labels[i] && (
            <span className="text-[10px] font-mono text-text-muted mt-1">{labels[i]}</span>
          )}
        </div>
      ))}
    </div>
  );
}
