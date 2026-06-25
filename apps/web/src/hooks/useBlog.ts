import { useEffect, useState } from 'react';
import type { BlogPost } from '@cee/types';
import { blogService } from '@/services/blog.service';

export function useBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    blogService
      .getAll()
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
  }, []);

  return { posts, isLoading };
}
