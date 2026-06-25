import { useParams } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { ROUTES } from '@/constants/routes';
import { useTeacher } from '@/hooks/useTeacher';
import { formatDateLong } from '@/lib/utils';

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
        <div>
          <h1 className="text-2xl sm:text-3xl">{teacher.name}</h1>
          <p className="mt-1 font-medium text-cee-red">{teacher.title}</p>
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
