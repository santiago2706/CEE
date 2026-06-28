import type { EventRegistration } from '@cee/types';

export const mockEventRegistrations: EventRegistration[] = [
  // ── Conferencia Cadena Inteligente (evt001) — 8 inscritos ─────────────────
  {
    id: 'reg001', eventId: 'evt001', firstName: 'María José',  lastNamePaternal: 'Quispe',   lastNameMaternal: 'Flores',
    email: 'mquispe@gmail.com',    phone: '945123456', isWorking: true,  wantsCertificate: true,  certificatePaid: true,
    source: 'web',      createdAt: '2026-06-10T09:00:00Z',
  },
  {
    id: 'reg002', eventId: 'evt001', firstName: 'Carlos Alberto', lastNamePaternal: 'Mamani', lastNameMaternal: 'García',
    email: 'cmamani@outlook.com',  phone: '912345678', isWorking: true,  wantsCertificate: false, certificatePaid: false,
    source: 'web',      createdAt: '2026-06-10T10:30:00Z',
  },
  {
    id: 'reg003', eventId: 'evt001', firstName: 'Elena Rosa',    lastNamePaternal: 'Pachas',  lastNameMaternal: 'Torres',
    email: 'epachas@gmail.com',    phone: '987654321', isWorking: false, wantsCertificate: true,  certificatePaid: true,
    source: 'web',      createdAt: '2026-06-11T08:15:00Z',
  },
  {
    id: 'reg004', eventId: 'evt001', firstName: 'Diego José',    lastNamePaternal: 'Ramos',   lastNameMaternal: 'Huanca',
    email: 'dramos@hotmail.com',   phone: '956789012', isWorking: true,  wantsCertificate: false, certificatePaid: false,
    source: 'whatsapp', createdAt: '2026-06-11T14:20:00Z',
  },
  {
    id: 'reg005', eventId: 'evt001', firstName: 'Lucía Graciela', lastNamePaternal: 'Vargas', lastNameMaternal: 'Castro',
    email: 'lvargas@gmail.com',    phone: '923456789', isWorking: true,  wantsCertificate: true,  certificatePaid: false,
    source: 'web',      createdAt: '2026-06-12T09:45:00Z',
  },
  {
    id: 'reg006', eventId: 'evt001', firstName: 'Pedro Antonio', lastNamePaternal: 'Ccori',   lastNameMaternal: 'Mendoza',
    email: 'pccori@gmail.com',     phone: '934567890', isWorking: false, wantsCertificate: false, certificatePaid: false,
    source: 'whatsapp', createdAt: '2026-06-13T11:00:00Z',
  },
  {
    id: 'reg007', eventId: 'evt001', firstName: 'María Elena',   lastNamePaternal: 'Sánchez', lastNameMaternal: 'López',
    email: 'msanchez@empresa.pe',  phone: '945678901', isWorking: true,  wantsCertificate: false, certificatePaid: false,
    source: 'manual',   createdAt: '2026-06-14T10:00:00Z',
  },
  {
    id: 'reg008', eventId: 'evt001', firstName: 'Roberto Carlos', lastNamePaternal: 'Huanca', lastNameMaternal: 'Rojas',
    email: 'rhuanca@gmail.com',    phone: '956789123', isWorking: false, wantsCertificate: false, certificatePaid: false,
    source: 'web',      createdAt: '2026-06-15T08:30:00Z',
  },

  // ── Taller Excel Avanzado (evt002) — 7 inscritos ──────────────────────────
  {
    id: 'reg009', eventId: 'evt002', firstName: 'Claudia Isabel', lastNamePaternal: 'Chávez',   lastNameMaternal: 'Díaz',
    email: 'cchavez@gmail.com',    phone: '923456790', isWorking: true,  wantsCertificate: false, certificatePaid: false,
    source: 'web',      createdAt: '2026-06-12T09:00:00Z',
  },
  {
    id: 'reg010', eventId: 'evt002', firstName: 'Arturo Manuel',  lastNamePaternal: 'Flores',   lastNameMaternal: 'Quispe',
    email: 'aflores@outlook.com',  phone: '934567891', isWorking: true,  wantsCertificate: false, certificatePaid: false,
    source: 'web',      createdAt: '2026-06-13T11:30:00Z',
  },
  {
    id: 'reg011', eventId: 'evt002', firstName: 'Valeria Sofía',  lastNamePaternal: 'Torres',   lastNameMaternal: 'Mendoza',
    email: 'vtorres@gmail.com',    phone: '945678902', isWorking: false, wantsCertificate: false, certificatePaid: false,
    source: 'web',      createdAt: '2026-06-14T13:00:00Z',
  },
  {
    id: 'reg012', eventId: 'evt002', firstName: 'Luis Eduardo',   lastNamePaternal: 'Condori',  lastNameMaternal: 'Paredes',
    email: 'lcondori@hotmail.com', phone: '956789124', isWorking: true,  wantsCertificate: false, certificatePaid: false,
    source: 'whatsapp', createdAt: '2026-06-15T09:15:00Z',
  },
  {
    id: 'reg013', eventId: 'evt002', firstName: 'Sandra Patricia', lastNamePaternal: 'Quispe',  lastNameMaternal: 'Mamani',
    email: 'squispe@gmail.com',    phone: '912345679', isWorking: false, wantsCertificate: false, certificatePaid: false,
    source: 'whatsapp', createdAt: '2026-06-16T10:45:00Z',
  },
  {
    id: 'reg014', eventId: 'evt002', firstName: 'Jorge Antonio',  lastNamePaternal: 'Cáceres',  lastNameMaternal: 'Díaz',
    email: 'jcaceres@empresa.pe',  phone: '923456791', isWorking: true,  wantsCertificate: false, certificatePaid: false,
    source: 'web',      createdAt: '2026-06-17T08:00:00Z',
  },
  {
    id: 'reg015', eventId: 'evt002', firstName: 'Patricia Elena', lastNamePaternal: 'Huanca',   lastNameMaternal: 'Castro',
    email: 'phuanca@gmail.com',    phone: '934567892', isWorking: false, wantsCertificate: false, certificatePaid: false,
    source: 'manual',   createdAt: '2026-06-18T11:30:00Z',
  },

  // ── Seminario Finanzas Corporativas (evt003) — 5 inscritos ────────────────
  {
    id: 'reg016', eventId: 'evt003', firstName: 'Ana Lucía',      lastNamePaternal: 'Quispe',   lastNameMaternal: 'Flores',
    email: 'aquispe2@gmail.com',   phone: '945678903', isWorking: true,  wantsCertificate: false, certificatePaid: false,
    source: 'web',      createdAt: '2026-06-18T09:30:00Z',
  },
  {
    id: 'reg017', eventId: 'evt003', firstName: 'Carlos Enrique', lastNamePaternal: 'Mamani',   lastNameMaternal: 'García',
    email: 'cmamani2@outlook.com', phone: '956789125', isWorking: true,  wantsCertificate: false, certificatePaid: false,
    source: 'web',      createdAt: '2026-06-19T10:00:00Z',
  },
  {
    id: 'reg018', eventId: 'evt003', firstName: 'Elena Beatriz',  lastNamePaternal: 'Pachas',   lastNameMaternal: 'Torres',
    email: 'epachas2@gmail.com',   phone: '912345680', isWorking: false, wantsCertificate: false, certificatePaid: false,
    source: 'web',      createdAt: '2026-06-20T08:45:00Z',
  },
  {
    id: 'reg019', eventId: 'evt003', firstName: 'Diego Fernando', lastNamePaternal: 'Ramos',    lastNameMaternal: 'Huanca',
    email: 'dramos2@hotmail.com',  phone: '923456792', isWorking: true,  wantsCertificate: false, certificatePaid: false,
    source: 'whatsapp', createdAt: '2026-06-21T14:30:00Z',
  },
  {
    id: 'reg020', eventId: 'evt003', firstName: 'Lucía Andrea',   lastNamePaternal: 'Vargas',   lastNameMaternal: 'Castro',
    email: 'lvargas2@gmail.com',   phone: '934567893', isWorking: false, wantsCertificate: false, certificatePaid: false,
    source: 'manual',   createdAt: '2026-06-22T09:00:00Z',
  },
];
