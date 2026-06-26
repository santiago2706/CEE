import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { SectionHeading } from './SectionHeading';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  location: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'El programa me dio el lenguaje y las herramientas para asumir nuevos retos. Tres meses después de terminar, lideraba un proyecto que antes me parecía inalcanzable.',
    name: 'Marco Delgado',
    role: 'Jefe de Operaciones',
    location: 'Sector industrial, Moquegua',
  },
  {
    quote:
      'Desde la primera semana estaba aplicando lo aprendido en mi trabajo. Los casos prácticos hacen toda la diferencia frente a un curso solo teórico.',
    name: 'Ana Torres',
    role: 'Analista de Infraestructura',
    location: 'Telecomunicaciones, Lima',
  },
  {
    quote:
      'Lo que más valoro es que los docentes enseñan desde la experiencia real, no desde un libro. Cada sesión era un caso que alguien vivió de verdad.',
    name: 'Carlos Mendoza',
    role: 'Supervisor de Planta',
    location: 'Manufactura, Callao',
  },
];

/** Carrusel de testimonios (scroll-snap accesible, sin auto-play para respetar reduced-motion). */
export function LandingTestimonials() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCards = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>('[data-card]');
    const amount = card ? card.offsetWidth + 16 : track.clientWidth * 0.8;
    track.scrollBy({
      left: amount * direction,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  };

  return (
    <div>
      <SectionHeading
        align="center"
        eyebrow="Prueba social"
        title="Lo que dicen nuestros egresados"
      />

      <div className="relative mt-6">
        <button
          type="button"
          onClick={() => scrollByCards(-1)}
          aria-label="Testimonio anterior"
          className="absolute -left-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md transition-colors hover:bg-cee-red hover:text-white lg:flex"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => scrollByCards(1)}
          aria-label="Siguiente testimonio"
          className="absolute -right-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md transition-colors hover:bg-cee-red hover:text-white lg:flex"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {TESTIMONIALS.map((testimonial) => (
            <article
              key={testimonial.name}
              data-card
              className="w-[85vw] shrink-0 snap-start rounded-xl border border-border bg-card p-6 sm:w-[380px]"
            >
              <Quote className="h-8 w-8 text-cee-red/20" />
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {testimonial.quote}
              </p>
              <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cee-red font-bold text-white">
                  {getInitials(testimonial.name)}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{testimonial.name}</p>
                  <p className="text-xs font-semibold text-cee-red">{testimonial.role}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
