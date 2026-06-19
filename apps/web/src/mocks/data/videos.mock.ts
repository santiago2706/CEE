import type { Video } from '@cee/types';

const CEE_THUMBNAIL =
  'https://acreditacion.uni.edu.pe/wp-content/uploads/2024/03/240325-1-720x340.jpg';
const CEE_VIDEO = 'https://www.youtube.com/embed/CqvEStle-6U';

export const mockVideos: Video[] = [
  {
    id: '1',
    title: 'Misión del CEE',
    description: 'Conoce la misión y los objetivos del Centro de Especialización Ejecutiva de la FIIS-UNI',
    thumbnailUrl: CEE_THUMBNAIL,
    videoUrl: CEE_VIDEO,
    duration: 180,
    category: 'Institucional',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Testimonio de egresados',
    description: 'Historias de éxito de nuestros egresados en el mundo empresarial',
    thumbnailUrl: CEE_THUMBNAIL,
    videoUrl: CEE_VIDEO,
    duration: 240,
    category: 'Testimonios',
    createdAt: '2024-01-20T14:30:00Z',
  },
  {
    id: '3',
    title: 'Instalaciones del CEE',
    description: 'Recorre nuestras modernas instalaciones en la FIIS-UNI',
    thumbnailUrl: CEE_THUMBNAIL,
    videoUrl: CEE_VIDEO,
    duration: 300,
    category: 'Institucional',
    createdAt: '2024-01-25T11:15:00Z',
  },
  {
    id: '4',
    title: 'Programas destacados 2024',
    description: 'Descubre nuestros programas más populares para este año',
    thumbnailUrl: CEE_THUMBNAIL,
    videoUrl: CEE_VIDEO,
    duration: 210,
    category: 'Programas',
    createdAt: '2024-02-01T09:45:00Z',
  },
  {
    id: '5',
    title: 'Experiencia educativa digital',
    description: 'Cómo acceder y usar nuestra plataforma de aprendizaje en línea',
    thumbnailUrl: CEE_THUMBNAIL,
    videoUrl: CEE_VIDEO,
    duration: 150,
    category: 'Tutorial',
    createdAt: '2024-02-05T13:20:00Z',
  },
  {
    id: '6',
    title: 'Panel de expertos',
    description: 'Conversatorio con líderes de la industria sobre tendencias ejecutivas',
    thumbnailUrl: CEE_THUMBNAIL,
    videoUrl: CEE_VIDEO,
    duration: 450,
    category: 'Webinar',
    createdAt: '2024-02-10T15:00:00Z',
  },
];