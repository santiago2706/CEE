import { useEffect, useState } from 'react';
import type { Course } from '@cee/types';
import { coursesService } from '@/services/courses.service';

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    coursesService
      .getAll()
      .then((response) => {
        if (isMounted) {
          setCourses(response.data);
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
  }, []);

  return { courses, isLoading };
}
