import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { BookOpen, LayoutDashboard, LineChart, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Cursos', path: '/cursos', icon: BookOpen },
  { label: 'Ventas', path: '/ventas', icon: LineChart },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="grid gap-1 p-4">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white',
              isActive && 'bg-white/10 text-white',
            )
          }
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function AdminLayout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { user } = useAuthStore();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop */}
      <aside className="hidden w-60 shrink-0 flex-col bg-cee-red md:flex">
        <Link to="/" className="px-4 py-5 text-lg font-bold text-white">
          CEE Admin
        </Link>
        <SidebarNav />
      </aside>

      {/* Sidebar mobile (drawer simple, sin dependencia de Radix Dialog) */}
      {isMobileNavOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileNavOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex w-60 flex-col bg-cee-red">
            <div className="flex items-center justify-between px-4 py-5">
              <span className="text-lg font-bold text-white">CEE Admin</span>
              <button
                type="button"
                aria-label="Cerrar menu"
                className="text-white"
                onClick={() => setIsMobileNavOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav onNavigate={() => setIsMobileNavOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Abrir menu"
            onClick={() => setIsMobileNavOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <span className="hidden text-sm font-medium text-muted-foreground md:inline">
            Panel administrativo
          </span>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{user?.name}</span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Cerrar sesion"
              onClick={() => {
                void authService.logout();
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      <Toaster />
    </div>
  );
}
