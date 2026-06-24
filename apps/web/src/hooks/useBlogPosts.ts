import { useEffect, useState } from 'react';
import type { BlogPost } from '@cee/types';
import { blogService } from '@/services/blog.service';

interface UseBlogPostsOptions {
  /** Si se define, limita la cantidad de entradas devueltas (ej. "últimas 3" en Home) */
  limit?: number;
}

export function useBlogPosts(options?: UseBlogPostsOptions) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const limit = options?.limit;

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const request = limit ? blogService.getLatest(limit) : blogService.getAll();

    request
      .then((data) => {
        if (isMounted) {
          setPosts(data);
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
  }, [limit]);

  return { posts, isLoading };
}
