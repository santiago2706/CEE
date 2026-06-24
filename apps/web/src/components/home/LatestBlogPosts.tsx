import { Link } from 'react-router-dom';
import type { BlogPost } from '@cee/types';
import { BlogCard } from '@/components/blog/BlogCard';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

interface LatestBlogPostsProps {
  posts: BlogPost[];
}

export function LatestBlogPosts({ posts }: LatestBlogPostsProps) {
  if (posts.length === 0) return null;

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Button asChild variant="outline" size="lg">
          <Link to={ROUTES.BLOG}>Ver todo el blog</Link>
        </Button>
      </div>
    </div>
  );
}
