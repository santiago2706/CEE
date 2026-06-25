import type { Course } from '@cee/types';
import { Badge } from '@/components/ui/badge';
import { CourseCountdown } from '@/components/shared/CourseCountdown';
import { cn } from '@/lib/utils';

interface NextStartBadgeProps {
  course?: Pick<Course, 'title' | 'startDate' | 'status'>;
  isLoading?: boolean;
  className?: string;
}

/**
 * Badge reutilizable para destacar el próximo curso a iniciar (Hero de Home,
 * y potencialmente listados de cursos). Envuelve el `Badge` de shadcn — no lo edita.
 */
export function NextStartBadge({ course, isLoading, className }: NextStartBadgeProps) {
  if (isLoading) {
    return (
      <div
        className={cn('h-[64px] w-72 animate-pulse rounded-lg bg-white/10', className)}
        aria-hidden="true"
      />
    );
  }

  if (!course) return null;

  return (
    <div
      className={cn(
        'inline-flex flex-col gap-1.5 rounded-lg bg-white/10 px-4 py-3 backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500',
        className,
      )}
    >
      <Badge className="w-fit border-transparent bg-white text-[11px] font-bold uppercase tracking-wider text-cee-red hover:bg-white">
        Próximo a iniciar
      </Badge>
      <p className="text-xs font-medium text-white/80">{course.title}</p>
      <CourseCountdown course={course} variant="dark" />
    </div>
  );
}
