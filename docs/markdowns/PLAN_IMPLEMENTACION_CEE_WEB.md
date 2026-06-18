# Plan de Implementación — Plataforma Web CEE-FIIS

> **Equipo IDI / CCAT** · Frontend del Centro de Especialización Ejecutiva (FIIS)
> Documento vivo. Actualizar a medida que avanza el proyecto.

---

## 1. Decisiones de arquitectura (cerradas)

### 1.1. Stack: solución a medida con panel tipo CMS
Se construye una solución propia (React + Vite), no un CMS empaquetado. La mención a WordPress en el Plan de Trabajo era **referencial**: no significa usar WordPress, sino que el **panel administrativo se comporte como un CMS** — que el personal del CEE pueda gestionar cursos, precios, contenido y multimedia de forma autónoma, sin tocar código.

Razones para ir a medida:

- **Escalabilidad:** un SPA propio no queda atado al ciclo de vida ni a los límites de los plugins.
- **Sin dependencia de plugins:** integración con Moodle, carrito y panel de ventas se controlan en código propio.
- **Mantenibilidad:** monorepo tipado de punta a punta, con componentes y tipos compartidos.

**Implicancia de diseño:** el backoffice (Fase 5) debe priorizar la autonomía del usuario no técnico — CRUD claro, subida de imágenes y sílabos, estados de publicación — que es justamente la experiencia "tipo CMS" que se busca.

### 1.2. Stack técnico
| Capa | Tecnología | Responsable |
|------|-----------|-------------|
| Monorepo | Turborepo + pnpm workspaces | IDI |
| Frontend público (`apps/web`) | React + Vite + TS, shadcn/ui, Tailwind, Zustand, Axios, React Router v6 | IDI |
| Backoffice (`apps/admin`) | React + Vite + TS | IDI |
| Tipos compartidos (`packages/types`) | TypeScript (`@cee/types`) | IDI (en coordinación con backend) |
| Backend (`apps/api` propuesto) | **NestJS + TypeORM** *(recomendación IDI; decisión final del equipo de backend)* | Equipo de backend |
| Base de datos | A definir por el equipo de modelado | Equipo de backend |
| Integración cursos | Moodle (vía `moodleCourseId`) | Backend |

### 1.3. Por qué NestJS + TypeScript (recomendación a backend)
- **Stack full TypeScript:** `@cee/types` se vuelve la **única fuente de verdad** compartida entre frontend y backend → se elimina el desfase entre tipos del cliente y respuestas reales de la API.
- **Encaja en el monorepo:** el `apps/api` puede vivir en el mismo Turborepo y consumir `@cee/types` con `workspace:*`.
- **ORM:** TypeORM es válido; Prisma es la alternativa moderna a evaluar. Decisión del equipo de backend.

### 1.4. Estrategia de datos: mock-first
Mientras el backend no esté listo, el frontend trabaja con **datos simulados**, controlados por un flag de entorno (`VITE_USE_MOCKS`). Cuando la API real exista, se apaga el flag sin reescribir las pantallas.

---

## 2. Estado actual

- ✅ **Fase 0 — Esqueleto del monorepo: COMPLETADA y funcional.**
  Estructura Turborepo, `apps/web` y `apps/admin`, `packages/types|config|ui`, shadcn inicializado, tema rojo CEE, alias `@/` operativo, `pnpm dev` levanta ambas apps.

- ✅ **Fase 1 — Capa de datos mock: COMPLETADA.**
  `@cee/types` reconciliado, fixtures completos en `apps/web/src/mocks/`, capa mock en services conmutada por `VITE_USE_MOCKS`. Detalle completo en la sección 3 (Fase 1) y en las convenciones de la sección 6.

---

## 3. Fases de implementación

### Fase 1 — Capa de datos mock ✅ COMPLETADA
**Objetivo:** desbloquear al frontend sin depender del backend.

**Trabajo de tipos (`packages/types`):**
- Se reconcilió el schema simple de Fase 0 hacia el contrato completo: se agregaron `Instructor`, `SyllabusModule`, `CartItem`, `AuthResponse`, `SalesKpis`, `SalesTrendPoint`, `CourseSalesBreakdown`, `SalesReport`, `CourseLevel`, `UserRole`.
- `Course` se amplió con `shortDescription`, `level`, `academicHours`, `certification`, `rating`, `syllabusPdfUrl`, `graduateProfile`, `syllabus`, `instructors`, `benefits`.
- `Sale` se mantuvo como entidad **transaccional** (con `userId` y `status`), separada de los tipos de **reporte agregado** (`SalesReport` y afines) — decisión tomada porque el producto va a necesitar "mis cursos comprados" por usuario más adelante, no solo el dashboard agregado de ventas.
- `ContactForm` fue reemplazada por `ContactLead` (agrega `id`, `phone` requerido, `createdAt`).
- `PaginatedResponse` → `Paginated` (`limit` → `pageSize`), alineado al resto del contrato.
- `User.fullName` → `User.name`; se agregó `avatarUrl`.
- Verificación previa por `grep`: ningún componente de `apps/web` ni `apps/admin` dependía de los valores anteriores (en inglés/kebab-case) de los enums, lo que permitió migrar sin romper código existente.

**Convención de idioma de enums (cerrada, ver sección 6):**
- `CourseStatus`: inglés (`'draft' | 'review' | 'published'`).
- `CourseModality` y `CourseCategory`: español (`'Virtual'`, `'Gestión'`, etc.).
- Mezcla intencional, no un error — quedó así porque se decidió campo por campo durante la implementación, priorizando lo que ya estaba en uso en el mockup del admin para cada caso.

**Regla de negocio cerrada — ciclo de vida del curso:**
El flujo es `Borrador → En Revisión → Publicado`, **unidireccional**: un curso publicado nunca regresa a Borrador o En Revisión. Por lo tanto, todo curso en `draft` o `review` tiene `enrolledCount: 0` y `rating: 0` (nunca tuvo alumnos ni calificaciones). Esta regla debe respetarse en cualquier fixture o dato nuevo que se agregue más adelante.

**Fixtures (`apps/web/src/mocks/data/`):**
- `courses.mock.ts` — 10 cursos (2 por cada una de las 5 categorías), con distribución deliberada de `status`, `modality` y `level`; 5 cursos con `originalPrice` (precio tachado).
- `instructors.mock.ts` — 8 docentes, reutilizados entre cursos afines.
- `users.mock.ts` — 1 admin + 3 students.
- `sales.mock.ts` — `mockSalesReport`: `breakdown` es **exhaustivo** (cubre los 6 cursos `published` con ventas) y sus sumas de `salesCount`/`revenue` coinciden exactamente con `kpis.totalSales` (1284) y `kpis.totalRevenue` (S/ 45,290); a su vez coherente con el `trend` de 4 semanas. La relación queda documentada con comentarios en el propio archivo.
- `leads.mock.ts` — 5 leads de contacto.
- `index.ts` — re-exporta todos los fixtures.

**Services (`apps/web/src/services/`):**
- `courses.service.ts`, `auth.service.ts`, `contact.service.ts` — se agregó la rama mock (controlada por `VITE_USE_MOCKS`) a los services ya existentes, **sin cambiar las firmas** de las funciones que ya consumían la API real.
- `salesService.ts` — nuevo, no existía antes de esta fase; expone `getSalesReport()`.
- Patrón aplicado de forma consistente: la firma pública de cada función es idéntica entre la rama mock y la rama real; apagar `VITE_USE_MOCKS` en Fase 6 no debe requerir tocar ninguna pantalla.

**Control de versiones:**
- Se creó la rama `dev` desde `main` para todo el trabajo de esta fase (sin PR por ahora, al ser una sola persona trabajando en el repo).

**Done:** cualquier service puede pedir datos y recibe respuestas realistas con el backend apagado, tipadas contra `@cee/types`.

---

### Fase 2 — Layout y navegación *(desbloquea a todo el equipo)*
**Objetivo:** dejar el cascarón donde cada quien monta su página.

- `Layout` (Navbar + `<Outlet/>` + Footer).
- `Navbar`: logo rojo, links desktop, badge de carrito (`cartStore`), botón sesión (`authStore`), sticky.
- `MobileMenu`: menú hamburguesa responsive.
- `Footer`: navegación, contacto, copyright dinámico.
- Router con `lazy()` + `<Suspense>` funcionando para todas las rutas.

**Done cuando:** se navega entre páginas placeholder dentro del layout, en desktop y mobile.

---

### Fase 3 — Páginas públicas *(trabajo en paralelo)*
**Objetivo:** construir el sitio público con datos mock.

Frentes de trabajo (asignar entre el equipo de IDI):

| # | Entregable | Detalle |
|---|-----------|---------|
| 1 | **Home + CourseCard** | Hero, catálogo con filtro por categoría, tarjeta con precio tachado y botón "Añadir" |
| 2 | **Catálogo** | Filtros (categoría/modalidad), búsqueda, paginación |
| 3 | **Detalle de curso** | Breadcrumb, perfil del egresado, sílabo en acordeón, plana docente, sidebar precio + carrito + descargar sílabo |
| 4 | **Nosotros + Multimedia** | Sección institucional; videos con lazy load / CDN (requisito de rendimiento) |
| 5 | **Contacto + Auth** | Formulario con validación anti-spam (`contactService`); login/register en layout split |

**Done cuando:** las páginas renderizan con datos mock, responsive, sin errores de consola.

> **Nota de consistencia (de Fase 1):** los componentes que muestren `rating` deben tener en cuenta que los cursos en `draft`/`review` tienen `rating: 0` por regla de negocio (no hay calificaciones de cursos que nunca se publicaron). Si "0 estrellas" se ve confuso en la UI junto a "sin calificaciones aún", evaluar en este punto si conviene migrar `rating` a `number | null` en `@cee/types` — quedó pendiente deliberadamente en Fase 1 por simplicidad.

---

### Fase 4 — Carrito y flujo de conversión
**Objetivo:** cablear el embudo de captación.

- `cartStore`: `addItem` (sin duplicados), `removeItem`, `clear`, `total()`.
- Badge de cantidad en Navbar.
- Drawer/página de carrito.
- Checkout **mock**: el flujo termina en registro/contacto.

> ⚠️ **Fuera de alcance:** pasarelas de pago y facturación ERP (definido en el Plan de Trabajo). No implementar pago real en esta etapa.

---

### Fase 5 — Panel administrativo (tipo CMS) *(paralelo a Fases 3–4)*
**Objetivo:** backoffice para que el CEE gestione su contenido de forma autónoma, sin tocar código.

> ⚠️ **Decisión pendiente:** el esqueleto tiene páginas admin dentro de `apps/web` **y** una app separada `apps/admin`. Elegir una. **Recomendación:** backoffice real en `apps/admin` (permisos y deploy separados); `web` queda solo para público.

Entregables:
- **Dashboard** (vista principal).
- **Gestión de Cursos** (CRUD con badges de estado: Publicado / Borrador / En Revisión).
- **Registrar / Editar curso**: formulario con Moodle Course ID y subida de sílabo (PDF).
- **Ventas**: KPIs (Total Ventas, Ingresos, Tasa de Conversión) + gráfico de tendencia con `recharts` + desglose por curso.

Todo bajo `ProtectedRoute requiredRole="admin"`.

> **Nota de consistencia (de Fase 1):** la pantalla de Gestión de Cursos debe respetar el flujo unidireccional `Borrador → En Revisión → Publicado` definido en Fase 1 — la UI no debería permitir que un curso ya `Publicado` regrese a `Borrador`/`En Revisión`. Si el negocio decide que sí necesita "despublicar" un curso para editarlo, esa es una regla nueva que hay que decidir explícitamente y propagar de vuelta a los fixtures y a `@cee/types` (no asumir que ya está cubierta).

> **Nota de consistencia (de Fase 1):** el reporte de Ventas debe mantener la misma invariante que `sales.mock.ts`: si el desglose por curso es exhaustivo, sus sumas deben coincidir exactamente con los KPIs agregados; si en algún momento se vuelve un top parcial, hay que documentarlo igual que se hizo en el mock para que no se lea como inconsistencia de datos.

---

### Fase 6 — Integración con backend real
**Objetivo:** conectar con la API.

- Apagar mocks (`VITE_USE_MOCKS=false`).
- Flujo JWT completo: login → token en `localStorage` (vía `authStore`) → interceptor request → manejo de 401 con redirect a login.
- Enlace real con Moodle por `moodleCourseId`.
- Validar que `@cee/types` coincide 1:1 con las respuestas reales.

**Done cuando:** las pantallas consumen la API real sin cambios de UI.

> **Punto crítico heredado de Fase 1:** los `// TODO(backend): confirmar contrato` dejados en `packages/types/src/index.ts` (sobre todo en `moodleCourseId` y en los valores de los enums de estado/modalidad) deben revisarse y cerrarse explícitamente con el equipo de backend antes de apagar `VITE_USE_MOCKS`. Si el backend devuelve los enums en un idioma o casing distinto al que el frontend fijó en Fase 1, hay que decidir conscientemente quién se adapta a quién — no asumir que coinciden.

---

### Fase 7 — Pulido y entrega
**Objetivo:** cumplir los indicadores de éxito del proyecto.

- **Responsive** verificado en móvil, tablet y escritorio (indicador de éxito).
- **Multimedia:** lazy loading / CDN para que los videos no penalicen la carga.
- **SEO / meta tags** y accesibilidad básica.
- **QA:** pruebas del formulario de contacto (captura + notificación al correo del CEE, sin pérdida de datos).
- **Deploy** y capacitación al personal del CEE (autonomía de gestión).

---

## 4. Decisiones abiertas (qué hay que definir y por qué)

Cosas que aún no están resueltas y conviene cerrar pronto:

**A. Confirmar el stack de backend (NestJS + TypeORM).**
El equipo de backend todavía no cierra con qué tecnología trabajará; IDI recomienda NestJS + TypeORM. Importa para el frontend porque: si el backend es TypeScript (NestJS), se puede compartir `@cee/types` y los tipos nunca se desincronizan; con otra tecnología, eso ya no se puede.
→ *Confirmar con el equipo de backend.*

**B. Dónde vive el panel admin.**
El esqueleto creó pantallas de admin en DOS lugares: dentro de `apps/web` y también como app aparte `apps/admin`. Hay que elegir uno solo para no construir lo mismo dos veces. Recomendación: en `apps/admin` (separado del público).
→ *Decidir antes de la Fase 5.*

**C. "Especializaciones" en el menú.**
El menú propuesto lista "Especializaciones" como sección aparte, pero en las rutas actuales solo existe "Programas". Definir si es una página propia o un filtro dentro de Programas, para que el navbar y las rutas coincidan.
→ *Decidir en Fase 2/3.*

**D. Cerrar el "contrato de datos" con backend (lo más importante).**
Es ponerse de acuerdo en la forma exacta de los datos que viajan entre frontend y backend: nombres de campos y tipos. Hoy `@cee/types` dice qué espera el frontend; el backend debe devolver exactamente eso. Si no coinciden (ej. backend manda `course_name` y el frontend espera `title`), todo se rompe al integrar.

Puntos específicos que Fase 1 dejó marcados con `// TODO(backend)` y que hay que cerrar con el equipo de backend antes de Fase 6:
- Idioma/casing de `CourseStatus` (`'draft' | 'review' | 'published'`, en inglés) y de `CourseModality`/`CourseCategory` (en español) — el frontend fijó una convención mixta por decisión propia; el backend debe alinearse a ella o el equipo debe acordar un cambio conjunto.
- Tipo de `moodleCourseId` (`number | null`) — confirmar que la integración real con Moodle en Fase 6 entrega un ID numérico y no un string.
→ *Acordar y congelar los tipos juntos antes de la Fase 6.*

**E. ¿Un curso publicado puede "despublicarse" o volver a revisión?**
Fase 1 asumió que el ciclo `Borrador → En Revisión → Publicado` es unidireccional (un curso publicado nunca regresa a un estado anterior), lo cual implica que todo curso en `draft`/`review` tiene cero inscritos y cero calificaciones. Si el negocio necesita en algún momento "pausar" o "despublicar" un curso ya activo (por ejemplo, para actualizarlo sin perder su historial de alumnos), esa es una regla nueva no contemplada — afecta el modelo de estados, los fixtures y posiblemente requiere un estado adicional (distinto de `draft`/`review`) que preserve `enrolledCount` e historial de ventas.
→ *Decidir antes de Fase 5 (Gestión de Cursos), porque cambia el diseño del CRUD admin.*

**F. ¿`rating: 0` es suficiente o se necesita `number | null`?**
Fase 1 dejó `rating` como `number` simple (sin `null`) por simplicidad, usando `0` tanto para "nunca calificado" como valor por defecto. Si en Fase 3 la UI muestra esto como "0 estrellas" de forma confusa (indistinguible de una mala calificación real), se debe decidir si vale la pena el cambio de tipo.
→ *Revisar en Fase 3, al construir `CourseCard` y el detalle de curso.*

---

## 5. Reglas del repositorio (recordatorio para todo el equipo)

- Solo **pnpm** (no npm/yarn).
- No editar `components/ui/` a mano (es de shadcn).
- No usar `localStorage` directo fuera de `authStore` (clave `cee_token`).
- El alias `@/` debe funcionar en Vite **y** TypeScript (mapea a `apps/web/src/`).
- Todos los tipos compartidos se importan de `@cee/types`, nunca se redefinen localmente.
- Toda función de `services/*.service.ts` debe tener **la misma firma** en su rama mock y su rama real — apagar `VITE_USE_MOCKS` nunca debe obligar a cambiar cómo una pantalla llama al service.

---

## 6. Convenciones de datos cerradas en Fase 1 (referencia rápida)

| Tipo / campo | Convención | Nota |
|---|---|---|
| `CourseStatus` | Inglés: `'draft' \| 'review' \| 'published'` | Decisión explícita; no se alinea al español de `category`/`modality` |
| `CourseModality`, `CourseCategory` | Español, con mayúscula inicial (ej. `'Virtual'`, `'Gestión'`) | — |
| Ciclo de vida del curso | `Borrador → En Revisión → Publicado`, unidireccional | Ver decisión abierta E si esto cambia |
| `enrolledCount` / `rating` en `draft`/`review` | Siempre `0` | Consecuencia directa de la regla anterior |
| `Sale` (transaccional) vs. `SalesReport` (agregado) | Tipos separados | `Sale` incluye `userId`/`status` para soportar futuro historial de compras por usuario |
| `sales.mock.ts` → `breakdown` | Exhaustivo (no es un "top N") | Sus sumas igualan `kpis.totalSales`/`totalRevenue` exactamente; documentado en el propio archivo |
| `moodleCourseId` | `number \| null` | Pendiente de confirmar con backend (ver decisión abierta D) |
| Imágenes de mocks | `picsum.photos/seed/<slug>/...` o locales | Decisión de cada equipo; no bloqueante para Fase 1 |
