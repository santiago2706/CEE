import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart2,
  BookOpen,
  Bot,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';

const NAV_ITEMS: readonly { label: string; path: string; icon: React.ElementType }[] = [
  { label: 'Dashboard',     path: '/',          icon: LayoutDashboard },
  { label: 'Cursos',        path: '/cursos',     icon: BookOpen },
  { label: 'Ventas',        path: '/ventas',     icon: BarChart2 },
  { label: 'Asistente CEE', path: '/asistente',  icon: Bot },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuthStore();

  const initial = user?.name?.charAt(0).toUpperCase() ?? 'A';

  return (
    <aside
      className={cn(
        'flex h-screen shrink-0 flex-col bg-cee-red font-sans',
        'shadow-[2px_0_12px_rgba(0,0,0,0.20)]',
        'transition-[width] duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* ── Logo + toggle ── */}
      {collapsed ? (
        <div className="flex flex-col items-center gap-2 px-3 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
            <span className="text-[11px] font-black leading-none tracking-tight text-cee-red">CEE</span>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            aria-label="Expandir menú"
            className="flex h-6 w-6 items-center justify-center rounded bg-white/15 text-white transition-colors duration-[400ms] ease-in-out hover:bg-white/95 hover:text-[#682222]"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
            <span className="text-[11px] font-black leading-none tracking-tight text-cee-red">CEE</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold leading-none text-white">CEE-FIIS</p>
            <p className="mt-0.5 truncate text-[10px] leading-none text-white/55">Panel Administrativo</p>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="Colapsar menú"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white transition-colors duration-[400ms] ease-in-out hover:bg-white/95 hover:text-[#682222]"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="mx-3 h-px bg-white/15" />

      {/* ── Navegación principal ── */}
      <nav className="flex-1 space-y-0.5 px-2 py-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center rounded-lg text-sm font-medium transition-all duration-[400ms] ease-in-out',
                  collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                  isActive
                    ? 'bg-cee-red-dark text-white'
                    : 'text-white/80 hover:bg-white/95 hover:text-[#682222]',
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Usuario + Salir ── */}
      <div className="px-2 pb-4">
        <div className="mb-3 h-px bg-white/15" />

        {/* Avatar + info del usuario */}
        {collapsed ? (
          <div className="mb-2 flex justify-center">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25 text-[13px] font-bold text-white"
              title={user?.name ?? 'Admin'}
            >
              {initial}
            </div>
          </div>
        ) : (
          <div className="mb-2 flex items-center gap-2.5 rounded-lg px-2 py-1.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/25 text-[13px] font-bold text-white">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">{user?.name ?? 'Admin'}</p>
              <p className="truncate text-[10px] text-white/50">{user?.email ?? ''}</p>
            </div>
          </div>
        )}

        <div className="mb-2 h-px bg-white/10" />

        {/* Salir */}
        <button
          type="button"
          onClick={() => void authService.logout()}
          title={collapsed ? 'Salir' : undefined}
          className={cn(
            'flex w-full items-center rounded-lg text-sm font-medium',
            'text-white/80 transition-all duration-[400ms] ease-in-out hover:bg-white/95 hover:text-[#682222]',
            collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && 'Salir'}
        </button>
      </div>
    </aside>
  );
}
