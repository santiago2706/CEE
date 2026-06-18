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
