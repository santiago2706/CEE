import { Link, useNavigate } from 'react-router-dom';
import type { Course } from '@cee/types';
import { ROUTES } from '@/constants/routes';
import { formatPrice } from '@/lib/utils';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const navigate = useNavigate();
  const courseUrl = ROUTES.COURSE.replace(':slug', course.slug);

  /** Navega al formulario de contacto/registro con el curso preseleccionado */
  const handleInscribirse = () => {
    navigate(`${ROUTES.CONTACT}?curso=${course.id}`);
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md">
      <img
        src={course.imageUrl ?? '/placeholder-course.jpg'}
        alt={course.title}
        className="h-44 w-full object-cover"
        loading="lazy"
      />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <span className="w-fit rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase text-cee-red">
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

        {/* Precio + botones — empujados al fondo de la card */}
        <div className="mt-auto flex items-center justify-between">
          <div>
            {course.originalPrice ? (
              <p className="text-sm text-muted-foreground line-through">
                {formatPrice(course.originalPrice)}
              </p>
            ) : null}
            <p className="text-lg font-bold text-cee-red">{formatPrice(course.price)}</p>
          </div>
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
            className="flex-1 rounded-md bg-cee-red px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-cee-red-dark"
          >
            Inscribirme
          </button>
        </div>
      </div>
    </article>
  );
}
