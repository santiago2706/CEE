import { Link } from 'react-router-dom';
import type { Course } from '@cee/types';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildInscripcionUrl } from '@/lib/inscripcion';
import { formatPrice } from '@/lib/utils';

interface CourseSidebarProps {
  course: Course;
}

export function CourseSidebar({ course }: CourseSidebarProps) {
  return (
    <aside className="space-y-4 rounded-lg border bg-card p-6">
      <p className="text-3xl font-bold text-cee-red">{formatPrice(course.price)}</p>

      <Button asChild className="w-full">
        <Link to={buildInscripcionUrl(course.id)}>Inscribirme</Link>
      </Button>

      <Button asChild variant="outline" className="w-full">
        <a href={course.syllabusPdfUrl} download>
          <Download className="h-4 w-4" />
          Descargar sílabo
        </a>
      </Button>

      <dl className="grid grid-cols-2 gap-3 border-t pt-4 text-sm">
        <div>
          <dt className="text-muted-foreground">Modalidad</dt>
          <dd className="font-medium">{course.modality}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Duración</dt>
          <dd className="font-medium">{course.academicHours} horas</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Nivel</dt>
          <dd className="font-medium">{course.level}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Certificación</dt>
          <dd className="font-medium">{course.certification}</dd>
        </div>
      </dl>
    </aside>
  );
}
