import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { navigationLinks } from '@/config/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { authService } from '@/services/auth.service';
import { cn, getInitials } from '@/lib/utils';
import logoMark from '@/assets/icons/CEE-logo.png';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { success } = useToast();

  const handleLogout = () => {
    authService.logout();
    success('Sesión cerrada', 'Vuelve pronto.');
    navigate(ROUTES.HOME);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="relative flex h-20 items-center px-4 sm:px-6 lg:px-8">
        {/* Left: Logo */}
        <Link to={ROUTES.HOME} className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
          <img
            src={logoMark}
            alt="Centro de Especialización Ejecutiva"
            className="h-14 w-auto object-contain"
          />
          <span className="hidden h-12 w-px bg-border sm:block" aria-hidden="true" />
          <span className="hidden flex-col sm:flex">
            <span className="text-xs font-semibold text-cee-red tracking-wider">UNIVERSIDAD NACIONAL</span>
            <span className="text-xs font-semibold text-cee-red tracking-wider">DE INGENIERÍA</span>
          </span>
        </Link>

        {/* Center: Navigation */}
        <nav className="hidden items-center gap-10 md:flex absolute left-1/2 transform -translate-x-1/2">
          {navigationLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                cn(
                  'text-base font-medium text-muted-foreground transition hover:text-cee-red',
                  isActive && 'text-cee-red',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right: Auth buttons */}
        <div className="flex items-center gap-4 flex-shrink-0 ml-auto">
          <Button asChild variant="outline" size="sm" className="hidden gap-2 md:inline-flex">
            <Link to={isAuthenticated ? ROUTES.PROFILE : ROUTES.LOGIN}>
              {isAuthenticated && user ? (
                <Avatar src={user.avatarUrl} alt={user.name} fallback={getInitials(user.name)} className="h-5 w-5" />
              ) : null}
              {isAuthenticated ? 'Mi Perfil' : 'Iniciar sesion'}
            </Link>
          </Button>

          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex"
              aria-label="Cerrar sesión"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Abrir menu"
            onClick={() => setIsOpen((value) => !value)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <MobileMenu open={isOpen} onClose={() => setIsOpen(false)} />
    </header>
  );
}
