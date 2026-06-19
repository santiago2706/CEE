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
      <section className="bg-gradient-to-br from-cee-red to-cee-red-dark text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">Multimedia</h1>
          <p className="mx-auto mt-4 text-lg text-white/90">
            Descubre historias, testimonios y contenido exclusivo del Centro de Especialización Ejecutiva
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <p className="text-muted-foreground">Cargando videos...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay videos disponibles</p>
          </div>
        ) : (
          <VideoGallery videos={videos} />
        )}
      </section>
    </>
  );
}
