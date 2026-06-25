import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { BlogCard } from '@/components/blog/BlogCard';
import { ROUTES } from '@/constants/routes';
import { useBlog } from '@/hooks/useBlog';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function BlogPage() {
  const { posts, isLoading } = useBlog();
  const gridRef = useScrollReveal<HTMLDivElement>({ selector: ':scope > *' });

  return (
    <section className="bg-dot-pattern bg-surface-grey py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={[{ label: 'Inicio', path: ROUTES.HOME }, { label: 'Blog' }]} />

        <div className="mt-6 mb-10">
          <p className="text-xs font-medium uppercase tracking-widest text-cee-red">CEE-FIIS</p>
          <h1 className="mt-1 text-3xl sm:text-4xl">Blog</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Noticias, casos y análisis sobre liderazgo, gestión y especialización profesional.
          </p>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground">Cargando entradas...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-muted-foreground">No hay entradas disponibles por ahora.</p>
        ) : (
          <div ref={gridRef} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
