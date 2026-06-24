import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Autoplay from 'embla-carousel-autoplay';
import { CalendarDays, Sparkles } from 'lucide-react';
import type { EventSlide } from '@cee/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const dateFormatter = new Intl.DateTimeFormat('es-PE', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

interface EventSliderProps {
  events: EventSlide[];
}

export function EventSlider({ events }: EventSliderProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on('select', () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  if (events.length === 0) return null;

  return (
    <Carousel
      setApi={setApi}
      opts={{ loop: true }}
      plugins={
        prefersReducedMotion
          ? []
          : [Autoplay({ delay: 5500, stopOnMouseEnter: true, stopOnInteraction: false })]
      }
      className="group overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/5 sm:rounded-3xl"
    >
      <CarouselContent>
        {events.map((event, index) => (
          <CarouselItem key={event.id}>
            <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/9] lg:aspect-[21/9]">
              <img
                src={event.imageUrl}
                alt={event.title}
                className={cn(
                  'absolute inset-0 h-full w-full object-cover transition-transform ease-out',
                  prefersReducedMotion ? 'duration-0' : 'duration-[6000ms]',
                  index === current ? 'scale-110' : 'scale-100',
                )}
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cee-ink/90 via-cee-ink/35 to-cee-ink/5" />
              <div className="absolute inset-0 bg-gradient-to-r from-cee-red/35 via-transparent to-transparent" />

              <div className="absolute right-4 top-4 hidden items-center gap-1 rounded-full bg-black/30 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm sm:flex">
                {String(index + 1).padStart(2, '0')} / {String(events.length).padStart(2, '0')}
              </div>

              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 sm:gap-4 sm:p-10 lg:p-12">
                <span className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-cee-red-light sm:text-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  Evento institucional
                </span>
                <h3 className="max-w-2xl text-2xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
                  {event.title}
                </h3>
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm sm:text-sm">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {dateFormatter.format(new Date(`${event.date}T00:00:00`))}
                </span>
                <Button
                  asChild
                  size="lg"
                  className="mt-2 w-fit bg-white text-cee-red shadow-lg transition-transform hover:scale-[1.04] hover:bg-white/90"
                >
                  <Link to={event.ctaHref}>{event.ctaLabel}</Link>
                </Button>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {events.length > 1 && (
        <>
          <CarouselPrevious className="left-3 h-9 w-9 border-white/30 bg-black/35 text-white opacity-80 backdrop-blur-sm transition-opacity hover:bg-black/55 hover:text-white focus-visible:opacity-100 sm:left-4 sm:h-11 sm:w-11 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100" />
          <CarouselNext className="right-3 h-9 w-9 border-white/30 bg-black/35 text-white opacity-80 backdrop-blur-sm transition-opacity hover:bg-black/55 hover:text-white focus-visible:opacity-100 sm:right-4 sm:h-11 sm:w-11 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100" />

          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2 sm:bottom-4">
            {events.map((event, index) => (
              <button
                key={event.id}
                type="button"
                aria-label={`Ir al evento ${index + 1}: ${event.title}`}
                aria-current={index === current}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  'h-2 rounded-full bg-white/50 transition-all hover:bg-white/80',
                  index === current ? 'w-8 bg-white' : 'w-2',
                )}
              />
            ))}
          </div>
        </>
      )}
    </Carousel>
  );
}
