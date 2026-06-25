import { Link } from 'react-router-dom';
import type { Course } from '@cee/types';
import { CalendarClock, Download, GraduationCap, Laptop, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CourseCountdown } from '@/components/shared/CourseCountdown';
import { buildInscripcionUrl } from '@/lib/inscripcion';
import { formatPrice } from '@/lib/utils';

interface CourseSidebarProps {
  course: Course;
}

export function CourseSidebar({ course }: CourseSidebarProps) {
  const discountPct = course.originalPrice
    ? Math.round((1 - course.price / course.originalPrice) * 100)
    : null;

  return (
    <aside className="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
      <div
        className="w-full bg-cover bg-center"
        style={{ aspectRatio: '16 / 9', backgroundImage: `url(${course.imageUrl})` }}
      />

      <div className="space-y-4 p-6">
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold">{formatPrice(course.price)}</p>
          {course.originalPrice && (
            <>
              <p className="text-base text-muted-foreground line-through">
                {formatPrice(course.originalPrice)}
              </p>
              <span className="text-sm font-semibold text-cee-red">{discountPct}% dto.</span>
            </>
          )}
        </div>

        <CourseCountdown course={course} />

        <div className="space-y-2.5">
          <Button asChild size="lg" className="w-full">
            <Link to={buildInscripcionUrl(course.id)}>Inscribirme ahora</Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="w-full">
            <a href={course.syllabusPdfUrl} download>
              <Download className="h-4 w-4" />
              Descargar sílabo
            </a>
          </Button>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-sm font-semibold">Este programa incluye:</p>
          <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-2.5">
              <CalendarClock className="h-4 w-4 shrink-0 text-cee-red" />
              {course.academicHours} horas académicas · {course.modality}
            </li>
            <li className="flex items-center gap-2.5">
              <Laptop className="h-4 w-4 shrink-0 text-cee-red" />
              Nivel {course.level}
            </li>
            <li className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 shrink-0 text-cee-red" />
              {course.certification}
            </li>
            <li className="flex items-center gap-2.5">
              <GraduationCap className="h-4 w-4 shrink-0 text-cee-red" />
              Acceso de por vida al material
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
