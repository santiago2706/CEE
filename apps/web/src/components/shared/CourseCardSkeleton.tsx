/** Esqueleto de carga con la misma silueta que `CourseCard` (evita CLS y parpadeo). */
export function CourseCardSkeleton() {
  return (
    <article
      aria-hidden="true"
      className="flex flex-col overflow-hidden rounded-lg border border-border bg-card"
    >
      <div className="aspect-[16/9] w-full animate-pulse bg-secondary" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="h-5 w-24 animate-pulse rounded-full bg-secondary" />
        <div className="h-6 w-3/4 animate-pulse rounded bg-secondary" />
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-secondary" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-secondary" />
        </div>
        <div className="mt-auto flex items-center justify-between">
          <div className="h-6 w-20 animate-pulse rounded bg-secondary" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 flex-1 animate-pulse rounded-md bg-secondary" />
          <div className="h-10 flex-1 animate-pulse rounded-md bg-secondary" />
        </div>
      </div>
    </article>
  );
}
