# Proyecto

**Plataforma Web Institucional del Centro de Especialización Ejecutiva (CEE) — UNI-FIIS.**
Desarrollada por el área de IDI (Investigación, Desarrollo e Innovación) del CCAT, bajo tutoría y validación del Ing. José Espinoza (director del CEE).

Propósito de negocio: el CEE no tiene presencia web. Se construye una **vitrina digital comercial** orientada a la **captación de leads (conversión)**: mostrar la oferta académica (cursos/programas ejecutivos), reproducir material multimedia y capturar interesados vía formularios. El embudo central es:

`Usuario → Landing/Páginas → Formulario → Base de Datos → Notificación al correo del CEE → Seguimiento comercial`

Pilares: 100% responsive, multimedia optimizada, CTAs de conversión, y **autonomía de gestión** para el personal no técnico del CEE (panel "tipo CMS").

---

# Arquitectura

- **Monorepo** gestionado con **Turborepo + pnpm workspaces**, tipado de punta a punta.
- Es una **solución a medida (React + Vite)**, NO un CMS empaquetado. La mención a "WordPress/CMS" en los documentos base es **referencial**: significa que el panel admin debe *comportarse* como un CMS (gestión autónoma de contenido), no usar WordPress.
- **Estrategia mock-first**: el frontend funciona con datos simulados hasta que exista el backend, controlado por el flag `VITE_USE_MOCKS`. Apagar el flag no debe requerir reescribir pantallas.

**Relación entre módulos (workspaces):**

| Workspace | Rol | Stack |
|---|---|---|
| `apps/web` | Frontend público | React + Vite + TS, shadcn/ui, Tailwind, Zustand, Axios, React Router v6 |
| `apps/admin` | Backoffice (panel tipo CMS) | React + Vite + TS |
| `packages/types` (`@cee/types`) | **Única fuente de verdad** de tipos compartidos FE/BE | TypeScript |
| `packages/config` | Configuración compartida (eslint, ts, etc.) | — |
| `packages/ui` | Componentes/UI compartida | — |
| `apps/api` (propuesto) | Backend | **NestJS + TypeORM** (recomendación IDI; decisión final del equipo backend) |

- **Integración de cursos** con **Moodle** vía el campo `moodleCourseId`.
- **Base de datos**: a definir por el equipo de modelado (liderado por Omar Velarde, equipo del Ing. Espinoza).

---

# Estructura de Carpetas

Solo lo relevante (ignorar `node_modules`, `dist`, `.turbo`, lockfiles, build/cache):

```
/ (raíz monorepo)
├── apps/
│   ├── web/                  # sitio público
│   │   └── src/
│   │       ├── config/       # navigation.ts (links centralizados del sitio)
│   │       ├── components/
│   │       │   └── layout/   # Layout, Navbar, MobileMenu, Footer
│   │       ├── pages/        # páginas por ruta (Home, About, Programs, ...)
│   │       ├── router/       # config de rutas (lazy + Suspense)
│   │       ├── stores/       # cartStore, authStore (Zustand)
│   │       ├── services/     # clientes de datos con capa mock conmutable
│   │       └── mocks/        # fixtures (cursos, usuarios, ventas)
│   └── admin/                # backoffice (Dashboard, Cursos, Ventas)
└── packages/
    ├── types/                # @cee/types — contrato de datos FE/BE
    ├── config/               # configs compartidas
    └── ui/                   # UI compartida
```

Responsabilidad clave: `config/navigation.ts` es la **lista única** de links del sitio público; Navbar, MobileMenu, Footer y el Router la consumen (no se duplican links en ningún componente).

---

# Flujo de la Aplicación

- **Inicio:** `pnpm dev` levanta `apps/web` y `apps/admin` (Turborepo). Cada app monta su Router de React Router v6 con `Layout` como ruta padre que renderiza `<Outlet/>`.
- **Navegación pública:** rutas perezosas (`lazy()` + `<Suspense>`). Secciones: **Inicio, Nosotros, Programas, Blog, Multimedia, Contacto**. Header con menú hamburguesa (mobile) e "Iniciar Sesión".
- **Flujo de datos:** las pantallas piden datos a los `services`. Con `VITE_USE_MOCKS=true` devuelven fixtures locales; con `false` consumen la API real. La UI no cambia entre ambos modos.
- **Comunicación con APIs:** vía **Axios**. En integración real (Fase 6) se usa **JWT**: login → token en `localStorage` (solo a través de `authStore`) → interceptor de request añade el token → manejo de `401` con redirect a login.
- **Embudo de conversión:** sin carrito ni checkout (descartados en Fase 2); cada CTA "Inscribirme" navega directo a `/contacto?curso=<id>` con el curso preseleccionado. No hay pago real. El formulario de contacto valida anti-spam y notifica al correo del CEE.
- **Admin:** todas las vistas de backoffice van bajo `ProtectedRoute requiredRole="admin"`.

---

# Componentes Clave

- **`Layout`** — compone Navbar + `<main><Outlet/></main>` + Footer; cascarón de todas las páginas públicas.
- **`Navbar`** — doble logo (CEE en SVG + UNI en PNG, separador vertical), links desktop (desde `navigation.ts`), pestaña **`TeachersMenu`** (overlay accesible de profesores, `Popover` de Radix), botón "Mi Perfil" con **`Avatar`** (foto o iniciales), logout, sticky. El logo de la UNI y `TeachersMenu` se ocultan en mobile (el listado de profesores vive en `MobileMenu`).
- **Profesores** (`/profesores/:slug`) — tipo `Teacher` (`@cee/types`, extiende `Instructor` con `slug`+`upcomingEvents`); mismas personas que la "Plana docente" del curso (`mockInstructors` reutilizado en `teachers.mock.ts`).
- **`MobileMenu`** — menú hamburguesa responsive (shadcn `Sheet`); mismos links que Navbar.
- **`Footer`** — fondo gris oscuro/negro (token de marca para footer, no guinda), navegación, contacto, redes, copyright dinámico (`new Date().getFullYear()`).
- **`WhatsAppFab`** — botón flotante fijo (esquina inferior derecha, todas las páginas), link a `CONTACT_INFO.whatsappUrl`, montado en `Layout`.
- **`CourseCard`** — tarjeta de curso (precio tachado + CTA "Inscribirme", sin carrito).
- **Detalle de curso** — breadcrumb, perfil del egresado, sílabo en acordeón, plana docente, sidebar (precio + "Inscribirme" + descargar sílabo PDF).
- **Home — Hero** (`pages/home/HomePage.tsx`) — bloque diagonal guinda (CSS `clip-path`, no imagen recortada) que contiene todo el texto, alineado a la izquierda y flush al borde del viewport; imagen institucional de fondo visible a través del recorte en desktop, debajo del texto en mobile. Usa **`NextStartBadge`** (`components/shared/NextStartBadge.tsx`), badge reutilizable que envuelve el `Badge` de shadcn para destacar "Próximo a iniciar" + cuenta regresiva (`CourseCountdown`).
- **Home** también incluye `EventSlider` (carrusel de eventos, Embla), `AboutSection` y `BlogSection` (3 entradas más recientes del blog).
- **Blog** (`/blog`, `/blog/:slug`) — listado con `BlogCard` y detalle con `Breadcrumb`, mismo patrón mock/Supabase que `coursesService`.
- **Admin: Gestión de Cursos** — CRUD con badges de estado (Publicado / Borrador / En Revisión); formulario de registro/edición con `moodleCourseId` y subida de sílabo PDF.
- **Admin: Ventas** — KPIs (Total Ventas, Ingresos, Tasa de Conversión) + gráfico de tendencia con **recharts** + desglose por curso.

---

# Estado Global

Gestión de estado con **Zustand**:

- **`authStore`** — usuario/sesión, `isAuthenticated`, token JWT. **Es el ÚNICO lugar autorizado para tocar `localStorage`.**
- No existe `cartStore`: el carrito se descartó del alcance del proyecto desde Fase 2 (ver `docs/IMPLEMENTATIONS.md`). El flujo de conversión es directo: curso → "Inscribirme" (`buildInscripcionUrl`) → formulario de contacto con el curso preseleccionado.

No se usa Context API ni Redux. Los componentes leen estado vía hooks/selectores de los stores, no acceden a `localStorage` directo.

---

# Servicios y APIs

- Patrón único: cada **service** (p. ej. `courseService`, `contactService`, `salesService`) encapsula el acceso a datos y tiene una **capa mock conmutable por `VITE_USE_MOCKS`**. Las pantallas nunca llaman a Axios directo.
- Cliente HTTP: **Axios** con interceptor de request (token JWT) y manejo centralizado de `401`.
- **Moodle**: enlace de cursos por `moodleCourseId` (Fase 6).
- **Contrato de datos**: las respuestas reales del backend deben coincidir **1:1** con `@cee/types`. Endpoints concretos aún no definidos (dependen del backend).

---

# Convenciones del Proyecto

**Repositorio:**
- Solo **pnpm** (nunca npm/yarn).
- **No editar `components/ui/`** a mano (es de shadcn).
- **No usar `localStorage`** fuera de `authStore`.
- El alias **`@/`** debe funcionar en Vite **y** TypeScript.
- Todos los tipos compartidos se importan de **`@cee/types`**; nunca se redefinen localmente.
- Links de navegación: una sola fuente en `config/navigation.ts`.

**Git (flujo del equipo frontend):**
- Ramas: `main` (estable/releases) y `dev` (integración), ambas **protegidas** (solo por PR aprobado).
- Ramas de trabajo cortas, por **tarea** no por persona: `feature/fase{N}-{descripcion}` (también `bugfix/`, `docs/`, `hotfix/`). Se eliminan tras el merge.
- **Conventional Commits** en inglés e imperativo: `feat`, `fix`, `refactor`, `style`, `docs`, `perf`, `test`, `chore`. Commits atómicos.
- Merge a `dev` con **"Squash and merge"**.

---

# Dependencias Importantes

Solo las que afectan la arquitectura: **Turborepo + pnpm** (monorepo), **React + Vite + TypeScript**, **React Router v6** (routing con lazy/Suspense), **Zustand** (estado), **Axios** (HTTP), **shadcn/ui + Tailwind** (UI/estilos), **recharts** (gráficos de Ventas en admin). Tipos compartidos vía `@cee/types`.

---

# Variables de Entorno

- **`VITE_USE_MOCKS`** — `true`: el frontend usa fixtures locales (desarrollo sin backend). `false`: consume la API real. Documentar siempre en `.env.example`.
- *(Pendiente)* **`VITE_API_URL`** u similar — base URL de la API real (a definir al integrar el backend en Fase 6).

---

# Decisiones Técnicas Relevantes

- **Solución a medida sobre CMS empaquetado**: por escalabilidad, evitar dependencia de plugins y mantenibilidad (monorepo tipado).
- **Full TypeScript FE↔BE** (motivo de recomendar NestJS): permite compartir `@cee/types` como única fuente de verdad y evitar desincronización de tipos.
- **Mock-first**: desacopla al frontend del backend; flag de entorno en vez de ramas separadas.
- **Restricciones / fuera de alcance**: pasarelas de pago reales y facturación ERP NO se implementan (definido en el Plan de Trabajo). El checkout es mock y termina en registro/contacto.
- **Multimedia**: videos con lazy loading / CDN — requisito de rendimiento, no opcional.
- **Indicadores de éxito** (criterios de "terminado" del proyecto): responsive verificado en móvil/tablet/escritorio; videos sin penalizar la carga; formulario de contacto sin pérdida de datos + notificación al correo del CEE; capacitación final al personal del CEE.
- **Equipo frontend (IDI):** Renato, Santiago, Isabel, Diana, Tom, Elvis.
- **Cronograma base:** Desarrollo técnico 11–22 jun 2026 · QA 22–28 jun · Lanzamiento 29 jun.

---

# Pendientes Detectados

Decisiones abiertas a cerrar (orden de urgencia):

- **C — "Especializaciones":** el menú la lista como sección, pero las rutas solo tienen "Programas". Definir si es página propia o filtro dentro de Programas (recomendación: filtro). *Cerrar en Fase 2/3.*
- **B — Ubicación del panel admin:** el esqueleto creó vistas admin en `apps/web` **y** en `apps/admin`. Elegir una (recomendación: `apps/admin`, por permisos y deploy separados). *Cerrar antes de Fase 5.*
- **A — Stack de backend:** sin confirmar; IDI recomienda NestJS + TypeORM (alternativa ORM: Prisma). *Confirmar con backend.*
- **D — Contrato de datos (lo más crítico):** congelar `@cee/types` 1:1 con las respuestas reales del backend antes de Fase 6 (evitar desfases tipo `course_name` vs `title`).

Trabajo preparado para fases futuras (aún mock/stub): capa mock de services, `authStore` (lógica real ya migrada a Supabase, ver Fase 6), flujo JWT completo, SEO/meta tags y accesibilidad (Fase 7).

**Estado actual:** Fases 0–6 completas (layout, páginas públicas, conversión sin carrito, panel admin, integración Supabase). En curso el **plan de mejoras de UI/UX** (`docs/mejoras-finale/mejoras-finales2.md`): tokens de marca en `cee.red.{50..900}` + `cee.surface.{cream,grey}` (Tailwind), Iniciativa A (Hero) ✅, B (Navbar doble logo) ✅ parcial (logo UNI en PNG, pendiente SVG oficial), C (cards de Blog pulidas) ✅, D (degradado y copy de "Multimedia" enriquecidos, título sin cambiar a pedido del usuario) ✅, E (Contacto fondo crema + Footer gris oscuro) ✅, F (Profesores: pestaña + overlay + perfil) ✅, G (WhatsApp flotante) ✅ ya estaba implementado. **Las 7 iniciativas del plan de mejoras quedan completas.**

---

# Resumen Ejecutivo

1. Vitrina web comercial del **CEE (UNI-FIIS)** construida por **IDI/CCAT**; meta = captación/conversión de leads.
2. Embudo: Usuario → formulario → BD → correo del CEE → seguimiento comercial. **Sin pagos reales** (fuera de alcance).
3. **Monorepo Turborepo + pnpm**; `apps/web` (público), `apps/admin` (backoffice tipo CMS), `packages/types|config|ui`.
4. Stack web: **React + Vite + TS, React Router v6, Zustand, Axios, shadcn/ui + Tailwind**.
5. Solución **a medida**, NO WordPress; "CMS" = autonomía de gestión del personal del CEE.
6. **Mock-first**: todo se desarrolla con fixtures bajo `VITE_USE_MOCKS`; apagar el flag no rompe la UI.
7. **`@cee/types` es la única fuente de verdad** de tipos; nunca redefinir tipos localmente.
8. **`config/navigation.ts`** es la lista única de links; Navbar, MobileMenu, Footer y Router la consumen.
9. Estado solo con **Zustand**: `cartStore` y `authStore`.
10. **`localStorage` solo dentro de `authStore`**; JWT con interceptor Axios y manejo de 401 (Fase 6).
11. **No editar `components/ui/`** (shadcn); solo **pnpm**; alias `@/` en Vite y TS.
12. Cursos se integran con **Moodle** vía `moodleCourseId`.
13. Backend propuesto **NestJS + TypeORM** (no confirmado); BD a definir por el equipo de modelado.
14. Admin: Dashboard, **Gestión de Cursos** (estados Publicado/Borrador/En Revisión, sílabo PDF), **Ventas** (KPIs + recharts), bajo `ProtectedRoute requiredRole="admin"`.
15. Multimedia con **lazy load / CDN** (requisito de rendimiento, no opcional).
16. Git: `main`/`dev` protegidas; ramas `feature/fase{N}-*` cortas; **Conventional Commits**; squash-merge a `dev`.
17. Equipo: Renato, Santiago, Isabel, Diana, Tom, Elvis.
18. **Estado: Fase 0 ✅, en curso Fase 2** (Layout y navegación).
19. **Decisiones abiertas:** Especializaciones (C), ubicación admin (B), stack backend (A), congelar contrato de datos (D).
20. Indicadores de éxito: responsive total, multimedia fluida, formulario de contacto sin pérdida de datos + notificación al CEE.
