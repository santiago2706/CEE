import type { Video } from '@cee/types';

const CEE_VIDEO = 'https://www.youtube.com/embed/CqvEStle-6U';

/** Miniaturas distintas y de mayor resolución por testimonio (Iniciativa D del plan de mejoras). */
export const mockVideos: Video[] = [
  {
    id: '1',
    title: 'De analista a gerente: la historia de Claudia Ramos',
    description:
      'Egresada de Gestión de Proyectos Ágiles, hoy lidera el área de operaciones de una financiera líder.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80',
    videoUrl: CEE_VIDEO,
    duration: 180,
    category: 'Testimonios',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Testimonio: liderando un equipo de 40 personas tras el CEE',
    description: 'Historias de éxito de nuestros egresados en el mundo empresarial.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=800&q=80',
    videoUrl: CEE_VIDEO,
    duration: 240,
    category: 'Testimonios',
    createdAt: '2024-01-20T14:30:00Z',
  },
  {
    id: '3',
    title: 'Instalaciones del CEE-FIIS',
    description: 'Recorre nuestras modernas instalaciones en la FIIS-UNI.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
    videoUrl: CEE_VIDEO,
    duration: 300,
    category: 'Institucional',
    createdAt: '2024-01-25T11:15:00Z',
  },
  {
    id: '4',
    title: 'Egresados que emprendieron tras especializarse',
    description: 'Tres historias de egresados que lanzaron su propio negocio aplicando lo aprendido en el CEE.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80',
    videoUrl: CEE_VIDEO,
    duration: 210,
    category: 'Testimonios',
    createdAt: '2024-02-01T09:45:00Z',
  },
  {
    id: '5',
    title: 'Experiencia educativa digital',
    description: 'Cómo acceder y usar nuestra plataforma de aprendizaje en línea.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1610484826967-09c5720778c7?auto=format&fit=crop&w=800&q=80',
    videoUrl: CEE_VIDEO,
    duration: 150,
    category: 'Tutorial',
    createdAt: '2024-02-05T13:20:00Z',
  },
  {
    id: '6',
    title: 'Panel de egresados: tendencias de liderazgo ejecutivo',
    description: 'Conversatorio con egresados del CEE sobre las tendencias de la industria.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80',
    videoUrl: CEE_VIDEO,
    duration: 450,
    category: 'Webinar',
    createdAt: '2024-02-10T15:00:00Z',
  },
];