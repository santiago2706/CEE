export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  COURSES: '/courses',
  AUTH: '/auth',
  CONTACT: '/contact',
  USERS: '/users',
  SALES: '/sales',
} as const;
