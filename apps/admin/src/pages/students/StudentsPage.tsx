import { useMemo, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Student, StudentSource } from '@cee/types';
import { utils as xlsxUtils, writeFile as xlsxWriteFile } from 'xlsx';
import { Download, Plus } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/shared/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { studentsService } from '@/services/studentsService';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 20;

// ─── Source badge ─────────────────────────────────────────────────────────────

const SOURCE_CONFIG: Record<StudentSource, { label: string; cls: string }> = {
  web:      { label: 'Web',      cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
  whatsapp: { label: 'WhatsApp', cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  manual:   { label: 'Manual',   cls: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200' },
  referido: { label: 'Referido', cls: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200' },
};

function SourceBadge({ source }: { source: StudentSource }) {
  const { label, cls } = SOURCE_CONFIG[source];
  return <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', cls)}>{label}</span>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SELECT_CLS =
  'h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 ' +
  'focus:border-[#682222] focus:outline-none focus:ring-1 focus:ring-[#682222]/40';

const SOURCE_FILTER_OPTIONS: { value: StudentSource | 'all'; label: string }[] = [
  { value: 'all',      label: 'Todas las fuentes' },
  { value: 'web',      label: 'Web' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'manual',   label: 'Manual' },
  { value: 'referido', label: 'Referido' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudentsPage() {
  const { success } = useToast();
  const [students, setStudents]   = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search,        setSearch]        = useState('');
  const [sourceFilter,  _setSource]       = useState<StudentSource | 'all'>('all');
  const [workingFilter, _setWorking]      = useState<'all' | 'yes' | 'no'>('all');

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await studentsService.getStudents();
      setStudents(res.data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      const name = `${s.firstName} ${s.lastNamePaterno} ${s.lastNameMaterno}`.toLowerCase();
      const matchSearch = !q || name.includes(q) || s.dni.includes(q);
      const matchSource  = sourceFilter === 'all' || s.source === sourceFilter;
      const matchWorking = workingFilter === 'all'
        || (workingFilter === 'yes' && s.isWorking)
        || (workingFilter === 'no' && !s.isWorking);
      return matchSearch && matchSource && matchWorking;
    });
  }, [students, search, sourceFilter, workingFilter]);

  const { page, totalPages, paginatedItems, setPage, goNext, goPrev, hasNext, hasPrev } =
    usePagination(filteredStudents, PAGE_SIZE);

  const setSource  = (v: StudentSource | 'all') => { _setSource(v);  setPage(1); };
  const setWorking = (v: 'all' | 'yes' | 'no') => { _setWorking(v); setPage(1); };
  const handleSearch = (v: string) => { setSearch(v); setPage(1); };

  const handleDelete = async (id: string) => {
    try {
      await studentsService.deleteStudent(id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
      success('Alumno eliminado', 'El alumno fue eliminado correctamente.');
    } catch (err) {
      success('Error', err instanceof Error ? err.message : 'No se pudo eliminar.');
    }
  };

  const handleExportExcel = () => {
    const today = new Date().toISOString().slice(0, 10);
    const rows = students.map((s) => ({
      'DNI':            s.dni,
      'Nombres':        s.firstName,
      'Apellido Paterno': s.lastNamePaterno,
      'Apellido Materno': s.lastNameMaterno,
      'Email':          s.email ?? '',
      'Celular':        s.phone,
      '¿Trabaja?':      s.isWorking ? 'Sí' : 'No',
      'Empresa':        s.company ?? '',
      'Profesión':      s.profession ?? '',
      'Distrito':       s.district ?? '',
      'Ciudad':         s.city ?? '',
      'Fuente':         SOURCE_CONFIG[s.source]?.label ?? s.source,
      'Notas':          s.notes ?? '',
      'Fecha registro': new Date(s.createdAt).toLocaleDateString('es-PE'),
    }));
    const ws = xlsxUtils.json_to_sheet(rows);
    const wb = xlsxUtils.book_new();
    xlsxUtils.book_append_sheet(wb, ws, 'Alumnos');
    xlsxWriteFile(wb, `alumnos-cee-${today}.xlsx`);
  };

  return (
    <section className="grid gap-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alumnos</h1>
          <p className="mt-0.5 text-sm text-[#A9A9A9]">Registro de alumnos del CEE-FIIS</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline" size="sm"
            onClick={handleExportExcel}
            disabled={isLoading || students.length === 0}
            className="h-9 gap-2 border-gray-200 text-sm hover:border-[#682222] hover:text-[#682222]"
          >
            <Download className="h-4 w-4" />
            Exportar Excel
          </Button>
          <Link
            to="/alumnos/nuevo"
            className="flex items-center gap-2 rounded-lg bg-[#682222] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#4F1A1A]"
          >
            <Plus className="h-4 w-4" />
            Nuevo alumno
          </Link>
        </div>
      </div>

      {/* ── Filtros ── */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
        <Input
          placeholder="Buscar por nombre o DNI..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-xs border-gray-200 focus:border-[#682222] focus:ring-[#682222]/20"
        />
        <select value={sourceFilter} onChange={(e) => setSource(e.target.value as StudentSource | 'all')} className={SELECT_CLS}>
          {SOURCE_FILTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={workingFilter} onChange={(e) => setWorking(e.target.value as 'all' | 'yes' | 'no')} className={SELECT_CLS}>
          <option value="all">Todos</option>
          <option value="yes">Trabajando</option>
          <option value="no">No trabaja</option>
        </select>
        <span className="ml-auto text-xs text-[#A9A9A9]">
          {filteredStudents.length} alumno{filteredStudents.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Tabla ── */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-xl bg-white shadow-sm">
          <p className="text-sm text-[#A9A9A9]">Cargando alumnos...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl bg-white shadow-sm">
          <p className="text-sm font-medium text-gray-500">No se encontraron alumnos</p>
          <p className="text-xs text-[#A9A9A9]">Prueba con otros filtros o registra un nuevo alumno.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] table-fixed text-sm">
              <colgroup>
                <col style={{ width: '9%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '8%' }} />
              </colgroup>
              <thead>
                <tr className="bg-[#682222] text-left">
                  {['DNI', 'Nombre completo', 'Email', 'Celular', 'Ocupación', 'Fuente', 'Cursos', 'Acciones'].map((h) => (
                    <th key={h} className={cn('px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white', h === 'Acciones' && 'text-right')}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((s, idx) => (
                  <tr
                    key={s.id}
                    className={cn(
                      'border-b border-gray-100 last:border-0 transition-colors duration-150 hover:bg-[#fdf6f6]',
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#f9f9f9]',
                    )}
                  >
                    <td className="px-4 py-3.5 font-mono text-xs font-semibold text-[#682222]">{s.dni}</td>
                    <td className="truncate px-4 py-3.5 font-medium text-gray-900" title={`${s.firstName} ${s.lastNamePaterno} ${s.lastNameMaterno}`}>
                      {s.firstName} {s.lastNamePaterno} {s.lastNameMaterno}
                    </td>
                    <td className="truncate px-4 py-3.5 text-gray-600">{s.email ?? '—'}</td>
                    <td className="px-4 py-3.5 text-gray-600">{s.phone}</td>
                    <td className="truncate px-4 py-3.5 text-gray-600">
                      {s.profession ?? '—'}
                      {s.isWorking && s.company && (
                        <span className="block truncate text-[11px] text-[#A9A9A9]">{s.company}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5"><SourceBadge source={s.source} /></td>
                    <td className="px-4 py-3.5 text-center text-sm font-medium text-gray-700">—</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="outline" size="sm" className="h-8 border-gray-200 text-xs hover:border-[#682222] hover:text-[#682222]">
                          <Link to={`/alumnos/${s.id}`}>Ver</Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 text-xs text-rose-500 hover:bg-rose-50 hover:text-rose-600">
                              Eliminar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar alumno?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Se eliminará a "{s.firstName} {s.lastNamePaterno}" permanentemente. Esta acción no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(s.id)}>Eliminar</AlertDialogAction>
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
          <Pagination page={page} totalPages={totalPages} hasNext={hasNext} hasPrev={hasPrev} onNext={goNext} onPrev={goPrev} />
        </div>
      )}
    </section>
  );
}
