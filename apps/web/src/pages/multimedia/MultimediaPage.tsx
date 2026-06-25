import { useEffect, useState } from 'react';
import { VideoGallery } from '@/components/multimedia/VideoGallery';
import type { Video } from '@cee/types';
import { mediaService } from '@/services/media.service';

export default function MultimediaPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await mediaService.getVideos();
        setVideos(data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <>
      <section className="relative overflow-hidden border-b-4 border-cee-gray bg-gradient-to-br from-cee-red-900 via-cee-red-600 to-cee-ink text-white">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 20%, rgba(140,58,58,0.5), transparent 55%)',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
          <h1 className="text-4xl leading-tight sm:text-5xl">Multimedia</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
            Egresados del CEE-FIIS cuentan, en sus propias palabras, cómo nuestros programas
            impulsaron su carrera y transformaron su forma de liderar.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {!isLoading && videos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay videos disponibles</p>
          </div>
        ) : (
          <VideoGallery videos={videos} isLoading={isLoading} />
        )}
      </section>
    </>
  );
}
