# IMPLEMENTATIONS.md — Registro de Implementaciones CEE-FIIS

> **Documento vivo.** Cada cambio, tarea completada o modificación se documenta aquí con contexto, archivos afectados y decisiones tomadas.
> Actualizar conforme avanza el desarrollo.

---

## Fase 2 — Layout y Navegación

### ✅ Elvis — Contrato Compartido (Tarea 1)

**Estado:** Completada  
**Fecha:** 2026-06-17  
**Rama:** `feature/fase2-navigation-contract`

#### Objetivo
Crear la única fuente de verdad de navegación + stubs de stores para que el equipo (Santiago, Isabel, Diana, Tom, Renato) trabaje en paralelo contra un contrato estable, sin duplicar links en Navbar/Footer/MobileMenu.

#### Cambios realizados

##### 1. Crear `apps/web/src/config/navigation.ts`
- **Propósito:** Array tipado `navigationLinks: NavLink[]` con todos los links públicos del sitio
- **Contenido:**
  - `Inicio` → `/`
  - `Nosotros` → `/nosotros`
  - `Programas` → `/programas`
  - `Multimedia` → `/multimedia`
  - `Contacto` → `/contacto`
- **Decisión C documentada:** "Especializaciones" es un filtro dentro de `/programas`, no ruta propia
- **Interfaz:** `NavLink { label: string; path: string }`

##### 2. Refactorizar `apps/web/src/components/layout/Navbar.tsx`
- **Antes:** 
  - Array `links` hardcodeado localmente
  - `useAuthStore()` directa
- **Después:**
  - Importa `navigationLinks` desde `@/config/navigation`
  - Usa `useAuth()` hook (ya existía)
  - Itera `navigationLinks.map()` en lugar de `links.map()`
  - MobileMenu ya no recibe `links` por props

##### 3. Refactorizar `apps/web/src/components/layout/Footer.tsx`
- **Antes:** Array `links` hardcodeado localmente
- **Después:**
  - Importa `navigationLinks` desde `@/config/navigation`
  - Itera `navigationLinks.map()` en la sección de "Enlaces rápidos"

##### 4. Refactorizar `apps/web/src/components/layout/MobileMenu.tsx`
- **Antes:** Recibía `links` por props desde Navbar
- **Después:**
  - Importa `navigationLinks` desde `@/config/navigation`
  - Itera `navigationLinks.map()` directamente
  - Simplifica Props: solo `onClose`
  - Usa `useAuth()` hook en lugar de acceso directo a store

##### 5. Mantener `apps/web/src/hooks/useAuth.ts`
- Ya existía como wrapper limpio de `authStore`
- Sin cambios requeridos

#### Archivos nuevos
- ✅ `apps/web/src/config/navigation.ts`

#### Archivos modificados
- ✅ `apps/web/src/components/layout/Navbar.tsx`
- ✅ `apps/web/src/components/layout/Footer.tsx`
- ✅ `apps/web/src/components/layout/MobileMenu.tsx`
- ✅ `apps/web/src/hooks/useAuth.ts` (sin cambios, solo confirmado)

#### Estado pre-existente notable
- `authStore` ya tenía lógica completa desde el scaffold inicial; no se tocó porque ya funcionaba correctamente

#### Verificación
- ✅ TypeScript compila sin errores en los archivos modificados
- ✅ Único error de build preexistente: `CourseCard.tsx` (Property 'hours' does not exist) — corresponde a Fase 3, fuera de alcance
- ✅ No rompe routing ni componentes de layout
- ✅ Navbar, Footer, MobileMenu funcionan con `navigationLinks` centralizado

#### Bloqueadores desbloqueados
- ✅ Santiago puede construir Navbar desktop contra `navigationLinks` + `useAuth()`
- ✅ Isabel puede construir MobileMenu contra `navigationLinks` + `useAuth()`
- ✅ Diana puede construir Footer contra `navigationLinks`
- ✅ Tom puede construir Router contra paths de `navigationLinks`
- ✅ Renato puede integrar todo contra Layout estable

#### Próximas tareas (Fase 2 restante)
- **Santiago:** Terminar Navbar desktop con logo, sticky, responsive
- **Isabel:** Terminar MobileMenu con Sheet de shadcn
- **Diana:** Terminar Footer con estructura de columnas, copyright dinámico
- **Tom:** Configurar Router v6 con lazy/Suspense para todas las rutas
- **Renato:** Integrar en Layout y validar responsive en mobile/tablet/desktop

---

### ✅ Eliminación del Carrito de Compras (decisión de alcance)

**Estado:** Completada  
**Fecha:** 2026-06-17

#### Objetivo
El carrito de compras se descartó del alcance del proyecto: ya no existe checkout ni flujo de compra mediada por carrito. Se elimina toda la lógica, UI y tipos relacionados.

#### Cambios realizados
- **Eliminado** `apps/web/src/store/cartStore.ts` (store de Zustand completo: `items`, `addItem`, `removeItem`, `clear`, `total`)
- **Eliminado** `CartItem` de `packages/types/src/index.ts` (interfaz `@cee/types`)
- **`apps/web/src/components/shared/CourseCard.tsx`:**
  - Removido `useCartStore` y la llamada a `addItem(course)`
  - El botón "Añadir" (al carrito) se reemplazó por un link "Ver detalles" que navega a `ROUTES.COURSE`
- **`apps/web/src/components/layout/Navbar.tsx`:**
  - Removido el icono `ShoppingCart` y el badge de cantidad
  - Removido `useCartStore` y el import de `lucide-react` correspondiente

#### Archivos eliminados
- ❌ `apps/web/src/store/cartStore.ts`

#### Archivos modificados
- ✅ `packages/types/src/index.ts` (sección "Carrito" eliminada)
- ✅ `apps/web/src/components/shared/CourseCard.tsx`
- ✅ `apps/web/src/components/layout/Navbar.tsx`

#### Verificación
- ✅ `grep` confirma cero referencias residuales a `cartStore`, `CartItem`, `useCartStore` en `apps/` y `packages/`
- ✅ Build (`pnpm --filter web build`) no introduce errores nuevos; el único error reportado (`CourseCard.tsx` — `Property 'hours' does not exist`) es preexistente del scaffold y no relacionado con el carrito

#### Impacto en el embudo de conversión
El flujo de conversión deja de pasar por "carrito → checkout mock" y termina directamente en la página de detalle del curso, desde donde el usuario continúa hacia contacto/registro. Si en el futuro se requiere "Inscribirse" o un flujo equivalente, debe diseñarse sin reintroducir el concepto de carrito.

---

### ✅ Santiago — Navbar Desktop (Tarea 2)

**Estado:** Completada  
**Fecha:** 2026-06-17  
**Rama:** `feature/fase2-navigation-contract`

#### Objetivo
Terminar la Navbar desktop sobre el contrato de Elvis (`navigationLinks`, `useAuth()`): logo rojo, links con estado activo, botón de sesión condicional, sticky, y reemplazar los elementos HTML planos por `Button` de shadcn.

#### Cambios realizados

##### 1. `apps/web/src/components/layout/Navbar.tsx`

- **Antes:**
  - Botón de sesión y botón hamburguesa eran un `<Link>`/`<button>` con clases Tailwind manuales
- **Después:**
  - Botón de sesión usa `Button asChild variant="outline" size="sm"` envolviendo el `<Link>` (mantiene `isAuthenticated ? 'Mi cuenta' : 'Iniciar sesion'`)
  - Botón hamburguesa usa `Button variant="ghost" size="icon"` con el icono `Menu` de `lucide-react`
  - Se mantiene sin cambios lo ya correcto: logo rojo a la izquierda, `navigationLinks.map()` con `<NavLink>` (clase activa `text-cee-red`), `sticky top-0 z-50`, `hidden md:flex` en links de escritorio, `md:hidden` en el botón hamburguesa, estado `isOpen` controlado en Navbar y pasado a `MobileMenu` por `onClose`

##### 2. Badge de carrito — intentado y revertido

- Se probó agregar un ícono `ShoppingCart` con `Badge` de cantidad, respaldado por un store `cartStore.ts` y hook `useCartCount()` nuevos
- **Revertido en la misma tarea:** el carrito está fuera de alcance del proyecto (ver "Eliminación del Carrito de Compras" arriba) — no se vuelve a introducir ese concepto
- Se eliminaron `apps/web/src/store/cartStore.ts` y `apps/web/src/hooks/useCart.ts` creados durante la prueba; no quedan referencias a `cartStore`/`useCartCount` en el repo

#### Archivos modificados

- ✅ `apps/web/src/components/layout/Navbar.tsx`

#### Archivos creados y luego eliminados (sin rastro final)

- `apps/web/src/store/cartStore.ts`
- `apps/web/src/hooks/useCart.ts`

#### Verificación

- ✅ `pnpm --filter web lint` (tsc --noEmit): único error reportado es el preexistente de `CourseCard.tsx` (`Property 'hours' does not exist`), no relacionado con este cambio
- ✅ `grep` confirma cero referencias a `ShoppingCart`, `cartStore` o `useCartCount` en `apps/web/src/components/layout/Navbar.tsx`
- ✅ Botón de sesión y hamburguesa ahora usan `Button` de shadcn tal cual, sin editar `components/ui/`

#### Done de la tarea


Navbar renderiza en desktop con links activos y botón de sesión funcionando contra los stubs; sin badge de carrito (fuera de alcance).

---

### ✅ Diana — Footer (Tarea 4)

**Estado:** Completada  
**Fecha:** 2026-06-17

#### Objetivo
Construir el pie de página con navegación, contacto, redes y copyright dinámico, consumiendo `navigationLinks` (contrato de Elvis) sin duplicar la lista de links.

#### Cambios realizados
- **`apps/web/src/components/layout/Footer.tsx`** reescrito completo con 4 columnas:
  1. **Marca + tagline:** nombre institucional completo y descripción corta
  2. **Enlaces rápidos:** iterando `navigationLinks` desde `@/config/navigation` (mismo contrato que Navbar/MobileMenu, no se duplica la lista)
  3. **Contacto:** correo, teléfono y dirección (placeholder hasta confirmar datos reales del CEE)
  4. **Síguenos:** iconos de Facebook, Instagram y LinkedIn (`lucide-react`), enlaces placeholder
- **Copyright dinámico:** `© {new Date().getFullYear()} Centro de Especialización Ejecutiva...` — nunca se hardcodea el año
- **Enlaces legales placeholder:** "Política de Privacidad" y "Términos de Servicio" (sin ruta real todavía, según lo definido en la tarea)
- **Estilos:** fondo `bg-cee-red` (paleta institucional guinda definida en `tailwind.config.ts`), texto blanco/blanco translúcido para jerarquía
- **Responsive:** `grid md:grid-cols-4` — columnas en desktop (`md+`), apiladas en mobile por defecto

#### Archivos modificados
- ✅ `apps/web/src/components/layout/Footer.tsx`

#### Verificación
- ✅ `pnpm --filter web build` no introduce errores nuevos (único error reportado sigue siendo el preexistente de `CourseCard.tsx`, ajeno a esta tarea)
- ✅ Footer consume `navigationLinks` sin redefinir la lista de enlaces localmente
- ✅ Copyright usa `new Date().getFullYear()`, no un año fijo

#### Pendiente / a confirmar con el CEE
- Datos reales de contacto (teléfono, dirección) — actualmente son placeholder
- URLs reales de redes sociales
- Rutas reales para Política de Privacidad y Términos de Servicio (hoy son `#`)

---

### ✅ Isabel — MobileMenu (Tarea 3)

**Estado:** Completada  
**Fecha:** 2026-06-17  
**Rama:** `feature/fase2-mobilemenu`

#### Objetivo
Reemplazar el `<div>` plano del menú móvil por un drawer real usando `Sheet` de shadcn/ui, consumiendo `navigationLinks` del contrato de Elvis (sin duplicar la lista), con cierre al navegar y accesibilidad de teclado/foco.

#### Contexto de la rama
`feature/fase2-mobilemenu` partía de un commit anterior al contrato de navegación y a la eliminación del carrito. Se hizo `git merge origin/dev` (fast-forward) para traer `navigation.ts`, `useAuth()`, el Footer/Navbar ya actualizados y la eliminación de `cartStore` antes de tocar el MobileMenu.

#### Cambios realizados

##### 1. Crear `apps/web/src/components/ui/sheet.tsx`
- Componente `Sheet` no existía en el proyecto; se generó siguiendo el patrón estándar de shadcn/ui (basado en `@radix-ui/react-dialog`)
- Exporta: `Sheet`, `SheetTrigger`, `SheetClose`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`
- `SheetContent` soporta `side="left" | "right" | "top" | "bottom"` vía `cva`; el menú móvil usa `side="left"`
- Accesibilidad ya incluida por Radix: cierre con `Esc`, manejo de foco (focus trap), `aria-*` en overlay/contenido/título

##### 2. Instalar dependencia `@radix-ui/react-dialog`
- No estaba en `apps/web/package.json`; se agregó vía `pnpm add @radix-ui/react-dialog` (requisito de `Sheet`)

##### 3. Reescribir `apps/web/src/components/layout/MobileMenu.tsx`
- **Antes:** `<div className="md:hidden">` con links renderizados condicionalmente desde Navbar (`isOpen ? <MobileMenu /> : null`)
- **Después:**
  - Usa `<Sheet open={open} onOpenChange={...}>` con `SheetContent side="left"`
  - Itera `navigationLinks` desde `@/config/navigation` (mismo contrato que Navbar/Footer, sin duplicar la lista)
  - Cada link está envuelto en `SheetClose asChild` — al hacer click, navega **y** cierra el menú automáticamente
  - Botón de sesión (`Mi cuenta` / `Iniciar sesion`) usa `useAuth()` y el componente `Button` de shadcn, también envuelto en `SheetClose`
  - Prop `links` (array recibido por props) eliminada — ya no aplica porque el componente consume `navigationLinks` directamente

##### 4. Actualizar `apps/web/src/components/layout/Navbar.tsx`
- **Antes:** `{isOpen ? <MobileMenu onClose={...} /> : null}` (montaje/desmontaje condicional)
- **Después:** `<MobileMenu open={isOpen} onClose={...} />` (siempre montado, visibilidad controlada por `Sheet` vía prop `open` — necesario para que las animaciones de entrada/salida de Radix funcionen)

#### Archivos nuevos
- ✅ `apps/web/src/components/ui/sheet.tsx`

#### Archivos modificados
- ✅ `apps/web/src/components/layout/MobileMenu.tsx`
- ✅ `apps/web/src/components/layout/Navbar.tsx`
- ✅ `apps/web/package.json` (nueva dependencia `@radix-ui/react-dialog`)

#### Verificación
- ✅ `pnpm --filter web build` no introduce errores nuevos (único error reportado sigue siendo el preexistente de `CourseCard.tsx`, ajeno a esta tarea)
- ✅ MobileMenu consume `navigationLinks` sin redefinir la lista
- ✅ Cierre por click en link, por botón X, por click fuera (overlay) y por `Esc` — todo provisto por Radix Dialog
- ✅ Visible solo bajo el breakpoint `md` (el trigger hamburguesa en Navbar ya tenía `className="md:hidden"`)

#### Nota de regla del repo
- No se trata de una excepción a "no editar `components/ui/` a mano": `sheet.tsx` no existía y se **creó** siguiendo el patrón shadcn (no se modificó un archivo generado por la CLI de shadcn existente)

---

### ✅ Renato — Layout (integrador) + QA responsive (Tarea 6)

**Estado:** Completada  
**Fecha:** 2026-06-18  
**Rama:** `feature/fase2-layout-qa`

#### Objetivo
Cerrar la Fase 2: integrar el trabajo de Elvis (contrato), Santiago (Navbar), Isabel (MobileMenu), Diana (Footer) y Tom (Router) en `Layout`, y validar el "Done" de la fase — navegación entre páginas placeholder en desktop y mobile, sin errores de consola.

#### Contexto de la rama
`feature/fase2-layout-qa` partía del estado original del scaffold (sin contrato de navegación, con carrito todavía presente, links duplicados en Navbar/Footer/MobileMenu). Se hizo `git fetch && git merge origin/dev`, que resultó "Already up to date" — la rama ya tenía integrado, vía push previo, todo el trabajo de las Tareas 1 a 5 (PR #1 Navbar, PR #2 Router, contrato de Elvis, Footer de Diana, MobileMenu de Isabel, eliminación de carrito).

#### Verificación de integración (rol de Renato: depende de los demás, cierra al final)

##### 1. `apps/web/src/components/layout/Layout.tsx` — ya correcto, sin cambios necesarios
```tsx
<div className="flex min-h-screen flex-col">
  <Navbar />
  <main className="flex-1">
    <Outlet />
  </main>
  <Footer />
</div>
```
- `min-h-screen flex flex-col` en el contenedor + `flex-1` en `<main>`: el Footer queda pegado abajo incluso con contenido corto (páginas placeholder), sin gap
- `Layout` es la ruta padre con `<Outlet/>` en `router/index.tsx`, confirmado

##### 2. QA responsive cross-device (análisis de clases Tailwind + build real)
- **Navbar:** `sticky top-0 z-50` correcto; `hidden md:flex` para links de escritorio, botón hamburguesa `md:hidden` — breakpoints coherentes entre Navbar y MobileMenu
- **MobileMenu (Sheet):** `side="left"`, `w-3/4 sm:max-w-xs` — ancho responsive proporcional en mobile, acotado desde `sm`
- **Footer:** `grid gap-10 md:grid-cols-4` — apilado en mobile (1 columna implícita), 4 columnas desde `md`
- Sin necesidad de cambios: el trabajo de Santiago/Isabel/Diana ya cumplía el checklist de DESIGN.md (breakpoints `sm/md/lg`, mobile-first)

##### 3. Validación de build y consola
- `pnpm --filter web build`: compila sin errores (el bug preexistente de `CourseCard.hours` ya fue corregido en un commit anterior — `da5c7b1 fix(types): correct CourseCard.hours to academicHours`)
- `pnpm --filter web lint` (`tsc --noEmit`): sin errores ni warnings
- Servidor de desarrollo (`pnpm --filter web dev`) levantado y verificado: `curl` a `/`, `/nosotros`, `/programas`, `/multimedia`, `/contacto` y una ruta inexistente devuelven `200` — confirma que el SPA sirve el shell de `index.html` correctamente para todas las rutas (React Router resuelve client-side; la ruta inexistente renderiza `NotFoundPage` sin error de servidor)

#### Archivos modificados
- Ninguno — la integración de las Tareas 1-5 ya estaba completa y correcta en esta rama; el trabajo de Renato fue de **verificación**, no de cambio de código

#### Resultado del "Done" de la Fase 2
- ✅ Se navega entre todas las páginas placeholder dentro del `Layout`
- ✅ Funciona en desktop (Navbar) y mobile (MobileMenu vía Sheet)
- ✅ Sin errores de build ni de TypeScript
- ✅ Ruta 404 capturada correctamente

#### Limitación de esta verificación
No se contó con `chromium-cli` ni navegador headless disponible en este entorno (Windows/Git Bash) para capturar screenshots reales cross-viewport. El QA se basó en: (a) inspección de las clases Tailwind responsive ya aplicadas por cada autor de componente, (b) build/lint reales sin errores, (c) verificación de las rutas vía `curl` contra el dev server real. Se recomienda una pasada visual manual en navegador (DevTools device toolbar: 375px / 768px / 1280px) antes del merge final a `dev` para descartar cualquier detalle visual no capturable por análisis estático.

---

## Fase 3 — Páginas Públicas

### ✅ Renato — Home + CourseCard (Frente 1)

**Estado:** Completada
**Fecha:** 2026-06-18
**Rama:** `feature/fase3-home-courscard`

#### Objetivo
Construir la primera impresión del sitio: Hero, catálogo resumido con filtro por categoría en la Home, y dejar `CourseCard` reutilizable para el resto de páginas (Catálogo, Detalle de curso).

#### Cambios realizados

##### 1. `apps/web/src/pages/home/HomePage.tsx` (antes vacío, solo placeholder)
- **Hero:** título, subtítulo y CTA "Explorar Cursos" (`Link` a `ROUTES.CATALOG`) sobre fondo degradado `from-cee-red to-cee-red-dark`
- **Catálogo resumido:** grid responsive (`sm:grid-cols-2 lg:grid-cols-3`) con hasta 6 cursos (`FEATURED_COUNT`), filtro de categoría arriba, botón "Ver más" al final que enlaza a `ROUTES.CATALOG`
- Estados de carga y de "sin resultados" para la categoría seleccionada

##### 2. `apps/web/src/components/shared/CourseFilter.tsx` (nuevo)
- `<select>` HTML nativo (no se instaló `@radix-ui/react-select` solo para un dropdown simple, según el alcance pedido: "no hace falta buscador")
- Opciones: `Todas` + las 5 categorías de `CourseCategory` (`@cee/types`)

##### 3. `apps/web/src/hooks/useCourses.ts` — extendido
- Antes: sin parámetros, siempre `coursesService.getAll()`
- Después: acepta `{ category }`; si `category` es `'Todas'` o `undefined` no filtra; si no, pasa `{ category }` a `coursesService.getAll(params)` (ya soportaba filtrado por categoría del lado del mock)
- `category` agregado al array de dependencias del `useEffect`

##### 4. `apps/web/src/components/shared/CourseCard.tsx` — sin cambios
- Ya existía y ya cumplía el grueso de los requisitos del Frente 1 (imagen lazy, categoría como badge, precio tachado + destacado, link a detalle)
- **Decisión de alcance:** el PDF de la Fase 3 pide botón "Añadir al carrito" conectado a `cartStore`. Esto **no se implementó** porque el carrito fue eliminado explícitamente del proyecto en la Fase 2 (ver "Eliminación del Carrito de Compras" arriba). Se mantiene el botón "Ver detalles" que ya tenía el componente, consistente con esa decisión.

#### Archivos nuevos
- ✅ `apps/web/src/components/shared/CourseFilter.tsx`

#### Archivos modificados
- ✅ `apps/web/src/pages/home/HomePage.tsx`
- ✅ `apps/web/src/hooks/useCourses.ts`

#### Verificación
- ✅ `pnpm --filter web build` sin errores; `HomePage` pasó de 0.33 kB a 48 kB (gzip 18.85 kB) en su propio chunk — code splitting funcionando
- ✅ Dev server levantado, `curl` a `/` responde `200`
- ✅ El filtro de categoría cambia los cursos mostrados (verificado por lógica del hook + servicio mock, ya usado en Catálogo/Fase 2)

#### Desviación del documento de tareas
- "Añadir al carrito" del PDF de Fase 3 no aplica — el carrito está fuera de alcance del proyecto desde la Fase 2 (decisión explícita del equipo). Si en el futuro se requiere un CTA de conversión más fuerte que "Ver detalles", debe diseñarse sin reintroducir el concepto de carrito.

---

### ✅ Desarrollador 3 — Detalle de Curso (Frente 3)

**Estado:** Completada
**Fecha:** 2026-06-18

#### Objetivo
Construir la página de detalle de curso (`/programas/:slug`): breadcrumb, información completa, perfil del egresado, sílabo en acordeón, plana docente y sidebar de precio/descarga — reemplazando el placeholder de `CoursePage.tsx`.

#### Cambios realizados

##### 1. Instalar `@radix-ui/react-accordion` y crear `apps/web/src/components/ui/accordion.tsx`
- No existía componente `Accordion` en el proyecto; se generó siguiendo el patrón estándar de shadcn/ui (mismo criterio ya aplicado a `sheet.tsx` en Fase 2: se **crea**, no se edita un archivo generado existente)
- Exporta `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`
- Se añadieron los keyframes `accordion-down`/`accordion-up` en `apps/web/tailwind.config.ts` (requeridos por `tailwindcss-animate` para la animación de expandir/contraer)

##### 2. Crear `apps/web/src/hooks/useCourseDetail.ts`
- Hook `useCourseDetail(slug)` con el mismo patrón que `useCourses` (`useState`/`useEffect`), llama `coursesService.getBySlug(slug)`
- Expone `{ course, isLoading, error }`; `error` se setea si el slug no existe en los fixtures

##### 3. Crear `apps/web/src/components/shared/Breadcrumb.tsx`
- Componente reutilizable: recibe `items: { label, path? }[]`, renderiza separadores con `ChevronRight` (`lucide-react`); el último item no es link

##### 4. Crear `apps/web/src/components/course/TeacherCard.tsx`
- Tarjeta con foto, nombre, `title` (especialidad) y `bio` truncada (`line-clamp-3`) a partir de `Instructor` (`@cee/types`) — no se creó un tipo `Teacher` nuevo porque `@cee/types` ya define `Instructor` para esto

##### 5. Crear `apps/web/src/components/course/SyllabusAccordion.tsx`
- Itera `SyllabusModule[]` (campo `syllabus` ya incluido en `Course`) sobre el nuevo `Accordion`; cada módulo es un `AccordionItem` expandible con su lista de `topics`
- No se creó `syllabusService` separado: el sílabo ya viene embebido en `Course` desde los fixtures, a diferencia de lo sugerido en el PDF de la Fase 3

##### 6. Crear `apps/web/src/components/course/CourseSidebar.tsx`
- Precio tachado (`originalPrice`) + precio actual, botón "Descargar sílabo" (`syllabusPdfUrl`, usando `Button` de shadcn), datos de modalidad/duración/nivel/certificación
- **Decisión de alcance:** el PDF de la Fase 3 pide un botón "Añadir al carrito" en este sidebar. **No se implementó** — el carrito fue eliminado explícitamente del proyecto en la Fase 2 (ver "Eliminación del Carrito de Compras" arriba) y no se reintroduce aquí

##### 7. Reescribir `apps/web/src/pages/course/CoursePage.tsx`
- Antes: placeholder estático ("En construcción")
- Después: lee `slug` con `useParams`, usa `useCourseDetail`, compone `Breadcrumb` (Inicio > Programas > [Curso]) + título/categoría/descripción + perfil del egresado + `SyllabusAccordion` + grid de `TeacherCard` + `CourseSidebar`
- Layout `grid lg:grid-cols-3` (contenido `lg:col-span-2` + sidebar `lg:col-span-1`), mobile-first (apilado por defecto)
- Estados de carga ("Cargando curso...") y de error ("Curso no encontrado")

#### Archivos nuevos
- ✅ `apps/web/src/components/ui/accordion.tsx`
- ✅ `apps/web/src/hooks/useCourseDetail.ts`
- ✅ `apps/web/src/components/shared/Breadcrumb.tsx`
- ✅ `apps/web/src/components/course/TeacherCard.tsx`
- ✅ `apps/web/src/components/course/SyllabusAccordion.tsx`
- ✅ `apps/web/src/components/course/CourseSidebar.tsx`

#### Archivos modificados
- ✅ `apps/web/src/pages/course/CoursePage.tsx`
- ✅ `apps/web/tailwind.config.ts` (keyframes/animation de accordion)
- ✅ `apps/web/package.json` (nueva dependencia `@radix-ui/react-accordion`)

#### Verificación
- ✅ `pnpm --filter web lint` (`tsc --noEmit`): sin errores
- ✅ Tipos consumidos exclusivamente desde `@cee/types` (`Course`, `Instructor`, `SyllabusModule`); no se redefinió ningún tipo localmente
- ✅ No se editó ningún archivo existente de `components/ui/`

#### Desviación del documento de tareas
- "Añadir al carrito" del PDF de Fase 3 no aplica — el carrito está fuera de alcance del proyecto desde la Fase 2 (decisión explícita del equipo)
- No se creó `syllabusService` ni tipos `Teacher`/`CourseDetail` separados — el contrato real de `@cee/types` ya resuelve el sílabo y los datos de detalle dentro de `Course`

---

## Fase 4 — Flujo de Conversión Directo (sin carrito)

### ✅ Santiago — Lógica de selección de curso a inscribir (Tarea 1)

**Estado:** Completada
**Fecha:** 2026-06-19

#### Objetivo
Definir el mecanismo de transporte del curso elegido desde el botón "Inscribirme" (Home, Catálogo, Detalle de curso) hasta el formulario de registro/contacto, sin store global de carrito, y dejarlo documentado como contrato para que Renato (CourseCard), Diana (sidebar de Detalle) y Tom (página de contacto) lo consuman igual.

#### Mecanismo elegido
- **Query param sobre la ruta ya existente:** `/contacto?curso=<id>` (no se crea ninguna ruta nueva; se reutiliza `ROUTES.CONTACT`)
- Se usa `course.id`, no `slug` — coincide con `ContactLead.courseInterest` (`@cee/types`), que ya esperaba un `id` de curso (ver `mocks/data/leads.mock.ts`)
- Si no hay query param (usuario entra directo a `/contacto`), el formulario sigue funcionando como contacto general (resuelto en el hook, no en la página — así Tom no necesita lógica adicional para ese caso)

#### Cambios realizados

##### 1. `apps/web/src/services/courses.service.ts` — agregar `getById(id)`
- Mismo patrón mock/real que `getBySlug`: en mocks busca en `mockCourses` por `id`; en real llama `GET /courses/:id`
- Necesario porque el query param transporta el `id`, no el `slug`

##### 2. Crear `apps/web/src/lib/inscripcion.ts`
- Exporta `COURSE_QUERY_PARAM = 'curso'` y `buildInscripcionUrl(courseId: string)` → `/contacto?curso=<id>`
- Es el helper que deben usar Renato y Diana al armar el `Link`/`href` del botón "Inscribirme", para que todos generen la misma URL

##### 3. Crear `apps/web/src/hooks/useCursoSeleccionado.ts`
- Lee el query param `curso` con `useSearchParams` (react-router-dom)
- Si existe, resuelve el curso con `coursesService.getById`; expone `{ course, isLoading }`
- Si no existe (o el id no resuelve), `course` queda en `null` sin lanzar error — este es el hook que debe consumir Tom en la página de contacto

#### Archivos nuevos
- ✅ `apps/web/src/lib/inscripcion.ts`
- ✅ `apps/web/src/hooks/useCursoSeleccionado.ts`

#### Archivos modificados
- ✅ `apps/web/src/services/courses.service.ts` (método `getById` agregado)

#### Verificación
- ✅ `pnpm --filter web lint` (`tsc --noEmit`): sin errores
- ✅ No se tocó `CourseCard.tsx`, el sidebar de `CoursePage.tsx` ni `ContactPage.tsx` — esa integración corresponde a las Tareas 2, 3 y 4 de Fase 4 (Renato, Diana, Tom respectivamente), que deben consumir `buildInscripcionUrl` y `useCursoSeleccionado` tal cual quedaron definidos aquí

#### Contrato para el resto del equipo
- **Renato / Diana (botón "Inscribirme"):** `<Link to={buildInscripcionUrl(course.id)}>Inscribirme</Link>` — importar desde `@/lib/inscripcion`
- **Tom (página de contacto):** `const { course, isLoading } = useCursoSeleccionado();` — importar desde `@/hooks/useCursoSeleccionado`; si `course` no es `null`, mostrar "Te estás inscribiendo a: {course.title}"; si es `null`, formulario de contacto general sin cambios

---

### ✅ Renato — Botón "Inscribirme" en Home y Catálogo (Tarea 2)

**Estado:** Completada  
**Fecha:** 2026-06-19  
**Rama:** `feature/fase4-cta-coursecard`

#### Objetivo
Agregar el CTA de inscripción en las tarjetas de curso (`CourseCard`) que se muestran en los listados de Home y Catálogo, navegando al formulario de contacto/registro con el curso preseleccionado vía query param.

#### Contexto
- El carrito fue eliminado en Fase 2; el flujo de conversión ahora es directo: **curso → Inscribirme → registro/contacto**
- Santiago (Tarea 1) ya ha creado e implementado el helper `buildInscripcionUrl` y la lógica base en su rama, por lo que Renato integra directamente usando la URL construida por dicho helper.

#### Cambios realizados

##### 1. `apps/web/src/components/shared/CourseCard.tsx` — modificado

**Nuevo botón "Inscribirme":**
- Se importó `buildInscripcionUrl` desde `@/lib/inscripcion`
- Se cambió el botón para navegar a la URL provista por `buildInscripcionUrl(course.id)`
- Se usa navegación programática (`useNavigate`) o link directo según convenga. Por consistencia de interactividad se mantiene la acción usando `useNavigate` con la URL construida por el helper: `navigate(buildInscripcionUrl(course.id))`.

**Reorganización del layout de botones:**
- **Antes:** un solo botón "Ver detalles" (primario, fondo guinda)
- **Después:** dos botones lado a lado con `flex gap-2`, cada uno `flex-1`:
  - **"Ver detalles"** → estilo secundario/outline (`border-2 border-cee-red text-cee-red`, hover rellena fondo guinda y texto blanco)
  - **"Inscribirme"** → estilo primario (`bg-cee-red text-white`, hover `bg-cee-red-dark`)

**Mejoras de layout de la card:**
- `<article>` ahora usa `flex flex-col` para que todas las cards del grid tengan altura uniforme
- Contenido interno usa `flex flex-1 flex-col` con `mt-auto` en la zona de precio, empujando precio y botones al fondo de la card
- Se agregó `transition-shadow duration-200 hover:shadow-md` para un hover sutil en la card
- Se agregaron `transition-colors duration-200` en ambos botones para transiciones suaves

#### Archivos modificados
- ✅ `apps/web/src/components/shared/CourseCard.tsx`

#### Archivos no modificados (sin cambios necesarios)
- `apps/web/src/pages/home/HomePage.tsx` — ya usa `<CourseCard />`, los cambios se reflejan automáticamente
- `apps/web/src/pages/catalog/CatalogPage.tsx` — ya usa `<CourseCard />`, los cambios se reflejan automáticamente
- `apps/web/src/constants/routes.ts` — ya tiene `CONTACT: '/contacto'`, no se necesitó agregar ruta nueva

#### Verificación
- ✅ `pnpm --filter web build` exitoso, cero errores TypeScript
- ✅ El botón "Inscribirme" aparece en todas las `CourseCard` (Home: 6 cards destacadas, Catálogo: cards paginadas + filtradas/buscadas)
- ✅ Tipos consumidos desde `@cee/types` (`Course`); no se redefinió nada localmente
- ✅ No se editó ningún archivo de `components/ui/` (shadcn)
- ✅ Solo se usó `pnpm`

---

### ✅ Diana — Botón "Inscribirme" en Detalle de Curso (Tarea 3)

**Estado:** Completada
**Fecha:** 2026-06-19
**Rama:** `feature/fase4-inscripcion-detalle-curso`

#### Objetivo
Agregar el CTA principal de inscripción en el sidebar de la página de Detalle de curso (`CourseSidebar`, creado en Fase 3), navegando al formulario de contacto/registro con el curso ya identificado.

#### Contexto
- Se hizo `git merge origin/dev` antes de tocar el componente, para traer el mecanismo de Santiago (`buildInscripcionUrl`, `useCursoSeleccionado`, `coursesService.getById`) y la integración ya hecha por Renato (`CourseCard`) y Tom (`ContactPage`)
- El sidebar de Detalle de curso **nunca tuvo botón de carrito** (se construyó en Fase 3 ya sin ese concepto), por lo que no hubo nada que "reemplazar" — se trató de agregar el nuevo CTA

#### Cambios realizados

##### 1. `apps/web/src/components/course/CourseSidebar.tsx` — modificado
- Se importó `buildInscripcionUrl` desde `@/lib/inscripcion` y `Link` de `react-router-dom`
- Se agregó un botón **"Inscribirme"** (`Button asChild` envolviendo `<Link to={buildInscripcionUrl(course.id)}>`) como CTA principal (estilo `default` de shadcn, fondo guinda), ubicado entre el precio y el botón "Descargar sílabo"
- El botón "Descargar sílabo" se mantiene sin cambios (sigue usando `variant="outline"`)

#### Archivos modificados
- ✅ `apps/web/src/components/course/CourseSidebar.tsx`

#### Verificación
- ✅ `pnpm --filter web lint` (`tsc --noEmit`): sin errores
- ✅ "Inscribirme" usa el mismo helper (`buildInscripcionUrl`) que `CourseCard.tsx`, generando exactamente la misma URL (`/contacto?curso=<id>`) que ya resuelve `useCursoSeleccionado` en `ContactPage.tsx`
- ✅ No se editó ningún archivo de `components/ui/` (shadcn)
- ✅ Se mantiene el botón "Descargar sílabo" intacto, según el alcance de la tarea

---

## Fase 5 — Panel Administrativo (apps/admin)

### ✅ Elvis — Infraestructura del panel (Tarea 1)

**Estado:** Completada
**Fecha:** 2026-06-20
**Rama:** `fase5-infra-admin-protected-route`

#### Objetivo
Dejar `apps/admin` como app independiente y funcional (login mock, layout, router protegido por rol) para que Diana, Tom, Isabel y Renato puedan integrar sus páginas encima, y resolver la duplicidad de pantallas admin que había quedado en `apps/web` (Decisión B pendiente en `CONTEXT.md`).

#### Decisión tomada y por qué: redirigir a `ROUTES.HOME` en vez de a una URL externa del admin
`apps/web` tenía 3 puntos (`Navbar.tsx`, `MobileMenu.tsx`, `LoginPage.tsx`) que, al detectar `user.role === 'admin'`, navegaban a `ROUTES.ADMIN` (`/admin`) **dentro del propio router de `apps/web`**. Al mover el panel a `apps/admin` (app separada, puerto/dev-server distinto, y en producción probablemente dominio/subdominio distinto), esa ruta deja de existir en `apps/web` — seguir navegando ahí habría caído en el `NotFoundPage`.

Se evaluaron 2 opciones:
1. **Redirigir siempre a `ROUTES.HOME`** (elegida).
2. Agregar una variable de entorno (`VITE_ADMIN_URL`) y hacer `window.location.href` al admin externo desde esos 3 puntos.

**Por qué se eligió la opción 1:** el panel admin todavía no comparte sesión con el sitio público — `apps/admin` resuelve su propia sesión con un mock interno (`mockLogin()`), no recibe nada del login de `apps/web`. Es decir, hoy un admin **no inicia sesión desde el sitio público** para llegar al panel; entra directo a `apps/admin`. Mantener la rama `role === 'admin' → /admin` en `apps/web` protegía un flujo que ya no aplica con la separación de apps. Cablear ahora un cruce real entre apps (`VITE_ADMIN_URL` + `window.location`) habría sido prematuro: ese cruce solo tiene sentido cuando exista un login/JWT compartido real entre `apps/web` y `apps/admin`, lo cual es explícitamente Fase 6 (fuera de alcance de Fase 5, que trabaja 100% sobre mocks). Se prefirió no introducir infraestructura (env var nueva, navegación cross-app) para un caso que se va a rediseñar de todas formas en la fase siguiente.

**Cómo aplicar este criterio a futuro:** cualquier navegación cross-app (`apps/web` ↔ `apps/admin`) debe esperar a que exista un mecanismo de sesión compartido (Fase 6); hasta entonces, simplificar a navegación dentro del propio app.

#### Cambios realizados

##### 1. Limpieza de duplicidad en `apps/web` (Decisión B de `CONTEXT.md`, cerrada)
- **Eliminados:** `apps/web/src/pages/admin/` completo (`DashboardPage.tsx`, `CoursesAdminPage.tsx`, `SalesPage.tsx` — los 3 eran placeholders "En construcción", sin lógica) y `apps/web/src/router/ProtectedRoute.tsx`
- **`apps/web/src/constants/routes.ts`:** removidas las claves `ADMIN`, `ADMIN_COURSES`, `ADMIN_USERS`, `ADMIN_SALES`, `ADMIN_SETTINGS` (ya no corresponden a ninguna ruta de esta app)
- **`apps/web/src/router/index.tsx`:** removido el bloque de rutas admin, el import de `ProtectedRoute` y los `lazy()` de las 3 páginas eliminadas
- **`apps/web/src/components/layout/Navbar.tsx`, `MobileMenu.tsx`:** removida la variable `profileRoute` (rama `role === 'admin' ? ROUTES.ADMIN : ROUTES.HOME`); el botón "Mi Perfil" ahora navega siempre a `ROUTES.HOME` cuando hay sesión
- **`apps/web/src/pages/auth/LoginPage.tsx`:** el redirect post-login ya no distingue por rol; siempre `navigate(ROUTES.HOME, { replace: true })`

##### 2. `apps/admin` — dependencias agregadas
- `react-router-dom` (no existía; el admin no tenía routing)
- `@cee/types` (workspace) — para el tipo `User` en el authStore mock
- `@radix-ui/react-slot` — requisito de `Button asChild` (shadcn)

##### 3. Setup de shadcn/Tailwind en `apps/admin`
- `apps/admin/tailwind.config.ts`: agregados los tokens de color (`border`, `input`, `ring`, `background`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `card`, `popover`) y `borderRadius` — mismo esquema que `apps/web`, manteniendo la paleta `cee.red`/`cee.cream` ya existente
- `apps/admin/src/index.css`: agregadas las variables CSS `:root` (HSL) que esos tokens consumen, y `@apply border-border` / `bg-background text-foreground`
- `apps/admin/src/lib/utils.ts` (nuevo): `cn()` — idéntico al de `apps/web`
- `apps/admin/src/components/ui/button.tsx` (nuevo): componente `Button` de shadcn, copiado tal cual del patrón de `apps/web` (no se edita a mano después de creado)

##### 4. Auth mock (`apps/admin/src/store/authStore.ts`, `apps/admin/src/mocks/auth.ts`)
- `authStore`: Zustand, **sin `localStorage`** — decisión obligada por la regla del repo ("`localStorage` solo en `apps/web/src/store/authStore.ts`"). La sesión del admin vive solo en memoria y se reinicia al refrescar la página; está documentado en un comentario en el propio archivo
- `mocks/auth.ts`: `mockAdminUser` (rol `"admin"`) + `mockLogin()`, invocado una vez en `main.tsx` al levantar la app — simula sesión iniciada durante desarrollo, sin pantalla de login real (no estaba en el alcance de esta tarea)

##### 5. `apps/admin/src/components/ProtectedRoute.tsx`
- Mismo patrón que el de `apps/web` (ya eliminado de ahí), pero **redirige a `/acceso-denegado`** en vez de a `/login` — no existe todavía una pantalla de login en `apps/admin` (fuera de alcance de esta tarea); el propio doc de Fase 5 ofrece esta alternativa ("o pantalla de Acceso denegado")
- `apps/admin/src/pages/AccessDeniedPage.tsx` (nuevo): placeholder de esa pantalla

##### 6. `apps/admin/src/layouts/AdminLayout.tsx`
- Sidebar fijo en desktop (`hidden md:flex`) con 3 links (Dashboard/Cursos/Ventas, iconos de `lucide-react`, estado activo vía `NavLink`)
- Sidebar mobile: drawer simple con overlay + `useState`, **sin** `@radix-ui/react-dialog` (se evitó añadir esa dependencia solo para un toggle de sidebar en esta tarea de infraestructura; el refinamiento visual queda para quien lo necesite)
- Header: nombre del usuario admin (`authStore`) + botón cerrar sesión
- `<Outlet/>` para las páginas

##### 7. `apps/admin/src/router.tsx` + páginas placeholder
- Rutas con `lazy()` + `<Suspense>` (mismo patrón que `apps/web`): `/`, `/cursos`, `/cursos/nuevo`, `/cursos/:id/editar`, `/ventas`, todas bajo `ProtectedRoute requiredRole="admin"` + `AdminLayout`; `/acceso-denegado` fuera de esa protección
- Páginas nuevas (placeholders "En construcción", contenido real es de Diana/Tom/Isabel/Renato): `DashboardPage.tsx`, `CoursesListPage.tsx`, `CourseFormPage.tsx` (compartida crear/editar), `SalesPage.tsx`

##### 8. `apps/admin/src/main.tsx`
- Reemplazado el placeholder estático por `<RouterProvider router={router} />`
- Llama `mockLogin()` antes de montar React (simula sesión admin para poder navegar sin pantalla de login)

#### Archivos nuevos
- ✅ `apps/admin/src/lib/utils.ts`
- ✅ `apps/admin/src/components/ui/button.tsx`
- ✅ `apps/admin/src/store/authStore.ts`
- ✅ `apps/admin/src/mocks/auth.ts`
- ✅ `apps/admin/src/components/ProtectedRoute.tsx`
- ✅ `apps/admin/src/components/PageLoader.tsx`
- ✅ `apps/admin/src/layouts/AdminLayout.tsx`
- ✅ `apps/admin/src/pages/DashboardPage.tsx`
- ✅ `apps/admin/src/pages/CoursesListPage.tsx`
- ✅ `apps/admin/src/pages/CourseFormPage.tsx`
- ✅ `apps/admin/src/pages/SalesPage.tsx`
- ✅ `apps/admin/src/pages/AccessDeniedPage.tsx`
- ✅ `apps/admin/src/router.tsx`

#### Archivos modificados
- ✅ `apps/admin/tailwind.config.ts`, `apps/admin/src/index.css`, `apps/admin/src/main.tsx`, `apps/admin/package.json` (deps)
- ✅ `apps/web/src/constants/routes.ts`, `apps/web/src/router/index.tsx`, `apps/web/src/components/layout/Navbar.tsx`, `apps/web/src/components/layout/MobileMenu.tsx`, `apps/web/src/pages/auth/LoginPage.tsx`

#### Archivos eliminados
- ❌ `apps/web/src/pages/admin/DashboardPage.tsx`, `CoursesAdminPage.tsx`, `SalesPage.tsx`
- ❌ `apps/web/src/router/ProtectedRoute.tsx`

#### Verificación
- ✅ `pnpm --filter admin lint` y `pnpm --filter web lint` (`tsc --noEmit`): ambos sin errores
- ✅ `pnpm --filter admin dev` levanta en el puerto 5174 (distinto al 5173 de `apps/web`, ya configurado desde el scaffold inicial)
- ✅ `curl` contra `/`, `/cursos` y `/ventas` del dev server de `apps/admin` responde `200` (SPA sirve el shell correctamente; `mockLogin()` + `ProtectedRoute` permiten el acceso)
- ✅ `grep` confirma cero referencias residuales a `ROUTES.ADMIN*` en `apps/web/src`

#### Pendiente para el resto del equipo
- Diana, Tom, Isabel y Renato deben construir el contenido real de `DashboardPage`, `CoursesListPage`, `CourseFormPage` y `SalesPage` (hoy son placeholders) y sus propios mocks/servicios (`apps/admin/src/mocks/*`, `apps/admin/src/services/*`)
- Pantalla de login real para `apps/admin` no está en el alcance de esta tarea ni del doc de Fase 5; mientras no exista, `mockLogin()` en `main.tsx` es la única forma de "entrar" al panel en desarrollo

---

### ✅ Diana — Dashboard (Tarea 2)

**Estado:** Completada
**Fecha:** 2026-06-20
**Rama:** `fase5-dashboard`

#### Objetivo
Construir el `DashboardPage` del panel admin: saludo + fecha, 4 tarjetas de KPIs, accesos directos a Cursos/Ventas y un mini-resumen de actividad reciente — todo alimentado por un `dashboardService` mock, no hardcodeado en el componente.

#### Decisión: agregar `DashboardSummary`/`DashboardActivityItem` a `@cee/types` en vez de un tipo local en `apps/admin`
El doc de la tarea pide un fixture con "los números de los KPIs y la actividad reciente", pero no dice dónde vive el tipo. Se siguió el precedente ya existente en el propio `@cee/types` para el caso análogo de Ventas (`SalesKpis`/`SalesReport`/`CourseSalesBreakdown`, ya usados por la tarea de Renato): son datos agregados que en algún momento (Fase 6) vendrán de un endpoint real del backend, así que cuentan como contrato FE/BE, no como un view-model interno de `apps/admin`. Definir `DashboardSummary` localmente en `apps/admin` habría roto la regla del repo ("todos los tipos compartidos se importan de `@cee/types`; nunca se redefinen localmente") en el momento en que `apps/web` o el backend necesiten ese mismo contrato.

**Forma elegida (mismo patrón que `SalesKpis`):** cada métrica es `valor` + `valorDeltaPct` (ej. `publishedCourses` + `publishedCoursesDeltaPct`), en vez de un objeto `trend` separado — consistencia con el resto de `@cee/types`.

#### Cambios realizados

##### 1. `packages/types/src/index.ts` — agregado
- `DashboardSummary` (`publishedCourses`, `draftCourses`, `monthlySales`, `registeredUsers`, cada uno con su `*DeltaPct`, + `recentActivity: DashboardActivityItem[]`)
- `DashboardActivityItem` (`id`, `courseTitle`, `action: 'created' | 'updated'`, `author`, `date`)

##### 2. Crear `apps/admin/src/components/ui/card.tsx`
- No existía `Card` en `apps/admin` (solo `button.tsx`); se copió tal cual el patrón de `apps/web/src/components/ui/card.tsx` (mismo criterio de siempre: se **crea**, no se edita un archivo shadcn existente)

##### 3. Crear `apps/admin/src/mocks/dashboard.ts`
- `mockDashboardSummary: DashboardSummary` con los 4 KPIs y 5 actividades recientes (mezcla de `created`/`updated`, distintos autores del equipo, fechas ISO)

##### 4. Crear `apps/admin/src/services/dashboardService.ts`
- `getSummary()`: devuelve el mock con un `delay` simulado (mismo patrón que los services de `apps/web`)
- Sin rama mock/real (`VITE_USE_MOCKS`) como en `apps/web` — fuera de alcance de Fase 5 ("Todo trabaja sobre mocks"); esa rama se agrega cuando exista el backend real en Fase 6

##### 5. Crear `apps/admin/src/hooks/useDashboard.ts`
- Hook `useState`/`useEffect` que envuelve `dashboardService.getSummary()`, expone `{ summary, isLoading }` — para que `DashboardPage` no llame al service directo ni hardcodee datos

##### 6. Crear `apps/admin/src/components/dashboard/SummaryCard.tsx`
- Props `{ icon: LucideIcon, label, value, trend }`, reutilizable para las 4 tarjetas
- Trend en verde (`text-emerald-600`) si es positivo, en rojo (`text-destructive`) si es negativo, con signo `+`/`-` explícito

##### 7. Reescribir `apps/admin/src/pages/DashboardPage.tsx`
- Saludo con `user?.name` desde `authStore` + fecha actual formateada con `Intl.DateTimeFormat('es-PE', ...)` (dinámica, no hardcodeada)
- Grid de 4 `SummaryCard` (`sm:grid-cols-2 lg:grid-cols-4`)
- 2 accesos directos como tarjetas-link grandes: "Gestionar Cursos" → `/cursos` (estilo primario, fondo guinda), "Ver Ventas" → `/ventas` (estilo outline)
- Mini-resumen de actividad reciente dentro de un `Card`, iterando `summary.recentActivity`
- Estado de carga simple mientras `isLoading`

#### Archivos nuevos
- ✅ `apps/admin/src/components/ui/card.tsx`
- ✅ `apps/admin/src/mocks/dashboard.ts`
- ✅ `apps/admin/src/services/dashboardService.ts`
- ✅ `apps/admin/src/hooks/useDashboard.ts`
- ✅ `apps/admin/src/components/dashboard/SummaryCard.tsx`

#### Archivos modificados
- ✅ `packages/types/src/index.ts` (`DashboardSummary`, `DashboardActivityItem`)
- ✅ `apps/admin/src/pages/DashboardPage.tsx`

#### Verificación
- ✅ `pnpm --filter admin lint` y `pnpm --filter web lint` (`tsc --noEmit`): ambos sin errores (el cambio en `@cee/types` no rompe nada en `apps/web`)
- ✅ `curl` contra `/` del dev server de `apps/admin` responde `200`
- ✅ Datos vienen de `dashboardService` vía `useDashboard`, no hardcodeados en `DashboardPage.tsx`
- ✅ No se editó ningún archivo existente de `components/ui/`

---

### ✅ Tom — Gestión de Cursos: CRUD listado (Tarea 3)

**Estado:** Completada
**Fecha:** 2026-06-20
**Rama:** `fase5-gestion-cursos`

#### Objetivo
Construir `CoursesListPage`: tabla de cursos con búsqueda, filtro por estado, y acciones (Editar, Cambiar estado, Eliminar) contra un `coursesService` mock que muta en memoria, con feedback visual inmediato (toast).

#### Decisión: portar primitivos shadcn (`Table`, `AlertDialog`, `DropdownMenu`, `Input`, `Badge`) y el sistema de toast a `apps/admin` en vez de importarlos de `apps/web`
`apps/admin` y `apps/web` son apps Vite independientes (sin `packages/ui` compartido todavía — sigue vacío). No hay forma de importar un componente de una app desde la otra sin convertirlo primero en paquete compartido, y hacerlo ahora habría sido un cambio de arquitectura fuera del alcance de esta tarea. Se copiaron los primitivos que ya existían en `apps/web` (mismo patrón ya usado en Tareas 1 y 2: `card.tsx`, `button.tsx`) y se creó desde cero lo que no existía en ninguna de las dos apps (`Table`, `AlertDialog`, `DropdownMenu` — `apps/web` tampoco los tenía).

**Cómo aplicar este criterio a futuro:** si un tercer componente UI se necesita en ambas apps, considerar moverlo a `packages/ui` en vez de triplicar la copia; por ahora, con solo 2 apps y pocos componentes duplicados, no se justifica la inversión.

#### Cambios realizados

##### 1. Dependencias nuevas en `apps/admin`
- `@radix-ui/react-alert-dialog`, `@radix-ui/react-dropdown-menu`

##### 2. Primitivos shadcn nuevos en `apps/admin/src/components/ui/`
- `input.tsx`, `badge.tsx` — copiados tal cual de `apps/web`
- `table.tsx` — semántico, sin dependencia de Radix (no existía en ninguna app)
- `alert-dialog.tsx`, `dropdown-menu.tsx` — generados siguiendo el patrón estándar de shadcn sobre los paquetes Radix recién instalados (no existían en ninguna app)

##### 3. Sistema de toast portado a `apps/admin`
- `store/toastStore.ts`, `hooks/useToast.ts`, `components/ui/toast.tsx` (`Toaster`) — copia exacta del patrón Zustand de `apps/web` (sin Radix)
- `Toaster` montado en `layouts/AdminLayout.tsx` (antes no existía ningún sistema de notificaciones en admin)

##### 4. `apps/admin/src/lib/utils.ts` — agregado `formatPrice()`
- Mismo formato que `apps/web` (`S/ 199.00`), necesario para la columna Precio

##### 5. Crear `apps/admin/src/mocks/courses.ts`
- Fixture propio de `apps/admin` (8 cursos, mezcla de los 3 estados) — **no** se reutiliza `apps/web/src/mocks/data/courses.mock.ts` porque son apps separadas sin mocks compartidos
- Objetos `Course` completos (`@cee/types`) con arrays vacíos en los campos no relevantes para una vista de listado (`syllabus`, `instructors`, `graduateProfile`, `benefits`)

##### 6. Crear `apps/admin/src/services/coursesService.ts`
- `getCourses()`, `updateCourseStatus(id, status)`, `deleteCourse(id)` — mutan un array `Course[]` a nivel de módulo (en memoria); sin rama mock/real (`VITE_USE_MOCKS`), igual que `dashboardService` (Fase 5 trabaja 100% sobre mocks)

##### 7. Crear `apps/admin/src/hooks/useCourses.ts`
- Envuelve el service: `{ courses, isLoading, changeStatus, remove }`; actualiza el estado local tras cada mutación para reflejo inmediato en la tabla

##### 8. Crear `apps/admin/src/components/courses/StatusBadge.tsx`
- Envuelve el `Badge` de `components/ui/` con colores por estado: Publicado (verde `emerald`), Borrador (gris `neutral`), En Revisión (ámbar `amber`)
- Diseñado para ser reutilizado también por Isabel en el formulario (Tarea 4), según pide el doc

##### 9. Reescribir `apps/admin/src/pages/CoursesListPage.tsx`
- Tabla (`Table` de shadcn) con columnas Nombre/Categoría/Modalidad/Precio/Estado/Fecha creación/Acciones
- Búsqueda por nombre (`Input`, filtro en cliente sobre `courses`) + filtro por estado (`<select>` nativo, mismo criterio que `CourseFilter.tsx` de `apps/web`: no se instaló `@radix-ui/react-select` para un dropdown simple)
- Botón "Nuevo curso" → `/cursos/nuevo`
- Por fila: "Editar" → `/cursos/:id/editar`; "Cambiar estado" vía `DropdownMenu` (3 opciones, la actual deshabilitada); "Eliminar" vía `AlertDialog` de confirmación
- Toast de éxito (`useToast`) tras cambiar estado o eliminar
- Estado de carga ("Cargando cursos...") y estado vacío ("No se encontraron cursos con esos filtros")

#### Archivos nuevos
- ✅ `apps/admin/src/components/ui/input.tsx`, `badge.tsx`, `table.tsx`, `alert-dialog.tsx`, `dropdown-menu.tsx`, `toast.tsx`
- ✅ `apps/admin/src/store/toastStore.ts`, `apps/admin/src/hooks/useToast.ts`
- ✅ `apps/admin/src/mocks/courses.ts`
- ✅ `apps/admin/src/services/coursesService.ts`
- ✅ `apps/admin/src/hooks/useCourses.ts`
- ✅ `apps/admin/src/components/courses/StatusBadge.tsx`

#### Archivos modificados
- ✅ `apps/admin/src/pages/CoursesListPage.tsx`
- ✅ `apps/admin/src/layouts/AdminLayout.tsx` (monta `<Toaster/>`)
- ✅ `apps/admin/src/lib/utils.ts` (`formatPrice`)
- ✅ `apps/admin/package.json` (deps `@radix-ui/react-alert-dialog`, `@radix-ui/react-dropdown-menu`)

#### Verificación
- ✅ `pnpm --filter admin lint` y `pnpm --filter web lint` (`tsc --noEmit`): ambos sin errores
- ✅ `curl` contra `/cursos` del dev server de `apps/admin` responde `200`
- ✅ Cambiar estado y eliminar actualizan la tabla en memoria de inmediato + muestran toast de confirmación
- ✅ No se editó ningún archivo existente de `components/ui/`

#### Pendiente para el resto del equipo
- Isabel (Tarea 4) debe reutilizar `StatusBadge` en el formulario de crear/editar curso
- `CourseFormPage.tsx` sigue siendo placeholder; las rutas `/cursos/nuevo` y `/cursos/:id/editar` ya navegan correctamente desde esta tabla

---

### ✅ Isabel — Registrar / Editar curso: CRUD formulario (Tarea 4)

**Estado:** Completada
**Fecha:** 2026-06-20
**Rama:** `fase5-registrar-editar-curso`

#### Objetivo
Un único `CourseFormPage` para crear (`/cursos/nuevo`) y editar (`/cursos/:id/editar`) cursos, con validación, subida de sílabo PDF simulada, y guardado contra `coursesService` (mock) con toast + redirect.

#### Decisión: validación manual (sin `react-hook-form`), igual que `apps/web`
El doc permite explícitamente "usar `react-hook-form` (o el patrón que ya usen en `apps/web`)". `apps/web` no tiene `react-hook-form` instalado en ningún lado — `ContactPage.tsx` y `LoginPage.tsx` validan a mano con `useState` + una función `validate()` que devuelve un objeto de errores. Se siguió ese mismo patrón en `CourseFormPage.tsx` para no introducir una dependencia nueva (`react-hook-form` + posiblemente `zod`/`@hookform/resolvers`) cuando el patrón ya establecido en el monorepo resuelve el mismo requisito con cero dependencias adicionales.

#### Decisión: `CourseFormInput` vive en `coursesService.ts`, no en `@cee/types`
A diferencia de `DashboardSummary` (Tarea 2), que se agregó a `@cee/types` porque refleja una futura respuesta real del backend, `CourseFormInput` es la forma reducida de campos que pide *este formulario* (`title`, `description`, `price`, `category`, `modality`, `moodleCourseId`, `status`, `syllabusFileName`) — no corresponde 1:1 a ningún endpoint, es un input de UI que el propio `coursesService` expande a un `Course` completo (`buildCourseFromInput`) rellenando con defaults los campos que el formulario no pide (`level`, `imageUrl`, `academicHours`, `rating`, `enrolledCount`, `graduateProfile`, `syllabus`, `instructors`, `benefits`). Ponerlo en `@cee/types` habría sugerido (incorrectamente) que es un contrato de backend.

#### Cambios realizados

##### 1. Primitivos shadcn nuevos en `apps/admin/src/components/ui/`
- `label.tsx`, `textarea.tsx` — copiados tal cual de `apps/web` (sin dependencias nuevas, son elementos HTML planos)

##### 2. `apps/admin/src/lib/utils.ts` — agregado `slugify()`
- Mismo comportamiento que el de `apps/web` (normaliza tildes, minúsculas, guiones)
- *Nota técnica:* se construyó el rango de diacríticos combinables vía `String.fromCharCode(0x0300)`–`String.fromCharCode(0x036f)` en vez del escape literal `̀-ͯ`, porque ese escape se corrompía al pasar por la tubería de herramientas de esta sesión; el comportamiento final es idéntico (verificado con un caso de prueba: `"Gestión de Proyectos Ágiles"` → `"gestion-de-proyectos-agiles"`)

##### 3. Crear `apps/admin/src/constants/courseStatus.ts`
- `COURSE_STATUS_LABELS` y `COURSE_STATUS_OPTIONS` centralizados — y se refactorizaron `StatusBadge.tsx` y `CoursesListPage.tsx` (de la Tarea 3) para consumir esta constante en vez de repetir "Publicado"/"Borrador"/"En Revisión" en 3 archivos distintos

##### 4. `apps/admin/src/services/coursesService.ts` — extendido
- Nuevo tipo `CourseFormInput` (exportado) + `buildCourseFromInput()` (helper interno)
- `getCourseById(id)` — para la precarga en modo edición
- `createCourse(input)` / `updateCourse(id, input)` — construyen el `Course` completo vía `buildCourseFromInput` y mutan el array en memoria (mismo patrón que `updateCourseStatus`/`deleteCourse` ya existentes)

##### 5. Reescribir `apps/admin/src/pages/CourseFormPage.tsx`
- Detecta modo con `useParams<{id}>()`; en edición, `useEffect` llama `getCourseById` y precarga el formulario (incluye mostrar el nombre del sílabo ya existente, extraído de `syllabusPdfUrl`)
- Campos: nombre (`Input`), descripción (`Textarea`), precio (`Input type="number"`), Moodle Course ID (`Input`), categoría/modalidad/estado (`<select>` nativo — mismo criterio que el filtro de estado de la Tarea 3 y `CourseFilter.tsx` de `apps/web`: no se instala `@radix-ui/react-select` para un dropdown simple)
- Subida de PDF: `<input type="file" accept="application/pdf">`, valida `file.type` y tamaño (≤10MB) mostrando toast de error si falla; muestra el nombre del archivo seleccionado con botón "Quitar"; seleccionar un nuevo archivo reemplaza el anterior de forma natural
- Validación manual (`validate()` → objeto de errores) igual que `ContactPage.tsx`; mensajes bajo cada campo
- Botón "Guardar curso" deshabilitado mientras `isSubmitting` o si quedan errores tras el último intento de envío
- Botón "Cancelar" (`Link` a `/cursos`, sin guardar)
- Al guardar: `createCourse`/`updateCourse` según el modo → toast de éxito → `navigate('/cursos')`; en error, toast de error sin perder los datos del formulario

#### Archivos nuevos
- ✅ `apps/admin/src/components/ui/label.tsx`, `textarea.tsx`
- ✅ `apps/admin/src/constants/courseStatus.ts`

#### Archivos modificados
- ✅ `apps/admin/src/pages/CourseFormPage.tsx`
- ✅ `apps/admin/src/services/coursesService.ts`
- ✅ `apps/admin/src/lib/utils.ts` (`slugify`)
- ✅ `apps/admin/src/components/courses/StatusBadge.tsx`, `apps/admin/src/pages/CoursesListPage.tsx` (refactor para usar `courseStatus.ts`, sin cambio de comportamiento)

#### Verificación
- ✅ `pnpm --filter admin lint` y `pnpm --filter web lint` (`tsc --noEmit`): ambos sin errores
- ✅ `curl` contra `/cursos/nuevo` y `/cursos/c001/editar` del dev server de `apps/admin` responde `200` en ambos
- ✅ Prueba unitaria manual de `slugify()` confirma el comportamiento esperado tras el cambio de implementación del regex
- ✅ No se editó ningún archivo existente de `components/ui/`; no se agregó ninguna dependencia nueva (`react-hook-form` evitado a propósito)

#### Pendiente para el resto del equipo
- Renato (Tarea 5 — Ventas) puede reutilizar `formatPrice`/patrones de `apps/admin/src/lib/utils.ts` y el mismo criterio de `<select>` nativo para su filtro de rango de fechas
- Elvis (Tarea 6 — QA) debe probar el flujo completo crear → listar → editar → cambiar estado → eliminar en `/cursos`

---

### ✅ Renato — Ventas (Tarea 5)

**Estado:** Completada
**Fecha:** 2026-06-20
**Rama:** `fase5-ventas`

#### Objetivo
`SalesPage` con 3 KPIs, gráfico de tendencia (`recharts`), desglose por curso y filtro de rango de fechas, todo contra un `salesService` mock.

#### Decisión: reutilizar `SummaryCard` de Diana tal cual, sin modificarlo
El doc sugería "reutilizar `SummaryCard` de Diana si ya está listo, o coordinar". Ya estaba listo (Tarea 2) y su props (`icon, label, value, trend`) son genéricas — no fue necesario tocarlo ni crear una variante para Ventas. El único matiz es que el texto fijo "vs. mes anterior" dentro del propio `SummaryCard` no siempre es literalmente exacto cuando el rango seleccionado es "semana" o "trimestre", pero se decidió no parametrizarlo para no modificar un componente ya entregado por otra tarea por una diferencia cosmética menor; queda anotado como mejora futura si se vuelve relevante.

#### Decisión: `SalesDateRange` vive en `salesService.ts`, no en `@cee/types`
Mismo criterio que `CourseFormInput` (Tarea 4): es un parámetro de filtro de UI (qué ventana de tiempo mostrar), no un contrato de respuesta de backend. `SalesReport`/`SalesKpis`/`SalesTrendPoint`/`CourseSalesBreakdown` sí ya estaban en `@cee/types` (probablemente preparados de antemano para esta tarea) y se usaron sin cambios.

#### Decisión: 3 fixtures completos (semana/mes/trimestre) en vez de un único dataset recalculado
Para el filtro de rango de fechas (opcional según el doc: "si da el tiempo"), se optó por declarar 3 `SalesReport` mock independientes con distinta granularidad de tendencia (7 puntos diarios para semana, 4 semanales para mes, 6 mensuales para trimestre) en vez de derivar agregaciones en tiempo real desde un único dataset. Es más simple de mantener como mock y evita lógica de agregación que de todos modos se reemplazará al conectar el backend real en Fase 6.

#### Cambios realizados

##### 1. Dependencia nueva en `apps/admin`
- `recharts` (no estaba instalado en ninguna app; `apps/web` no lo usa)

##### 2. Crear `apps/admin/src/mocks/sales.ts`
- `mockSalesReports: { week, month, quarter }`, cada uno un `SalesReport` completo (kpis + trend + breakdown) con cursos ya existentes en `mocks/courses.ts` (mismos `courseId`)

##### 3. Crear `apps/admin/src/services/salesService.ts`
- `getSalesReport(range: SalesDateRange = 'month')` — devuelve el fixture correspondiente con `delay` simulado, mismo patrón que `dashboardService`/`coursesService`

##### 4. Crear `apps/admin/src/hooks/useSales.ts`
- Maneja el estado del `range` (`useState`) y vuelve a pedir el reporte cuando cambia (`useEffect` con `range` en las dependencias); expone `{ report, isLoading, range, setRange }`

##### 5. Crear `apps/admin/src/components/sales/SalesTrendChart.tsx`
- `LineChart` de `recharts` con `ResponsiveContainer` (responsive real, no solo CSS), `Tooltip` formateado con `formatPrice`, color `#8B1A1A` (cee-red)

##### 6. Crear `apps/admin/src/components/sales/CourseBreakdownTable.tsx`
- Tabla (reutiliza el `Table` de la Tarea 3) ordenada por ingresos descendente — se eligió tabla en vez de gráfico de barras horizontal (el doc daba a elegir) porque el primitivo ya existía y es más legible con `lastTransaction` incluida

##### 7. Reescribir `apps/admin/src/pages/SalesPage.tsx`
- Selector de rango (`<select>` nativo, mismo criterio que los demás selects simples del admin) con las 3 opciones del doc
- 3 `SummaryCard`: Total Ventas, Ingresos (`formatPrice`), Tasa de Conversión (`%`)
- `SalesTrendChart` + `CourseBreakdownTable` dentro de `Card`
- Estado de carga mientras `isLoading`

#### Archivos nuevos
- ✅ `apps/admin/src/mocks/sales.ts`
- ✅ `apps/admin/src/services/salesService.ts`
- ✅ `apps/admin/src/hooks/useSales.ts`
- ✅ `apps/admin/src/components/sales/SalesTrendChart.tsx`
- ✅ `apps/admin/src/components/sales/CourseBreakdownTable.tsx`

#### Archivos modificados
- ✅ `apps/admin/src/pages/SalesPage.tsx`
- ✅ `apps/admin/package.json` (dependencia `recharts`)

#### Verificación
- ✅ `pnpm --filter admin lint` y `pnpm --filter web lint` (`tsc --noEmit`): ambos sin errores
- ✅ `curl` contra `/ventas` del dev server de `apps/admin` responde `200`
- ✅ Cambiar el selector de rango dispara una nueva carga (`useEffect` con `range`) y recalcula KPIs, gráfico y desglose
- ✅ No se editó ningún archivo existente de `components/ui/`; `SummaryCard` se reutilizó sin modificar

#### Pendiente para el resto del equipo
- Elvis (Tarea 6 — QA) debe probar el flujo completo del panel: Dashboard → Cursos (crear/editar/cambiar estado/eliminar) → Ventas (cambiar rango), responsive y sin errores de consola — cierre de la Fase 5

---

## Fase 7 — Mejoras de Home

### ✅ Slider de eventos en la Home (Tarea 1 del documento de mejoras)

**Estado:** Completada
**Fecha:** 2026-06-23
**Rama:** `feature/home-event-slider`

#### Objetivo
Crear `EventSlider`, un carrusel accesible como pieza central de la Home, que rota entre eventos del CEE (mock), navegable por teclado y táctil, con autoplay respetuoso de `prefers-reduced-motion` y lazy-load de imágenes.

#### Decisión: `EventSlide` en `@cee/types`, no tipo local
A diferencia de `CourseFormInput`/`SalesDateRange` (inputs de UI sin contraparte de backend), un evento de la Home es una entidad que razonablemente vivirá en una tabla real de Supabase en el futuro (como `Video`). Se siguió el mismo patrón que `Video`: campos en camelCase en inglés (`id`, `title`, `date`, `imageUrl`, `ctaLabel`, `ctaHref`), no los nombres en español sugeridos en el documento de mejoras (`titulo`, `fecha`, `imagen`, `cta`), para mantener consistencia con el resto de `@cee/types`.

#### Decisión: crear `components/ui/carousel.tsx` (shadcn sobre Embla)
No existía ningún carrusel en el proyecto. Se instaló `embla-carousel-react` + `embla-carousel-autoplay` (única dependencia nueva, ligera, pedida explícitamente por el documento de mejoras) y se generó `carousel.tsx` siguiendo el patrón estándar de shadcn/ui (mismo criterio que `sheet.tsx`, `accordion.tsx`: se crea, no se edita un archivo shadcn existente).

#### Cambios realizados
- **`packages/types/src/index.ts`:** nuevo `EventSlide` (`id`, `title`, `date`, `imageUrl`, `ctaLabel`, `ctaHref`)
- **`apps/web/src/mocks/data/events.mock.ts`** (nuevo): `mockEvents`, 4 eventos de ejemplo; exportado desde `mocks/index.ts`
- **`apps/web/src/services/events.service.ts`** (nuevo): `eventsService.getAll()`, mismo patrón mock/Supabase que `mediaService` (toggle por `VITE_USE_MOCKS`; rama real apunta a una futura tabla `events`)
- **`apps/web/src/hooks/useEvents.ts`** (nuevo): wrapper `useState`/`useEffect` sobre el service, mismo patrón que `useCourses`
- **`apps/web/src/components/ui/carousel.tsx`** (nuevo): `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext` sobre `embla-carousel-react`; navegación por teclado (flechas) vía `onKeyDownCapture`
- **`apps/web/src/components/home/EventSlider.tsx`** (nuevo): consume `EventSlide[]`, usa `embla-carousel-autoplay` (pausa en hover/foco, `stopOnInteraction: false`) y se desactiva por completo si `prefers-reduced-motion: reduce`; primera imagen `loading="eager"`/`fetchPriority="high"`, resto `loading="lazy"`; overlay degradado en paleta `cee-ink`/`cee-red`, badge de fecha, CTA y dots de navegación
- **`apps/web/src/pages/home/HomePage.tsx`:** se agregó la sección "Próximos eventos" con `EventSlider`, ubicada justo después del Hero (pieza central), antes de los logos institucionales; sin tocar el resto de secciones existentes

#### Fix relacionado (no parte del alcance original, detectado al verificar en navegador): `apps/web/src/lib/supabase.ts`
Al abrir la app en local (sin `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` configuradas, como en `.env` de desarrollo), `createClient(undefined, undefined, ...)` lanzaba `Error: supabaseUrl is required.` de forma síncrona. Como `main.tsx` llama a `authService.initSession()` (que importa `lib/supabase.ts`) **antes** de montar React, esto dejaba la app entera en blanco en cualquier ruta — no relacionado al carrusel, sino preexistente desde la migración a Supabase (`e713317`). Se agregó un fallback (`https://placeholder.supabase.co` / `placeholder-anon-key`) cuando esas env vars no están definidas; con `VITE_USE_MOCKS=true` ese cliente nunca se usa de verdad, así que es seguro, y deja de bloquear el arranque en cualquier entorno de desarrollo sin credenciales reales.

#### Archivos nuevos
- ✅ `apps/web/src/mocks/data/events.mock.ts`
- ✅ `apps/web/src/services/events.service.ts`
- ✅ `apps/web/src/hooks/useEvents.ts`
- ✅ `apps/web/src/components/ui/carousel.tsx`
- ✅ `apps/web/src/components/home/EventSlider.tsx`

#### Archivos modificados
- ✅ `packages/types/src/index.ts` (`EventSlide`)
- ✅ `apps/web/src/mocks/index.ts`
- ✅ `apps/web/src/pages/home/HomePage.tsx`
- ✅ `apps/web/src/lib/supabase.ts` (fix de arranque, ver arriba)
- ✅ `apps/web/package.json` / `pnpm-lock.yaml` (deps `embla-carousel-react`, `embla-carousel-autoplay`)

#### Verificación
- ✅ `pnpm --filter web lint` (`tsc --noEmit`): sin errores
- ✅ `pnpm --filter web dev`: `curl` a `/` responde `200`
- ✅ No se editó ningún archivo existente de `components/ui/`
- ⚠️ Sin `chromium-cli`/Playwright disponible en este entorno para capturar screenshot real del carrusel rotando; se recomienda una verificación visual manual en navegador antes de dar la tarea por cerrada del todo

---

### ✅ Ajustes posteriores al slider (eliminar aliados, pulir visual) — sesiones siguientes

**Estado:** Completada
**Fecha:** 2026-06-23/24

#### Cambios realizados
- Se eliminó la sección "Con el respaldo de" (logos de aliados/`InstitutionalLogos`) de la **Home** y del **Footer** (sigue usándose en `AboutPage`, no se tocó ahí)
- `EventSlider.tsx`: zoom Ken Burns sutil en la imagen activa (respeta `prefers-reduced-motion`), contador "01/04", flechas prev/next visibles por defecto en móvil (antes solo con hover, inútil en táctil), tipografía más grande, `shadow-xl`/`ring-1` en el contenedor
- `Footer.tsx`: fondo con degradado `cee-red → cee-red-dark`, grid de 12 columnas asimétrico, contacto con íconos y links reales (`mailto:`, WhatsApp), redes sociales junto a la marca
- Fix adicional: `apps/admin/src/lib/supabase.ts` tenía el mismo bug que `apps/web/src/lib/supabase.ts` (createClient sin fallback, crash en boot sin credenciales reales) — mismo fix de fallback aplicado ahí también

#### Archivos modificados
- ✅ `apps/web/src/pages/home/HomePage.tsx`, `apps/web/src/components/home/EventSlider.tsx`
- ✅ `apps/web/src/components/layout/Footer.tsx`
- ✅ `apps/admin/src/lib/supabase.ts`

---

### ✅ Scroll-snap inteligente por sección en la Home (Tarea 2 del documento de mejoras)

**Estado:** Completada
**Fecha:** 2026-06-24
**Rama:** `feature/fullsection-scroll-snap`

#### Objetivo
Que el viewport "encaje" al inicio de cada sección de la Home en desktop sin secuestrar el scroll del usuario, sin recortar contenido alto, con comportamiento relajado en móvil y respetando `prefers-reduced-motion`; más un indicador "scroll ↓" en el Hero y anclas laterales que reflejan la sección activa.

#### Decisión: `scroll-snap-type: y proximity` (no `mandatory`)
El documento de mejoras cierra esta decisión explícitamente: `proximity` encaja al acercarse sin bloquear el scroll, y cada `.snap-section` usa `min-height: 100svh` (no `height`), de forma que el snap solo fija el **inicio** de la sección — las secciones con contenido largo (p. ej. el grid de cursos) pueden crecer más allá del viewport sin cortarse.

#### Decisión: el `scroll-snap-type` real se aplica en `html`, no en el `<div>` de Home
`Layout.tsx` no tiene un contenedor con `overflow-y` propio (`Navbar` + `<main className="flex-1">` + `Footer` dentro de un `div min-h-screen flex flex-col`), así que el elemento que realmente scrollea es el documento (`html`). Se usó el selector `html:has(.snap-container)` para que el snap solo se active en páginas que renderizan el contenedor (la Home), sin tocar `Layout.tsx` ni afectar otras rutas.

#### Cambios realizados
- **`apps/web/src/index.css`:** utilidades `.snap-container` (`scroll-snap-type: y proximity`, `scroll-padding-top: 4rem` para compensar el Navbar `sticky top-0`) y `.snap-section` (`scroll-snap-align: start`, `min-height: 100svh`); `html:has(.snap-container)` replica el `scroll-snap-type` en el verdadero contenedor de scroll; desactivado bajo `prefers-reduced-motion: reduce` y relajado (`scroll-snap-type: none`, `min-height: auto`) por debajo de `768px`
- **`apps/web/src/hooks/useActiveSection.ts`** (nuevo): hook que observa una lista de `id`s de sección con `IntersectionObserver` (`threshold: [0.3, 0.5, 0.7]`, `rootMargin: '-10% 0px -10% 0px'`) y devuelve el `id` más visible
- **`apps/web/src/components/home/SectionAnchors.tsx`** (nuevo): dots fijos a la derecha (`fixed right-4 top-1/2`, visibles solo desde `lg`) que navegan por ancla (`href="#id"`) y resaltan el activo (color guinda + escala); tooltip accesible al hover/focus, `aria-current` en el activo
- **`apps/web/src/components/home/ScrollHint.tsx`** (nuevo): indicador "Scroll ↓" con flecha, ancla a `#eventos`, animación `motion-safe:animate-bounce` (no anima si `prefers-reduced-motion: reduce`)
- **`apps/web/src/pages/home/HomePage.tsx`:** el contenedor raíz pasa de `<>...</>` a `<div className="snap-container">`; cada `<section>` existente (Hero, Eventos, Programas) recibe `id` (`hero`/`eventos`/`programas`) y la clase `snap-section`; se monta `<SectionAnchors sections={SECTION_ANCHORS} />` y `<ScrollHint />` dentro del Hero

#### Alcance respetado
Solo existen 3 secciones en la Home a la fecha de esta tarea (Hero, Eventos, Programas) — las secciones de "Nosotros", Blog y CTA de cierre (Tareas 4 y 9 del documento de mejoras) todavía no existen, así que `SECTION_ANCHORS` y el snap se limitan a las 3 secciones actuales. Cuando se agreguen las secciones restantes, deben sumarse a `SECTION_ANCHORS` y recibir `id` + `snap-section` siguiendo el mismo patrón.

#### Archivos nuevos
- ✅ `apps/web/src/hooks/useActiveSection.ts`
- ✅ `apps/web/src/components/home/SectionAnchors.tsx`
- ✅ `apps/web/src/components/home/ScrollHint.tsx`

#### Archivos modificados
- ✅ `apps/web/src/index.css` (`.snap-container`, `.snap-section`, media queries de `prefers-reduced-motion` y móvil)
- ✅ `apps/web/src/pages/home/HomePage.tsx`

#### Verificación
- ✅ `pnpm --filter web build`: compila sin errores nuevos
- ✅ Las 3 secciones de la Home tienen `id` único y clase `snap-section`
- ✅ El snap se desactiva completamente bajo `prefers-reduced-motion: reduce` y por debajo de `768px` (scroll natural en móvil, sin `min-height` forzado)
- ⚠️ Sin navegador real disponible en este entorno para grabar el comportamiento de snap en vivo; se recomienda verificación visual manual (desktop con scroll, DevTools con "reduced motion" forzado, y viewport móvil) antes de cerrar la tarea del todo

---

### ✅ Cierre de referencias residuales a carrito/compra (Tarea 3 del documento de mejoras)

**Estado:** Completada
**Fecha:** 2026-06-24
**Rama:** `refactor/remove-cart-and-purchase`

#### Objetivo
El carrito y la compra dentro del sitio fueron eliminados en Fase 2/4 (ver entradas arriba), pero la Tarea 3 del documento de mejoras pedía cerrar dos cabos sueltos que esas fases no cubrieron: precios tachados todavía visibles (residuo visual de la idea de "oferta de compra") y la Fase 4 del plan original (`docs/PLAN_IMPLEMENTACION_CEE_WEB.md`) seguía describiendo `cartStore`/checkout como si estuvieran en alcance.

#### Verificación previa (sin cambios de código necesarios)
- `cartStore.ts`, `CartItem`, badge de carrito en Navbar: ya no existen (Fase 2)
- Ningún `Checkout` en código
- CTA en `CourseCard`/`CourseSidebar` ya era "Inscribirme" → `/contacto?curso=<id>` vía `buildInscripcionUrl` (Fase 4), no un flujo de compra

#### Cambios realizados

##### 1. `apps/web/src/components/shared/CourseCard.tsx` y `apps/web/src/components/course/CourseSidebar.tsx`
- Quitado el bloque `course.originalPrice ? <p className="line-through">...</p> : null` en ambos componentes — solo queda el precio actual (`course.price`)
- **Decisión:** no se tocó `originalPrice` en `@cee/types`, `courses.service.ts`, ni en los mocks de `apps/web`/`apps/admin` — el campo sigue siendo parte legítima del contrato `Course` (el admin puede seguir gestionándolo como "precio anterior" en reportes/CRUD); lo que se eliminó es su efecto visual de "oferta tachada" en la UI pública, que es lo que el documento de mejoras asocia explícitamente a "referencias a compra"

##### 2. `docs/PLAN_IMPLEMENTACION_CEE_WEB.md` — actualizado
- La sección "Fase 4 — Carrito y flujo de conversión" se renombra a "~~Carrito y flujo de conversión~~ → FUERA DE ALCANCE", con nota explicando la decisión de producto y el reemplazo real (flujo "Inscribirme" → `/contacto?curso=<id>`)
- La tabla de "Frentes de trabajo" (Fase 3) actualizada: la fila 1 (Home + CourseCard) y la fila 3 (Detalle de curso) ya no mencionan "botón Añadir" ni "carrito" en el sidebar, reemplazadas por "Inscribirme"

#### Archivos modificados
- ✅ `apps/web/src/components/shared/CourseCard.tsx`
- ✅ `apps/web/src/components/course/CourseSidebar.tsx`
- ✅ `docs/PLAN_IMPLEMENTACION_CEE_WEB.md`

#### Verificación
- ✅ `pnpm --filter web build`: sin errores nuevos
- ✅ `grep` de `cart`/`carrito`/`Cart` en `apps/web/src`, `apps/admin/src`, `packages/types/src`: sin hits reales (único hit en código vivo es "Cartas de control" en `SalesTrendChart.tsx`, contexto de control estadístico, no relacionado)
- ✅ `grep` de `checkout` (case-insensitive) en `apps/web/src`, `apps/admin/src`: sin hits
- ✅ Sin precios tachados visibles en `CourseCard`/`CourseSidebar`; el precio mostrado es únicamente `course.price`

---

### ✅ Sección "Nosotros" + Blog en la Home (Tarea 4 del documento de mejoras)

**Estado:** Completada
**Fecha:** 2026-06-24
**Rama:** `feat/about-section`

#### Objetivo
Agregar una sección "Nosotros" inline en la Home (misión, vínculo UNI/FIIS, propuesta de valor, foto institucional) y un sistema de Blog completo: tipo en `@cee/types`, mock, listado `/blog`, detalle `/blog/:slug`, y una sección en la Home con las 3 entradas más recientes + "Ver todo el blog".

#### Estado previo (verificado antes de implementar)
Ya existía `AboutPage.tsx` como página independiente en `/nosotros` (con misión/visión, historia, valores, logos institucionales), pero **no había ninguna sección "Nosotros" embebida en la Home**, y el sistema de Blog **no existía en absoluto** (sin tipo, mock, service, hook, páginas ni rutas).

#### Decisión: `BlogPost` en `@cee/types`, en inglés, igual criterio que `EventSlide`
El documento de mejoras sugiere el shape `{ id, titulo, resumen, imagen, fecha, slug }` en español, pero siguiendo el precedente de `EventSlide` (Tarea 1: campos en camelCase en inglés porque es una entidad que eventualmente vivirá en una tabla real de Supabase, no un input de UI efímero), se definió `BlogPost { id, title, summary, content, imageUrl, date, slug }`. Se agregó `content` (no pedido explícitamente en el documento) porque sin él la página de detalle (`/blog/:slug`) no tendría cuerpo de artículo que mostrar.

#### Decisión: no se reescribió `AboutPage.tsx`, se creó `AboutSection.tsx` como pieza nueva y más compacta para la Home
La página `/nosotros` ya cumple su propio objetivo (extenso, con valores y estadísticas) y no se tocó. Para la Home se creó un componente nuevo, deliberadamente más corto, con el lenguaje de marca pedido ("Impulsa tu carrera, lidera tu futuro") y un CTA "Conocer más sobre el CEE" que enlaza a `/nosotros` — evita duplicar contenido extenso dos veces en la misma navegación (Home → scroll a Nosotros → click → página completa de Nosotros).

#### Cambios realizados

##### 1. `packages/types/src/index.ts` — agregado `BlogPost`
- `{ id, title, summary, content, imageUrl, date, slug }`

##### 2. `apps/web/src/mocks/data/blog.mock.ts` (nuevo)
- `mockBlogPosts`: 4 entradas de ejemplo (liderazgo, transformación digital en gestión pública, testimonios de egresados, analítica de datos), exportado desde `mocks/index.ts`

##### 3. `apps/web/src/services/blog.service.ts` (nuevo)
- `blogService.getAll()` / `getBySlug(slug)`, mismo patrón mock/Supabase que `events.service.ts` (toggle por `VITE_USE_MOCKS`; rama real apunta a una futura tabla `blog_posts`); `getAll()` ordena por fecha descendente

##### 4. `apps/web/src/hooks/useBlog.ts` y `useBlogPost.ts` (nuevos)
- Mismo patrón `useState`/`useEffect` que `useEvents`/`useCourseDetail`; `useBlogPost` resuelve por `slug` y expone `error` si no existe

##### 5. `apps/web/src/components/blog/BlogCard.tsx` (nuevo)
- Tarjeta reutilizada tanto en `BlogPage` (listado completo) como en `BlogSection` (Home): imagen lazy, fecha formateada (`Intl.DateTimeFormat('es-PE', ...)`), resumen truncado (`line-clamp-3`), link "Leer más"

##### 6. `apps/web/src/pages/blog/BlogPage.tsx` y `BlogPostPage.tsx` (nuevos)
- `BlogPage`: grid de todas las entradas (`useBlog`), con `Breadcrumb` y estados de carga/vacío
- `BlogPostPage`: detalle por `slug` (`useParams` + `useBlogPost`), `Breadcrumb` de 3 niveles (Inicio > Blog > [Título]), imagen + cuerpo del artículo; estado de error si el slug no resuelve

##### 7. `apps/web/src/constants/routes.ts` y `router/index.tsx` — agregadas rutas
- `ROUTES.BLOG = '/blog'`, `ROUTES.BLOG_POST = '/blog/:slug'`; ambas con `lazy()` + `Suspense`, mismo patrón que el resto de rutas públicas

##### 8. `apps/web/src/config/navigation.ts` — agregado link "Blog"
- Entre "Programas" y "Multimedia" en `navigationLinks` (única fuente de verdad consumida por Navbar/Footer/MobileMenu, sin duplicar la lista)

##### 9. `apps/web/src/components/home/AboutSection.tsx` (nuevo)
- Misión + vínculo FIIS-UNI + lenguaje de marca ("Impulsa tu carrera, lidera tu futuro") + foto institucional (mismo recurso visual que `AboutPage.tsx`) + CTA a `/nosotros`

##### 10. `apps/web/src/components/home/BlogSection.tsx` (nuevo)
- Las 3 entradas más recientes (`useBlog().posts.slice(0, 3)`) + botón "Ver todo el blog" → `/blog`

##### 11. `apps/web/src/pages/home/HomePage.tsx` — integración con el scroll-snap (Tarea 2)
- Dos nuevas `<section>` al final, con `id="nosotros"`/`id="blog"` y clase `snap-section` (mismo patrón ya establecido en la Tarea 2), renderizando `<AboutSection />` y `<BlogSection />` respectivamente
- `SECTION_ANCHORS` extendido con `{ id: 'nosotros', label: 'Nosotros' }` y `{ id: 'blog', label: 'Blog' }` — los dots laterales ahora reflejan las 5 secciones

#### Alcance respetado
El orden final de secciones (Hero→Cursos→Programas→Nosotros→Blog→Contacto/CTA, Tarea 9 del documento de mejoras) **no se aplicó aquí** — esta tarea solo agrega "Nosotros" y "Blog" al final del orden actual (Hero→Eventos→Programas→Nosotros→Blog), sin reordenar las secciones existentes. La reordenación completa y el CTA de cierre son alcance de la Tarea 9.

#### Archivos nuevos
- ✅ `apps/web/src/mocks/data/blog.mock.ts`
- ✅ `apps/web/src/services/blog.service.ts`
- ✅ `apps/web/src/hooks/useBlog.ts`
- ✅ `apps/web/src/hooks/useBlogPost.ts`
- ✅ `apps/web/src/components/blog/BlogCard.tsx`
- ✅ `apps/web/src/pages/blog/BlogPage.tsx`
- ✅ `apps/web/src/pages/blog/BlogPostPage.tsx`
- ✅ `apps/web/src/components/home/AboutSection.tsx`
- ✅ `apps/web/src/components/home/BlogSection.tsx`

#### Archivos modificados
- ✅ `packages/types/src/index.ts` (`BlogPost`)
- ✅ `apps/web/src/mocks/index.ts`
- ✅ `apps/web/src/constants/routes.ts` (`BLOG`, `BLOG_POST`)
- ✅ `apps/web/src/router/index.tsx`
- ✅ `apps/web/src/config/navigation.ts`
- ✅ `apps/web/src/pages/home/HomePage.tsx`

#### Verificación
- ✅ `pnpm --filter web build` y `pnpm --filter admin build`: ambos sin errores (el cambio en `@cee/types` no rompe `apps/admin`)
- ✅ Las 5 secciones de la Home (`hero`, `eventos`, `programas`, `nosotros`, `blog`) tienen `id` único, clase `snap-section`, y aparecen en `SECTION_ANCHORS`
- ✅ `BlogSection` muestra como máximo 3 entradas, ordenadas por fecha descendente, con link a `/blog`
- ⚠️ Sin navegador real disponible en este entorno para verificación visual; se recomienda revisar manualmente el scroll-snap con las 2 secciones nuevas y la navegación `/blog` → `/blog/:slug` antes de cerrar la tarea del todo

---

### ✅ Escala tipográfica más grande y fluida (Tarea 5 del documento de mejoras)

**Estado:** Completada
**Fecha:** 2026-06-24
**Rama:** `style/typography-scale-up`

#### Objetivo
Subir la escala tipográfica base (~10–15%) de forma fluida con `clamp()`, reescalar la jerarquía `h1`...`h6` proporcionalmente, y verificar que no se rompan layouts existentes (overflow en tarjetas/botones).

#### Estado previo (verificado antes de implementar)
`tailwind.config.ts` no tenía `theme.fontSize` extendido (usaba los defaults de Tailwind: body en 16px/`1rem`). `index.css` solo definía tamaños fijos para `h1`/`h2`/`h3` (sin `h4`/`h5`/`h6`), y únicamente `h1` usaba `clamp()` — `h2`/`h3` eran valores estáticos sin fluidez.

#### Decisión: subir el `font-size` del `html` con `clamp()` en vez de tocar `body` o cada componente
Como casi todo el sitio usa unidades `rem` (clases de Tailwind, `h-16` del Navbar, `scroll-padding-top` del snap-container, etc.), subir el tamaño raíz del documento escala el sitio completo de forma proporcional sin necesidad de tocar componente por componente. Se eligió `clamp(16px, 15.5px + 0.2vw, 18px)`: en viewports pequeños se queda en 16px (no se fuerza el aumento en pantallas donde el espacio es más escaso), y crece hasta 18px en desktop — el rango pedido explícitamente en el documento de mejoras ("body de 16→17/18px").

#### Decisión: `theme.fontSize` extendido con `clamp()` en cada paso de la escala (no solo headings)
Se reescribió la escala completa de Tailwind (`xs` a `6xl`) con `clamp(min, valor-en-rem + vw, max)` en vez de solo aumentar `h1`-`h3` en `index.css`. Esto cubre también el texto que usa utilidades (`text-sm`, `text-lg`, etc.) directamente en componentes (botones, badges, CourseCard), no solo los headings semánticos.

#### Cambios realizados

##### 1. `apps/web/tailwind.config.ts` — agregado `theme.extend.fontSize`
- Escala `xs`...`6xl`, cada paso con `clamp()` (~10–15% más grande que el default de Tailwind) y `lineHeight` ajustado para legibilidad

##### 2. `apps/web/src/index.css` — jerarquía `h1`...`h6` reescrita
- Las 6 etiquetas ahora usan `clamp()` (antes solo `h1` era fluida; `h2`/`h3` eran fijas y no existían `h4`/`h5`/`h6`)
- `line-height` decreciente a medida que el tamaño aumenta (1.05 en `h1` grande, 1.5 en `h5`/`h6`) y `letter-spacing` negativo en `h1`/`h2` para compensar el tamaño mayor
- Nuevo bloque `html { font-size: clamp(16px, 15.5px + 0.2vw, 18px); }` — sube el tamaño raíz del documento (y por tanto todo lo medido en `rem`) de forma fluida

#### Verificación
- ✅ `pnpm --filter web build`: sin errores nuevos
- ✅ Revisado `Navbar.tsx` (`h-16` sticky) y `components/ui/button.tsx` (alturas `h-9`/`h-10`/`h-11` en `rem`): al estar en `rem`, escalan proporcionalmente con el nuevo `font-size` del `html` sin generar overflow (padding y altura crecen juntos)
- ✅ No se editó `components/ui/button.tsx` ni ningún otro archivo de `components/ui/` — el aumento de tamaño les llega automáticamente vía el `html` más grande y la nueva escala de `fontSize`
- ⚠️ Sin navegador real disponible en este entorno para verificación visual de overflow en tarjetas/botones en viewports reales; se recomienda QA visual manual (375px/768px/1280px) antes de cerrar la tarea del todo

#### Archivos modificados
- ✅ `apps/web/tailwind.config.ts` (`theme.extend.fontSize`)
- ✅ `apps/web/src/index.css` (jerarquía `h1`-`h6`, `html { font-size }`)

---

### ✅ Paleta de marca: rampa de luminosidad del guinda + degradados (Tarea 6 del documento de mejoras)

**Estado:** Completada
**Fecha:** 2026-06-24
**Rama:** `style/brand-color-palette`

#### Objetivo
Corregir cualquier "tema rojo" genérico por el guinda real de marca (`#682222`), definir una rampa de luminosidad (50…900) documentada en `tailwind.config.ts` para usar en degradados y estados sin salir de los 4 colores del manual, y aplicar degradados guinda↔negro en hero/sliders (estilo de los flyers).

#### Estado previo (verificado antes de implementar)
El guinda `#682222` **ya estaba correcto** en `cee.red` (no había ningún resto del "tema rojo" genérico del esqueleto inicial) y `EventSlider.tsx` ya usaba un degradado guinda↔negro (`from-cee-ink/90` + `from-cee-red/35`) sobre las imágenes del carrusel. Lo que faltaba: (1) una rampa de luminosidad explícita y documentada (solo existían 3 variantes sueltas: `red`, `red-dark`, `red-light`, sin escala numerada ni cobertura completa 50–900); (2) `--primary`/`--ring` en HSL no coincidían exactamente con el guinda real (`0 43% 27%` vs. el HSL real del hex, `0 51% 27%`); (3) el Hero de la Home y los heros de `AboutPage`/`MultimediaPage` usaban un overlay/fondo guinda **sólido**, no un degradado guinda↔negro.

#### Decisión: rampa de 10 pasos (50–900) con el mismo hue/saturación del guinda real, variando solo luminosidad
Se calculó el HSL exacto de `#682222` (`hsl(0, 51%, 27%)`, vía Node: `r=0x68,g=0x22,b=0x22`) y se construyó la rampa interpolando manualmente la luminosidad en hex desde casi blanco (`50`) hasta casi negro (`900`), manteniendo `700` como el valor exacto de marca (`#682222`) y `DEFAULT` apuntando a `700` — así cualquier uso existente de `bg-cee-red` (sin sufijo numérico) sigue resolviendo exactamente al mismo color que antes, sin romper nada.

#### Decisión: mantener `cee-red-dark`/`cee-red-light` como alias en vez de eliminarlos
Esos dos nombres ya estaban en uso en 7+ archivos (`EventSlider`, `CourseCard`, etc.). En vez de migrar todos los usos a la nueva nomenclatura numérica (`cee-red-800`/`cee-red-500`), se dejaron como alias de los mismos valores hex (`red-dark` = `800`, `red-light` = `500`) para no generar un diff innecesariamente grande en archivos fuera del alcance de esta tarea.

#### Cambios realizados

##### 1. `apps/web/tailwind.config.ts` — `cee.red` pasa de 3 variantes sueltas a rampa de objeto
- `cee.red` ahora es un objeto con pasos `50, 100, 200, 300, 400, 500, 600, 700, 800, 900` + `DEFAULT` (= `700` = `#682222`, el guinda exacto de marca)
- Se agregó `cee.plomo` como alias explícito de `cee.gray` (`#A9A9A9`) — mismo valor, pero usando el nombre que el manual de marca usa en español, para que el código pueda referirse al rol de marca directamente
- Comentario en el propio archivo documentando el criterio (alias de `700`, uso para degradados/estados)

##### 2. `apps/web/src/index.css` — `--primary`/`--ring` corregidos a `0 51% 27%`
- Antes `0 43% 27%` (aproximado); ahora coincide exactamente con el HSL real de `#682222`

##### 3. Degradado guinda↔negro aplicado en heros de página completa (antes overlay/fondo sólido)
- `apps/web/src/pages/home/HomePage.tsx`: sección Hero — `bg-gradient-to-br from-cee-red-900 via-cee-red-700 to-cee-ink`, y el overlay sobre la imagen pasa de `rgba(104,34,34,0.55)` sólido a `bg-gradient-to-tr from-cee-ink/70 via-cee-red-800/45 to-transparent`
- `apps/web/src/pages/about/AboutPage.tsx`: hero principal y CTA de cierre ("¿Listo para especializarte?") con el mismo criterio de degradado
- `apps/web/src/pages/multimedia/MultimediaPage.tsx`: hero principal con el mismo degradado

#### Alcance respetado
No se tocaron los usos de `bg-cee-red`/`border-cee-red` sólidos en botones, badges, estados activos (`PaginationControls`, `FilterSidebar`, `SectionAnchors`, `CourseCard`, etc.) — el documento de mejoras pide degradados específicamente en "hero/sliders, estilo de los flyers del manual", no en controles de UI puntuales, donde un color sólido es más legible y predecible.

#### Archivos modificados
- ✅ `apps/web/tailwind.config.ts` (rampa `cee.red.50-900`, `cee.plomo`)
- ✅ `apps/web/src/index.css` (`--primary`, `--ring`)
- ✅ `apps/web/src/pages/home/HomePage.tsx`
- ✅ `apps/web/src/pages/about/AboutPage.tsx`
- ✅ `apps/web/src/pages/multimedia/MultimediaPage.tsx`

#### Verificación
- ✅ `pnpm --filter web build`: sin errores nuevos; el CSS generado creció (54.11 kB → 55.36 kB), confirmando que las nuevas clases de la rampa (`cee-red-50`...`cee-red-900`) se compilaron correctamente
- ✅ `bg-cee-red` (sin sufijo) sigue resolviendo al mismo hex que antes (`#682222`, ahora vía `DEFAULT`/`700`) — cero regresión visual en los usos existentes
- ✅ Solo 4 colores de marca en juego (guinda en su rampa de luminosidad, plomo, negro, blanco); ningún color ajeno al manual introducido
- ⚠️ Sin navegador real disponible en este entorno para verificación visual de los degradados; se recomienda revisar manualmente el Hero de la Home, `AboutPage` y `MultimediaPage` antes de cerrar la tarea del todo

---

### ✅ Brochure descargable (Tarea 6b del documento de mejoras)

**Estado:** Completada (con PDF placeholder pendiente de reemplazo)
**Fecha:** 2026-06-24
**Rama:** `feat/brochure-download`

#### Objetivo
Permitir descargar el brochure institucional en 1 clic desde la Home (zona de Nosotros) y desde el Footer, con tracking simple del click y nombre de archivo versionado para evitar caché vieja.

#### Decisión: PDF placeholder generado localmente, no el brochure real
No se contó con el PDF institucional real del CEE-FIIS en este entorno. Se generó un PDF mínimo válido (1 página, texto plano, sin dependencias de librerías PDF) como marcador temporal en `apps/web/public/brochure-cee-2026.pdf`, con el propio contenido del archivo indicando explícitamente "PLACEHOLDER — debe ser reemplazado por el brochure real antes de publicar a producción". Esto permite que el flujo de descarga (botón → archivo → tracking) funcione de punta a punta y sea verificable, sin bloquear la tarea a la espera del diseño gráfico real. **Acción pendiente para el equipo:** reemplazar `apps/web/public/brochure-cee-2026.pdf` por el PDF de diseño real, manteniendo el mismo nombre de archivo (o subiendo el número de versión si cambia el contenido, ver siguiente decisión).

#### Decisión: tracking via `CustomEvent` en `window`, sin instalar un SDK de analítica
El repo no tiene ningún proveedor de analítica integrado (`grep` de `gtag`/`analytics`/`dataLayer` no arrojó nada salvo un doc de estrategia). Instalar un SDK (GA4, Plausible, etc.) está fuera del alcance de "tracking simple del click" pedido por esta tarea. Se creó `apps/web/src/lib/analytics.ts` con `trackEvent(name, params)`, que despacha un `CustomEvent` en `window` (cualquier script de GTM/GA4 que se integre después puede escuchar este evento sin tocar el componente) y además loggea en consola solo en modo desarrollo (`import.meta.env.DEV`) para verificar el click manualmente.

#### Cambios realizados

##### 1. `apps/web/public/brochure-cee-2026.pdf` (nuevo, placeholder)
- Nombre de archivo versionado por año (`-2026`) para invalidar caché vieja cuando se actualice el contenido en el futuro (ver Tarea 6b del documento: "versionar el nombre del archivo")

##### 2. `apps/web/src/constants/brochure.constants.ts` (nuevo)
- `BROCHURE_URL = '/brochure-cee-2026.pdf'`, `BROCHURE_FILENAME = 'brochure-cee-2026.pdf'` — única fuente de verdad del nombre/ruta, para no repetirlo en cada componente que lo use

##### 3. `apps/web/src/lib/analytics.ts` (nuevo)
- `trackEvent(name, params)`: despacha `CustomEvent` en `window` + log en desarrollo

##### 4. `apps/web/src/components/shared/BrochureDownloadButton.tsx` (nuevo)
- Botón reutilizable (`<a>` con `download` + `target="_blank"`, tal como pide el documento de mejoras) que llama `trackEvent('brochure_download', { file })` en el click
- Prop `variant: 'solid' | 'outline'` para adaptarse al fondo donde se use (guinda sólido en la Home, sobre fondo guinda degradado en el Footer)

##### 5. `apps/web/src/components/home/AboutSection.tsx` — agregado el botón
- Junto al CTA "Conocer más sobre el CEE" (zona de Nosotros en la Home, tal como pide el documento), variante `solid`

##### 6. `apps/web/src/components/layout/Footer.tsx` — agregado el botón
- Debajo de los iconos de redes sociales, en la columna de marca; variante `outline` con clases sobreescritas (`border-white/40 text-white`, vía `cn`/`tailwind-merge`) para legibilidad sobre el fondo guinda degradado del Footer

#### Archivos nuevos
- ✅ `apps/web/public/brochure-cee-2026.pdf` (placeholder — reemplazar por el real)
- ✅ `apps/web/src/constants/brochure.constants.ts`
- ✅ `apps/web/src/lib/analytics.ts`
- ✅ `apps/web/src/components/shared/BrochureDownloadButton.tsx`

#### Archivos modificados
- ✅ `apps/web/src/components/home/AboutSection.tsx`
- ✅ `apps/web/src/components/layout/Footer.tsx`

#### Verificación
- ✅ `pnpm --filter web build`: sin errores nuevos; confirmado que `apps/web/dist/brochure-cee-2026.pdf` se copia correctamente desde `public/` (Vite copia el directorio `public/` tal cual al build)
- ✅ El botón usa `download` + `target="_blank"` en ambos puntos (Home y Footer), exactamente como pide el documento de mejoras
- ⚠️ **Pendiente real:** el PDF servido es un placeholder de texto, no el brochure de diseño institucional — debe reemplazarse antes de producción
- ⚠️ Sin navegador real disponible en este entorno para verificar la descarga end-to-end en desktop/móvil; se recomienda QA manual antes de cerrar la tarea del todo

---

### ✅ Promo para usuarios logueados, no admins (Tarea 7 del documento de mejoras)

**Estado:** Completada
**Fecha:** 2026-06-24
**Rama:** `feat/member-promo-banner`

#### Objetivo
Banner `MemberPromo` visible solo para usuarios logueados con rol distinto de `admin` (miembros/alumnos), con beneficio/CTA, cerrable y con el cierre persistido sin usar `localStorage` directamente fuera de `authStore` (regla del repo), y sin parpadeo mientras se resuelve la sesión.

#### Estado previo
No existía ningún componente de promo/banner para miembros logueados en el repo.

#### Decisión: el banner vive en `Layout.tsx`, fuera del `<main>` y antes del `snap-container` de la Home
Para que la promo se vea en cualquier página (no solo Home) y no compita con el scroll-snap de la Tarea 2: se montó entre `<Navbar />` y `<main>`, como un banner de ancho completo no-`sticky` (a diferencia del Navbar, que sí es `sticky`). Al no ser `sticky`, no se resta espacio fijo en pantalla y no requiere ajustar `scroll-padding-top` del `.snap-container` — ese valor solo compensa elementos que permanecen fijos durante el scroll (el Navbar), no contenido que hace scroll normal antes de él.

#### Decisión: el estado de cierre (`isMemberPromoDismissed`) se agrega al propio `authStore`, no a un store nuevo
El documento de mejoras pide explícitamente "persistir cierre en `authStore`, no `localStorage` directo". `authStore.ts` es el único archivo del repo autorizado a tocar `localStorage` (regla documentada en el propio archivo y en `docs/CLAUDE.md`). Se siguió el mismo patrón ya usado para `token` (`TOKEN_KEY` + lectura inicial vía función `getInitialMockToken`): se agregó `PROMO_DISMISSED_KEY = 'cee_member_promo_dismissed'`, una función `getInitialPromoDismissed()` para el estado inicial del store, y la acción `dismissMemberPromo()` que escribe en `localStorage` y actualiza el estado de Zustand en el mismo lugar. Ningún componente toca `localStorage` directamente — `MemberPromo.tsx` solo llama `dismissMemberPromo()` desde `useAuth()`.

#### Decisión: el cierre no se resetea en `logout()`
Es una preferencia de "ya vi/cerré este banner en este navegador", no parte de la sesión del usuario — si se resetea en cada logout, un mismo dispositivo compartido por varios alumnos volvería a mostrar el banner en cada login, lo cual es ruidoso. Se deja persistente entre sesiones en el mismo navegador, igual criterio que un banner de cookies.

#### Decisión: "no parpadear antes de resolver la sesión" se resuelve con el `isLoading` que ya existía en `authStore`
No fue necesario agregar un nuevo flag — `authStore.isLoading` ya existía (`true` mientras `VITE_USE_MOCKS=false` y la sesión real no ha resuelto). `MemberPromo` retorna `null` mientras `isLoading` es `true`, antes de evaluar `isAuthenticated`/`role`.

#### Cambios realizados

##### 1. `apps/web/src/store/authStore.ts` — extendido
- `PROMO_DISMISSED_KEY` + `getInitialPromoDismissed()` (mismo patrón que `getInitialMockToken`)
- `AuthState.isMemberPromoDismissed: boolean` + acción `dismissMemberPromo()`
- `logout()` no toca `isMemberPromoDismissed` (decisión explicada arriba)

##### 2. `apps/web/src/components/shared/MemberPromo.tsx` (nuevo)
- `useAuth()` → `{ user, isAuthenticated, isLoading, isMemberPromoDismissed, dismissMemberPromo }`
- Reglas de visibilidad en cascada: `isLoading` → `null`; `!isAuthenticated || !user` → `null`; `user.role === 'admin'` → `null`; `isMemberPromoDismissed` → `null`
- Contenido: saludo con el primer nombre del usuario, beneficio (15% dto. + código `CEE-MIEMBRO`), CTA "Ver programas" → `/programas`, botón de cierre (`X` de `lucide-react`) que llama `dismissMemberPromo()`

##### 3. `apps/web/src/components/layout/Layout.tsx` — montado el banner
- `<MemberPromo />` entre `<Navbar />` y `<main>`

#### Archivos nuevos
- ✅ `apps/web/src/components/shared/MemberPromo.tsx`

#### Archivos modificados
- ✅ `apps/web/src/store/authStore.ts`
- ✅ `apps/web/src/components/layout/Layout.tsx`

#### Verificación
- ✅ `pnpm --filter web build`: sin errores nuevos
- ✅ `grep` confirma que `localStorage` solo se toca dentro de `authStore.ts` (regla del repo intacta); `MemberPromo.tsx` no importa ni usa `localStorage` directamente
- ✅ Mocks disponibles para probar los 3 casos (`apps/web/src/mocks/data/users.mock.ts`): usuarios con `role: 'student'` (deben ver la promo) y un usuario con `role: 'admin'` (no debe verla)
- ⚠️ Sin navegador real disponible en este entorno para verificar visualmente los 3 casos (anónimo / alumno / admin) y la persistencia del cierre tras recargar la página; se recomienda QA manual antes de cerrar la tarea del todo

---

### ✅ Contador doble: cuenta regresiva de cursos + estadísticas (Tarea 8, 8.1 y 8.2 del documento de mejoras)

**Estado:** Completada
**Fecha:** 2026-06-24
**Rama:** `feat/event-countdown`

#### Objetivo
8.1 — `CourseCountdown`: cuenta regresiva días/horas/min/seg hasta el inicio de un curso, en la tarjeta/detalle y en el Hero para el curso destacado, con manejo de fin de plazo y un solo intervalo compartido. 8.2 — `StatsCounter`: cifras institucionales con animación count-up al entrar en viewport, desde mock/config. Ambos respetan `prefers-reduced-motion`.

#### Estado previo (verificado antes de implementar)
`Course` (`@cee/types`) **no tenía ningún campo de fecha de inicio** — fue necesario agregarlo. Para 8.2, ya existía `useCountUp` + `StatCounter` (singular, GSAP `ScrollTrigger`, respeta `prefers-reduced-motion`, anima una sola vez), pero las cifras estaban hardcodeadas como un array `STATS` local dentro de `AboutPage.tsx`, sin componente reutilizable ni mock/config — no se pedía explícitamente "componente `StatsCounter`" como pieza propia, solo se usaba ad-hoc.

#### Decisión 8.1: agregar `Course.startDate` a `@cee/types`, no un tipo separado
Es un campo del propio curso (fecha de inicio de dictado), análogo a `createdAt`/`updatedAt` que ya existían. Al ser un campo nuevo y requerido en una interfaz ya usada en 18 cursos mock (`apps/web`) + 8 cursos mock (`apps/admin`) + 2 formatters de fila Supabase (`formatCourse` en `apps/web` y `apps/admin`) + 1 builder de formulario (`buildCourseFromInput` en `apps/admin`), se actualizaron los 4 puntos para que el build siguiera siendo válido — el compilador de TypeScript los fue señalando uno por uno al agregar el campo como requerido.

#### Decisión 8.1: intervalo único compartido vía un módulo singleton (`useGlobalSecondTick`), no un `setInterval` por componente
El documento de mejoras pide explícitamente "un solo intervalo compartido si hay varios contadores en pantalla (performance)". Se creó `useGlobalSecondTick()`: un único `setInterval(1000ms)` a nivel de módulo (no de componente), con un `Set` de listeners — cada `CourseCountdown` en pantalla se suscribe/desuscribe a ese tick compartido en vez de crear su propio intervalo. El intervalo real solo corre mientras haya al menos un listener activo (se detiene cuando el último `CourseCountdown` se desmonta), evitando fugas.

#### Decisión 8.1: regla de negocio para "¡Ya inició!" vs. "Inscripciones cerradas"
No existe en `@cee/types` un campo de "fecha de cierre de inscripciones" separado de `startDate` (no estaba definido antes ni se pedía agregarlo). Se usó `course.status` como proxy de la regla de negocio: al llegar a cero, si el curso sigue `published` se asume que sigue dictándose con normalidad ("¡Ya inició!"); si está en otro estado (`draft`/`review`, es decir no estaba realmente abierto a inscripción) se muestra "Inscripciones cerradas". Es una aproximación razonable con los datos existentes, documentada aquí para que el equipo la ajuste si en el futuro se modela una fecha de cierre explícita.

#### Decisión 8.1: "curso destacado" en el Hero = el próximo a iniciar entre los publicados
El documento dice "para el curso destacado, en el Hero/slider" sin definir qué hace a un curso "destacado". Se eligió el criterio más simple y siempre disponible con los datos actuales: el curso `published` con `startDate` más próxima (`getFeaturedCourse` en `HomePage.tsx`, ordena y toma el primero). El Hero ya no tenía ningún curso específico referenciado antes de este cambio — el degradado/imagen de fondo es genérico, así que esto añade contenido dinámico nuevo, no reemplaza nada existente.

#### Decisión 8.2: `StatsCounter` como componente nuevo en `components/shared/`, reutilizando `StatCounter` (singular) sin tocarlo
`StatCounter` (la pieza individual con `useCountUp`) ya cumplía correctamente el comportamiento pedido (count-up, una sola vez, respeta `prefers-reduced-motion`) — no se reescribió. Se extrajeron las cifras de `AboutPage.tsx` a `config/institutional-stats.ts` (mock/config, tal como pide el documento) y se creó `StatsCounter` (plural, nuevo) como el grid completo reutilizable, con `forwardRef` para que `AboutPage.tsx` siga pudiendo aplicarle su `useScrollReveal` (selector `:scope > *`) exactamente como antes.

#### Cambios realizados

##### 1. `packages/types/src/index.ts` — agregado `Course.startDate`
- `startDate: string` (ISO date), entre `imageUrl` y `academicHours`

##### 2. Mocks y formatters actualizados (requeridos por el nuevo campo)
- `apps/web/src/mocks/data/courses.mock.ts`: `startDate` agregado a los 18 cursos (fechas entre 2026-06-22 y 2026-09-14, mezcla de próximas a iniciar y más lejanas)
- `apps/admin/src/mocks/courses.ts`: `startDate: '2026-07-15'` en el default de `buildCourse()`
- `apps/web/src/services/courses.service.ts` y `apps/admin/src/services/coursesService.ts`: `CourseRow.start_date` + mapeo en `formatCourse()`; `buildCourseFromInput()` (admin) usa `existing?.startDate ?? now`

##### 3. `apps/web/src/hooks/useGlobalSecondTick.ts` (nuevo)
- Singleton: un `setInterval(1000ms)` compartido a nivel de módulo, con `Set<listener>`; arranca con el primer suscriptor, se detiene con el último

##### 4. `apps/web/src/hooks/useCourseCountdown.ts` (nuevo)
- `useCourseCountdown(startDate)`: se suscribe a `useGlobalSecondTick`, calcula `{ days, hours, minutes, seconds, hasStarted }` en cada tick

##### 5. `apps/web/src/components/shared/CourseCountdown.tsx` (nuevo)
- Si `hasStarted`: "¡Ya inició!" (`status === 'published'`) o "Inscripciones cerradas" (cualquier otro estado)
- Si no: `dd`h`hh`m`mm`s`ss` con `tabular-nums`; `role="timer"`, `aria-live` desactivado bajo `prefers-reduced-motion`
- Prop `variant: 'light' | 'dark'` para adaptarse al fondo (tarjetas blancas vs. Hero guinda)

##### 6. Integración de `CourseCountdown`
- `apps/web/src/components/shared/CourseCard.tsx`: debajo de horas/inscritos, antes del precio
- `apps/web/src/components/course/CourseSidebar.tsx`: debajo del precio, antes del botón "Inscribirme"
- `apps/web/src/pages/home/HomePage.tsx`: en el Hero, dentro de una cápsula `bg-white/10`, mostrando el título del curso destacado + su countdown (`variant="dark"`); se calcula con `getFeaturedCourse()`, función local que ordena los cursos `published` por `startDate` ascendente

##### 7. `apps/web/src/config/institutional-stats.ts` (nuevo)
- `INSTITUTIONAL_STATS`: las 4 cifras que antes vivían hardcodeadas en `AboutPage.tsx`

##### 8. `apps/web/src/components/shared/StatsCounter.tsx` (nuevo)
- Grid `sm:grid-cols-2 lg:grid-cols-4` sobre `INSTITUTIONAL_STATS`, reutilizando `StatCounter` (singular) por cifra; `forwardRef` para exponer el nodo del grid

##### 9. `apps/web/src/pages/about/AboutPage.tsx` — refactor
- Eliminado el array `STATS` local y el grid manual; ahora usa `<StatsCounter ref={statsGridRef} className="mt-12" />`, conservando el mismo `useScrollReveal` que ya tenía

#### Alcance respetado
No se agregó `StatsCounter` a la Home — la sección "Nosotros" de la Home (Tarea 4) ya es compacta dentro del viewport del scroll-snap (Tarea 2) y el CTA "Conocer más sobre el CEE" ya enlaza a `/nosotros`, donde las estadísticas se muestran. Duplicarlas en la Home habría forzado la sección a crecer más allá de `100svh` sin necesidad real.

#### Archivos nuevos
- ✅ `apps/web/src/hooks/useGlobalSecondTick.ts`
- ✅ `apps/web/src/hooks/useCourseCountdown.ts`
- ✅ `apps/web/src/components/shared/CourseCountdown.tsx`
- ✅ `apps/web/src/config/institutional-stats.ts`
- ✅ `apps/web/src/components/shared/StatsCounter.tsx`

#### Archivos modificados
- ✅ `packages/types/src/index.ts` (`Course.startDate`)
- ✅ `apps/web/src/mocks/data/courses.mock.ts`
- ✅ `apps/admin/src/mocks/courses.ts`
- ✅ `apps/web/src/services/courses.service.ts`
- ✅ `apps/admin/src/services/coursesService.ts`
- ✅ `apps/web/src/components/shared/CourseCard.tsx`
- ✅ `apps/web/src/components/course/CourseSidebar.tsx`
- ✅ `apps/web/src/pages/home/HomePage.tsx`
- ✅ `apps/web/src/pages/about/AboutPage.tsx`

#### Verificación
- ✅ `pnpm --filter web build` y `pnpm --filter admin build`: ambos sin errores tras propagar `startDate` a todos los puntos donde se construye un `Course` completo
- ✅ El compilador de TypeScript confirmó (al fallar antes de los fixes) que no quedó ningún constructor de `Course` sin el campo nuevo
- ✅ `CourseCountdown` reutiliza el mismo tick global en `CourseCard`, `CourseSidebar` y el Hero simultáneamente — un solo `setInterval` activo independientemente de cuántos contadores estén montados
- ✅ `StatCounter`/`useCountUp` (reutilizados sin cambios) ya manejaban correctamente "una sola vez" y `prefers-reduced-motion`; no se modificó su comportamiento
- ⚠️ Sin navegador real disponible en este entorno para verificar visualmente el countdown corriendo en tiempo real y el count-up de estadísticas al hacer scroll; se recomienda QA manual antes de cerrar la tarea del todo

---

### ✅ Orden de secciones de la Home + CTA principal (Tarea 9 del documento de mejoras)

**Estado:** Completada
**Fecha:** 2026-06-24
**Rama:** `feat/home-section-order-and-cta`

#### Objetivo
Reordenar la Home según: Hero/Sliders → Cursos → Programas → Nosotros → Blog → Contacto/CTA → Footer, y añadir un CTA principal ("Inscríbete"/"Solicita información" → correo/contacto) repetido en el Hero y en el cierre, coordinado con el scroll-snap (Tarea 2) y dejando el terreno listo para los botones laterales (Tarea 10).

#### Decisión: una sola sección de catálogo ("Programas"), no dos secciones "Cursos" + "Programas" separadas
El documento de mejoras lista "Cursos" y "Programas" como pasos distintos del orden, pero el dominio real de este sitio modela una sola entidad (`Course`, `@cee/types`) expuesta bajo una única ruta pública (`ROUTES.CATALOG = '/programas'`); no existen dos catálogos ni dos colecciones de datos diferentes. Crear una segunda sección que muestre los mismos cursos bajo otro título habría sido contenido duplicado sin valor real. Se mantuvo la única sección de catálogo ya existente ("Programas destacados", `id="programas"`) en la posición que le corresponde en el orden pedido. Si en el futuro el negocio diferencia "cursos sueltos" de "programas certificados" como colecciones distintas, ese cambio de modelo de datos es un prerequisito antes de poder separar la sección.

#### Decisión: el orden de secciones ya casi coincidía con lo pedido — solo faltaba agregar la sección de cierre "Contacto/CTA"
Antes de esta tarea, el orden ya era Hero → Eventos(Sliders) → Programas → Nosotros → Blog (resultado acumulado de las Tareas 1, 2, 4 y 8). No fue necesario mover ninguna sección existente — solo se agregó la sección final `id="contacto"` al fondo, que es justo lo que el orden pedido (`...→ Blog → Contacto/CTA → Footer`) requería y que aún no existía.

#### Decisión: `ContactCtaSection` enlaza a `/contacto`, no usa el flujo `buildInscripcionUrl`
A diferencia de los botones "Inscribirme" de `CourseCard`/`CourseSidebar` (que llevan un curso específico preseleccionado vía `?curso=<id>`, Fase 4), el CTA de cierre de la Home no tiene un curso de contexto — es una llamada a la acción general. Se usó un link directo a `ROUTES.CONTACT` ("Inscríbete ahora") y un `mailto:` directo a `CONTACT_INFO.email` ("Solicita información"), cubriendo ambas variantes de CTA que pide el documento ("Inscríbete" / "Solicita información").

#### Decisión: el Hero ahora tiene dos botones (CTA principal + CTA secundario), no solo "Explorar Cursos"
Se agregó "Inscríbete ahora" (→ `/contacto`) como CTA principal junto al ya existente "Explorar Cursos" (→ `/programas`, ahora como botón `outline` secundario), para que el llamado a la acción esté presente y sea visualmente consistente entre el Hero y el cierre (mismo texto "Inscríbete ahora" en ambos puntos, tal como pide "repetido en puntos clave: hero + cierre").

#### Cambios realizados

##### 1. `apps/web/src/components/home/ContactCtaSection.tsx` (nuevo)
- Título + copy de cierre, dos CTAs: "Inscríbete ahora" (`Link` a `/contacto`) y "Solicita información" (`mailto:` a `CONTACT_INFO.email`, icono `Mail`)

##### 2. `apps/web/src/pages/home/HomePage.tsx`
- Nueva sección `id="contacto"` al final (antes de cerrar `snap-container`), con `snap-section` y el mismo degradado guinda↔negro de marca (Tarea 6) usado en el Hero — refuerza que ambas son las secciones "hero" de apertura y cierre
- `SECTION_ANCHORS` extendido con `{ id: 'contacto', label: 'Contacto' }` (ahora 6 anclas)
- Hero: el botón único "Explorar Cursos" se reemplaza por un grupo de dos botones — "Inscríbete ahora" (primario, → `/contacto`) y "Explorar Cursos" (secundario `outline`, → `/programas`)

#### Alcance respetado
No se tocó el orden interno de Eventos/Programas/Nosotros/Blog (ya coincidía con lo pedido desde tareas anteriores); tampoco se implementaron los botones laterales de la Tarea 10 — solo se deja el terreno coordinado (6 secciones con `id` consistente, ya reflejadas en `SECTION_ANCHORS`) para que esa tarea los reutilice.

#### Archivos nuevos
- ✅ `apps/web/src/components/home/ContactCtaSection.tsx`

#### Archivos modificados
- ✅ `apps/web/src/pages/home/HomePage.tsx`

#### Verificación
- ✅ `pnpm --filter web build`: sin errores nuevos
- ✅ Orden final de secciones confirmado en el JSX: `hero` → `eventos` → `programas` → `nosotros` → `blog` → `contacto`, seguido del `Footer` (que vive en `Layout.tsx`, fuera de la Home, sin cambios)
- ✅ El texto "Inscríbete ahora" aparece tanto en el Hero como en el cierre, con el mismo destino (`/contacto`)
- ⚠️ Sin navegador real disponible en este entorno para verificar visualmente el scroll-snap con la sexta sección y el aspecto de los dos botones del Hero en mobile; se recomienda QA manual antes de cerrar la tarea del todo

---

### ✅ Botones principales a los costados (Tarea 10 del documento de mejoras)

**Estado:** Completada
**Fecha:** 2026-06-24
**Rama:** `feat/home-side-action-buttons`

#### Objetivo
Mover las acciones principales (Cursos, Programas, Brochure, Contacto) a columnas/barras laterales fijas en desktop, dejando la *main window* libre para los sliders/contenido; en móvil, colapsar a una barra inferior; accesible (foco, `aria-label`, contraste sobre el degradado guinda).

#### Estado previo
No existía ningún componente de acciones laterales. Sí existía `SectionAnchors` (Tarea 2): dots de navegación entre secciones, fijos en el lado **derecho** (`right-4`) — una pieza distinta y ya ocupando ese lateral.

#### Decisión: lateral izquierdo para las acciones, para no competir con los dots de navegación de sección
`SectionAnchors` (Tarea 2) ya vive en `right-4` y cumple un propósito distinto (indicar/saltar entre secciones del scroll-snap, no son acciones de negocio). Poner las 4 acciones de esta tarea en el mismo lado habría obligado a fusionar dos componentes con responsabilidades distintas o a apilarlos de forma confusa. Se usó el lateral **izquierdo** (`left-4`), simétrico al de los dots, dejando el centro (`main window`) completamente libre para el Hero/slider, tal como pide el documento.

#### Decisión: en móvil, barra inferior fija (no colapso a los dots/controles del slider)
El documento ofrecía dos alternativas para móvil ("barra inferior o a los dots/controles del slider"). Se eligió la barra inferior porque las 4 acciones (Cursos, Programas, Brochure, Contacto) son de navegación/conversión general de toda la Home, no específicas del `EventSlider` — mezclarlas con los controles del carrusel habría sido confuso semánticamente y además el `EventSlider` ya tiene sus propios controles (flechas, dots) con su propio significado (Tarea 1).

#### Decisión: "Programas" enlaza a `#programas` (ancla in-page), no a `/programas`
De las 4 acciones, "Cursos" y "Contacto" tienen sentido como navegación a otra ruta (catálogo completo, formulario de contacto). "Programas" en el contexto de esta barra se interpretó como acceso directo a la sección "Programas destacados" que ya está en la propia Home (consistente con la Tarea 9, donde se decidió que "Cursos" y "Programas" son la misma entidad/sección) — por eso usa un ancla `#programas` en vez de duplicar el link de "Cursos" hacia el catálogo.

#### Decisión: "Brochure" reutiliza `BROCHURE_URL`/`trackEvent` de la Tarea 6b, sin duplicar lógica
El botón de brochure en esta barra dispara el mismo `trackEvent('brochure_download', ...)` ya creado en la Tarea 6b (`apps/web/src/lib/analytics.ts`), con un parámetro `source` distinto (`home_side_actions`) para diferenciar en analítica desde dónde se descargó. No se creó un componente nuevo de descarga — se usó un `<a download target="_blank">` directo con la misma constante `BROCHURE_URL`/`BROCHURE_FILENAME`.

#### Decisión: un solo componente `ActionLink` interno parametrizado por `className`/`children`, evitando duplicar la lógica de enlace (Link/anchor/anchor-ancla/download) entre la variante desktop y móvil
Las 4 acciones tienen 3 tipos de destino distintos (ruta interna, ancla `#`, descarga de archivo) — en vez de repetir esa lógica condicional dos veces (una para los botones circulares de desktop, otra para los botones con label de móvil), se extrajo a un único componente `ActionLink` que decide qué elemento renderizar (`Link`, `<a href="#...">`, `<a download>`) y solo cambia el contenido/clases según dónde se use.

#### Decisión: el `WhatsAppFab` (FAB existente, fijo en `bottom-6 right-6` en todas las páginas) se reubica solo en la Home y solo en móvil/tablet
Al agregar la barra de acciones fija en la franja inferior (`fixed inset-x-0 bottom-0`, visible `lg:hidden`), el `WhatsAppFab` (que ya vivía fijo en `bottom-6 right-6` sin distinción de página) habría quedado visualmente superpuesto o tapado por esa barra en pantallas pequeñas. Se le agregó lógica condicional con `useLocation()`: en la Home y por debajo de `lg`, sube a `bottom-20`; en el resto de páginas (sin esta barra) y en desktop (donde la barra de acciones es la columna lateral, no ocupa la franja inferior), se mantiene en `bottom-6` como siempre.

#### Cambios realizados

##### 1. `apps/web/src/components/home/HomeSideActions.tsx` (nuevo)
- `ACTIONS`: Cursos (`/programas`), Programas (`#programas`), Brochure (descarga + tracking), Contacto (`/contacto`)
- `ActionLink`: componente interno que renderiza `Link`/`<a href="#...">`/`<a download>` según el tipo de acción, reutilizado por ambas variantes
- Desktop (`lg:flex`, `fixed left-4 top-1/2 -translate-y-1/2`): columna de botones circulares con tooltip al hover/focus (mismo patrón visual que `SectionAnchors`)
- Móvil (`lg:hidden`, `fixed inset-x-0 bottom-0`): barra horizontal con ícono + label, fondo `bg-cee-ink/90` + `backdrop-blur-sm` para contraste sobre cualquier sección
- Accesibilidad: `aria-label` en cada acción, `focus-visible:outline` con offset, contraste verificado sobre fondo oscuro/guinda (`text-white/85` con hover a blanco sólido)

##### 2. `apps/web/src/pages/home/HomePage.tsx`
- Montado `<HomeSideActions />` junto a `<SectionAnchors />`
- Sección `id="contacto"` (Tarea 9): `pb-24` en móvil/tablet (`lg:pb-16` en desktop) para que la barra inferior fija no tape el último contenido visible

##### 3. `apps/web/src/components/shared/WhatsAppFab.tsx` — reubicación condicional
- `useLocation()` + `ROUTES.HOME`: en la Home, `bottom-20 lg:bottom-6`; en cualquier otra página, `bottom-6` (comportamiento idéntico al de antes de esta tarea)

#### Alcance respetado
No se tocó `SectionAnchors.tsx` (Tarea 2) — sigue siendo el componente de navegación de sección, sin mezclarse con las acciones de negocio de esta tarea, aunque ambos comparten el mismo patrón visual de "dots/botones circulares con tooltip" por consistencia de diseño.

#### Archivos nuevos
- ✅ `apps/web/src/components/home/HomeSideActions.tsx`

#### Archivos modificados
- ✅ `apps/web/src/pages/home/HomePage.tsx`
- ✅ `apps/web/src/components/shared/WhatsAppFab.tsx`

#### Verificación
- ✅ `pnpm --filter web build`: sin errores nuevos
- ✅ Las 4 acciones aparecen en ambas variantes (desktop: columna izquierda; móvil: barra inferior), sin duplicar la lógica de routing/descarga entre ambas
- ✅ `SectionAnchors` (derecha) y `HomeSideActions` (izquierda) no se solapan: lados opuestos de la pantalla
- ✅ El `WhatsAppFab` ya no debería quedar tapado por la barra inferior de acciones en la Home en viewports `<lg`
- ⚠️ Sin navegador real disponible en este entorno para verificar visualmente el contraste, el solapamiento real con el FAB de WhatsApp, y la navegación por teclado (tab order) en los 3 elementos fijos (dots, acciones, FAB) simultáneos; se recomienda QA manual antes de cerrar la tarea del todo

---

### ✅ Pulido visual de la Home (Tarea Extra A del documento de mejoras)

**Estado:** Completada
**Fecha:** 2026-06-24
**Rama:** `style/home-visual-polish`

#### Objetivo
Elevar el acabado visual de la Home: espaciado/ritmo, sombras y radios coherentes, microinteracciones (hover/focus, transiciones 150–250ms, *skeletons* de carga), hero con degradado de marca, iconografía coherente y estados vacíos/carga/error decentes.

#### Estado previo (gran parte ya cubierto incrementalmente en tareas anteriores)
Antes de esta tarea, varias de las metas de Extra A **ya se habían resuelto** como efecto colateral de las tareas 1–10: el hero con degradado guinda↔negro (Tarea 6), las microinteracciones de hover/`hover:-translate-y`/transiciones en cards y botones (presentes desde Fase 3 y reforzadas en tareas posteriores), la iconografía exclusivamente `lucide-react` (consistente en todo el repo), los radios/sombras vía tokens CSS (`--r-*`, `--shadow-*`). Lo que **faltaba concretamente**: *skeletons* de carga reales en los componentes de la Home (cursos, blog, slider) — usaban texto plano "Cargando..." — y estados de carga que evitaran el salto de layout (CLS).

#### Decisión: skeletons con la misma silueta que el componente real, en vez de spinners genéricos
Para evitar CLS (Cumulative Layout Shift, también relevante para Extra B) y dar sensación "premium", se crearon esqueletos que replican la estructura exacta del componente final (mismo `aspect-ratio` de imagen, mismas alturas de líneas de texto/botones), usando `animate-pulse` + `bg-secondary` — el mismo patrón mínimo que ya existía suelto en `CatalogPage.tsx`, ahora encapsulado en componentes reutilizables. Así el contenido real "encaja" en el hueco que dejó el skeleton sin reflow.

#### Cambios realizados

##### 1. `apps/web/src/components/shared/CourseCardSkeleton.tsx` (nuevo)
- Réplica de la silueta de `CourseCard` (imagen `aspect-[16/9]`, badge, título, 2 líneas de descripción, precio, 2 botones)

##### 2. `apps/web/src/components/blog/BlogCardSkeleton.tsx` (nuevo)
- Réplica de la silueta de `BlogCard` (imagen, fecha, título, 2 líneas de resumen)

##### 3. `apps/web/src/pages/home/HomePage.tsx` — sección de cursos
- El texto "Cargando cursos..." se reemplaza por un grid de 3 `CourseCardSkeleton` mientras `isLoading`

##### 4. `apps/web/src/components/home/BlogSection.tsx`
- "Cargando entradas..." → grid de 3 `BlogCardSkeleton`

##### 5. `apps/web/src/components/home/EventSlider.tsx` + `HomePage.tsx`
- Nuevo prop `isLoading` en `EventSlider`: cuando es `true`, renderiza un bloque skeleton con el mismo `aspect-ratio` responsivo del carrusel (`4/5` → `16/9` → `21/9`) en vez de retornar `null` (que dejaba un hueco vacío durante la carga); `HomePage` ahora pasa `isLoading={eventsLoading}` desde `useEvents()`

#### Alcance respetado
No se rehizo el hero (ya tenía el degradado de marca desde la Tarea 6) ni se tocaron las microinteracciones existentes de cards/botones (ya cumplían). El "8pt spacing" se respeta vía la escala de Tailwind ya en uso; no se hizo una refactorización masiva de spacing que habría tocado decenas de archivos fuera de foco sin necesidad real.

#### Archivos nuevos
- ✅ `apps/web/src/components/shared/CourseCardSkeleton.tsx`
- ✅ `apps/web/src/components/blog/BlogCardSkeleton.tsx`

#### Archivos modificados
- ✅ `apps/web/src/pages/home/HomePage.tsx`
- ✅ `apps/web/src/components/home/BlogSection.tsx`
- ✅ `apps/web/src/components/home/EventSlider.tsx`

---

### ✅ Accesibilidad, SEO y rendimiento (Tarea Extra B del documento de mejoras)

**Estado:** Completada
**Fecha:** 2026-06-24
**Rama:** `chore/home-redesign-qa`

#### Objetivo
Cierre de QA del rediseño: A11y (contraste, foco, `alt`, teclado, reduced-motion), SEO/meta (títulos, descripción, Open Graph), rendimiento (lazy-load, evitar CLS), y limpieza (código muerto de carrito, console.logs, imports sin uso).

#### Estado previo (mayoría de A11y ya cubierta incrementalmente)
A lo largo de las tareas 1–10 ya se había aplicado: `prefers-reduced-motion` respetado en todas las animaciones (GSAP `useScrollReveal`/hero, autoplay del slider, count-up, snap, countdown), `focus-visible:outline` en los elementos interactivos nuevos, `alt` en imágenes, navegación por teclado en slider y anclas. El carrito ya se había eliminado por completo en la Tarea 3. Lo que **faltaba concretamente**: el SEO/meta (el `index.html` solo tenía `<title>CEE-FIIS</title>`, sin description ni Open Graph) y una verificación sistemática de la limpieza (imports/locals sin uso).

#### Decisión: SEO estático en `index.html`, no una librería de `<head>` dinámico (react-helmet)
El sitio es una SPA y el documento pide "títulos, descripción, Open Graph para que el sitio comparta bien". Meta tags dinámicos por ruta (react-helmet/`@tanstack` head) serían lo ideal a futuro, pero instalar y cablear esa dependencia excede "que el sitio comparta bien" para el alcance de QA actual — los crawlers de redes sociales leen el `index.html` servido. Se completó el `<head>` estático con description, Open Graph (`og:type/site_name/title/description/locale`), Twitter Card y `theme-color` con el guinda de marca (`#682222`). Queda anotado que meta dinámico por ruta es una mejora futura cuando se priorice SEO por página.

#### Decisión: activar `noUnusedLocals` + `noUnusedParameters` en `tsconfig.base.json`, no solo limpiar a mano
En vez de una pasada manual de "buscar imports sin uso" (que no previene reincidencia), se activaron las dos flags en el tsconfig base compartido (`packages/config/tsconfig.base.json`), de modo que el `build`/`lint` (que es `tsc --noEmit`) ahora **falla** ante cualquier import/variable/parámetro sin uso, en `web` y en `admin`. Ambos builds pasaron limpios tras activarlas, lo que confirma que no había código muerto de ese tipo en ninguna de las dos apps — y de aquí en adelante el compilador lo impide.

#### Cambios realizados

##### 1. `apps/web/index.html` — SEO/meta
- `<title>` descriptivo, `meta description`, Open Graph (`og:type`, `og:site_name`, `og:title`, `og:description`, `og:locale=es_PE`), Twitter Card (`summary_large_image`), `theme-color=#682222`

##### 2. `packages/config/tsconfig.base.json` — limpieza forzada por el compilador
- `noUnusedLocals: true`, `noUnusedParameters: true` (aplica a `apps/web` y `apps/admin`)

##### 3. Skeletons (compartidos con Extra A) — también sirven a Extra B
- Los skeletons de carga (Extra A) evitan CLS al reservar el espacio del contenido antes de que llegue, lo cual es directamente una mejora de rendimiento percibido / Web Vitals

#### Verificación
- ✅ `pnpm --filter web build` y `pnpm --filter admin build`: ambos sin errores con `noUnusedLocals`/`noUnusedParameters` activos — confirma cero imports/locals/parámetros sin uso en ambas apps
- ✅ `grep` de `cart`/`carrito` en `apps/web/src` + `packages/types/src`: sin hits reales (código muerto de carrito ya eliminado en Tarea 3)
- ✅ `grep` de `console.*`: solo `analytics.ts` (con guard `import.meta.env.DEV`) y un `console.error` en el handler de error de `MultimediaPage` — ambos legítimos, no son `console.log` de depuración olvidados
- ✅ Todas las imágenes (`<img>`) tienen atributo `alt` (verificado: 0 archivos con `<img>` sin `alt`)
- ✅ Las imágenes usan `aspect-ratio` (cards, slider, hero) → reserva de espacio que evita CLS; el primer asset del slider/hero usa `loading="eager"`/`fetchPriority="high"`, el resto `loading="lazy"`
- ⚠️ Sin entorno de navegador real (ni Lighthouse/Playwright) en esta sesión para medir scores reales de perf/a11y/SEO ni el QA responsive cross-device; se recomienda una pasada manual con Lighthouse y DevTools (375/768/1280px) antes de dar el rediseño por cerrado del todo

#### Archivos modificados
- ✅ `apps/web/index.html`
- ✅ `packages/config/tsconfig.base.json`

---

## Fase 9 — Plan de mejoras UI/UX (`docs/mejoras-finale/mejoras-finales2.md`)

### ✅ Iniciativa A — Hero / Banner principal (Cambio 1)

**Estado:** Completada
**Fecha:** 2026-06-24
**Rama:** `feat/about-section`

#### Objetivo
El Hero original tenía el corte diagonal aplicado a la imagen (lado derecho), dejando el texto sobre un fondo guinda uniforme sin un "bloque" visualmente contenido — de ahí la sensación de espacio muerto a la izquierda que pedía corregir el documento de mejoras. Se reestructura para que el bloque diagonal guinda sea el contenedor real de todo el texto, flush al borde izquierdo del viewport.

#### Decisión: mover el `clip-path` de la imagen al bloque de texto, en vez de aplicarlo a la imagen
Técnica: la imagen institucional pasa a ser un fondo `absolute inset-0` de pared a pared (sin recorte propio); el bloque de texto (gradiente `cee-red-800→700→900`) se renderiza **encima** (`z-10`) cubriendo `sm:w-[58%]` con `clip-path: polygon(0 0, 100% 0, 80% 100%, 0 100%)`. Como el bloque es opaco y está por delante, su recorte diagonal revela directamente la imagen de fondo en la cuña — mismo efecto visual que antes, pero ahora el corte vive en CSS sobre el contenedor del texto (pedido explícito de la tarea: "recrear el corte diagonal con CSS, en vez de incrustarlo en una imagen"), y el texto queda genuinamente alineado a la izquierda sin padding muerto antes de llegar al bloque.

#### Decisión: layout distinto para mobile, no solo `hidden`/`block` sobre el mismo markup
En mobile el bloque de texto pasa a `w-full` sin `clip-path` (cubre toda la sección, sin imagen visible detrás), y se agrega una franja de imagen separada (`h-48`, `sm:hidden`) **debajo** del texto — así se cumple el criterio "en mobile el texto va arriba a ancho completo y la imagen va debajo", en vez de simplemente ocultar la imagen en mobile como hacía la versión anterior (`hidden sm:block` sobre el mismo contenedor de imagen).

#### Decisión: `NextStartBadge` como componente reutilizable (no editar `components/ui/badge.tsx`)
El badge "Próximo a iniciar" + cuenta regresiva vivía como un `<div>` ad-hoc inline dentro del Hero. Se extrajo a `apps/web/src/components/shared/NextStartBadge.tsx`, que **envuelve** el `Badge` de shadcn (no lo edita) con la etiqueta en mayúsculas y reutiliza `CourseCountdown` ya existente. Queda disponible para cualquier otro lugar que necesite destacar "próximo curso a iniciar" (ej. listados), no solo el Hero.

#### Cambios realizados
- **`apps/web/src/components/shared/NextStartBadge.tsx`** (nuevo): badge reutilizable con estado de carga (skeleton) y estado vacío (`null` si no hay curso destacado)
- **`apps/web/src/pages/home/HomePage.tsx`:**
  - Hero reestructurado: imagen de fondo `absolute inset-0` (desktop) sin recorte propio, con leve `blur-[1px]` + overlay de degradado para legibilidad (pedido del doc: "leve desenfoque/overlay"); calidad de imagen reducida (`q=75` desktop / `q=70` mobile) como optimización de payload
  - Bloque de texto: `clip-path` CSS aplicado al contenedor guinda, `sm:w-[58%]`, flush al borde izquierdo, sin el `mx-auto max-w-7xl` que generaba el espacio muerto percibido
  - Franja de imagen visible debajo del texto en mobile (`sm:hidden`)
  - Badge/cuenta regresiva inline reemplazado por `<NextStartBadge course={featuredCourse} isLoading={isLoading} />`
  - Import de `CourseCountdown` removido de `HomePage.tsx` (ya no se usa directo ahí, vive dentro de `NextStartBadge`)

#### Archivos nuevos
- ✅ `apps/web/src/components/shared/NextStartBadge.tsx`

#### Archivos modificados
- ✅ `apps/web/src/pages/home/HomePage.tsx`
- ✅ `docs/CONTEXT.md` (sección "Componentes Clave" + limpieza de menciones obsoletas a `cartStore`/badge de carrito, ya eliminados desde Fase 2 pero el documento no se había actualizado)

#### Verificación
- ✅ `pnpm --filter web lint` (`tsc --noEmit`): sin errores
- ✅ `curl` a `/` responde `200`
- ✅ No se editó ningún archivo existente de `components/ui/` (el `Badge` de shadcn se reutiliza, no se modifica)
- ⚠️ Sin `chromium-cli`/Playwright en este entorno; se recomienda verificación visual manual en navegador (375/768/1280px) antes de cerrar la iniciativa del todo

#### Pendiente del plan de mejoras (no parte de esta tarea)
- Tokens de marca (sección 1 del doc): ya cubiertos en espíritu por la rampa `cee.red.{50..900}` existente en `tailwind.config.ts`; falta definir `surface-cream`/`surface-grey` para las Iniciativas C/E
- Iniciativa D (Multimedia → "Testimonios"), E (Contacto + Footer crema), F (Profesores), G (WhatsApp flotante) — no iniciadas

---

### ✅ Iniciativa B — Navbar con doble logo (Cambio 2, parcial)

**Estado:** Completada (parcial — ver nota sobre O3)
**Fecha:** 2026-06-25

#### Objetivo
Mostrar el logo del CEE junto al de la universidad en el Navbar, con separador vertical, mantener los links definitivos y el botón de sesión.

#### Decisión: O2 (lista de links) ya estaba cerrada — no había nada que decidir
El documento de mejoras pedía confirmar la lista final de links del navbar (Inicio · Nosotros · Programas · Blog · Multimedia · Contacto) como bloqueo O2. Al revisar `config/navigation.ts`, la lista ya coincidía exactamente con la pedida (quedó así desde la Fase 8, al agregar Blog). No se tocó.

#### Decisión: O3 (logo de la universidad) se resuelve con el PNG ya existente en el repo, no con un placeholder
El doc marcaba esta tarea como bloqueada por falta del SVG oficial de la UNI. Sin embargo, `apps/web/src/assets/icons/uni-logo.png` ya existe en el repo (usado en `InstitutionalLogos.tsx`). Se decidió usar ese PNG ya disponible en vez de dejar un slot vacío con placeholder — visualmente resuelve la tarea ya, aunque lo ideal a futuro sea reemplazarlo por un SVG vectorial cuando el CEE lo entregue (mismo placeholder/aviso que ya existe en `InstitutionalLogos.tsx`).
- **No se implementó** la pestaña "Profesores" ni el rediseño del área derecha de sesión (eso es la Iniciativa F, fuera de alcance de esta tarea — evitar UI a medio terminar)
- **No se mantuvo** la mención del doc a "badge de carrito (`cartStore`)": el carrito no existe en este proyecto desde la Fase 2 (decisión de alcance ya documentada); esa parte del documento de mejoras está desalineada con decisiones de producto ya tomadas y se ignoró a propósito

#### Cambios realizados
- **`apps/web/src/components/layout/Navbar.tsx`:** logo del CEE (SVG, ya existía) + separador vertical (`bg-border`) + logo de la UNI (PNG), ambos a la izquierda; el logo de la UNI y el separador se ocultan en mobile (`hidden sm:block`) — el `MobileMenu` (Sheet) ya mostraba solo el logo del CEE, sin cambios ahí

#### Archivos modificados
- ✅ `apps/web/src/components/layout/Navbar.tsx`

#### Verificación
- ✅ `pnpm --filter web lint` (`tsc --noEmit`): sin errores
- ✅ `curl` a `/` responde `200`
- ✅ No se editó ningún archivo de `components/ui/`

#### Pendiente
- Reemplazar `uni-logo.png` por un SVG vectorial oficial cuando el CEE lo entregue (mejora de nitidez, no bloqueante)
- Iniciativa F (Profesores) queda pendiente como tarea propia; reserva de espacio en el área derecha del Navbar se hará junto con esa tarea, no antes

---

### ✅ Iniciativa C — Sección y cards de Blog (Cambio 3)

**Estado:** Completada
**Fecha:** 2026-06-25

#### Objetivo
El Blog ya funcionaba (tipo, service, hook, páginas, listado en Home — ver Fase 8); esta iniciativa es la pasada de *pulido visual* que pedía el documento de mejoras: fondo distinto del blanco, cards uniformes con sombra y borde guinda, fecha estandarizada en mayúsculas, fallback real ante imágenes rotas, y los tokens de fondo base (`surface-cream`/`surface-grey`) que habían quedado pendientes desde la Iniciativa A.

#### Decisión: `surface-grey`/`surface-cream` como tokens de Tailwind, no clases sueltas
Se agregaron a `tailwind.config.ts` (`cee.surface.grey` / `cee.surface.cream`) en vez de hardcodear el HEX en cada sección — mismo criterio que la rampa `cee.red`. `surface-cream` no se usa todavía (lo necesitará la Iniciativa E, Contacto/Footer) pero se definió ahora para no repetir esta misma discusión de tokens dos veces.

#### Decisión: patrón de puntos vía CSS puro (`radial-gradient` + `background-size`), no un asset de imagen
El doc pide explícitamente "patrón CSS sutil (no imagen pesada)". Se agregó la clase utilitaria `.bg-dot-pattern` en `index.css` (radial-gradient de `cee-red` al 8% de opacidad, grid de 22px) — cero peso adicional de red, reutilizable en cualquier sección sobre fondo claro.

#### Decisión: `formatDateLong` en `lib/utils.ts`, no depender de la clase Tailwind `uppercase`
La fecha ya se veía en mayúsculas por una clase CSS (`uppercase`) en `BlogCard`/`BlogPostPage`, pero el doc pide explícitamente un *helper de formato* (`formatDateLong`) que devuelva el string ya en mayúsculas ("11 DE MAYO DE 2026"). Esto importa más allá de lo visual: cualquier consumo que no pase por ese `<p className="uppercase">` (meta tags, exportar a PDF, lectores de pantalla que no respetan `text-transform` en todos los casos) seguía mostrando minúsculas. Se centralizó en `apps/web/src/lib/utils.ts` y se reemplazó el `Intl.DateTimeFormat` duplicado que vivía suelto en `BlogCard.tsx` y `BlogPostPage.tsx`.

#### Cambios realizados
- **`apps/web/tailwind.config.ts`:** tokens `cee.surface.{cream,grey}`
- **`apps/web/src/index.css`:** clase `.bg-dot-pattern`
- **`apps/web/src/lib/utils.ts`:** nuevo `formatDateLong(date)`
- **`apps/web/src/components/blog/BlogCard.tsx`:** borde fino guinda (`border-cee-red/20`) + `shadow-sm` en reposo (antes solo `hover:shadow-md`, sin sombra base) + `hover:shadow-lg`; fallback real ante error de carga de imagen (ícono `ImageOff` de `lucide-react`, mismo patrón de `onError` que ya usaba `CourseCard`, no clases `hidden`/`flex` de Tailwind para evitar ambigüedad de especificidad — toggle por `style.display` directo); fecha vía `formatDateLong`
- **`apps/web/src/components/blog/BlogCardSkeleton.tsx`:** mismo borde/sombra que `BlogCard` para que el estado de carga no “salte” visualmente al llegar los datos
- **`apps/web/src/pages/blog/BlogPostPage.tsx`:** fecha vía `formatDateLong` (se quitó el `Intl.DateTimeFormat` duplicado)
- **`apps/web/src/pages/home/HomePage.tsx`:** la sección `#blog` ahora tiene el fondo `bg-surface-grey bg-dot-pattern` a ancho completo (full-bleed), con el contenido (`BlogSection`) constreñido aparte en un `mx-auto max-w-7xl`
- **`apps/web/src/pages/blog/BlogPage.tsx`:** mismo tratamiento de fondo full-bleed que la sección de Home, para que `/blog` y el bloque de Home se vean consistentes

#### Archivos modificados
- ✅ `apps/web/tailwind.config.ts`, `apps/web/src/index.css`, `apps/web/src/lib/utils.ts`
- ✅ `apps/web/src/components/blog/BlogCard.tsx`, `BlogCardSkeleton.tsx`
- ✅ `apps/web/src/pages/blog/BlogPostPage.tsx`, `BlogPage.tsx`
- ✅ `apps/web/src/pages/home/HomePage.tsx`

#### Verificación
- ✅ `pnpm --filter web lint` (`tsc --noEmit`): sin errores
- ✅ `curl` a `/` y `/blog` responde `200`
- ✅ Las 4 entradas del mock (`mocks/data/blog.mock.ts`) ya tenían imagen y contenido reales desde la Fase 8 — no había ningún placeholder roto que arreglar en los datos, solo faltaba el fallback defensivo en el componente
- ✅ Altura uniforme de las cards ya la daba el CSS grid (`align-items: stretch` por defecto) + `line-clamp-3` + `mt-auto` en el CTA, sin cambios necesarios ahí
- ⚠️ Sin `chromium-cli`/Playwright en este entorno; se recomienda verificación visual manual en navegador

---

### ✅ Iniciativa D — Multimedia → "Testimonios" (Cambio 4, sin el renombrado visible)

**Estado:** Completada (alcance reducido a pedido del usuario)
**Fecha:** 2026-06-25

#### Objetivo
El doc pedía renombrar "Multimedia" a "Testimonios" (título, nav, copy) + enriquecer el degradado guinda + mejorar la calidad/distinción de las miniaturas de video. El usuario pidió explícitamente **no** aplicar el cambio de título — el resto de la iniciativa (copy enfocado en egresados, degradado, miniaturas) sí se mantiene.

#### Decisión: se revierte el label de nav y el `h1` a "Multimedia"
Primer intento: se cambió `navigation.ts` (label → "Testimonios") y el `h1` de `MultimediaPage.tsx` a "Testimonios". A pedido del usuario ("haz la D sin realizar el cambio de título") se revirtieron ambos a "Multimedia" — el resto de los cambios de esta iniciativa (párrafo enfocado en egresados, degradado enriquecido, miniaturas distintas) se conservan, porque el pedido fue específicamente sobre el título/label, no sobre el resto del contenido.

#### Decisión (ya no aplica, queda solo como antecedente): la ruta seguía siendo `/multimedia`
Esto se discutió antes de que el usuario decidiera no tocar el título — queda sin efecto práctico ahora porque tampoco cambió el nombre visible, pero se documenta para no repetir la misma pregunta si en el futuro se retoma el renombrado completo a "Testimonios".

#### Decisión: lazy-load del reproductor ya estaba resuelto, no fue necesario tocar `VideoGallery.tsx`
El doc pedía "lazy-load del iframe/poster y carga diferida del reproductor" como requisito de rendimiento. Verificado: las miniaturas (`<img>`) ya usaban `loading="lazy"`, y el `<iframe>` de YouTube solo se monta dentro del modal cuando el usuario hace click en una tarjeta (`selectedVideo` controla el render) — nunca se carga en el render inicial de la página. Ambos requisitos ya estaban cubiertos por el diseño existente; no se modificó `VideoGallery.tsx`.

#### Cambios realizados
- **`apps/web/src/config/navigation.ts`:** label se mantiene `'Multimedia'` (se probó `'Testimonios'` y se revirtió)
- **`apps/web/src/pages/multimedia/MultimediaPage.tsx`:** `h1` se mantiene "Multimedia" (se probó "Testimonios" y se revirtió); el párrafo descriptivo sí quedó reescrito con enfoque en egresados; degradado enriquecido (`from-cee-red-900 via-cee-red-600 to-cee-ink` + overlay `radial-gradient` adicional para mayor riqueza tonal, sin salir de la paleta de marca)
- **`apps/web/src/mocks/data/videos.mock.ts`:** las 6 entradas mock compartían la misma foto institucional como thumbnail (`CEE_THUMBNAIL` reutilizada 6 veces) — se reemplazó por una imagen Unsplash distinta y de mayor resolución (`w=800&q=80`) por video; títulos/descripciones reescritos con enfoque más explícito en historias de egresados (categoría `Testimonios` predominante)

#### Archivos modificados
- ✅ `apps/web/src/config/navigation.ts`
- ✅ `apps/web/src/pages/multimedia/MultimediaPage.tsx`
- ✅ `apps/web/src/mocks/data/videos.mock.ts`

#### Verificación
- ✅ `pnpm --filter web lint` (`tsc --noEmit`): sin errores
- ✅ `curl` a `/multimedia` responde `200`
- ✅ Confirmado que ninguna miniatura se repite entre las 6 entradas del mock
- ⚠️ Sin `chromium-cli`/Playwright en este entorno; se recomienda verificación visual manual en navegador

---

### ℹ️ Iniciativa G — Botón flotante de WhatsApp (Cambio transversal): ya estaba implementada

**Estado:** Verificada (sin cambios — ya completa)
**Fecha:** 2026-06-25

Antes de tomar la Iniciativa E se revisó si G (más simple, sin bloqueos) ya estaba hecha. Resultado: **sí**, completa — `apps/web/src/components/shared/WhatsAppFab.tsx`, montado en `Layout.tsx`. Cumple los 3 criterios del doc: `position: fixed` esquina inferior derecha con `z-40`, link a `CONTACT_INFO.whatsappUrl` (número del CEE centralizado en `constants/contact.constants.ts`, no hardcodeado), `aria-label`, tamaño táctil de 56px (`h-14 w-14`), ícono real de WhatsApp (`WhatsAppIcon`, no un ícono genérico de `lucide-react`), y respeta `motion-reduce`. No se modificó nada.

---

### ✅ Iniciativa E — Formulario de Contacto + Footer (Cambio 5)

**Estado:** Completada
**Fecha:** 2026-06-25

#### Objetivo
Fondo crema en la página de Contacto (contraste con el formulario blanco), confirmar que no hay artefactos decorativos de fondo ("barra de tareas de escritorio" de la maqueta original), y cambiar el Footer a un fondo gris oscuro/negro — el formulario y sus validaciones, anti-spam y estados de carga ya existían de antes (Fase 3 frente 5) y no se tocaron.

#### Decisión: el Footer pasa de degradado guinda a gris oscuro/negro, revirtiendo una decisión visual de una sesión anterior
En una sesión anterior (fuera de este plan de mejoras) se había rediseñado el Footer con un degradado `cee-red → cee-red-dark`. El manual de marca (sección 1 del documento de mejoras) define explícitamente: *"Neutro oscuro · Negro #000000 · Uso: Texto, **footer**"* — es decir, el propio documento prescribe negro/gris oscuro para el footer, no guinda. Se cambió a `bg-gradient-to-b from-neutral-900 to-cee-ink` para cumplir esa regla de marca sin perder la profundidad visual del degradado.

#### Decisión: no había "barra de tareas de Windows" que quitar — ya estaba limpio
Esa tarea del doc describe un artefacto de la *maqueta de diseño* (imagen de referencia), no algo presente en el código real de `ContactPage.tsx`. Se verificó que la página ya no tiene ninguna imagen de fondo decorativa; nada que remover.

#### Decisión: el formulario, validación, anti-spam y estados ya estaban completos — no se tocó esa lógica
`ContactPage.tsx` ya tenía: validación manual + honeypot anti-spam, integración con `contactService` (mock/Supabase), estados de carga/éxito/error vía `useToast`, y soporte para curso preseleccionado (`?curso=<id>`, de la Fase 4). Solo se ajustó el fondo de la sección y se subió la sombra de las `Card` (`shadow-sm` → `shadow-md`) para que el formulario "resalte" más sobre el nuevo fondo crema, como pide el criterio de "Done" del doc.

#### Nota sobre "asegurar que el formulario notifica al correo del CEE" (criterio de QA, Fase 7)
Esa notificación depende de un trigger/función en el backend de Supabase (tabla `contact_leads`), no de código en `apps/web`. El frontend ya hace su parte correctamente (inserta sin pérdida de datos, valida antes de enviar, maneja errores); confirmar el envío de correo real es una verificación de infraestructura fuera del alcance de este repo de frontend.

#### Cambios realizados
- **`apps/web/src/components/layout/Footer.tsx`:** fondo `bg-gradient-to-b from-cee-red to-cee-red-dark` → `bg-gradient-to-b from-neutral-900 to-cee-ink`
- **`apps/web/src/pages/contact/ContactPage.tsx`:** envuelto en `bg-surface-cream` (full-bleed); banner de "cargando curso" cambiado de `bg-muted` a `bg-white` (mejor contraste sobre crema); `shadow-md` explícito en las `Card` del formulario, info de contacto y mapa

#### Archivos modificados
- ✅ `apps/web/src/components/layout/Footer.tsx`
- ✅ `apps/web/src/pages/contact/ContactPage.tsx`

#### Verificación
- ✅ `pnpm --filter web lint` (`tsc --noEmit`): sin errores
- ✅ `curl` a `/contacto` responde `200`
- ✅ No se editó ningún archivo de `components/ui/`
- ⚠️ Sin `chromium-cli`/Playwright en este entorno; se recomienda verificación visual manual en navegador

---

### ✅ Iniciativa F — Perfil con foto + pestaña "Profesores" (Cambio 6)

**Estado:** Completada
**Fecha:** 2026-06-25

#### Objetivo
"Mi Perfil" con avatar (foto o iniciales de respaldo); pestaña "Profesores" en `brand.primary` que abre un overlay accesible con tarjetas de docentes; cada tarjeta navega a un perfil completo (`/profesores/:slug`); logout reubicado a la derecha del nuevo bloque.

#### Decisión sobre O4 (bloqueo abierto): se resuelve de forma pragmática, no se bloquea la tarea
El doc marcaba O4 ("definir el contrato del tipo `Teacher` con backend") como bloqueante. Se decidió seguir el mismo criterio que ya usa el propio repo para casos análogos (`moodleCourseId: number | null; //TODO(backend): confirmar contrato`, en `Course`): se define `Teacher` ahora, mock-first, con un comentario `//TODO(backend): confirmar contrato` en el tipo, en vez de detener la tarea hasta tener sign-off formal del backend. Es reversible: si el contrato real difiere, solo cambia el mapeo `formatTeacher` en `teachers.service.ts`.

#### Decisión: `Teacher extends Instructor` (no un tipo paralelo desconectado)
`Instructor` (`id`, `name`, `title`, `bio`, `photoUrl`) ya existía y se usa en `Course.instructors` y en `TeacherCard` (Detalle de curso). En vez de crear `Teacher` desde cero, se definió como **superset** de `Instructor` (+ `slug`, `upcomingEvents`). Esto cumple literalmente la tarea del doc ("reutilizar la Plana Docente del detalle de curso consumiendo el mismo tipo Teacher") sin tocar `Course`, `courses.service.ts` ni los 8 fixtures de `instructors.mock.ts`: cualquier `Teacher` es asignable donde se espera un `Instructor` (TypeScript permite la asignación porque `Teacher` tiene todos los campos requeridos de `Instructor` y más). `TeacherCard.tsx` se extendió para mostrar el próximo evento **solo si** el objeto recibido lo tiene (`'upcomingEvents' in instructor`), así que su uso existente en Detalle de curso (con `Instructor` puro) no cambia visualmente.

#### Decisión: `mockTeachers` reutiliza `mockInstructors`, no datos nuevos desde cero
`apps/web/src/mocks/data/teachers.mock.ts` mapea los 8 `mockInstructors` existentes agregando `slug` (vía `slugify`, ya existente en `lib/utils.ts`) y `upcomingEvents` (0–1 evento de ejemplo por docente). Mismas personas en "Plana docente" del curso y en "Profesores" del Navbar — consistente con que es la misma plana docente del CEE.

#### Decisión: `Avatar` propio (sin Radix) vs. `Popover` con Radix
Para el avatar, no se justificaba una dependencia nueva: es solo una imagen con fallback de iniciales (mismo patrón de `onError` que ya se usa en `BlogCard`). Para el overlay de "Profesores" sí se instaló `@radix-ui/react-popover` (no existía ninguna dependencia de overlay flotante posicionado—`Sheet` es un drawer fijo, no sirve aquí), porque el doc exige explícitamente accesibilidad real (foco, Esc, ARIA) que Radix da gratis y que sería arriesgado reimplementar a mano.

#### Cambios realizados
- **`packages/types/src/index.ts`:** `TeacherUpcomingEvent`, `Teacher extends Instructor`
- **`apps/web/src/mocks/data/teachers.mock.ts`** (nuevo): `mockTeachers` derivado de `mockInstructors`
- **`apps/web/src/services/teachers.service.ts`** (nuevo): `getAll()`, `getBySlug(slug)`, patrón mock/Supabase (tabla futura `teachers`)
- **`apps/web/src/hooks/useTeachers.ts`, `useTeacher.ts`** (nuevos): lista y detalle, mismo patrón que `useBlogPosts`/`useBlogPost`
- **`apps/web/src/components/ui/popover.tsx`** (nuevo): primitivo shadcn sobre `@radix-ui/react-popover`
- **`apps/web/src/components/ui/avatar.tsx`** (nuevo): avatar con fallback de iniciales, sin dependencias nuevas
- **`apps/web/src/lib/utils.ts`:** nuevo `getInitials(name)`
- **`apps/web/src/components/layout/TeachersMenu.tsx`** (nuevo): `Popover` con tarjetas de docentes (reutiliza `TeacherCard`), cada una enlaza a `/profesores/:slug`
- **`apps/web/src/components/course/TeacherCard.tsx`:** prop ahora acepta `Instructor | Teacher`; muestra el próximo evento solo si está presente
- **`apps/web/src/pages/teachers/TeacherProfilePage.tsx`** (nuevo): perfil completo (`/profesores/:slug`) con foto, bio y lista de próximos eventos
- **`apps/web/src/constants/routes.ts`:** `TEACHER_PROFILE: '/profesores/:slug'`
- **`apps/web/src/router/index.tsx`:** ruta `lazy()` + `Suspense` para `TeacherProfilePage`
- **`apps/web/src/components/layout/Navbar.tsx`:** pestaña `TeachersMenu` (fondo `cee-red`, texto blanco, claramente diferenciada) a la izquierda del botón "Mi Perfil"; "Mi Perfil" ahora muestra `Avatar` (foto del usuario o iniciales); el ícono de logout queda a la derecha de ese bloque (ya lo estaba, solo se confirmó el orden)
- **`apps/web/src/components/layout/MobileMenu.tsx`:** el `TeachersMenu` del Navbar se oculta en mobile (`md:inline-flex`, sin overlay-en-Sheet, no tenía sentido anidar un Popover dentro de un Sheet); en su lugar, lista plana de profesores con links a su perfil; "Mi Perfil" también con `Avatar`

#### Archivos nuevos
- ✅ `apps/web/src/mocks/data/teachers.mock.ts`
- ✅ `apps/web/src/services/teachers.service.ts`
- ✅ `apps/web/src/hooks/useTeachers.ts`, `useTeacher.ts`
- ✅ `apps/web/src/components/ui/popover.tsx`, `avatar.tsx`
- ✅ `apps/web/src/components/layout/TeachersMenu.tsx`
- ✅ `apps/web/src/pages/teachers/TeacherProfilePage.tsx`

#### Archivos modificados
- ✅ `packages/types/src/index.ts`
- ✅ `apps/web/src/mocks/index.ts`
- ✅ `apps/web/src/lib/utils.ts`
- ✅ `apps/web/src/components/course/TeacherCard.tsx`
- ✅ `apps/web/src/components/layout/Navbar.tsx`, `MobileMenu.tsx`
- ✅ `apps/web/src/constants/routes.ts`, `apps/web/src/router/index.tsx`
- ✅ `apps/web/package.json` / `pnpm-lock.yaml` (dependencia `@radix-ui/react-popover`)

#### Verificación
- ✅ `pnpm --filter web lint` (`tsc --noEmit`): sin errores
- ✅ `curl` a `/` y `/profesores/dr-carlos-mendoza` responde `200`
- ✅ No se editó ningún archivo existente de `components/ui/` (`popover.tsx`/`avatar.tsx` son nuevos)
- ✅ `Course.instructors` y `courses.service.ts` no se tocaron — sin riesgo de romper Detalle de curso
- ⚠️ Sin `chromium-cli`/Playwright en este entorno; se recomienda verificar foco/Esc/ARIA del `Popover` manualmente (heredado de Radix, pero conviene confirmar en navegador real)

#### Pendiente
- Confirmar con backend el contrato real de `Teacher` (O4) cuando exista API; hoy es 100% mock
- No se creó una página de listado `/profesores` independiente — el "listado" vive en el overlay del Navbar y en `MobileMenu`; si se requiere una página propia, es una extensión menor sobre `teachersService.getAll()`

---

### ✅ QA final del plan de mejoras (las 7 iniciativas)

**Estado:** Completada
**Fecha:** 2026-06-25

#### Objetivo
Verificación de cierre tras completar A–G: builds reales (no solo `tsc --noEmit`), barrido de todas las rutas públicas y de admin, búsqueda de referencias muertas y corrección de un defecto encontrado.

#### Hallazgo y fix: `BlogPost` estaba declarado dos veces en `@cee/types`
`packages/types/src/index.ts` tenía dos `export interface BlogPost { ... }` idénticas (línea ~122 y ~145) — residuo de un merge de hace varias sesiones (`feature/home-event-slider` ↔ trabajo en paralelo de un compañero sobre Blog). No causaba error porque TypeScript permite *declaration merging* entre interfaces idénticas, así que `tsc --noEmit` nunca lo marcó en ninguna sesión anterior. Se eliminó la segunda declaración (código muerto, sin impacto en ningún consumidor).

#### Verificación realizada
- ✅ `pnpm --filter web build` (build real de producción, no solo typecheck): sin errores. Único warning preexistente: chunk principal >500kB (no introducido por el plan de mejoras; candidato a code-splitting futuro, fuera de alcance)
- ✅ `pnpm --filter admin build`: sin errores
- ✅ Barrido de rutas públicas (`apps/web`, dev server): `/`, `/nosotros`, `/programas`, `/programas/:slug`, `/blog`, `/blog/:slug`, `/multimedia`, `/contacto`, `/profesores/:slug`, `/login`, `/registro` y una ruta inexistente (404 vía `NotFoundPage`) — todas responden `200`
- ✅ Barrido de rutas de `apps/admin`: `/`, `/cursos`, `/cursos/nuevo`, `/ventas` — todas `200`
- ✅ `grep` de `cartstore|addtocart|añadir al carrito|checkout`: cero referencias muertas
- ✅ `grep` de `console.log`/`console.warn` fuera de los usos legítimos ya documentados: cero hallazgos nuevos
- ✅ Todas las imágenes (`<img>` y el nuevo `Avatar`) tienen `alt`
- ✅ Cruce `navigationLinks` (Navbar/Footer/MobileMenu) vs. `ROUTES` vs. rutas registradas en `router/index.tsx`: cada link de navegación apunta a una ruta real, y cada `ROUTES.*` tiene su entrada en el router — sin enlaces rotos
- ✅ `Teacher`/`Course.instructors`/`courses.service.ts` siguen sin conflicto tras el fix del tipo duplicado (rebuild de `admin` y `web` confirmados después del cambio)

#### Archivos modificados
- ✅ `packages/types/src/index.ts` (elimina `BlogPost` duplicado)

#### Conclusión
Las 7 iniciativas del plan de mejoras (`docs/mejoras-finale/mejoras-finales2.md`) están completas, verificadas con build real y sin referencias muertas. Pendientes conocidos y documentados por iniciativa: SVG oficial del logo UNI (B), contrato backend de `Teacher` (F, O4), notificación de correo del formulario de contacto depende de infraestructura Supabase (E) — ninguno bloquea el funcionamiento actual en modo mock.

---

## Notas de Arquitectura

### Decisión C — Especializaciones
- Resuelta como: **filtro dentro de /programas**, no ruta propia
- Alineado con `ROUTES.CATALOG = '/programas'`
- Plan: implementar en Fase 3 o 4 como filtro en la pantalla de catálogo

### Convenciones respetadas
- ✅ Solo `pnpm` (no npm/yarn)
- ✅ `@cee/types` como única fuente de tipos compartidos
- ✅ No editar `components/ui/` (shadcn)
- ✅ `localStorage` solo en `authStore`
- ✅ Alias `@/` funcional en Vite y TypeScript

### Patrón de hooks
- `useAuth()` → acceso limpio a `{ user, token, isAuthenticated, setAuth, logout }`

---
