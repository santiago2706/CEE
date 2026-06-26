import type { Course } from '@cee/types';
import { Check } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

interface LandingValueSummaryProps {
  course: Course;
}

/** "Todo lo que recibes al inscribirte" — derivado de course.benefits + certificación. */
export function LandingValueSummary({ course }: LandingValueSummaryProps) {
  const items = [
    `${course.academicHours} horas de formación con docentes de la industria`,
    ...course.benefits,
    course.certification,
  ].filter(Boolean);

  return (
    <div>
      <SectionHeading align="center" title="Todo lo que recibes al inscribirte" />
      <div className="mx-auto mt-6 grid max-w-3xl gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
          >
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-cee-red" />
            <span className="text-sm text-foreground">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
