import { forwardRef } from 'react';
import { StatCounter } from '@/components/about/StatCounter';
import { INSTITUTIONAL_STATS } from '@/config/institutional-stats';
import { cn } from '@/lib/utils';

interface StatsCounterProps {
  className?: string;
}

/** Grid de cifras institucionales con animación count-up (Tarea 8.2). */
export const StatsCounter = forwardRef<HTMLDivElement, StatsCounterProps>(function StatsCounter(
  { className },
  ref,
) {
  return (
    <div ref={ref} className={cn('grid gap-8 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {INSTITUTIONAL_STATS.map((stat) => (
        <div key={stat.label} className="rounded-lg bg-white p-6 text-center shadow-sm">
          <StatCounter value={stat.value} />
          <p className="mt-2 font-semibold text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
});
