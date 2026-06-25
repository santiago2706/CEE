import type { Instructor, Teacher } from '@cee/types';
import { formatDateLong } from '@/lib/utils';

interface TeacherCardProps {
  instructor: Instructor | Teacher;
}

function hasUpcomingEvents(instructor: Instructor | Teacher): instructor is Teacher {
  return 'upcomingEvents' in instructor;
}

export function TeacherCard({ instructor }: TeacherCardProps) {
  const nextEvent = hasUpcomingEvents(instructor) ? instructor.upcomingEvents[0] : undefined;

  return (
    <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
      <img
        src={instructor.photoUrl}
        alt={instructor.name}
        className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-cee-red/15"
        loading="lazy"
      />
      <div>
        <p className="font-semibold">{instructor.name}</p>
        <p className="text-sm font-medium text-cee-red">{instructor.title}</p>
        <p className="mt-1.5 line-clamp-3 text-sm text-muted-foreground">{instructor.bio}</p>
        {nextEvent && (
          <p className="mt-2 text-xs text-muted-foreground">
            <span className="font-semibold text-cee-red">Próximo:</span> {nextEvent.title} ·{' '}
            {formatDateLong(nextEvent.date)}
          </p>
        )}
      </div>
    </div>
  );
}
