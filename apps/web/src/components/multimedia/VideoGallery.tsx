import { useState, useCallback } from 'react';
import { X, Play } from 'lucide-react';
import type { Video } from '@cee/types';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface VideoGalleryProps {
  videos: Video[];
}

export function VideoGallery({ videos }: VideoGalleryProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const gridRef = useScrollReveal<HTMLDivElement>({ selector: ':scope > *' });

  const closeModal = useCallback(() => {
    setSelectedVideo(null);
  }, []);

  return (
    <>
      <div ref={gridRef} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <article
            key={video.id}
            className="group cursor-pointer overflow-hidden rounded-lg border border-border bg-card transition hover:-translate-y-0.5 hover:border-cee-red/40"
            onClick={() => setSelectedVideo(video)}
          >
            <div
              className="relative w-full overflow-hidden bg-muted"
              style={{ aspectRatio: '16 / 9' }}
            >
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="h-full w-full object-cover transition group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-[rgba(26,20,20,0)] transition group-hover:bg-[rgba(26,20,20,0.35)]">
                <Play className="h-12 w-12 text-white opacity-0 transition group-hover:opacity-100" />
              </div>
            </div>
            <div className="p-4">
              <h3 className="line-clamp-2 font-semibold">{video.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {video.description}
              </p>
              {video.category && (
                <span className="mt-3 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-cee-red">
                  {video.category}
                </span>
              )}
            </div>
          </article>
        ))}
      </div>

      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-2xl rounded-lg bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/20 p-4">
              <h2 className="text-lg text-white">{selectedVideo.title}</h2>
              <button
                onClick={closeModal}
                className="rounded-lg p-1 hover:bg-white/10"
                aria-label="Cerrar"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="aspect-video w-full">
              <iframe
                src={selectedVideo.videoUrl}
                title={selectedVideo.title}
                className="h-full w-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="border-t border-white/20 p-4">
              <p className="text-sm text-white/80">{selectedVideo.description}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}