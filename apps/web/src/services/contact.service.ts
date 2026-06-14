import type { ApiResponse, ContactForm } from '@cee/types';
import { API_ENDPOINTS } from '@/constants/api.constants';
import { api } from '@/services/api';

export const contactService = {
  async send(data: ContactForm) {
    const response = await api.post<ApiResponse<ContactForm>>(
      API_ENDPOINTS.CONTACT,
      data,
    );
    return response.data;
  },
};
