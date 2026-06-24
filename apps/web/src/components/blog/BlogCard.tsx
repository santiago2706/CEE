import { Link } from 'react-router-dom';
import type { BlogPost } from '@cee/types';
import { ROUTES } from '@/constants/routes';

const dateFormatter = new Intl.DateTimeFormat('es-PE', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const postUrl = ROUTES.BLOG_POST.replace(':slug', post.slug);

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground transition duration-200 hover:-translate-y-1 hover:shadow-md">
      <Link to={postUrl} className="block" style={{ aspectRatio: '16 / 9' }}>
        <img
          src={post.imageUrl}
          alt={post.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {dateFormatter.format(new Date(`${post.date}T00:00:00`))}
        </span>
        <Link to={postUrl} className="text-lg font-semibold leading-snug hover:text-cee-red">
          {post.title}
        </Link>
        <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">{post.summary}</p>
        <Link
          to={postUrl}
          className="mt-auto text-sm font-semibold text-cee-red hover:text-cee-red-dark"
        >
          Leer más →
        </Link>
      </div>
    </article>
  );
}
