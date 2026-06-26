import type { Course } from '@cee/types';
import { ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { scrollToInscription } from './landing-utils';

interface LandingCtaBannerProps {
  course: Course;
}

/** Banner de cierre con precio y CTA que lleva al formulario de inscripción de la misma página. */
export function LandingCtaBanner({ course }: LandingCtaBannerProps) {
  const savings =
    course.originalPrice && course.originalPrice > course.price
      ? course.originalPrice - course.price
      : null;

  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-cee-red-900 via-cee-red-700 to-cee-ink text-white shadow-2xl">
      <div className="grid lg:grid-cols-2">
        <div className="p-6 lg:p-8">
          <h2 className="text-xl font-extrabold leading-tight tracking-tight sm:text-2xl">
            Da el siguiente paso en tu carrera profesional
          </h2>
          <p className="mt-2 text-sm text-white/80">
            Asegura tu cupo en {course.title} y empieza a construir el perfil que el mercado
            necesita.
          </p>
          <button
            type="button"
            onClick={scrollToInscription}
            className="mt-5 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-cee-red transition-transform hover:scale-[1.02] sm:w-auto"
          >
            Inscríbete hoy y asegura tu cupo
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col justify-center border-t border-white/10 bg-black/15 p-6 lg:border-l lg:border-t-0 lg:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
            Inversión total
          </p>
          {course.originalPrice && course.originalPrice > course.price && (
            <span className="mt-1.5 text-lg text-white/50 line-through">
              {formatPrice(course.originalPrice)}
            </span>
          )}
          <p className="mt-1 text-3xl font-extrabold sm:text-4xl">{formatPrice(course.price)}</p>
          {savings && (
            <p className="mt-1.5 text-sm font-bold text-amber-300">
              Ahorra {formatPrice(savings)} — precio de lanzamiento
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
