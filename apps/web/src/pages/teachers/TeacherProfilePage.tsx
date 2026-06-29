import { useParams } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { ROUTES } from '@/constants/routes';
import { useTeacher } from '@/hooks/useTeacher';
import { formatDateLong } from '@/lib/utils';

const LinkedInLogo = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.731-2.004 1.438-.103.249-.129.597-.129.946v5.421h-3.554s.05-8.789 0-9.514h3.554v1.347c.42-.648 1.36-1.573 3.322-1.573 2.432 0 4.261 1.589 4.261 5.004v4.736zM5.337 8.855c-1.144 0-1.915-.758-1.915-1.706 0-.968.77-1.706 1.96-1.706 1.188 0 1.915.738 1.939 1.706 0 .948-.751 1.706-1.984 1.706zm1.581 11.597H3.635V9.038h3.283v11.414zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
  </svg>
);

export default function TeacherProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const { teacher, isLoading, error } = useTeacher(slug);

  if (isLoading) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-muted-foreground">Cargando perfil...</p>
      </section>
    );
  }

  if (error || !teacher) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-muted-foreground">Profesor no encontrado.</p>
      </section>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <Breadcrumb
        items={[
          { label: 'Inicio', path: ROUTES.HOME },
          { label: 'Profesores' },
          { label: teacher.name },
        ]}
      />

      <div className="mt-6 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <img
          src={teacher.photoUrl}
          alt={teacher.name}
          className="h-28 w-28 shrink-0 rounded-full object-cover ring-4 ring-cee-red/15"
          loading="eager"
        />
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl">{teacher.name}</h1>
              <p className="mt-1 font-medium text-cee-red">{teacher.title}</p>
            </div>
            {teacher.linkedinUrl && (
              <a
                href={teacher.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0A66C2] transition hover:scale-110 hover:shadow-lg"
                aria-label="Ver perfil en LinkedIn"
              >
                <LinkedInLogo />
              </a>
            )}
          </div>
        </div>
      </div>

      <p className="mt-8 text-base leading-relaxed text-muted-foreground">{teacher.bio}</p>

      <div className="mt-10">
        <h2 className="text-xl font-semibold">Próximos eventos y clases</h2>
        {teacher.upcomingEvents.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Sin eventos próximos programados por el momento.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {teacher.upcomingEvents.map((event) => (
              <li
                key={event.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
              >
                <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-cee-red" />
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-muted-foreground">{formatDateLong(event.date)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
