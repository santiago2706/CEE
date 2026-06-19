import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/constants/routes';
import { useToast } from '@/hooks/useToast';
import { authService } from '@/services/auth.service';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validationErrors: FormErrors = {};
    if (name.trim().length < 3) {
      validationErrors.name = 'El nombre debe tener al menos 3 caracteres.';
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      validationErrors.email = 'Ingresa un correo con formato válido.';
    }
    if (password.length < 6) {
      validationErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (confirmPassword !== password) {
      validationErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }
    if (!acceptedTerms) {
      validationErrors.terms = 'Debes aceptar los términos y condiciones.';
    }
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const response = await authService.register(name.trim(), email.trim(), password);
      success('Cuenta creada', `Bienvenido, ${response.data.user.name}.`);
      navigate(ROUTES.HOME, { replace: true });
    } catch (err) {
      error('No se pudo completar el registro', err instanceof Error ? err.message : 'Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
      <div className="order-2 lg:order-1">
        <h1 className="text-2xl font-bold">Crear cuenta</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Regístrate para acceder a todos nuestros programas.
        </p>

        <form className="mt-8 grid gap-5" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

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

          <div className="grid gap-4 sm:grid-cols-2">
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

            <div className="grid gap-1.5">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                aria-invalid={Boolean(errors.confirmPassword)}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="grid gap-1.5">
            <label className="flex items-start gap-2 text-sm text-muted-foreground">
              <Checkbox
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5"
              />
              Acepto los términos y condiciones.
            </label>
            {errors.terms && <p className="text-sm text-destructive">{errors.terms}</p>}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Creando cuenta...' : 'Registrarme'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{' '}
            <Link to={ROUTES.LOGIN} className="font-medium text-cee-red hover:underline">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>

      <div className="order-1 rounded-xl bg-cee-red p-8 text-white lg:order-2">
        <GraduationCap className="h-10 w-10" />
        <h2 className="mt-4 text-xl font-bold">Forma parte del CEE-FIIS</h2>
        <p className="mt-3 text-sm text-white/90">
          Crea tu cuenta y accede a programas de especialización diseñados para impulsar tu carrera
          profesional, con certificación reconocida y docentes de alto nivel.
        </p>
      </div>
    </section>
  );
}
