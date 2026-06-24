import { useParams } from 'react-router-dom';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { ROUTES } from '@/constants/routes';
import { useBlogPost } from '@/hooks/useBlogPost';

const dateFormatter = new Intl.DateTimeFormat('es-PE', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { post, isLoading, error } = useBlogPost(slug);

  if (isLoading) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-muted-foreground">Cargando entrada...</p>
      </section>
    );
  }

  if (error || !post) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Entrada no encontrada</h1>
      </section>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: 'Inicio', path: ROUTES.HOME },
          { label: 'Blog', path: ROUTES.BLOG },
          { label: post.title },
        ]}
      />

      <h1 className="mt-6 text-3xl leading-tight sm:text-4xl">{post.title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {dateFormatter.format(new Date(`${post.date}T00:00:00`))} · {post.author}
      </p>

      <div className="mt-8 w-full overflow-hidden rounded-lg" style={{ aspectRatio: '16 / 9' }}>
        <img
          src={post.imageUrl}
          alt={post.title}
          className="h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
      </div>

      <div className="mt-8 text-base leading-relaxed">
        {post.content.split('\n\n').map((paragraph, index) => (
          <p key={index} className="mb-4 text-muted-foreground">
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
}
