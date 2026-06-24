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
