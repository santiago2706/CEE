import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { error } = useToast();
  const { isAuthenticated } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

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
      await authService.login(email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      error('No se pudo iniciar sesión', err instanceof Error ? err.message : 'Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-cee-gray/10 px-4">
      <section className="w-full max-w-sm rounded-xl border bg-background p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-cee-red">CEE Admin</p>
        <h1 className="mt-2 text-2xl font-bold text-neutral-950">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acceso exclusivo para administradores del backoffice.
        </p>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit} noValidate>
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

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>
      </section>
    </main>
  );
}
