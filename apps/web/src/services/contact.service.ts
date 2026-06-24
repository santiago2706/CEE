import type { ApiResponse, ContactLead } from '@cee/types';
import { supabase } from '@/lib/supabase';

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
    validateLead(data);

    if (USE_MOCKS) {
      const lead: ContactLead = {
        ...data,
        id: `mock-lead-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      return delay({ data: lead });
    }

    // Sin .select(): la policy de contact_leads solo permite SELECT a admins,
    // así que no se puede leer de vuelta la fila recién insertada como anónimo.
    const { error } = await supabase.from('contact_leads').insert({
      name: data.name,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      course_interest: data.courseInterest,
      message: data.message,
    });

    if (error) {
      throw new Error('No se pudo enviar el mensaje. Intenta nuevamente.');
    }
    return { data: { ...data, id: '', createdAt: new Date().toISOString() } };
  },
};
