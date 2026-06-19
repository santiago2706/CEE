import type { ApiResponse, ContactLead } from '@cee/types';
import { API_ENDPOINTS } from '@/constants/api.constants';
import { api } from '@/services/api';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^9\d{8}$/;

function validateLead(data: Omit<ContactLead, 'id' | 'createdAt'>): void {
  if (data.name.trim().length < 3) {
    throw new Error('El nombre debe tener al menos 3 caracteres.');
  }
  if (data.name.trim().length > 100) {
    throw new Error('El nombre no puede exceder 100 caracteres.');
  }
  if (!EMAIL_REGEX.test(data.email.trim())) {
    throw new Error('El formato del email no es válido.');
  }
  if (data.phone && data.phone.trim() && !PHONE_REGEX.test(data.phone.trim())) {
    throw new Error('El teléfono debe ser un número peruano de 9 dígitos (ej. 987654321).');
  }
  if (!data.subject.trim()) {
    throw new Error('El asunto es obligatorio.');
  }
  if (data.subject.trim().length > 150) {
    throw new Error('El asunto no puede exceder 150 caracteres.');
  }
  if (data.message.trim().length < 10) {
    throw new Error('El mensaje debe tener al menos 10 caracteres.');
  }
  if (data.message.trim().length > 2000) {
    throw new Error('El mensaje no puede exceder 2000 caracteres.');
  }
}

export const contactService = {
  async send(data: Omit<ContactLead, 'id' | 'createdAt'>): Promise<ApiResponse<ContactLead>> {
    if (USE_MOCKS) {
      validateLead(data);
      const lead: ContactLead = {
        ...data,
        id: `mock-lead-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      return delay({ data: lead });
    }
    const response = await api.post<ApiResponse<ContactLead>>(API_ENDPOINTS.CONTACT, data);
    return response.data;
  },
};

