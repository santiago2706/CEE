import { Link, useNavigate } from 'react-router-dom';
import type { Course } from '@cee/types';
import { CourseCountdown } from '@/components/shared/CourseCountdown';
import { ROUTES } from '@/constants/routes';
import { formatPrice } from '@/lib/utils';
import { buildInscripcionUrl } from '@/lib/inscripcion';
import { CATEGORY_GRADIENTS } from '@/constants/category-gradients';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const navigate = useNavigate();
  const courseUrl = ROUTES.COURSE.replace(':slug', course.slug);

  /** Navega al formulario de contacto/registro con el curso preseleccionado */
  const handleInscribirse = () => {
    navigate(buildInscripcionUrl(course.id));
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground transition duration-200 hover:-translate-y-1 hover:shadow-md">
      <div
        className="w-full bg-cover bg-center"
        style={{ aspectRatio: '16 / 9', backgroundImage: CATEGORY_GRADIENTS[course.category] }}
      >
        <img
          src={course.imageUrl}
          alt={course.title}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <span className="w-fit rounded-full border border-cee-red/30 bg-transparent px-3 py-1 text-xs font-semibold uppercase text-cee-red">
          {course.category}
        </span>
        <Link to={courseUrl} className="text-lg font-semibold hover:text-cee-red">
          {course.title}
        </Link>
        <p className="line-clamp-3 text-sm text-muted-foreground">{course.description}</p>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{course.academicHours} horas</span>
          <span>{course.enrolledCount ?? 0} inscritos</span>
        </div>

        <CourseCountdown course={course} />

        {/* Precio + botones — empujados al fondo de la card */}
        <div className="mt-auto flex items-center justify-between">
          <p className="text-lg font-bold text-cee-red">{formatPrice(course.price)}</p>
        </div>

        <div className="flex gap-2">
          <Link
            to={courseUrl}
            className="flex-1 rounded-md border-2 border-cee-red px-4 py-2 text-center text-sm font-semibold text-cee-red transition-colors duration-200 hover:bg-cee-red hover:text-white"
          >
            Ver detalles
          </Link>
          <button
            type="button"
            onClick={handleInscribirse}
            className="flex-1 rounded-md bg-cee-red px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:scale-[1.02] hover:bg-cee-red-dark"
          >
            Inscribirme
          </button>
        </div>
      </div>
    </article>
  );
}
