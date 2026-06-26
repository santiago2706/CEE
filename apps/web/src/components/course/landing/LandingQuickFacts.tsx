import type { Course } from '@cee/types';
import { CalendarDays, Clock, GraduationCap, Laptop } from 'lucide-react';
import { formatDateLong } from '@/lib/utils';

interface LandingQuickFactsProps {
  course: Course;
}

/** "Ficha técnica" del programa (nivel, duración, modalidad, inicio) — datos del curso. */
export function LandingQuickFacts({ course }: LandingQuickFactsProps) {
  const facts = [
    { icon: GraduationCap, label: 'Nivel', value: course.level },
    { icon: Clock, label: 'Duración', value: `${course.academicHours} horas académicas` },
    { icon: Laptop, label: 'Modalidad', value: course.modality },
    { icon: CalendarDays, label: 'Inicio', value: formatDateLong(course.startDate) },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {facts.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cee-red/10">
              <Icon className="h-4 w-4 text-cee-red" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <p className="truncate text-sm font-bold text-foreground">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
