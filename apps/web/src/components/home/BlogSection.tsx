import { Link } from 'react-router-dom';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogCardSkeleton } from '@/components/blog/BlogCardSkeleton';
import { ROUTES } from '@/constants/routes';
import { useBlog } from '@/hooks/useBlog';

const RECENT_COUNT = 3;

export function BlogSection() {
  const { posts, isLoading } = useBlog();
  const recentPosts = posts.slice(0, RECENT_COUNT);

  return (
    <>
      <div className="mb-6 flex flex-col gap-1 sm:mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-cee-red">CEE-FIIS</p>
        <h2 className="text-2xl sm:text-3xl">Blog</h2>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: RECENT_COUNT }).map((_, i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
      ) : recentPosts.length === 0 ? (
        <p className="text-center text-muted-foreground">No hay entradas disponibles por ahora.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recentPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}

      <div className="mt-10 flex justify-center">
        <Link
          to={ROUTES.BLOG}
          className="rounded-md border-2 border-cee-red px-5 py-2.5 text-sm font-semibold text-cee-red transition-colors duration-200 hover:bg-cee-red hover:text-white"
        >
          Ver todo el blog
        </Link>
      </div>
    </>
  );
}
