import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AdminNotification, NotificationType } from '@cee/types';
import { CalendarDays, Check, CheckCheck, CheckCircle, Users, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/shared/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { notificationsService } from '@/services/notificationsService';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 20;

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<NotificationType, { label: string; icon: React.ElementType; cls: string }> = {
  low_enrollment:   { label: 'Bajo cupo',        icon: Users,         cls: 'bg-amber-50 text-amber-600' },
  new_lead:         { label: 'Nuevo contacto',    icon: UserPlus,      cls: 'bg-blue-50 text-blue-600' },
  event:            { label: 'Evento',            icon: CalendarDays,  cls: 'bg-purple-50 text-purple-600' },
  course_confirmed: { label: 'Curso confirmado',  icon: CheckCircle,   cls: 'bg-emerald-50 text-emerald-600' },
};

const TYPE_FILTER_OPTIONS: { value: NotificationType | 'all'; label: string }[] = [
  { value: 'all',              label: 'Todos los tipos' },
  { value: 'low_enrollment',   label: 'Bajo cupo' },
  { value: 'new_lead',         label: 'Nuevo contacto' },
  { value: 'event',            label: 'Evento' },
  { value: 'course_confirmed', label: 'Curso confirmado' },
];

const READ_FILTER_OPTIONS = [
  { value: 'all',    label: 'Todas' },
  { value: 'unread', label: 'No leídas' },
  { value: 'read',   label: 'Leídas' },
];

const SELECT_CLS =
  'h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 ' +
  'focus:border-[#682222] focus:outline-none focus:ring-1 focus:ring-[#682222]/40';

const dateFmt = new Intl.DateTimeFormat('es-PE', {
  day: 'numeric', month: 'short', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
});

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins   = Math.floor(diffMs / 60_000);
  if (mins < 1)   return 'ahora mismo';
  if (mins < 60)  return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const { success } = useToast();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isLoading, setIsLoading]         = useState(true);

  const [search,     setSearch]     = useState('');
  const [typeFilter, _setType]      = useState<NotificationType | 'all'>('all');
  const [readFilter, _setRead]      = useState<'all' | 'unread' | 'read'>('all');

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await notificationsService.getNotifications();
      setNotifications(res.data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filteredNotifs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notifications.filter((n) => {
      const matchSearch = !q || n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
      const matchType   = typeFilter === 'all' || n.type === typeFilter;
      const matchRead   =
        readFilter === 'all' ||
        (readFilter === 'unread' && !n.isRead) ||
        (readFilter === 'read'   &&  n.isRead);
      return matchSearch && matchType && matchRead;
    });
  }, [notifications, search, typeFilter, readFilter]);

  const { page, totalPages, paginatedItems, setPage, goNext, goPrev, hasNext, hasPrev } =
    usePagination(filteredNotifs, PAGE_SIZE);

  const setTypeFilter = (v: NotificationType | 'all') => { _setType(v); setPage(1); };
  const setReadFilter = (v: 'all' | 'unread' | 'read') => { _setRead(v); setPage(1); };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleMarkRead = async (id: string) => {
    await notificationsService.markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    success('Leída', 'La notificación fue marcada como leída.');
  };

  const handleMarkAllRead = async () => {
    await notificationsService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    success('Listas', 'Todas las notificaciones marcadas como leídas.');
  };

  return (
    <section className="grid gap-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
          <p className="mt-0.5 text-sm text-[#A9A9A9]">
            {unreadCount > 0
              ? `${unreadCount} notificación${unreadCount !== 1 ? 'es' : ''} sin leer`
              : 'Todas leídas'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="h-9 gap-2 border-gray-200 text-sm hover:border-[#682222] hover:text-[#682222]"
          >
            <CheckCheck className="h-4 w-4" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {/* ── Filtros ── */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
        <Input
          placeholder="Buscar en notificaciones..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="max-w-xs border-gray-200 focus:border-[#682222] focus:ring-[#682222]/20"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as NotificationType | 'all')}
          className={SELECT_CLS}
        >
          {TYPE_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={readFilter}
          onChange={(e) => setReadFilter(e.target.value as 'all' | 'unread' | 'read')}
          className={SELECT_CLS}
        >
          {READ_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className="ml-auto text-xs text-[#A9A9A9]">
          {filteredNotifs.length} notificación{filteredNotifs.length !== 1 ? 'es' : ''}
        </span>
      </div>

      {/* ── Tabla ── */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-xl bg-white shadow-sm">
          <p className="text-sm text-[#A9A9A9]">Cargando notificaciones...</p>
        </div>
      ) : filteredNotifs.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl bg-white shadow-sm">
          <p className="text-sm font-medium text-gray-500">No hay notificaciones</p>
          <p className="text-xs text-[#A9A9A9]">Cambia los filtros o espera nuevas alertas del sistema.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="bg-[#682222] text-left">
                  {['Tipo', 'Título / Mensaje', 'Fecha', 'Estado', 'Acción'].map((h) => (
                    <th
                      key={h}
                      className={cn(
                        'px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white',
                        h === 'Acción' && 'text-right',
                      )}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((notif, idx) => {
                  const cfg  = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.new_lead;
                  const Icon = cfg.icon;
                  return (
                    <tr
                      key={notif.id}
                      className={cn(
                        'border-b border-gray-100 last:border-0 transition-colors duration-150 hover:bg-[#fdf6f6]',
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#f9f9f9]',
                        notif.isRead && 'opacity-60',
                      )}
                    >
                      {/* Tipo */}
                      <td className="px-5 py-3.5">
                        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium', cfg.cls)}>
                          <Icon className="h-3.5 w-3.5" />
                          {cfg.label}
                        </span>
                      </td>

                      {/* Título + mensaje */}
                      <td className="max-w-[320px] px-5 py-3.5">
                        <p className="font-medium text-gray-900">{notif.title}</p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{notif.message}</p>
                      </td>

                      {/* Fecha */}
                      <td className="px-5 py-3.5">
                        <p className="text-xs text-[#A9A9A9]">{relativeTime(notif.createdAt)}</p>
                        <p className="mt-0.5 text-[10px] text-gray-400">
                          {dateFmt.format(new Date(notif.createdAt))}
                        </p>
                      </td>

                      {/* Estado */}
                      <td className="px-5 py-3.5">
                        {notif.isRead ? (
                          <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                            Leída
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-600 ring-1 ring-rose-200">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
                            Nueva
                          </span>
                        )}
                      </td>

                      {/* Acción */}
                      <td className="px-5 py-3.5 text-right">
                        {!notif.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 text-xs text-[#682222] hover:bg-[#682222]/10"
                            onClick={() => handleMarkRead(notif.id)}
                          >
                            <Check className="h-3.5 w-3.5" />
                            Leída
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
