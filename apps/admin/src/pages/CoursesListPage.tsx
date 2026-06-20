import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CourseStatus } from '@cee/types';
import { MoreHorizontal, Plus } from 'lucide-react';
import { StatusBadge } from '@/components/courses/StatusBadge';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { COURSE_STATUS_OPTIONS } from '@/constants/courseStatus';
import { useCourses } from '@/hooks/useCourses';
import { useToast } from '@/hooks/useToast';
import { formatPrice } from '@/lib/utils';

const STATUS_FILTER_OPTIONS: { value: CourseStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  ...COURSE_STATUS_OPTIONS,
];

const STATUS_ACTION_OPTIONS = COURSE_STATUS_OPTIONS;

const dateFormatter = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });

export default function CoursesListPage() {
  const { courses, isLoading, changeStatus, remove } = useCourses();
  const { success } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CourseStatus | 'all'>('all');

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(search.trim().toLowerCase());
      const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
      return matchesSearch && matchesStatus;
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Gestión de cursos</h1>
        <Button asChild>
          <Link to="/cursos/nuevo">
            <Plus className="h-4 w-4" />
            Nuevo curso
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as CourseStatus | 'all')}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          {STATUS_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Cargando cursos...</p>
      ) : filteredCourses.length === 0 ? (
        <p className="text-muted-foreground">No se encontraron cursos con esos filtros.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Modalidad</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha creación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">{course.title}</TableCell>
                <TableCell>{course.category}</TableCell>
                <TableCell>{course.modality}</TableCell>
                <TableCell>{formatPrice(course.price)}</TableCell>
                <TableCell>
                  <StatusBadge status={course.status} />
                </TableCell>
                <TableCell>{dateFormatter.format(new Date(course.createdAt))}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/cursos/${course.id}/editar`}>Editar</Link>
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Cambiar estado">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {STATUS_ACTION_OPTIONS.map((option) => (
                          <DropdownMenuItem
                            key={option.value}
                            disabled={option.value === course.status}
                            onClick={() => handleChangeStatus(course.id, option.value)}
                          >
                            Marcar como {option.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          Eliminar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar curso?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Se eliminará "{course.title}" permanentemente de la lista. Esta acción no
                            se puede deshacer.
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
