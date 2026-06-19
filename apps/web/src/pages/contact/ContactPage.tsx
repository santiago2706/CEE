import { useState, useEffect, type FormEvent } from 'react';
import { Mail, MapPin, Phone, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CONTACT_INFO } from '@/constants/contact.constants';
import { useToast } from '@/hooks/useToast';
import { contactService } from '@/services/contact.service';
import { useCursoSeleccionado } from '@/hooks/useCursoSeleccionado';
import { formatPrice } from '@/lib/utils';

interface ContactFormValues {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  website: string; // honeypot
}

const INITIAL_VALUES: ContactFormValues = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  website: '',
};

type FormErrors = Partial<Record<keyof Omit<ContactFormValues, 'website'>, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^9\d{8}$/;

function validate(values: ContactFormValues): FormErrors {
  const errors: FormErrors = {};

  // Nombre: mínimo 3, máximo 100 caracteres
  if (!values.name.trim()) {
    errors.name = 'El nombre es obligatorio.';
  } else if (values.name.trim().length < 3) {
    errors.name = 'El nombre debe tener al menos 3 caracteres.';
  } else if (values.name.trim().length > 100) {
    errors.name = 'El nombre no puede exceder 100 caracteres.';
  }

  // Email: formato válido
  if (!values.email.trim()) {
    errors.email = 'El correo electrónico es obligatorio.';
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Ingresa un correo con formato válido (ej. usuario@dominio.com).';
  }

  // Teléfono: opcional, pero si se ingresa debe ser formato peruano (9 dígitos)
  if (values.phone.trim() && !PHONE_REGEX.test(values.phone.trim())) {
    errors.phone = 'Ingresa un número peruano de 9 dígitos (ej. 987654321).';
  }

  // Asunto: obligatorio, máximo 150 caracteres
  if (!values.subject.trim()) {
    errors.subject = 'El asunto es obligatorio.';
  } else if (values.subject.trim().length > 150) {
    errors.subject = 'El asunto no puede exceder 150 caracteres.';
  }

  // Mensaje: mínimo 10, máximo 2000 caracteres
  if (!values.message.trim()) {
    errors.message = 'El mensaje es obligatorio.';
  } else if (values.message.trim().length < 10) {
    errors.message = 'El mensaje debe tener al menos 10 caracteres.';
  } else if (values.message.trim().length > 2000) {
    errors.message = 'El mensaje no puede exceder 2000 caracteres.';
  }

  return errors;
}

export default function ContactPage() {
  const [values, setValues] = useState<ContactFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  // Leer curso preseleccionado desde query param (?curso=<id>)
  const { course, isLoading: isCourseLoading } = useCursoSeleccionado();

  // Auto-rellenar asunto cuando se detecta un curso preseleccionado
  useEffect(() => {
    if (course) {
      setValues((prev) => ({
        ...prev,
        subject: `Inscripción: ${course.title}`,
      }));
    }
  }, [course]);

  const handleChange = (field: keyof ContactFormValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));

    // Limpiar el error del campo al editar (feedback en tiempo real)
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as keyof FormErrors];
        return next;
      });
    }
  };

  /** Resetea el form preservando el asunto si hay curso preseleccionado */
  const resetForm = () => {
    setValues({
      ...INITIAL_VALUES,
      subject: course ? `Inscripción: ${course.title}` : '',
    });
    setErrors({});
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Honeypot: si el campo trampa viene relleno, es un bot. Simulamos éxito sin enviar nada.
    if (values.website.trim()) {
      resetForm();
      success('Mensaje enviado', 'Gracias por contactarnos, te responderemos pronto.');
      return;
    }

    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await contactService.send({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || null,
        subject: values.subject.trim(),
        message: values.message.trim(),
        courseInterest: course?.id ?? null,
      });

      const successMsg = course
        ? `Tu solicitud de inscripción a "${course.title}" ha sido registrada. Te contactaremos pronto.`
        : 'Gracias por contactarnos, te responderemos pronto.';

      success('Mensaje enviado', successMsg);
      resetForm();
    } catch (err) {
      error('No se pudo enviar el mensaje', err instanceof Error ? err.message : 'Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold">
          {course ? 'Inscripción' : 'Contacto'}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {course
            ? 'Completa el formulario y nos pondremos en contacto contigo para finalizar tu inscripción.'
            : '¿Tienes alguna consulta? Completa el formulario y nuestro equipo te responderá a la brevedad.'}
        </p>
      </div>

      {/* Banner de curso preseleccionado */}
      {isCourseLoading && (
        <div className="mt-6 animate-pulse rounded-lg border border-border bg-muted p-4">
          <p className="text-sm text-muted-foreground">Cargando información del curso...</p>
        </div>
      )}

      {course && !isCourseLoading && (
        <div className="mt-6 rounded-lg border border-cee-red/20 bg-cee-red/5 p-4">
          <div className="flex items-start gap-3">
            <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-cee-red" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Te estás inscribiendo a:</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{course.title}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold uppercase text-cee-red">
                  {course.category}
                </span>
                <span>{course.modality}</span>
                <span>{course.academicHours} horas</span>
                <span className="font-semibold text-cee-red">{formatPrice(course.price)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
              {/* Honeypot: oculto para usuarios, visible para bots */}
              <div className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden" aria-hidden="true">
                <label htmlFor="website">No completar este campo</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={values.website}
                  onChange={handleChange('website')}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="name">Nombre completo *</Label>
                  <Input
                    id="name"
                    value={values.name}
                    onChange={handleChange('name')}
                    maxLength={100}
                    placeholder="Ej. Juan Pérez"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  {errors.name && <p id="name-error" className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="email">Correo electrónico *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange('email')}
                    placeholder="Ej. usuario@dominio.com"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && <p id="email-error" className="text-sm text-destructive">{errors.email}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="phone">Teléfono (opcional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={values.phone}
                    onChange={handleChange('phone')}
                    maxLength={9}
                    placeholder="Ej. 987654321"
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? 'phone-error' : undefined}
                  />
                  {errors.phone && <p id="phone-error" className="text-sm text-destructive">{errors.phone}</p>}
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="subject">Asunto *</Label>
                  <Input
                    id="subject"
                    value={values.subject}
                    onChange={handleChange('subject')}
                    maxLength={150}
                    aria-invalid={Boolean(errors.subject)}
                    aria-describedby={errors.subject ? 'subject-error' : undefined}
                  />
                  {errors.subject && <p id="subject-error" className="text-sm text-destructive">{errors.subject}</p>}
                </div>
              </div>

              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="message">Mensaje *</Label>
                  <span className="text-xs text-muted-foreground">
                    {values.message.trim().length}/2000
                  </span>
                </div>
                <Textarea
                  id="message"
                  value={values.message}
                  onChange={handleChange('message')}
                  maxLength={2000}
                  rows={5}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? 'message-error' : undefined}
                />
                {errors.message && <p id="message-error" className="text-sm text-destructive">{errors.message}</p>}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-fit">
                  {isSubmitting
                    ? 'Enviando...'
                    : course
                      ? 'Enviar solicitud de inscripción'
                      : 'Enviar mensaje'}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Los campos marcados con * son obligatorios.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información de contacto</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-cee-red" />
                <span>{CONTACT_INFO.phone}</span>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-cee-red" />
                <span>{CONTACT_INFO.email}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-cee-red" />
                <span>{CONTACT_INFO.address}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <iframe
              title="Ubicación del CEE-FIIS"
              src={CONTACT_INFO.mapsEmbedUrl}
              className="h-64 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Card>
        </div>
      </div>
    </section>
  );
}


