import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Course } from '@cee/types';
import { COURSE_QUERY_PARAM } from '@/lib/inscripcion';
import { coursesService } from '@/services/courses.service';

export function useCursoSeleccionado() {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get(COURSE_QUERY_PARAM);
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(courseId));

  useEffect(() => {
    if (!courseId) {
      setCourse(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    coursesService
      .getById(courseId)
      .then((response) => {
        if (isMounted) {
          setCourse(response.data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCourse(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [courseId]);

  return { course, isLoading };
}
