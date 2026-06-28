import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CourseCategory, CourseStatus } from '@cee/types';
import { utils as xlsxUtils, writeFile as xlsxWriteFile } from 'xlsx';
import { Download, MoreHorizontal, Plus } from 'lucide-react';
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
import { Pagination } from '@/components/shared/Pagination';
import { COURSE_STATUS_LABELS, COURSE_STATUS_OPTIONS } from '@/constants/courseStatus';
import { useCourses } from '@/hooks/useCourses';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { cn, formatPrice } from '@/lib/utils';

const PAGE_SIZE = 20;

// ─── Status chip ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<CourseStatus, { cls: string; dot?: boolean }> = {
  published: { cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: true },
  draft:     { cls: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200' },
  review:    { cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
};

function StatusChip({ status }: { status: CourseStatus }) {
  const { cls, dot } = STATUS_STYLES[status];
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', cls)}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </span>
      )}
      {COURSE_STATUS_LABELS[status]}
    </span>
  );
}

// ─── Category chip ────────────────────────────────────────────────────────────

const CATEGORY_STYLES: Record<CourseCategory, string> = {
  'Gestión':             'bg-blue-50 text-blue-700',
  'Tecnología':          'bg-purple-50 text-purple-700',
  'Finanzas':            'bg-emerald-50 text-emerald-700',
  'Habilidades Blandas': 'bg-orange-50 text-orange-700',
  'Ingeniería':          'bg-red-50 text-red-700',
};

function CategoryChip({ category }: { category: CourseCategory }) {
  return (
    <span className={cn('inline-flex rounded-md px-2 py-0.5 text-xs font-medium', CATEGORY_STYLES[category])}>
      {category}
    </span>
  );
}

// ─── Filter constants ─────────────────────────────────────────────────────────

const CATEGORY_OPTIONS: CourseCategory[] = [
  'Ingeniería', 'Gestión', 'Tecnología', 'Habilidades Blandas', 'Finanzas',
];

const STATUS_FILTER_OPTIONS: { value: CourseStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos los estados' },
  ...COURSE_STATUS_OPTIONS,
];

const dateFormatter = new Intl.DateTimeFormat('es-PE', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CoursesListPage() {
  const { courses, isLoading, changeStatus, remove } = useCourses();
  const { success } = useToast();

  const [search, setSearch]               = useState('');
  const [statusFilter, setStatusFilter]   = useState<CourseStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<CourseCategory | 'all'>('all');

  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return courses.filter((c) => {
      const matchSearch   = !q || c.title.toLowerCase().includes(q);
      const matchStatus   = statusFilter === 'all' || c.status === statusFilter;
      const matchCategory = categoryFilter === 'all' || c.category === categoryFilter;
      return matchSearch && matchStatus && matchCategory;
    });
  }, [courses, search, statusFilter, categoryFilter]);

  const { page, totalPages, paginatedItems, setPage, goNext, goPrev, hasNext, hasPrev } =
    usePagination(filteredCourses, PAGE_SIZE);

  // Reset to page 1 whenever any filter changes
  const handleSearch         = (v: string)                    => { setSearch(v);         setPage(1); };
  const handleStatusFilter   = (v: CourseStatus | 'all')      => { setStatusFilter(v);   setPage(1); };
  const handleCategoryFilter = (v: CourseCategory | 'all')    => { setCategoryFilter(v); setPage(1); };

  const handleChangeStatus = async (id: string, status: CourseStatus) => {
    await changeStatus(id, status);
    success('Estado actualizado', 'El curso se actualizó correctamente.');
  };

  const handleDelete = async (id: string) => {
    await remove(id);
    success('Curso eliminado', 'El curso se eliminó correctamente.');
  };

  const handleExportExcel = () => {
    const today = new Date().toISOString().slice(0, 10);
    const rows = courses.map((c) => ({
      'Nombre':              c.title,
      'Categoría':           c.category,
      'Modalidad':           c.modality,
      'Nivel':               c.level,
      'Precio':              c.price,
      'Estado':              COURSE_STATUS_LABELS[c.status],
      'Horas Académicas':    c.academicHours,
      'Horario':             c.scheduleDescription ?? '',
      'Fecha Inicio':        c.startDate ? c.startDate.slice(0, 10) : '',
      'Duración (semanas)':  c.durationWeeks ?? '',
      'Cupo Máximo':         c.maxStudents ?? '',
      'Moodle Course ID':    c.moodleCourseId ?? '',
      'Fecha Creación':      dateFormatter.format(new Date(c.createdAt)),
    }));

    const ws = xlsxUtils.json_to_sheet(rows);
    const wb = xlsxUtils.book_new();
    xlsxUtils.book_append_sheet(wb, ws, 'Cursos');
    xlsxWriteFile(wb, `cursos-cee-${today}.xlsx`);
  };

  const foundLabel = `${filteredCourses.length} curso${filteredCourses.length !== 1 ? 's' : ''} encontrado${filteredCourses.length !== 1 ? 's' : ''}`;

  return (
    <section className="grid gap-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de cursos</h1>
          <p className="mt-0.5 text-sm text-[#A9A9A9]">Administra el catálogo de cursos del CEE</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            disabled={isLoading || courses.length === 0}
            className="h-9 gap-2 border-gray-200 text-sm hover:border-[#682222] hover:text-[#682222]"
          >
            <Download className="h-4 w-4" />
            Exportar Excel
          </Button>
          <Link
            to="/cursos/nuevo"
            className="flex items-center gap-2 rounded-lg bg-[#682222] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#4F1A1A] focus:outline-none focus:ring-2 focus:ring-[#682222]/40"
          >
            <Plus className="h-4 w-4" />
            Nuevo curso
          </Link>
        </div>
      </div>

      {/* ── Filtros ── */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
        <Input
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-xs border-gray-200 focus:border-[#682222] focus:ring-[#682222]/20"
        />
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value as CourseStatus | 'all')}
          className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-[#682222] focus:outline-none focus:ring-1 focus:ring-[#682222]/40"
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => handleCategoryFilter(e.target.value as CourseCategory | 'all')}
          className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-[#682222] focus:outline-none focus:ring-1 focus:ring-[#682222]/40"
        >
          <option value="all">Todas las categorías</option>
          {CATEGORY_OPTIONS.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <span className="ml-auto text-xs text-[#A9A9A9]">{foundLabel}</span>
      </div>

      {/* ── Tabla / Estado ── */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-xl bg-white shadow-sm">
          <p className="text-sm text-[#A9A9A9]">Cargando cursos...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl bg-white shadow-sm">
          <p className="text-sm font-medium text-gray-500">No se encontraron cursos</p>
          <p className="text-xs text-[#A9A9A9]">Prueba con otros filtros o agrega un nuevo curso.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] table-fixed text-sm">
              <colgroup>
                <col style={{ width: '30%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '13%' }} />
              </colgroup>
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
                {paginatedItems.map((course, idx) => (
                  <tr
                    key={course.id}
                    className={cn(
                      'border-b border-gray-100 last:border-0 transition-colors duration-150 hover:bg-[#fdf6f6]',
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#f9f9f9]',
                    )}
                  >
                    <td
                      className="truncate px-5 py-3.5 font-medium text-gray-900"
                      title={course.title}
                    >
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
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="h-8 border-gray-200 text-xs hover:border-[#682222] hover:text-[#682222]"
                        >
                          <Link to={`/cursos/${course.id}/editar`}>Editar</Link>
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-[#682222]/10"
                              aria-label="Cambiar estado"
                            >
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
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                            >
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
          <Pagination
            page={page}
            totalPages={totalPages}
            hasNext={hasNext}
            hasPrev={hasPrev}
            onNext={goNext}
            onPrev={goPrev}
          />
        </div>
      )}
    </section>
  );
}
