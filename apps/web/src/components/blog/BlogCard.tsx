import { Link } from 'react-router-dom';
import { ImageOff } from 'lucide-react';
import type { BlogPost } from '@cee/types';
import { ROUTES } from '@/constants/routes';
import { formatDateLong } from '@/lib/utils';

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const postUrl = ROUTES.BLOG_POST.replace(':slug', post.slug);

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-cee-red/20 bg-card text-card-foreground shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative w-full bg-muted" style={{ aspectRatio: '16 / 9' }}>
        <img
          src={post.imageUrl}
          alt={post.title}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <div
          className="absolute inset-0 items-center justify-center bg-muted text-muted-foreground"
          style={{ display: 'none' }}
        >
          <ImageOff className="h-8 w-8" aria-hidden="true" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-xs font-medium tracking-widest text-cee-red">
          {formatDateLong(post.date)}
        </p>
        <Link to={postUrl} className="text-lg font-semibold hover:text-cee-red">
          {post.title}
        </Link>
        <p className="line-clamp-3 text-sm text-muted-foreground">{post.summary}</p>
        <Link to={postUrl} className="mt-auto pt-2 text-sm font-semibold text-cee-red hover:underline">
          Leer más →
        </Link>
      </div>
    </article>
  );
}
