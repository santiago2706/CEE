/** Esqueleto de carga con la misma silueta que la card de `VideoGallery` (evita CLS y parpadeo). */
export function VideoCardSkeleton() {
  return (
    <article
      aria-hidden="true"
      className="overflow-hidden rounded-lg border border-border bg-card"
    >
      <div className="aspect-[16/9] w-full animate-pulse bg-secondary" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-secondary" />
        <div className="h-3 w-full animate-pulse rounded bg-secondary" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-secondary" />
      </div>
    </article>
  );
}
