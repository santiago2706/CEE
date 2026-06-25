/** Esqueleto de carga con la misma silueta que `BlogCard`. */
export function BlogCardSkeleton() {
  return (
    <article
      aria-hidden="true"
      className="flex flex-col overflow-hidden rounded-lg border border-cee-red/20 bg-card shadow-sm"
    >
      <div className="aspect-[16/9] w-full animate-pulse bg-secondary" />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="h-3 w-28 animate-pulse rounded bg-secondary" />
        <div className="h-6 w-3/4 animate-pulse rounded bg-secondary" />
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-secondary" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-secondary" />
        </div>
      </div>
    </article>
  );
}
