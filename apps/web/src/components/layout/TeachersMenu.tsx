import { Link } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TeacherCard } from '@/components/course/TeacherCard';
import { ROUTES } from '@/constants/routes';
import { useTeachers } from '@/hooks/useTeachers';
import { cn } from '@/lib/utils';

/**
 * Pestaña "Profesores" del Navbar (Iniciativa F del plan de mejoras): overlay
 * accesible (Radix Popover: foco, Esc, ARIA) con tarjetas de docentes que
 * navegan a su perfil completo (`/profesores/:slug`).
 */
export function TeachersMenu() {
  const { teachers, isLoading } = useTeachers();

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          'hidden h-9 items-center rounded-full bg-cee-red px-4 text-sm font-semibold text-white transition hover:bg-cee-red-dark md:inline-flex',
        )}
      >
        Profesores
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 sm:w-96">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Plana docente CEE-FIIS
        </p>
        <div className="grid max-h-80 gap-3 overflow-y-auto">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando profesores...</p>
          ) : (
            teachers.map((teacher) => (
              <Link
                key={teacher.id}
                to={ROUTES.TEACHER_PROFILE.replace(':slug', teacher.slug)}
                className="rounded-xl transition hover:bg-secondary/60"
              >
                <TeacherCard instructor={teacher} />
              </Link>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
