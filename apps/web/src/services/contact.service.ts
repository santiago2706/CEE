import type { ApiResponse, ContactLead } from '@cee/types';
import { API_ENDPOINTS } from '@/constants/api.constants';
import { api } from '@/services/api';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLead(data: Omit<ContactLead, 'id' | 'createdAt'>): void {
  if (data.name.trim().length < 3) {
    throw new Error('El nombre debe tener al menos 3 caracteres.');
  }
  if (!EMAIL_REGEX.test(data.email.trim())) {
    throw new Error('El formato del email no es válido.');
  }
  if (!data.subject.trim()) {
    throw new Error('El asunto es obligatorio.');
  }
  if (data.message.trim().length < 10) {
    throw new Error('El mensaje debe tener al menos 10 caracteres.');
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
