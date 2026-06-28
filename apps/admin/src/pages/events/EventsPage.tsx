import { Link } from 'react-router-dom';
import type { EventStatus } from '@cee/types';
import { Plus } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/shared/Pagination';
import { useEvents } from '@/hooks/useEvents';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

// ─── Status chip ──────────────────────────────────────────────────────────────

const EVENT_STATUS_CONFIG: Record<EventStatus, { label: string; cls: string }> = {
  published: { label: 'Publicado', cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  draft:     { label: 'Borrador',  cls: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200' },
  cancelled: { label: 'Cancelado', cls: 'bg-rose-50 text-rose-500 ring-1 ring-rose-200' },
};

function StatusChip({ status }: { status: EventStatus }) {
  const { label, cls } = EVENT_STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', cls)}>
      {label}
    </span>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_FILTER_OPTIONS: { value: EventStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'published', label: 'Publicado' },
  { value: 'draft', label: 'Borrador' },
  { value: 'cancelled', label: 'Cancelado' },
];

const dateFmt = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });

function formatEventDate(iso: string) {
  return dateFmt.format(new Date(`${iso}T00:00:00`));
}

const SELECT_CLS =
  'h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 ' +
  'focus:border-[#682222] focus:outline-none focus:ring-1 focus:ring-[#682222]/40';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventsPage() {
  const {
    isLoading, filteredEvents, paginatedItems,
    search, setSearch, statusFilter, setStatusFilter,
    page, totalPages, goNext, goPrev, hasNext, hasPrev,
    deleteEvent,
  } = useEvents();
  const { success } = useToast();

  const handleDelete = async (id: string) => {
    await deleteEvent(id);
    success('Evento eliminado', 'El evento fue eliminado correctamente.');
  };

  return (
    <section className="grid gap-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
          <p className="mt-0.5 text-sm text-[#A9A9A9]">Gestiona los eventos del CEE-FIIS</p>
        </div>
        <Link
          to="/eventos/nuevo"
          className="flex items-center gap-2 rounded-lg bg-[#682222] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#4F1A1A] focus:outline-none focus:ring-2 focus:ring-[#682222]/40"
        >
          <Plus className="h-4 w-4" />
          Nuevo evento
        </Link>
      </div>

      {/* ── Filtros ── */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
        <Input
          placeholder="Buscar por título..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs border-gray-200 focus:border-[#682222] focus:ring-[#682222]/20"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as EventStatus | 'all')}
          className={SELECT_CLS}
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className="ml-auto text-xs text-[#A9A9A9]">
          {filteredEvents.length} evento{filteredEvents.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Tabla ── */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-xl bg-white shadow-sm">
          <p className="text-sm text-[#A9A9A9]">Cargando eventos...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl bg-white shadow-sm">
          <p className="text-sm font-medium text-gray-500">No se encontraron eventos</p>
          <p className="text-xs text-[#A9A9A9]">Prueba con otros filtros o crea un nuevo evento.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] table-fixed text-sm">
              <colgroup>
                <col style={{ width: '30%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '14%' }} />
              </colgroup>
              <thead>
                <tr className="bg-[#682222] text-left">
                  {['Título', 'Fecha', 'Lugar', 'Inscritos', 'Estado', 'Acciones'].map((h) => (
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
                {paginatedItems.map((ev, idx) => (
                  <tr
                    key={ev.id}
                    className={cn(
                      'border-b border-gray-100 last:border-0 transition-colors duration-150 hover:bg-[#fdf6f6]',
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#f9f9f9]',
                    )}
                  >
                    <td className="truncate px-5 py-3.5 font-medium text-gray-900" title={ev.title}>
                      {ev.title}
                    </td>
                    <td className="px-5 py-3.5 text-[#A9A9A9]">
                      {formatEventDate(ev.eventDate)}
                    </td>
                    <td className="truncate px-5 py-3.5 text-gray-600" title={ev.location}>
                      {ev.location}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-gray-900">{ev.registeredCount ?? 0}</span>
                      <span className="text-[#A9A9A9]"> / {ev.capacity}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusChip status={ev.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="h-8 border-gray-200 text-xs hover:border-[#682222] hover:text-[#682222]"
                        >
                          <Link to={`/eventos/${ev.id}/inscritos`}>Inscritos</Link>
                        </Button>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="h-8 border-gray-200 text-xs hover:border-[#682222] hover:text-[#682222]"
                        >
                          <Link to={`/eventos/${ev.id}/editar`}>Editar</Link>
                        </Button>
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
                              <AlertDialogTitle>¿Eliminar evento?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Se eliminará "{ev.title}" y todas sus inscripciones. Esta acción no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(ev.id)}>
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
