import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type { Course } from '@cee/types';
import { CheckCircle2, Lock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';
import { contactService } from '@/services/contact.service';
import { formatPrice } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import { INSCRIPTION_ANCHOR_ID } from './landing-utils';

interface InscriptionFormProps {
  course: Course;
  /** Origen del lead, para trazabilidad (p. ej. 'sidebar' | 'mobile'). */
  source?: string;
}

interface FormValues {
  name: string;
  email: string;
  phone: string;
  website: string; // honeypot
}

const INITIAL_VALUES: FormValues = {
  name: '',
  email: '',
  phone: '',
  website: '',
};

type FormErrors = Partial<Record<'name' | 'email', string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (values.name.trim().length < 3) {
    errors.name = 'Ingresa tu nombre completo (mínimo 3 caracteres).';
  }
  if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Ingresa un correo con formato válido.';
  }
  return errors;
}

/**
 * Formulario de captura de leads integrado en la landing del programa.
 * Persiste en `contact_leads` vía contactService.sendLandingLead (respeta VITE_USE_MOCKS).
 */
export function InscriptionForm({ course, source = 'landing' }: InscriptionFormProps) {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const { success, error } = useToast();

  const discountPct = course.originalPrice
    ? Math.round((1 - course.price / course.originalPrice) * 100)
    : null;

  const handleChange =
    (field: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Honeypot: si viene relleno asumimos bot y simulamos éxito sin enviar nada.
    if (values.website.trim()) {
      setValues(INITIAL_VALUES);
      setIsDone(true);
      return;
    }

    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await contactService.sendLandingLead({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || null,
        company: null,
        position: null,
        source,
        courseId: course.id,
        courseTitle: course.title,
      });

      success(
        '¡Registro exitoso!',
        `Recibimos tu solicitud para "${course.title}". Te contactaremos pronto.`,
      );
      setValues(INITIAL_VALUES);
      setErrors({});
      setIsDone(true);
    } catch (err) {
      error(
        'No se pudo enviar tu solicitud',
        err instanceof Error ? err.message : 'Intenta nuevamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
      <div className="border-b border-border bg-muted/40 p-5">
        <div className="flex flex-wrap items-baseline gap-2">
          <p className="text-2xl font-extrabold text-foreground">{formatPrice(course.price)}</p>
          {course.originalPrice && (
            <>
              <p className="text-sm text-muted-foreground line-through">
                {formatPrice(course.originalPrice)}
              </p>
              {discountPct !== null && (
                <span className="text-xs font-semibold text-cee-red">{discountPct}% dto.</span>
              )}
            </>
          )}
        </div>
        <h2 className="mt-2 text-lg font-bold text-foreground">Reserva tu cupo</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Déjanos tus datos y un asesor te contactará para completar tu inscripción.
        </p>
      </div>

      <div className="p-5">
        {isDone ? (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cee-red/10">
              <CheckCircle2 className="h-8 w-8 text-cee-red" />
            </div>
            <p className="mt-4 text-lg font-bold text-foreground">¡Solicitud enviada!</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Gracias por tu interés. Te contactaremos muy pronto.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-5"
              onClick={() => setIsDone(false)}
            >
              Enviar otra solicitud
            </Button>
          </div>
        ) : (
          <form className="grid gap-2.5" onSubmit={handleSubmit} noValidate>
            {/* Honeypot anti-spam: oculto para usuarios, visible para bots. */}
            <div
              className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden"
              aria-hidden="true"
            >
              <label htmlFor={`${INSCRIPTION_ANCHOR_ID}-website`}>No completar este campo</label>
              <input
                id={`${INSCRIPTION_ANCHOR_ID}-website`}
                name="website_url"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={values.website}
                onChange={handleChange('website')}
              />
            </div>

            <div className="grid gap-1">
              <Label htmlFor="lead-name">Nombre completo *</Label>
              <Input
                id="lead-name"
                className="h-10 lg:h-9"
                value={values.name}
                onChange={handleChange('name')}
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="grid gap-1">
              <Label htmlFor="lead-email">Correo electrónico *</Label>
              <Input
                id="lead-email"
                type="email"
                inputMode="email"
                className="h-10 lg:h-9"
                value={values.email}
                onChange={handleChange('email')}
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="grid gap-1">
              <Label htmlFor="lead-phone">Teléfono / WhatsApp</Label>
              <Input
                id="lead-phone"
                type="tel"
                inputMode="tel"
                className="h-10 lg:h-9"
                value={values.phone}
                onChange={handleChange('phone')}
                autoComplete="tel"
              />
            </div>

            <Button type="submit" size="lg" disabled={isSubmitting} className="mt-1 w-full">
              {isSubmitting ? 'Enviando...' : 'Quiero inscribirme'}
            </Button>

            <p className="text-center text-[11px] leading-snug text-muted-foreground">
              Al enviar aceptas nuestra{' '}
              <Link to={ROUTES.PRIVACY} className="text-cee-red underline-offset-2 hover:underline">
                Política de Privacidad
              </Link>
              .
            </p>

            <div className="flex items-center justify-center gap-4 pt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Lock className="h-3.5 w-3.5 text-cee-red" /> Datos seguros
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-cee-red" /> Sin spam
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
