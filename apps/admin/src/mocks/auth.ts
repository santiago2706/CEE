import type { User } from '@cee/types';

/** Único usuario válido en modo mock (VITE_USE_MOCKS=true), cualquier contraseña. */
export const mockAdminUser: User = {
  id: 'admin-001',
  name: 'José Espinoza',
  email: 'jespinoza@cee-fiis.edu.pe',
  role: 'admin',
  avatarUrl: 'https://picsum.photos/seed/admin-jose-espinoza/100/100',
};
