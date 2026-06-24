import { BlogCard } from '@/components/blog/BlogCard';
import { useBlogPosts } from '@/hooks/useBlogPosts';

export default function BlogPage() {
  const { posts, isLoading } = useBlogPosts();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl sm:text-4xl">Blog CEE-FIIS</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Artículos, casos de estudio y novedades sobre liderazgo, gestión y especialización
          ejecutiva.
        </p>
      </div>

      {isLoading ? (
        <p className="mt-10 text-center text-muted-foreground">Cargando entradas...</p>
      ) : posts.length === 0 ? (
        <p className="mt-10 text-center text-muted-foreground">
          Todavía no hay entradas publicadas.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}
