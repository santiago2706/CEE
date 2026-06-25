import { useEffect, useState } from 'react';
import type { Teacher } from '@cee/types';
import { teachersService } from '@/services/teachers.service';

export function useTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    teachersService
      .getAll()
      .then((data) => {
        if (isMounted) setTeachers(data);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { teachers, isLoading };
}
