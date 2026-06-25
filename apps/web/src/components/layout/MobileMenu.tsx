import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { navigationLinks } from '@/config/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useTeachers } from '@/hooks/useTeachers';
import { useToast } from '@/hooks/useToast';
import { authService } from '@/services/auth.service';
import { getInitials } from '@/lib/utils';
import logoFull from '@/assets/icons/logo1.png';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { isAuthenticated, user } = useAuth();
  const { teachers } = useTeachers();
  const navigate = useNavigate();
  const { success } = useToast();

  const handleLogout = () => {
    authService.logout();
    success('Sesión cerrada', 'Vuelve pronto.');
    onClose();
    navigate(ROUTES.HOME);
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="left" className="flex w-3/4 flex-col gap-6 sm:max-w-xs">
        <SheetHeader>
          <SheetTitle asChild>
            <img src={logoFull} alt="CEE-FIIS" className="h-16 w-auto" />
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-1" aria-label="Navegacion principal movil">
          {navigationLinks.map((link) => (
            <SheetClose key={link.path} asChild>
              <Link
                to={link.path}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-cee-red"
              >
                {link.label}
              </Link>
            </SheetClose>
          ))}
        </nav>

        {teachers.length > 0 && (
          <div>
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Profesores
            </p>
            <nav className="mt-2 flex flex-col gap-1" aria-label="Profesores">
              {teachers.map((teacher) => (
                <SheetClose key={teacher.id} asChild>
                  <Link
                    to={ROUTES.TEACHER_PROFILE.replace(':slug', teacher.slug)}
                    className="rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-cee-red"
                  >
                    {teacher.name}
                  </Link>
                </SheetClose>
              ))}
            </nav>
          </div>
        )}

        <div className="mt-auto grid gap-2">
          <SheetClose asChild>
            <Button asChild className="w-full justify-center gap-2">
              <Link to={isAuthenticated ? ROUTES.HOME : ROUTES.LOGIN}>
                {isAuthenticated && user ? (
                  <Avatar src={user.avatarUrl} alt={user.name} fallback={getInitials(user.name)} className="h-5 w-5" />
                ) : null}
                {isAuthenticated ? 'Mi Perfil' : 'Iniciar sesion'}
              </Link>
            </Button>
          </SheetClose>

          {isAuthenticated && (
            <Button variant="outline" className="w-full justify-center gap-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
