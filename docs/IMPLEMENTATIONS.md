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
