import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CourseCategory, CourseStatus } from '@cee/types';
import { MoreHorizontal, Plus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { COURSE_STATUS_OPTIONS } from '@/constants/courseStatus';
import { useCourses } from '@/hooks/useCourses';
import { useToast } from '@/hooks/useToast';
import { cn, formatPrice } from '@/lib/utils';

// ─── status badge ────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<CourseStatus, { label: string; cls: string; dot?: boolean }> = {
  published: { label: 'Publicado',   cls: 'bg-emerald-50 text-emerald-700', dot: true },
  draft:     { label: 'Borrador',    cls: 'bg-gray-100 text-gray-500' },
  review:    { label: 'En Revisión', cls: 'bg-amber-50 text-amber-700' },
};

function StatusChip({ status }: { status: CourseStatus }) {
  const { label, cls, dot } = STATUS_STYLES[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', cls)}>
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </span>
      )}
      {label}
    </span>
  );
}

// ─── category badge ───────────────────────────────────────────────────────────

const CATEGORY_STYLES: Record<CourseCategory, string> = {
  'Gestión':           'bg-blue-50   text-blue-700',
  'Tecnología':        'bg-purple-50 text-purple-700',
  'Finanzas':          'bg-emerald-50 text-emerald-700',
  'Habilidades Blandas': 'bg-orange-50 text-orange-700',
  'Ingeniería':        'bg-red-50    text-red-700',
};

function CategoryChip({ category }: { category: CourseCategory }) {
  return (
    <span className={cn('inline-flex rounded-md px-2 py-0.5 text-xs font-medium', CATEGORY_STYLES[category])}>
      {category}
    </span>
  );
}

// ─── filter options ───────────────────────────────────────────────────────────

const STATUS_FILTER_OPTIONS: { value: CourseStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  ...COURSE_STATUS_OPTIONS,
];

const dateFormatter = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });

// ─── page ─────────────────────────────────────────────────────────────────────

export default function CoursesListPage() {
  const { courses, isLoading, changeStatus, remove } = useCourses();
  const { success } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CourseStatus | 'all'>('all');

  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return courses.filter((c) => {
      const matchSearch = c.title.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [courses, search, statusFilter]);

  const handleChangeStatus = async (id: string, status: CourseStatus) => {
    await changeStatus(id, status);
    success('Estado actualizado', 'El curso se actualizó correctamente.');
  };

  const handleDelete = async (id: string) => {
    await remove(id);
    success('Curso eliminado', 'El curso se eliminó correctamente.');
  };

  return (
    <section className="grid gap-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de cursos</h1>
          <p className="mt-0.5 text-sm text-[#A9A9A9]">Administra el catálogo de cursos del CEE</p>
        </div>
        <Link
          to="/cursos/nuevo"
          className="flex items-center gap-2 rounded-lg bg-[#682222] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#4F1A1A] focus:outline-none focus:ring-2 focus:ring-[#682222]/40"
        >
          <Plus className="h-4 w-4" />
          Nuevo curso
        </Link>
      </div>

      {/* ── Filtros ── */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
        <Input
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs border-gray-200 focus:border-[#682222] focus:ring-[#682222]/20"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as CourseStatus | 'all')}
          className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-[#682222] focus:outline-none focus:ring-1 focus:ring-[#682222]/40"
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {filteredCourses.length > 0 && (
          <span className="ml-auto text-xs text-[#A9A9A9]">
            {filteredCourses.length} curso{filteredCourses.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Tabla ── */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-xl bg-white shadow-sm">
          <p className="text-sm text-[#A9A9A9]">Cargando cursos...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl bg-white shadow-sm">
          <p className="text-sm text-[#A9A9A9]">No se encontraron cursos con esos filtros.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#682222] text-left">
                  {['Nombre', 'Categoría', 'Modalidad', 'Precio', 'Estado', 'Creado', 'Acciones'].map((h) => (
                    <th
                      key={h}
                      className={cn(
                        'px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white',
                        h === 'Acciones' && 'text-right',
                      )}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course, idx) => (
                  <tr
                    key={course.id}
                    className={cn(
                      'border-b border-gray-100 last:border-0 transition-colors hover:bg-[#f5eded]',
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#f9f9f9]',
                    )}
                  >
                    <td className="max-w-[220px] truncate px-5 py-3.5 font-medium text-gray-900">
                      {course.title}
                    </td>
                    <td className="px-5 py-3.5">
                      <CategoryChip category={course.category} />
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{course.modality}</td>
                    <td className="px-5 py-3.5 font-semibold text-[#682222]">
                      {formatPrice(course.price)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusChip status={course.status} />
                    </td>
                    <td className="px-5 py-3.5 text-[#A9A9A9]">
                      {dateFormatter.format(new Date(course.createdAt))}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button asChild variant="outline" size="sm" className="h-8 border-gray-200 text-xs hover:border-[#682222] hover:text-[#682222]">
                          <Link to={`/cursos/${course.id}/editar`}>Editar</Link>
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#682222]/10" aria-label="Cambiar estado">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {COURSE_STATUS_OPTIONS.map((opt) => (
                              <DropdownMenuItem
                                key={opt.value}
                                disabled={opt.value === course.status}
                                onClick={() => handleChangeStatus(course.id, opt.value)}
                              >
                                Marcar como {opt.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 text-xs text-rose-500 hover:bg-rose-50 hover:text-rose-600">
                              Eliminar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar curso?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Se eliminará "{course.title}" permanentemente. Esta acción no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(course.id)}>
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
