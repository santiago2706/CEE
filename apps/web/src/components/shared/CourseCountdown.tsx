import type { Course } from '@cee/types';
import { useCourseCountdown } from '@/hooks/useCourseCountdown';
import { cn } from '@/lib/utils';

interface CourseCountdownProps {
  course: Pick<Course, 'startDate' | 'status'>;
  variant?: 'light' | 'dark';
  className?: string;
}

const UNITS: Array<{ key: 'days' | 'hours' | 'minutes' | 'seconds'; label: string }> = [
  { key: 'days', label: 'd' },
  { key: 'hours', label: 'h' },
  { key: 'minutes', label: 'm' },
  { key: 'seconds', label: 's' },
];

export function CourseCountdown({ course, variant = 'light', className }: CourseCountdownProps) {
  const countdown = useCourseCountdown(course.startDate);
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (countdown.hasStarted) {
    const label = course.status === 'published' ? '¡Ya inició!' : 'Inscripciones cerradas';
    return (
      <p
        className={cn(
          'text-sm font-semibold',
          variant === 'dark' ? 'text-white' : 'text-cee-red',
          className,
        )}
      >
        {label}
      </p>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm font-medium',
        variant === 'dark' ? 'text-white/90' : 'text-muted-foreground',
        className,
      )}
      role="timer"
      aria-live={prefersReducedMotion ? 'off' : 'polite'}
    >
      {UNITS.map((unit) => (
        <span key={unit.key} className="tabular-nums">
          {String(countdown[unit.key]).padStart(2, '0')}
          {unit.label}
        </span>
      ))}
    </div>
  );
}
