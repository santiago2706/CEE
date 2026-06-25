import { useEffect, useState } from 'react';
import type { BlogPost } from '@cee/types';
import { blogService } from '@/services/blog.service';

export function useBlogPost(slug: string | undefined) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setIsLoading(false);
      setError('Entrada no encontrada.');
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    blogService
      .getBySlug(slug)
      .then((data) => {
        if (!isMounted) return;
        if (!data) {
          setError('Entrada no encontrada.');
        }
        setPost(data);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  return { post, isLoading, error };
}
