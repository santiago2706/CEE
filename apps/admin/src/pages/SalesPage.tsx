import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Sale } from '@cee/types';
import { utils as xlsxUtils, writeFile as xlsxWriteFile } from 'xlsx';
import { Award, Download, Eye, MoreHorizontal, Plus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/shared/Pagination';
import { useSalesList } from '@/hooks/useSalesList';
import { useToast } from '@/hooks/useToast';
import { cn, formatPrice } from '@/lib/utils';

// ─── Status display ───────────────────────────────────────────────────────────

type SaleStatus = Sale['status'];

const SALE_STATUS_CONFIG: Record<SaleStatus, { label: string; cls: string }> = {
  completed: { label: 'Completado',  cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  pending:   { label: 'Pendiente',   cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  refunded:  { label: 'Reembolsado', cls: 'bg-rose-50 text-rose-500 ring-1 ring-rose-200' },
};

const SALE_STATUS_OPTIONS: SaleStatus[] = ['completed', 'pending', 'refunded'];

function SaleStatusChip({ status }: { status: SaleStatus }) {
  const { label, cls } = SALE_STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', cls)}>
      {label}
    </span>
  );
}

// ─── Detail modal ─────────────────────────────────────────────────────────────

const detailDateFmt = new Intl.DateTimeFormat('es-PE', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function SaleDetailModal({ sale }: { sale: Sale }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-[#682222]/10"
          aria-label="Ver detalle"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Detalle de inscripción</AlertDialogTitle>
        </AlertDialogHeader>

        <dl className="grid gap-2.5 text-sm">
          <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
            <dt className="text-[#A9A9A9]">Alumno</dt>
            <dd className="text-right font-medium text-gray-900">{sale.studentName ?? '—'}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
            <dt className="text-[#A9A9A9]">Curso</dt>
            <dd className="text-right font-medium text-gray-900 max-w-[200px]">{sale.courseName}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
            <dt className="text-[#A9A9A9]">Monto</dt>
            <dd className="font-semibold text-[#682222]">{formatPrice(sale.amount)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
            <dt className="text-[#A9A9A9]">Estado</dt>
            <dd><SaleStatusChip status={sale.status} /></dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
            <dt className="text-[#A9A9A9]">Fecha</dt>
            <dd className="text-gray-700">{detailDateFmt.format(new Date(sale.date))}</dd>
          </div>
          {sale.notes && (
            <div className="flex flex-col gap-1">
              <dt className="text-[#A9A9A9]">Notas</dt>
              <dd className="rounded-lg bg-gray-50 px-3 py-2 text-gray-700">{sale.notes}</dd>
            </div>
          )}
        </dl>

        <AlertDialogFooter>
          <AlertDialogCancel>Cerrar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Filters bar ─────────────────────────────────────────────────────────────

const SELECT_CLS =
  'h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 ' +
  'focus:border-[#682222] focus:outline-none focus:ring-1 focus:ring-[#682222]/40';

const DATE_CLS =
  'rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm text-gray-900 ' +
  'focus:border-[#682222] focus:outline-none focus:ring-1 focus:ring-[#682222]/40';

// ─── Table row ───────────────────────────────────────────────────────────────

const tableDateFmt = new Intl.DateTimeFormat('es-PE', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SalesPage() {
  const {
    isLoading, sales, filteredSales, paginatedItems, uniqueCourses,
    search,       setSearch,
    courseFilter, setCourseFilter,
    statusFilter, setStatusFilter,
    dateFrom,     setDateFrom,
    dateTo,       setDateTo,
    page, totalPages, goNext, goPrev, hasNext, hasPrev,
    changeStatus,
  } = useSalesList();

  const navigate = useNavigate();
  const { success } = useToast();

  const handleChangeStatus = async (id: string, status: SaleStatus) => {
    await changeStatus(id, status);
    success('Estado actualizado', 'La inscripción se actualizó correctamente.');
  };

  const handleExportExcel = () => {
    const today = new Date().toISOString().slice(0, 10);
    const rows = sales.map((s) => ({
      'Alumno':      s.studentName ?? '',
      'Curso':       s.courseName,
      'Monto (S/)':  s.amount,
      'Estado':      SALE_STATUS_CONFIG[s.status].label,
      'Fecha':       tableDateFmt.format(new Date(s.date)),
      'Notas':       s.notes ?? '',
    }));
    const ws = xlsxUtils.json_to_sheet(rows);
    const wb = xlsxUtils.book_new();
    xlsxUtils.book_append_sheet(wb, ws, 'Ventas');
    xlsxWriteFile(wb, `ventas-cee-${today}.xlsx`);
  };

  const foundLabel = useMemo(() => {
    const n = filteredSales.length;
    return `${n} inscripción${n !== 1 ? 'es' : ''} encontrada${n !== 1 ? 's' : ''}`;
  }, [filteredSales.length]);

  return (
    <section className="grid gap-6">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ventas / Inscripciones</h1>
          <p className="mt-0.5 text-sm text-[#A9A9A9]">Registro operativo de inscripciones del CEE</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            disabled={isLoading || sales.length === 0}
            className="h-9 gap-2 border-gray-200 text-sm hover:border-[#682222] hover:text-[#682222]"
          >
            <Download className="h-4 w-4" />
            Exportar Excel
          </Button>
          <Link
            to="/ventas/nueva"
            className="flex items-center gap-2 rounded-lg bg-[#682222] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#4F1A1A] focus:outline-none focus:ring-2 focus:ring-[#682222]/40"
          >
            <Plus className="h-4 w-4" />
            Registrar inscripción
          </Link>
        </div>
      </div>

      {/* ── Filtros ── */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
        <Input
          placeholder="Buscar por alumno o curso..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs border-gray-200 focus:border-[#682222] focus:ring-[#682222]/20"
        />

        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className={SELECT_CLS}
        >
          <option value="all">Todos los cursos</option>
          {uniqueCourses.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as SaleStatus | 'all')}
          className={SELECT_CLS}
        >
          <option value="all">Todos los estados</option>
          {SALE_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{SALE_STATUS_CONFIG[s].label}</option>
          ))}
        </select>

        <label className="flex items-center gap-1.5 text-xs text-gray-500">
          Desde
          <input
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => setDateFrom(e.target.value)}
            className={DATE_CLS}
          />
        </label>

        <label className="flex items-center gap-1.5 text-xs text-gray-500">
          Hasta
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => setDateTo(e.target.value)}
            className={DATE_CLS}
          />
        </label>

        <span className="ml-auto text-xs text-[#A9A9A9]">{foundLabel}</span>
      </div>

      {/* ── Tabla / Estado ── */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-xl bg-white shadow-sm">
          <p className="text-sm text-[#A9A9A9]">Cargando inscripciones...</p>
        </div>
      ) : filteredSales.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl bg-white shadow-sm">
          <p className="text-sm font-medium text-gray-500">No se encontraron inscripciones</p>
          <p className="text-xs text-[#A9A9A9]">Prueba con otros filtros o registra una nueva inscripción.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] table-fixed text-sm">
              <colgroup>
                <col style={{ width: '20%' }} />
                <col style={{ width: '30%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '12%' }} />
              </colgroup>
              <thead>
                <tr className="bg-[#682222] text-left">
                  {['Alumno', 'Curso', 'Monto', 'Estado', 'Fecha', 'Acciones'].map((h) => (
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
                {paginatedItems.map((sale, idx) => (
                  <tr
                    key={sale.id}
                    className={cn(
                      'border-b border-gray-100 last:border-0 transition-colors duration-150 hover:bg-[#fdf6f6]',
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#f9f9f9]',
                    )}
                  >
                    <td className="truncate px-5 py-3.5 font-medium text-gray-900" title={sale.studentName ?? ''}>
                      {sale.studentName ?? '—'}
                    </td>
                    <td className="truncate px-5 py-3.5 text-gray-600" title={sale.courseName}>
                      {sale.courseName}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-[#682222]">
                      {formatPrice(sale.amount)}
                    </td>
                    <td className="px-5 py-3.5">
                      <SaleStatusChip status={sale.status} />
                    </td>
                    <td className="px-5 py-3.5 text-[#A9A9A9]">
                      {tableDateFmt.format(new Date(sale.date))}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <SaleDetailModal sale={sale} />

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
                            {SALE_STATUS_OPTIONS.map((s) => (
                              <DropdownMenuItem
                                key={s}
                                disabled={s === sale.status}
                                onClick={() => handleChangeStatus(sale.id, s)}
                              >
                                Marcar como {SALE_STATUS_CONFIG[s].label}
                              </DropdownMenuItem>
                            ))}
                            {sale.status === 'completed' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate(
                                      `/certificados/nuevo?alumno=${encodeURIComponent(sale.studentName ?? '')}&curso=${sale.courseId}`,
                                    )
                                  }
                                >
                                  <Award className="mr-2 h-4 w-4 text-[#682222]" />
                                  Emitir certificado
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
