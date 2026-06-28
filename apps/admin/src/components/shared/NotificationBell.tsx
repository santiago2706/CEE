import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AdminNotification } from '@cee/types';
import { Bell, CheckCircle, Users, UserPlus, CalendarDays, Check } from 'lucide-react';
import { notificationsService } from '@/services/notificationsService';
import { cn } from '@/lib/utils';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diffMs  = Date.now() - new Date(iso).getTime();
  const mins    = Math.floor(diffMs / 60_000);
  if (mins < 1)   return 'ahora mismo';
  if (mins < 60)  return `hace ${mins} min`;
  const hours   = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} hora${hours !== 1 ? 's' : ''}`;
  const days    = Math.floor(hours / 24);
  return `hace ${days} día${days !== 1 ? 's' : ''}`;
}

const TYPE_CONFIG = {
  low_enrollment: {
    icon:    Users,
    label:   'Bajo cupo',
    iconCls: 'text-amber-500',
    bgCls:   'bg-amber-50',
  },
  new_lead: {
    icon:    UserPlus,
    label:   'Nuevo contacto',
    iconCls: 'text-blue-500',
    bgCls:   'bg-blue-50',
  },
  course_confirmed: {
    icon:    CheckCircle,
    label:   'Curso confirmado',
    iconCls: 'text-emerald-500',
    bgCls:   'bg-emerald-50',
  },
  event: {
    icon:    CalendarDays,
    label:   'Evento',
    iconCls: 'text-purple-500',
    bgCls:   'bg-purple-50',
  },
} as const;

// ─── Notification item ────────────────────────────────────────────────────────

function NotifItem({
  notif,
  onRead,
}: {
  notif: AdminNotification;
  onRead: (id: string) => void;
}) {
  const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.new_lead;
  const Icon = cfg.icon;

  return (
    <div
      className={cn(
        'flex gap-3 rounded-lg p-3 transition-colors',
        notif.isRead ? 'opacity-50' : 'bg-white hover:bg-gray-50',
      )}
    >
      <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full', cfg.bgCls)}>
        <Icon className={cn('h-4 w-4', cfg.iconCls)} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-gray-900">{notif.title}</p>
        <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-gray-500">{notif.message}</p>
        <p className="mt-1 text-[10px] text-[#A9A9A9]">{relativeTime(notif.createdAt)}</p>
      </div>
      {!notif.isRead && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRead(notif.id); }}
          aria-label="Marcar como leída"
          className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-[#682222] hover:text-white"
        >
          <Check className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

// ─── Bell component ───────────────────────────────────────────────────────────

export function NotificationBell() {
  const navigate = useNavigate();
  const [open,         setOpen]        = useState(false);
  const [unreadCount,  setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loadingAll,   setLoadingAll]  = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load unread count on mount + poll every 60s
  const refreshCount = useCallback(async () => {
    try {
      const res = await notificationsService.getUnreadCount();
      setUnreadCount(res.data);
    } catch { /* silently ignore */ }
  }, []);

  useEffect(() => {
    void refreshCount();
    const id = setInterval(() => { void refreshCount(); }, 60_000);
    return () => clearInterval(id);
  }, [refreshCount]);

  // Load full list when panel opens
  useEffect(() => {
    if (!open) return;
    setLoadingAll(true);
    notificationsService.getNotifications()
      .then((res) => setNotifications(res.data.slice(0, 10)))
      .catch(() => {})
      .finally(() => setLoadingAll(false));
  }, [open]);

  // Close on click outside
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleMarkRead = async (id: string) => {
    await notificationsService.markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    await notificationsService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const goToPage = () => {
    setOpen(false);
    navigate('/notificaciones');
  };

  return (
    <div ref={containerRef} className="relative">
      {/* ── Bell button ── */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notificaciones"
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#682222]"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-0.5 text-[9px] font-bold leading-none text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">
              Notificaciones
              {unreadCount > 0 && (
                <span className="ml-2 rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-600">
                  {unreadCount} nuevas
                </span>
              )}
            </p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-medium text-[#682222] hover:underline"
              >
                Marcar todas
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto p-2">
            {loadingAll ? (
              <p className="py-6 text-center text-xs text-[#A9A9A9]">Cargando...</p>
            ) : notifications.length === 0 ? (
              <p className="py-6 text-center text-xs text-[#A9A9A9]">Sin notificaciones.</p>
            ) : (
              <div className="grid gap-1">
                {notifications.map((n) => (
                  <NotifItem key={n.id} notif={n} onRead={handleMarkRead} />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-4 py-2.5">
            <button
              type="button"
              onClick={goToPage}
              className="text-[11px] font-medium text-[#682222] hover:underline"
            >
              Ver todas las notificaciones →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
