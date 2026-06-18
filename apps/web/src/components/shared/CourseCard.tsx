import { Link } from 'react-router-dom';
import type { Course } from '@cee/types';
import { ROUTES } from '@/constants/routes';
import { formatPrice } from '@/lib/utils';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const courseUrl = ROUTES.COURSE.replace(':slug', course.slug);

  return (
    <article className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
      <img
        src={course.imageUrl ?? '/placeholder-course.jpg'}
        alt={course.title}
        className="h-44 w-full object-cover"
        loading="lazy"
      />
      <div className="grid gap-3 p-5">
        <span className="w-fit rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase text-cee-red">
          {course.category}
        </span>
        <Link to={courseUrl} className="text-lg font-semibold hover:text-cee-red">
          {course.title}
        </Link>
        <p className="line-clamp-3 text-sm text-muted-foreground">{course.description}</p>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{course.hours} horas</span>
          <span>{course.enrolledCount ?? 0} inscritos</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            {course.originalPrice ? (
              <p className="text-sm text-muted-foreground line-through">
                {formatPrice(course.originalPrice)}
              </p>
            ) : null}
            <p className="text-lg font-bold text-cee-red">{formatPrice(course.price)}</p>
          </div>
          <Link
            to={courseUrl}
            className="rounded-md bg-cee-red px-4 py-2 text-sm font-semibold text-white hover:bg-cee-red-dark"
          >
            Ver detalles
          </Link>
        </div>
      </div>
    </article>
  );
}
