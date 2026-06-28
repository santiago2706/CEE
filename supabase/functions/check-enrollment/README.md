# Edge Function: check-enrollment

Cron diario que detecta cursos con bajo cupo y envía alertas por email a la secretaria.

## Setup completado

### Función deployada
- Project: `yusaeqpjnnxrykunzopr`
- URL: `https://yusaeqpjnnxrykunzopr.supabase.co/functions/v1/check-enrollment`

### Secrets a configurar en Supabase Dashboard
Ir a: https://supabase.com/dashboard/project/yusaeqpjnnxrykunzopr/functions  
Seleccionar **check-enrollment → Secrets → Add secret**

Agregar estos 3 secrets:

| Secret | Valor |
|--------|-------|
| `RESEND_API_KEY` | `re_xxxxxxxxx` _(reemplazar con key real de Resend)_ |
| `SECRETARY_EMAIL` | `jose.canales.c@uni.pe` _(reemplazar en producción)_ |
| `ADMIN_URL` | `http://localhost:5174` _(reemplazar en producción)_ |

> `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` son inyectados automáticamente por Supabase — no es necesario agregarlos.

### Activar el cron
Ejecutar el archivo `supabase/migrations/0006_setup_cron_check_enrollment.sql`
en **Supabase → SQL Editor**.

El cron corre todos los días a las **8:00 AM hora Perú (13:00 UTC)**.

### Probar manualmente
```bash
bash supabase/functions/check-enrollment/test.sh
```

### En producción cambiar solo los secrets
```
SECRETARY_EMAIL = secretaria@cee-fiis.edu.pe
ADMIN_URL       = https://admin.cee-fiis.edu.pe
```
Sin tocar código.

## Lógica

1. Consulta todos los cursos `published` con `start_date` entre hoy y `hoy + alert_days_before`.
2. Para cada curso, cuenta `sales` con `status = 'completed'`.
3. Si `count < min_students` **y** no existe ya una notificación `low_enrollment` para ese curso en las últimas 24 h:
   - Inserta fila en `notifications`.
   - Envía correo vía Resend API.

## Variables de entorno requeridas

Configurar en **Supabase Dashboard → Project Settings → Edge Functions → Secrets**:

| Variable              | Descripción                                                    |
|-----------------------|----------------------------------------------------------------|
| `SUPABASE_URL`        | URL del proyecto (ya disponible en la función automáticamente) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key del proyecto (no la anon key)          |
| `RESEND_API_KEY`      | Clave de API de Resend (`re_...`). Obtener en resend.com/api-keys |
| `SECRETARY_EMAIL`     | Correo de la secretaria del CEE (ej. `secretaria@cee.fiis.uni.edu.pe`) |
| `ADMIN_URL`           | URL pública del panel admin (ej. `https://admin.cee-fiis.edu.pe`) |

> `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` se pueden configurar como secretos del proyecto
> o simplemente usar las variables de entorno que Supabase inyecta automáticamente en la función.

## Variables por entorno

### Desarrollo / pruebas
```
SECRETARY_EMAIL = tu-correo-de-prueba@gmail.com
SMTP_USER       = tu-correo-de-prueba@gmail.com
```

### Producción
```
SECRETARY_EMAIL = secretaria@cee-fiis.edu.pe   (reemplazar con correo real del CEE)
SMTP_USER       = notificaciones@cee-fiis.edu.pe  (reemplazar con correo oficial)
```

> **Nunca hardcodear correos en el código.**
> Cambiar solo en **Supabase Dashboard → Settings → Edge Functions → Environment Variables**.

## Deploy

```bash
# Desde la raíz del monorepo (donde está supabase/)
supabase functions deploy check-enrollment

# Para pasar secretos en el mismo comando (alternativa):
supabase secrets set RESEND_API_KEY=re_xxxx SECRETARY_EMAIL=secretaria@uni.edu.pe
```

## Configurar el Cron (todos los días a las 8 AM hora Perú, UTC-5 → 13:00 UTC)

En **Supabase Dashboard → Database → Extensions**, asegúrate de que `pg_net` esté habilitado.

Luego en **SQL Editor**:

```sql
-- Ejecuta la función todos los días a las 13:00 UTC (8:00 AM Perú)
SELECT cron.schedule(
  'check-enrollment-daily',
  '0 13 * * *',
  $$
  SELECT net.http_post(
    url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/check-enrollment',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body    := '{}'::jsonb
  );
  $$
);
```

> Reemplaza `<PROJECT_REF>` con el ID de tu proyecto Supabase (ej. `yusaeqpjnnxrykunzopr`).

## Invocar manualmente (para pruebas)

```bash
# Con Supabase CLI
supabase functions invoke check-enrollment --no-verify-jwt

# O con curl
curl -X POST 'https://<PROJECT_REF>.supabase.co/functions/v1/check-enrollment' \
  -H 'Authorization: Bearer <ANON_OR_SERVICE_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## Tabla `notifications` esperada

```sql
CREATE TABLE public.notifications (
  id         uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  type       text    NOT NULL CHECK (type IN ('low_enrollment', 'new_lead', 'event')),
  title      text    NOT NULL,
  message    text    NOT NULL,
  course_id  uuid    REFERENCES public.courses(id) ON DELETE SET NULL,
  is_read    boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);
```

## Campos en `courses` requeridos

```sql
-- Estos campos ya existen en Supabase según la especificación del proyecto:
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS min_students      integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS alert_days_before integer DEFAULT 7;
```
