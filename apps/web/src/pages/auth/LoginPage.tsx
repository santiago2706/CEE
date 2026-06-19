import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/constants/routes';
import { useToast } from '@/hooks/useToast';
import { authService } from '@/services/auth.service';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BENEFITS = [
  'Acceso a tu historial de cursos e inscripciones.',
  'Certificados disponibles para descargar en cualquier momento.',
  'Notificaciones sobre nuevas cohortes y descuentos exclusivos.',
  'Soporte prioritario con nuestro equipo académico.',
];

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validationErrors: FormErrors = {};
    if (!EMAIL_REGEX.test(email.trim())) {
      validationErrors.email = 'Ingresa un correo con formato válido.';
    }
    if (!password) {
      validationErrors.password = 'La contraseña es obligatoria.';
    }
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const response = await authService.login(email.trim(), password, remember);
      success('Bienvenido de nuevo', `Sesión iniciada como ${response.data.user.name}.`);
      navigate(response.data.user.role === 'admin' ? ROUTES.ADMIN : ROUTES.HOME, { replace: true });
    } catch (err) {
      error('No se pudo iniciar sesión', err instanceof Error ? err.message : 'Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
      <div className="order-2 lg:order-1">
        <h1 className="text-2xl font-bold">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ingresa tus credenciales para acceder a tu cuenta.
        </p>

        <form className="mt-8 grid gap-5" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(errors.password)}
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Recordarme
            </label>
            <button
              type="button"
              className="text-sm font-medium text-cee-red hover:underline"
              onClick={() =>
                error(
                  '¿Olvidaste tu contraseña?',
                  'Comunícate con el CEE-FIIS para restablecer tu acceso.',
                )
              }
            >
              ¿Olvidó su contraseña?
            </button>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            ¿No tienes una cuenta?{' '}
            <Link to={ROUTES.REGISTER} className="font-medium text-cee-red hover:underline">
              Regístrate
            </Link>
          </p>
        </form>
      </div>

      <div className="order-1 rounded-xl bg-cee-red p-8 text-white lg:order-2">
        <h2 className="text-xl font-bold">Beneficios de tener una cuenta</h2>
        <ul className="mt-6 grid gap-4">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-start gap-3 text-sm text-white/90">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
