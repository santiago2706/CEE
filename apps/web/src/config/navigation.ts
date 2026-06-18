import { ROUTES } from '@/constants/routes';

export interface NavLink {
  label: string;
  path: string;
}

/**
 * Decision C (Fase 2 kickoff): "Especializaciones" es un filtro dentro de
 * /programas, no una ruta propia — por eso no aparece aqui como link aparte.
 *
 * Unica fuente de verdad de los links publicos del sitio.
 * Navbar, MobileMenu, Footer y el Router consumen este array; no se duplica
 * la lista en ningun componente.
 */
export const navigationLinks: NavLink[] = [
  { label: 'Inicio', path: ROUTES.HOME },
  { label: 'Nosotros', path: ROUTES.ABOUT },
  { label: 'Programas', path: ROUTES.CATALOG },
  { label: 'Multimedia', path: ROUTES.MULTIMEDIA },
  { label: 'Contacto', path: ROUTES.CONTACT },
];
