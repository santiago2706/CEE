# Actualizaciones CEE-FIIS — Panel Administrativo

> **Última actualización:** junio 2026  
> **Equipo:** IDI / CCAT — Universidad Nacional de Ingeniería  
> **Proyecto Supabase:** `yusaeqpjnnxrykunzopr`

---

## Resumen ejecutivo

El panel administrativo del CEE-FIIS (`apps/admin`) está **operativo al 100%** con datos reales de Supabase. Se construyeron 10 módulos completos — Cursos, Eventos, Ventas/Inscripciones, Beneficios, Alumnos, Certificados, Notificaciones, Asistente CEE (con function calling), Perfil/Configuración y Dashboard — más una Edge Function de alertas automáticas por email. Todo el código sigue el patrón mock-first (`VITE_USE_MOCKS`): cambiar la variable de entorno a `false` activa el backend real sin tocar ninguna pantalla.

El sitio público (`apps/web`) tiene la estructura de rutas, layout, páginas y servicios construidos (Fases 0–6 completas según `PLAN_IMPLEMENTACION_CEE_WEB.md`), pero aún no está en producción.

---

## Base de datos — Migraciones aplicadas

| # | Archivo | Qué hace |
|---|---------|----------|
| 0001 | `0001_init.sql` | Esquema inicial: tablas `profiles`, `instructors`, `courses`, `course_instructors`, `sales`, `contact_leads`, `videos`. Triggers de auditoría, RLS completo, bucket `syllabus-pdfs`. También existen en Supabase las tablas `students`, `events`, `event_registrations`, `notifications`, `benefits`, `settings` y `certificates` (creadas fuera de migraciones versionadas). |
| 0002 | `0002_add_course_schedule_fields.sql` | Agrega a `courses`: `duration_weeks`, `schedule_description`, `start_date`, `max_students` (todos nullable). |
| 0003 | `0003_add_sales_operational_fields.sql` | Agrega a `sales`: `student_name` (desnormalizado para evitar JOIN), `notes`, `updated_at` con trigger automático. |
| 0004 | `0004_create_certificates_table.sql` | Crea tabla `certificates` con número correlativo (`CEE-{año}-{####}`), estados (`draft / pending_signature / signed / revoked`), `signed_document_url`, trigger `updated_at` y RLS admin-only. |
| 0005 | `0005_add_events_slug.sql` | Agrega columna `slug` a la tabla `events` existente con índice único parcial. |
| 0006 | `0006_setup_cron_check_enrollment.sql` | Registra el cron `check-enrollment-daily` (`0 13 * * *` UTC = 8 AM Perú) usando `pg_net` y `cron.schedule`. **Ejecutar en SQL Editor para activar.** |
| 0007 | `0007_add_course_confirmed_notification_type.sql` | Amplía el CHECK constraint de `notifications.type` para incluir `'course_confirmed'` (notificación cuando un curso alcanza su mínimo el día de inicio). |

### Campos adicionales en tablas existentes (fuera de migraciones versionadas)
- `courses`: `min_students integer`, `alert_days_before integer DEFAULT 7`
- `sales`: `student_id uuid REFERENCES profiles`
- `certificates`: `student_id uuid REFERENCES profiles`
- `event_registrations`: `student_id uuid REFERENCES profiles`

---

## Módulos implementados en el admin

### Dashboard

**Ruta:** `/`  
**Página:** `DashboardPage.tsx`  
**Servicio:** `dashboardService.ts`

Vista gerencial completa con filtro de fechas (Desde/Hasta con botón "Aplicar"). Muestra 4 KPI cards (Total Ventas, Cursos Publicados, Leads de Contacto, Ventas Completadas) con variación porcentual vs. mes anterior. Gráfico de ingresos mensuales con barras + línea de tendencia (recharts) y gráfico de dona con distribución por categoría de cursos. Tabla de últimas ventas al pie.

---

### Cursos

**Rutas:** `/cursos` · `/cursos/nuevo` · `/cursos/:id/editar`  
**Páginas:** `CoursesListPage.tsx`, `CourseFormPage.tsx`  
**Servicio:** `coursesService.ts`  
**Mock:** `mocks/courses.ts`

**CoursesListPage:** Tabla con columnas Nombre / Categoría / Modalidad / Precio / Estado / Creado / Acciones. Filtros por título (búsqueda), categoría y estado. Exportar Excel (SheetJS). Paginación 20/página. Botón "Marcar como" (DropdownMenu) para cambiar estado. Eliminar con AlertDialog.

**CourseFormPage:** Formulario de 7 secciones. Campos destacados: título, descripción, precio, Moodle Course ID, categoría, modalidad, estado, duración (semanas), horario, fecha de inicio, cupo máximo, **mínimo de alumnos para iniciar**, **días de anticipación para alertas**. Subida de sílabo PDF (hasta 10 MB, Supabase Storage bucket `syllabus-pdfs`). Los campos `min_students` y `alert_days_before` alimentan la Edge Function de alertas.

---

### Eventos

**Rutas:** `/eventos` · `/eventos/nuevo` · `/eventos/:id/editar` · `/eventos/:id/inscritos`  
**Páginas:** `events/EventsPage.tsx`, `events/EventFormPage.tsx`, `events/EventRegistrationsPage.tsx`  
**Servicio:** `eventsService.ts`  
**Mocks:** `mocks/events.mock.ts`, `mocks/eventRegistrations.mock.ts`

**EventsPage:** Tabla Título / Fecha / Lugar / Inscritos / Capacidad / Estado. Filtros por título y estado. Acciones: Ver inscritos, Editar, Eliminar (con confirmación).

**EventFormPage:** Campos: título, descripción, fecha, hora inicio/fin, lugar, capacidad, toggle "¿Incluye certificado?" (muestra precio si activo), estado (borrador/publicado/cancelado), subida de flyer (imagen). Detecta modo crear/editar por el parámetro `:id`.

**EventRegistrationsPage:** Header con nombre + fecha + contador "X / capacidad inscritos". Tabla completa: Nombre / Email / Celular / ¿Trabaja? / ¿Quiere certificado? / Pagado / Fuente / Fecha. Botón "Marcar certificado pagado" por fila (solo si `wantsCertificate=true && !certificatePaid`). Exportar Excel con todos los campos.

**Mock de eventos:** 3 eventos (Conferencia Cadena Inteligente, Taller Excel Avanzado, Seminario Finanzas Corporativas). 20 inscritos distribuidos con nombres peruanos, `is_working` variado, `source` variado (web/whatsapp/manual).

---

### Ventas / Inscripciones

**Rutas:** `/ventas` · `/ventas/nueva`  
**Páginas:** `SalesPage.tsx`, `SaleFormPage.tsx`  
**Servicios:** `salesRecordsService.ts` (operativo), `salesService.ts` (reportes/analytics para dashboard)  
**Mock:** `mocks/salesRecords.ts`

**SalesPage (vista operativa):** Tabla Alumno / Curso / Monto / Estado / Fecha / Acciones. Filtros combinados: búsqueda por alumno o curso, por curso, por estado, y por rango de fechas (Desde/Hasta). Acciones por fila: "Ver detalle" (modal con todos los campos), "Cambiar estado" (DropdownMenu), "Emitir certificado" (navega a `/certificados/nuevo?alumno=...`), "Ver alumno" (navega a `/alumnos/:id` si existe `studentId`). Exportar Excel. Paginación 20/página.

**SaleFormPage:** Campos: nombre del alumno, curso (dropdown), monto, estado, notas. Se pre-llena automáticamente si la URL tiene `?student_id=<id>` (consulta `studentsService` para obtener el nombre completo).

---

### Beneficios

**Rutas:** `/beneficios` · `/beneficios/nuevo` · `/beneficios/:id/editar`  
**Páginas:** `BenefitsListPage.tsx`, `BenefitFormPage.tsx`  
**Servicio:** `benefitsService.ts`  
**Mock:** `mocks/benefits.ts`

CRUD completo de descuentos y beneficios que se muestran en el perfil del estudiante en `apps/web`. 8 beneficios de ejemplo: descuento por pronto pago, egresados UNI, inscripción grupal, beca por mérito, alumni FIIS, empleados públicos, referido y matrícula anticipada. Campos: título, descripción, `discountLabel` (ej. "15% OFF"), categoría (`descuento / acceso / servicio`), código, vigencia, activo/inactivo. Toggle rápido de activo/inactivo desde la lista.

---

### Alumnos

**Rutas:** `/alumnos` · `/alumnos/nuevo` · `/alumnos/:id` · `/alumnos/:id/editar`  
**Páginas:** `students/StudentsPage.tsx`, `students/StudentFormPage.tsx`, `students/StudentDetailPage.tsx`  
**Servicio:** `studentsService.ts`  
**Mock:** `mocks/students.mock.ts`

**StudentsPage:** Tabla DNI / Nombre completo / Email / Celular / Ocupación / Fuente / Cursos / Acciones. Badges de fuente con colores (web=azul, whatsapp=verde, manual=gris, referido=naranja). Filtros: búsqueda por nombre o DNI, por fuente, por situación laboral. Exportar Excel con todos los campos. Paginación 20/página.

**StudentFormPage:** 5 secciones:
1. Datos personales: DNI (validado 8 dígitos), nombres, apellidos, fecha de nacimiento, género.
2. Contacto y ubicación: email, celular, distrito, ciudad.
3. Información profesional: toggle "¿Trabaja?", empresa, profesión, fuente de captación.
4. Integración Moodle (sección colapsable): campo `moodle_user_id` con nota informativa — "dejar vacío hasta configurar la integración con Moodle LMS".
5. Notas libres de la secretaria.

**StudentDetailPage:** 4 tabs — Perfil (todos los datos + badge de fuente + campo Moodle), Historial de cursos (tabla + total gastado + botón "Nueva inscripción"), Certificados (tabla + botón "Emitir certificado"), Eventos (tabla de inscripciones a eventos). Los botones de acción generan URLs con `?student_id=<id>` para pre-llenar formularios.

**Mock:** 15 alumnos peruanos con 60% trabajando, distribución de fuentes 60% web / 30% whatsapp / 10% referido, `moodle_user_id: null` para todos, 4 con notas de la secretaria.

---

### Certificados

**Rutas:** `/certificados` · `/certificados/nuevo`  
**Páginas:** `CertificatesPage.tsx`, `CertificateFormPage.tsx`  
**Servicio:** `certificatesService.ts`  
**Mock:** `mocks/certificates.mock.ts`

**CertificatesPage:** Tabla Nº Certificado / Alumno / Curso / Fecha Emisión / Estado / Acciones. Filtros: búsqueda por alumno o Nº, por curso, por estado. DropdownMenu por fila para cambiar estado (`draft → pending_signature → signed`) y "Anular" (solo si no está `revoked`). Enlace "Ver PDF" cuando `signedDocumentUrl` existe. Exportar Excel.

**CertificateFormPage:** Campos: alumno, curso (dropdown), fecha de emisión, notas. Se pre-llena si la URL tiene `?alumno=<nombre>&curso=<id>` o `?student_id=<id>`. Los nuevos certificados se crean en estado `draft`. Número correlativo (`CEE-{año}-{####}`) generado automáticamente.

**Estados del ciclo de vida:** `draft` → `pending_signature` → `signed` (firmado, con URL del PDF) / `revoked` (anulado).

**Mock:** 15 certificados: 11 firmados (con URL ficticia de PDF), 3 pendientes de firma, 1 borrador.

---

### Notificaciones

**Ruta:** `/notificaciones`  
**Página:** `NotificationsPage.tsx`  
**Componente:** `components/shared/NotificationBell.tsx` (en el header del admin)  
**Servicio:** `notificationsService.ts`

**NotificationsPage:** Tabla completa con ícono de tipo, título, mensaje (truncado), fecha relativa ("hace 2 horas") + absoluta, badge leída/no leída, botón "Leída" por fila. Filtros por tipo y por estado de lectura. Botón "Marcar todas como leídas".

**NotificationBell:** Campana en el header del admin con badge rojo de no leídas (oculto si es 0, muestra "99+" sobre ese número). Al hacer clic abre un dropdown con las últimas 10 notificaciones: ícono por tipo, título, mensaje resumido, tiempo relativo. Botón "Marcar todas" en la cabecera. Link "Ver todas →" navega a `/notificaciones`. **Polling cada 60 segundos** para actualizar el contador sin recargar la página.

**Tipos de notificación con sus iconos:**

| Tipo | Ícono | Color |
|------|-------|-------|
| `low_enrollment` | Users | Ámbar |
| `new_lead` | UserPlus | Azul |
| `event` | CalendarDays | Púrpura |
| `course_confirmed` | CheckCircle | Esmeralda |

**Mock:** 7 notificaciones de ejemplo (3 `low_enrollment`, 2 `new_lead`, 2 `course_confirmed`), mix de leídas/no leídas.

---

### Asistente CEE

**Ruta:** `/asistente`  
**Página:** `SecretariaChat.tsx`

Chatbot administrativo con **function calling via Groq API** (modelo `llama-3.3-70b-versatile`). La interfaz tiene ancho máximo 800px centrado. Un `useRef` mantiene el historial completo de la conversación (incluyendo tool calls) para preservar el contexto entre turnos.

**Herramientas disponibles (tools):**

| Tool | Acción |
|------|--------|
| `create_course` | Crea un curso en estado Borrador vía `coursesService` |
| `register_sale` | Registra una inscripción vía `salesRecordsService` (resuelve courseId por nombre) |
| `issue_certificate` | Emite certificado vía `certificatesService` (resuelve curso por ID o nombre) |
| `query_sales` | Consulta inscripciones con filtros opcionales de curso y estado |
| `query_courses` | Lista todos los cursos con estado, modalidad y precio |
| `query_students` | Busca alumnos por nombre, DNI o fuente de captación |

**Configuración requerida:** `VITE_GROQ_API_KEY` en `apps/admin/.env`. Obtener en [console.groq.com/keys](https://console.groq.com/keys).

Mientras el modelo llama una herramienta, se muestra un indicador de "Ejecutando: [acción]..." con fondo ámbar y animación de ping.

---

### Perfil / Configuración

**Ruta:** `/perfil` (accesible solo desde el avatar en la esquina inferior del sidebar)  
**Página:** `ProfilePage.tsx`  
**Servicios:** `profileService.ts`, `settingsService.ts`  
**Mock:** `mocks/settings.mock.ts`

**Tab "Mi perfil":** Avatar circular 120px con iniciales de respaldo. Hover sobre el avatar muestra overlay con ícono de cámara para cambiar foto (sube a bucket `avatars`, máximo 3 MB). Campo de nombre editable. Email (solo lectura con badge "No editable"). Badge de rol guinda ("Administrador"). Cambios se reflejan inmediatamente en el sidebar sin recargar.

**Tab "Seguridad":** Cambio de contraseña con 3 campos (actual, nueva, confirmar). Ícono mostrar/ocultar por campo. Validación de mínimo 8 caracteres y coincidencia. En modo real: re-autenticación con contraseña actual antes de actualizar. Nota de aviso sobre cierre de sesión.

**Tab "Configuración CEE"** (solo visible para `role === 'admin'`): Edición de los 6 settings del sistema: nombre del centro, teléfono, WhatsApp, correo de notificaciones, mínimo de alumnos por defecto, días de anticipación por defecto. Nota informativa recordando actualizar también `SECRETARY_EMAIL` en los Secrets de la Edge Function.

**Acceso desde el sidebar:** La sección de avatar/nombre/correo en la esquina inferior izquierda es ahora un `<Link to="/perfil">`. Al hacer hover aparece un `ChevronRight` sutil.

---

## Tipos agregados a @cee/types

Los siguientes tipos se agregaron al contrato compartido en `packages/types/src/index.ts`:

| Tipo / Interfaz | Descripción |
|-----------------|-------------|
| `Setting` | Clave-valor de configuración del sistema con descripción y timestamp |
| `UserProfile` | Perfil del usuario admin con avatar opcional |
| `Student` | Alumno con DNI, datos personales, profesión, fuente, `moodleUserId` |
| `StudentSource` | Union: `'web' \| 'whatsapp' \| 'manual' \| 'referido'` |
| `StudentGender` | Union: `'M' \| 'F' \| 'otro'` |
| `AdminNotification` | Notificación interna del panel (evita colisión con DOM `Notification`) |
| `NotificationType` | Union: `'low_enrollment' \| 'new_lead' \| 'event' \| 'course_confirmed'` |
| `CeeEvent` | Evento del CEE (evita colisión con DOM `Event`) |
| `EventStatus` | Union: `'draft' \| 'published' \| 'cancelled'` |
| `EventRegistrationSource` | Union: `'web' \| 'whatsapp' \| 'manual'` |
| `EventRegistrationInput` | Input para registrar asistente en un evento |
| `EventRegistration` | Registro completo de inscripción a evento |
| `CertificateStatus` | Union: `'draft' \| 'pending_signature' \| 'signed' \| 'revoked'` |
| `SignatureProvider` | Union: `'manual' \| 'digital'` |
| `Certificate` | Certificado con número correlativo y `studentId?` |

**Campos nuevos en tipos existentes:**

| Tipo | Campos agregados |
|------|-----------------|
| `Course` | `durationWeeks?`, `scheduleDescription?`, `maxStudents?`, `minStudents?`, `alertDaysBefore?` |
| `Sale` | `studentId?`, `studentName?`, `notes?`, `updatedAt?` |
| `Certificate` | `studentId?` |
| `EventRegistration` | `studentId?` |

---

## Edge Functions

### `check-enrollment` — Alertas de bajo cupo y curso confirmado

**URL:** `https://yusaeqpjnnxrykunzopr.supabase.co/functions/v1/check-enrollment`  
**Cron:** todos los días a las 8:00 AM hora Perú (13:00 UTC), configurado con `pg_cron` + `pg_net`.  
**Stack:** Deno TypeScript + Supabase client + Resend API.

**Chequeo 1 — Bajo cupo (`low_enrollment`):**
1. Consulta cursos `published` con `start_date` entre hoy y `hoy + alert_days_before` días.
2. Cuenta inscripciones completadas (`sales.status = 'completed'`) por curso.
3. Si `count < min_students` **y** no hay notificación `low_enrollment` en las últimas 24h para ese curso:
   - Inserta fila en `notifications` (tipo `low_enrollment`).
   - Envía email con template HTML en fondo **guinda** vía Resend API.

**Chequeo 2 — Curso confirmado (`course_confirmed`):**
1. Consulta cursos con `start_date = hoy`.
2. Si `enrolled >= min_students` **y** no hay notificación `course_confirmed` en últimas 24h:
   - Inserta fila en `notifications` (tipo `course_confirmed`).
   - Envía email con template HTML en fondo **verde** (`#1a6b35`) vía Resend API.

**Secrets necesarios en Supabase Dashboard → Edge Functions → Secrets:**

| Secret | Descripción |
|--------|-------------|
| `RESEND_API_KEY` | Clave de API de Resend (obtener en resend.com) |
| `SECRETARY_EMAIL` | Correo destino de las alertas (dev: gmail de prueba; prod: correo del CEE) |
| `ADMIN_URL` | URL del panel admin (dev: `http://localhost:5174`; prod: dominio real) |

`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` son inyectados automáticamente por Supabase.

**Probar manualmente:**
```bash
bash supabase/functions/check-enrollment/test.sh
# Requiere SUPABASE_ANON_KEY como variable de entorno
```

---

## Pendientes y próximos pasos

### Corto plazo (antes del lanzamiento)

- [ ] **Sitio público `apps/web`:** Layout, páginas, formulario de contacto y conversión ya están construidos (Fases 0–6 completas). Falta QA responsive en móvil/tablet, verificar formulario de contacto end-to-end, y configurar el deploy.
- [ ] **Configurar secrets de la Edge Function** en producción (`SECRETARY_EMAIL` real del CEE, `ADMIN_URL` con el dominio definitivo).
- [ ] **Ejecutar la migración 0006** (`setup_cron_check_enrollment.sql`) en Supabase SQL Editor para activar el cron diario.
- [ ] **Bucket `avatars` en Supabase Storage** — crear y configurar RLS para que cada usuario solo pueda subir su propio avatar.
- [ ] **Capacitación al personal del CEE** — el módulo de Configuración CEE ya permite que la secretaria actualice teléfonos, WhatsApp y correos sin tocar código.

### Medio plazo

- [ ] **Integración Moodle LMS:** El campo `moodle_user_id` en `Student` y `moodle_course_id` en `Course` están reservados para esta integración. Cuando se active, sincronizará automáticamente inscripciones del CEE con accesos en Moodle. El Asistente CEE también expone la herramienta `query_students` que puede usarse para buscar por DNI antes de sincronizar.
- [ ] **Sistema de firma digital:** El estado `pending_signature` en `Certificate` está diseñado para soportar firma digital (con entidades como la UNI o RENIEC). El campo `signatureProvider` puede tomar el valor `'digital'` cuando se implemente. Actualmente solo existe el flujo manual (`'manual'`).
- [ ] **Integración con bot de WhatsApp del equipo:** Los eventos del CEE generan registros en `event_registrations` con `source: 'whatsapp'`. Coordinar con el equipo del bot para que los registros de WhatsApp usen el endpoint de `eventsService.registerAttendee()` directamente y setee `source: 'whatsapp'` automáticamente.
- [ ] **Sistema de pagos de certificados:** El campo `certificate_paid` en `EventRegistration` ya trackea si el alumno pagó su certificado de evento. Falta implementar el flujo de cobro (actualmente se marca manualmente desde el admin).
- [ ] **Portal del estudiante:** La tabla `students` con `moodle_user_id` y el perfil con `avatarUrl` están listos para soportar un login de alumnos que vean su historial de cursos, certificados y eventos desde `apps/web`.

### Largo plazo

- [ ] **Reportes avanzados:** El dashboard actual muestra KPIs básicos. Sería útil agregar reportes de tasa de aprobación, alumnos recurrentes y análisis por categoría de curso.
- [ ] **Notificaciones push / Telegram:** Las notificaciones hoy llegan solo por email. Agregar un canal de Telegram o push notifications para la secretaria.
- [ ] **API backend (NestJS + TypeORM):** El stack recomendado por IDI. Cuando el equipo de backend lo implemente, apagar `VITE_USE_MOCKS=false` y el frontend funciona sin cambios de código.

---

## Decisiones técnicas tomadas

### `student_name` como campo desnormalizado en `sales`
La tabla `sales` tiene tanto `user_id` (FK a `profiles`) como `student_name` (texto libre). El campo `student_name` se añadió para la vista operativa de la secretaria: permite registrar inscripciones manuales sin que el alumno exista en la tabla `students`. El `student_id` (FK a `students`) es opcional (nullable) para compatibilidad con datos históricos registrados antes de la creación del módulo de Alumnos.

### Mock-first como estrategia de desarrollo
Todos los servicios tienen dos ramas controladas por `VITE_USE_MOCKS`: una con datos en memoria y una con Supabase real. Esto permitió construir y demostrar el 100% del panel sin depender de que el backend estuviera disponible. Los fixtures de mock son datos peruanos realistas (nombres, DNIs, distritos, profesiones) para que las demos se vean convincentes.

### Paginación como hook reutilizable (`usePagination`)
En lugar de implementar paginación en cada tabla, se creó `apps/admin/src/hooks/usePagination.ts` que acepta `(items, pageSize)` y expone `paginatedItems`, `page`, `totalPages`, `goNext/goPrev` y `setPage`. El mismo hook alimenta CoursesListPage, SalesPage, CertificatesPage, NotificationsPage, StudentsPage, EventsPage y EventRegistrationsPage.

### `CeeEvent` y `AdminNotification` en vez de `Event` y `Notification`
Los nombres `Event` y `Notification` colisionan con tipos globales del DOM en TypeScript. Se usaron nombres con prefijo (`CeeEvent`, `AdminNotification`) para evitar ambigüedad en los archivos que importan tanto los tipos del dominio como los tipos del browser.

### Sección colapsable de Moodle en el formulario de alumno
El campo `moodle_user_id` está en el formulario de alumno pero en una sección colapsable con un aviso informativo. Decisión deliberada: el campo existe en la BD para no tener que migrar cuando se active la integración, pero se oculta visualmente para no confundir a la secretaria en el uso cotidiano.

### Número correlativo de certificados generado en el cliente
El número `CEE-{año}-{####}` se genera consultando el máximo existente y sumando 1. En mock mode se usa el cache en memoria; en Supabase se consulta la tabla antes de insertar. No tiene protección contra race conditions simultáneas (aceptable dado el volumen bajo de emisión de certificados del CEE). Si en el futuro aumenta el volumen, se puede mover a un trigger de Supabase.

### `VITE_GROQ_API_KEY` en el cliente
La clave de Groq se expone en el cliente por diseño: el panel admin es una herramienta interna (solo accesible con login de admin), por lo que el riesgo de exposición es equivalente al de cualquier herramienta interna con credenciales de API. Si se necesita más seguridad en el futuro, la llamada a Groq puede moverse a una Edge Function de Supabase que actúe de proxy.

### Sidebar user-section como link a `/perfil`
En vez de agregar "Perfil" como ítem del menú lateral (que ya está lleno), se aprovechó la sección de avatar/nombre/correo en la parte inferior del sidebar. Al hacer hover aparece un `ChevronRight` sutil. Esto sigue el patrón de apps como Linear, Notion y Vercel donde el perfil se accede desde el avatar del usuario, no desde el menú de navegación principal.

---

*Documento generado por el equipo IDI/CCAT — actualizar este archivo con cada sprint de cambios significativos.*
