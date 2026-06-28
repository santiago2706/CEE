import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CeeEvent } from '@cee/types';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { eventsPublicService } from '@/services/events.service';

const dateFmt = new Intl.DateTimeFormat('es-PE', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function EventCard({ ev }: { ev: CeeEvent }) {
  const dateLabel = capitalize(dateFmt.format(new Date(`${ev.eventDate}T00:00:00`)));
  const certLabel = ev.hasCertificate
    ? ev.certificatePrice && ev.certificatePrice > 0
      ? `Certificado S/ ${ev.certificatePrice}`
      : 'Certificado gratuito'
    : null;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-shadow duration-200 hover:shadow-lg">
      {/* Flyer o placeholder guinda */}
      {ev.flyerUrl ? (
        <img src={ev.flyerUrl} alt={ev.title} className="h-44 w-full object-cover" loading="lazy" />
      ) : (
        <div className="flex h-44 items-center justify-center bg-gradient-to-br from-cee-red to-cee-red-dark">
          <span className="text-4xl font-black text-white/20">CEE</span>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-5">
        {certLabel && (
          <span className="inline-flex w-fit items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
            {certLabel}
          </span>
        )}
        <h2 className="line-clamp-2 text-base font-bold text-gray-900 leading-snug">{ev.title}</h2>
        <ul className="space-y-1.5 text-xs text-gray-500">
          <li className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-cee-red" />
            {dateLabel}
          </li>
          <li className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 shrink-0 text-cee-red" />
            {ev.startTime} – {ev.endTime}
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-cee-red" />
            {ev.location}
          </li>
        </ul>
        <div className="mt-auto pt-2">
          <Link
            to={`/eventos/${ev.slug}`}
            className="block rounded-lg bg-cee-red px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-cee-red-dark"
          >
            Inscribirme
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function EventsPublicPage() {
  const [events, setEvents]     = useState<CeeEvent[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [hasError, setError]    = useState(false);

  useEffect(() => {
    eventsPublicService.getPublishedEvents()
      .then((res) => setEvents(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Eventos CEE-FIIS</h1>
          <p className="mt-3 text-base text-gray-500">
            Conferencias, talleres y seminarios del Centro de Especialización Ejecutiva
          </p>
        </div>

        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-gray-200" />
            ))}
          </div>
        )}

        {!isLoading && hasError && (
          <p className="text-center text-sm text-gray-500">
            No se pudieron cargar los eventos. Intenta nuevamente más tarde.
          </p>
        )}

        {!isLoading && !hasError && events.length === 0 && (
          <p className="text-center text-sm text-gray-500">
            No hay eventos publicados por el momento. ¡Vuelve pronto!
          </p>
        )}

        {!isLoading && !hasError && events.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((ev) => <EventCard key={ev.id} ev={ev} />)}
          </div>
        )}
      </div>
    </div>
  );
}
