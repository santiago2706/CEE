import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Award,
  BarChart2,
  Bell,
  BookOpen,
  Bot,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Gift,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  ShoppingBag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';

// ─── Nav structure ────────────────────────────────────────────────────────────

const TOP_ITEMS = [
  { label: 'Dashboard', path: '/',        icon: LayoutDashboard },
  { label: 'Cursos',    path: '/cursos',  icon: BookOpen },
  { label: 'Eventos',   path: '/eventos', icon: CalendarDays },
] as const;

const VENTAS_CHILDREN = [
  { label: 'Inscripciones', path: '/ventas',     icon: ShoppingBag },
  { label: 'Beneficios',    path: '/beneficios', icon: Gift },
] as const;

const BOTTOM_ITEMS = [
  { label: 'Alumnos',        path: '/alumnos',         icon: GraduationCap },
  { label: 'Certificados',   path: '/certificados',    icon: Award },
  { label: 'Notificaciones', path: '/notificaciones',  icon: Bell },
  { label: 'Asistente CEE',  path: '/asistente',       icon: Bot },
] as const;

// ─── Style helpers ────────────────────────────────────────────────────────────

// Corrección 1: item activo usa #4F1A1A (guinda oscuro) hardcodeado para
// evitar que el token cee-red-dark quede sin generar en ciertos builds.
// El hover blanco solo aplica en items inactivos.
const ACTIVE_CLS   = 'bg-[#4F1A1A] text-white';
const INACTIVE_CLS = 'text-white/80 hover:bg-white/95 hover:text-[#682222]';

function navLinkCls(isActive: boolean, collapsed: boolean) {
  return cn(
    'flex items-center rounded-lg text-sm font-medium',
    'transition-all duration-[400ms] ease-in-out',
    collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
    isActive ? ACTIVE_CLS : INACTIVE_CLS,
  );
}

function subLinkCls(isActive: boolean) {
  return cn(
    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium',
    'transition-all duration-[400ms] ease-in-out',
    isActive ? ACTIVE_CLS : INACTIVE_CLS,
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [ventasOpen, setVentasOpen] = useState(true);
  const { user } = useAuthStore();
  const location = useLocation();

  const initial = user?.name?.charAt(0).toUpperCase() ?? 'A';

  // Grupo Ventas: está "activo" si cualquier ruta hija coincide
  const isVentasActive = VENTAS_CHILDREN.some(
    (c) => location.pathname === c.path || location.pathname.startsWith(c.path + '/'),
  );
  // El grupo permanece abierto si alguna hija está activa
  const groupOpen = ventasOpen || isVentasActive;

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

      {/* ── Navegación ── */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-4">

        {/* Ítems superiores: Dashboard y Cursos */}
        {TOP_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) => navLinkCls(isActive, collapsed)}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}

        {/* ── Grupo Ventas (colapsable) ── */}
        {collapsed ? (
          // Sidebar colapsado: los hijos se muestran como íconos directos
          VENTAS_CHILDREN.map((child) => (
            <NavLink
              key={child.path}
              to={child.path}
              title={child.label}
              className={({ isActive }) => navLinkCls(isActive, true)}
            >
              <child.icon className="h-4 w-4 shrink-0" />
            </NavLink>
          ))
        ) : (
          // Sidebar expandido: cabecera colapsable + hijos
          <div>
            <button
              type="button"
              onClick={() => setVentasOpen((prev) => !prev)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                'transition-all duration-[400ms] ease-in-out',
                isVentasActive ? ACTIVE_CLS : INACTIVE_CLS,
              )}
            >
              <BarChart2 className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate text-left">Ventas</span>
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 shrink-0 transition-transform duration-200',
                  groupOpen ? 'rotate-180' : 'rotate-0',
                )}
              />
            </button>

            {groupOpen && (
              <div className="mt-0.5 space-y-0.5 pl-3 pr-0">
                {VENTAS_CHILDREN.map((child) => (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    className={({ isActive }) => subLinkCls(isActive)}
                  >
                    <child.icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{child.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Ítems inferiores: Certificados y Asistente */}
        {BOTTOM_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) => navLinkCls(isActive, collapsed)}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* ── Usuario + Salir ── */}
      <div className="px-2 pb-4">
        <div className="mb-3 h-px bg-white/15" />

        {collapsed ? (
          <Link
            to="/perfil"
            title="Mi perfil"
            className="mb-2 flex justify-center rounded-lg transition-colors hover:bg-white/15"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25 text-[13px] font-bold text-white">
              {initial}
            </div>
          </Link>
        ) : (
          <Link
            to="/perfil"
            className="group mb-2 flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/15"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/25 text-[13px] font-bold text-white">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{user?.name ?? 'Admin'}</p>
              <p className="truncate text-[10px] text-white/50">{user?.email ?? ''}</p>
            </div>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/30 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        )}

        <div className="mb-2 h-px bg-white/10" />

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
