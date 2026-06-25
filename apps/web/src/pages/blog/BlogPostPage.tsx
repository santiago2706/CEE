import { useParams } from 'react-router-dom';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { ROUTES } from '@/constants/routes';
import { useBlogPost } from '@/hooks/useBlogPost';
import { formatDateLong } from '@/lib/utils';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { post, isLoading, error } = useBlogPost(slug);

  if (isLoading) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-muted-foreground">Cargando entrada...</p>
      </section>
    );
  }

  if (error || !post) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-muted-foreground">Entrada no encontrada.</p>
      </section>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <Breadcrumb
        items={[
          { label: 'Inicio', path: ROUTES.HOME },
          { label: 'Blog', path: ROUTES.BLOG },
          { label: post.title },
        ]}
      />

      <p className="mt-6 text-xs font-medium tracking-widest text-cee-red">
        {formatDateLong(post.date)}
      </p>
      <h1 className="mt-2 text-3xl sm:text-4xl">{post.title}</h1>

      <div className="mt-8 w-full overflow-hidden rounded-lg" style={{ aspectRatio: '16 / 9' }}>
        <img src={post.imageUrl} alt={post.title} className="h-full w-full object-cover" loading="eager" />
      </div>

      <p className="mt-8 whitespace-pre-line text-lg leading-relaxed text-foreground">
        {post.content}
      </p>
    </article>
  );
}
