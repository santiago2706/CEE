import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import type { CourseCategory } from '@cee/types';
import { CourseCard } from '@/components/shared/CourseCard';
import { CourseCardSkeleton } from '@/components/shared/CourseCardSkeleton';
import { CourseCountdown } from '@/components/shared/CourseCountdown';
import { CourseFilter } from '@/components/shared/CourseFilter';
import { AboutSection } from '@/components/home/AboutSection';
import { BlogSection } from '@/components/home/BlogSection';
import { EventSlider } from '@/components/home/EventSlider';
import { HomeSideActions } from '@/components/home/HomeSideActions';
import { SectionAnchors } from '@/components/home/SectionAnchors';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useCourses } from '@/hooks/useCourses';
import { useEvents } from '@/hooks/useEvents';
import { useScrollReveal } from '@/hooks/useScrollReveal';

function getFeaturedCourse<T extends { status: string; startDate: string }>(
  courses: T[],
): T | undefined {
  return [...courses]
    .filter((course) => course.status === 'published')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];
}

const FEATURED_COUNT = 6;

const SECTION_ANCHORS = [
  { id: 'hero', label: 'Inicio' },
  { id: 'eventos', label: 'Eventos' },
  { id: 'programas', label: 'Programas' },
  { id: 'nosotros', label: 'Nosotros' },
  { id: 'blog', label: 'Blog' },
];

export default function HomePage() {
  const [category, setCategory] = useState<CourseCategory | 'Todas'>('Todas');
  const { courses, isLoading } = useCourses({ category });
  const { events, isLoading: eventsLoading } = useEvents();
  const featuredCourse = getFeaturedCourse(courses);
  const heroRef = useRef<HTMLDivElement>(null);
  const eventosSectionRef = useScrollReveal<HTMLDivElement>({ selector: ':scope > *' });
  const programasHeaderRef = useScrollReveal<HTMLDivElement>();
  const coursesGridRef = useScrollReveal<HTMLDivElement>({ selector: ':scope > *' });
  const nosotrosSectionRef = useScrollReveal<HTMLDivElement>();
  const blogSectionRef = useScrollReveal<HTMLDivElement>({ selector: ':scope > *' });

  useEffect(() => {
    if (!heroRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const tween = gsap.fromTo(
      heroRef.current.children,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out' },
    );

    return () => {
      tween.kill();
    };
  }, []);

  return (
    <div className="snap-container">
      <SectionAnchors sections={SECTION_ANCHORS} />
      <HomeSideActions />

      <section
        id="hero"
        className="relative flex min-h-[85vh] items-center overflow-hidden bg-gradient-to-br from-cee-red-900 via-cee-red-700 to-cee-ink text-white sm:min-h-screen snap-always snap-start"
      >
        <div
          className="absolute inset-y-0 right-0 hidden w-3/5 sm:block sm:[clip-path:polygon(15%_0,100%_0,100%_100%,0_100%)]"
          style={{ aspectRatio: '16 / 10' }}
        >
          <img
            src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="h-full w-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-cee-ink/70 via-cee-red-800/45 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div ref={heroRef} className="max-w-xl">
            <h1 className="text-3xl leading-tight sm:text-5xl">
              Especialízate con el Centro de Especialización Ejecutiva
            </h1>
            <p className="mt-4 text-base text-white/85 sm:text-lg">
              Programas ejecutivos de la FIIS-UNI diseñados para impulsar tu carrera profesional.
            </p>

            {isLoading ? (
              <div className="mt-6 h-[58px] w-72 animate-pulse rounded-lg bg-white/10" aria-hidden="true" />
            ) : featuredCourse ? (
              <div className="mt-6 inline-flex flex-col gap-1.5 rounded-lg bg-white/10 px-4 py-3 backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500">
                <p className="text-xs font-medium uppercase tracking-widest text-white/70">
                  Próximo a iniciar: {featuredCourse.title}
                </p>
                <CourseCountdown course={featuredCourse} variant="dark" />
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="bg-white text-cee-red transition-transform hover:scale-[1.03] hover:bg-white/90">
                <Link to={ROUTES.CONTACT}>Inscríbete ahora</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:border-white hover:bg-white hover:text-cee-red"
              >
                <Link to={ROUTES.CATALOG}>Explorar Cursos</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section
        id="eventos"
        ref={eventosSectionRef}
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 snap-always snap-start"
      >
        <div className="mb-6 flex flex-col gap-1 sm:mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-cee-red">
            Agenda CEE
          </p>
          <h2 className="text-2xl sm:text-3xl">Próximos eventos</h2>
        </div>
        <EventSlider events={events} isLoading={eventsLoading} />
      </section>

      <section
        id="programas"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 snap-always snap-start"
      >
        <div
          ref={programasHeaderRef}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <h2 className="text-2xl">Programas destacados</h2>
          <CourseFilter value={category} onChange={setCategory} />
        </div>

        {isLoading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <p className="mt-10 text-center text-muted-foreground">
            No hay cursos disponibles en esta categoría.
          </p>
        ) : (
          <div ref={coursesGridRef} className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, FEATURED_COUNT).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Button asChild variant="outline" size="lg">
            <Link to={ROUTES.CATALOG}>Ver más</Link>
          </Button>
        </div>
      </section>

      <section
        id="nosotros"
        ref={nosotrosSectionRef}
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 snap-always snap-start"
      >
        <AboutSection />
      </section>

      <section
        id="blog"
        ref={blogSectionRef}
        className="mx-auto max-w-7xl px-4 py-16 pb-24 sm:px-6 sm:py-20 sm:pb-24 lg:px-8 snap-always snap-start"
      >
        <BlogSection />
      </section>
    </div>
  );
}
