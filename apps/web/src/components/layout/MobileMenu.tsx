import { Link, useNavigate } from 'react-router-dom';
import { LogOut, UserCircle } from 'lucide-react';
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
import { useToast } from '@/hooks/useToast';
import { authService } from '@/services/auth.service';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { isAuthenticated } = useAuth();
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
          <SheetTitle className="text-cee-red">CEE-FIIS</SheetTitle>
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

        <div className="mt-auto grid gap-2">
          <SheetClose asChild>
            <Button asChild className="w-full justify-center gap-2">
              <Link to={isAuthenticated ? ROUTES.HOME : ROUTES.LOGIN}>
                <UserCircle className="h-4 w-4" />
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
