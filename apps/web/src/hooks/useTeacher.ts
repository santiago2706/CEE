import { useEffect, useState } from 'react';
import type { Teacher } from '@cee/types';
import { teachersService } from '@/services/teachers.service';

export function useTeacher(slug?: string) {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    teachersService
      .getBySlug(slug)
      .then((data) => {
        if (isMounted) setTeacher(data);
      })
      .catch((err: Error) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  return { teacher, isLoading, error };
}
