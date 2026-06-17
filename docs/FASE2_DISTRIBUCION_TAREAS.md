# Fase 2 — Layout y navegación · Distribución de tareas

> **Proyecto:** Plataforma Web CEE-FIIS · Frontend (`apps/web`)
> **Equipo:** Renato · Santiago · Isabel · Diana · Tom · Elvis
> **Objetivo de la fase (del plan):** dejar el cascarón donde cada quien monta su página.
> **Done de la fase:** se navega entre páginas placeholder dentro del layout, en desktop y mobile, sin errores de consola.

---

## Cómo está repartido y por qué

El plan lista 5 entregables (Layout, Navbar, MobileMenu, Footer, Router). Pero **Navbar, MobileMenu y Footer dependen todos de lo mismo**: los links de navegación y los stores (`cartStore`, `authStore`). Si cada quien define sus propios links o lee los stores a su manera, se rompe la regla del repo ("tipos compartidos nunca se redefinen localmente") y habrá conflictos.

Por eso se separa un **6.º frente: el contrato compartido**, que entrega Elvis el **día 1** para desbloquear al resto. Así los 6 trabajan en paralelo de verdad.

### Orden de arranque (importante)

1. **Día 1 — Kickoff corto (15 min, todos):** se cierra la decisión C ("Especializaciones") y se acuerdan los `paths` de las rutas. Sin esto, Navbar, MobileMenu, Footer y Router no pueden coincidir.
2. **Día 1 — Elvis** publica `navigation.ts` + stubs de stores (el contrato).
3. **Día 1–N — Santiago, Isabel, Diana, Tom** trabajan en paralelo contra ese contrato.
4. **Cierre — Renato** integra todo en el `Layout` y valida el "Done" de la fase.

### Decisión C a cerrar en el kickoff

El menú propuesto lista "Especializaciones" pero en las rutas solo existe "Programas". **Recomendación:** que "Especializaciones" sea un **filtro dentro de Programas** (no una página aparte), para que navbar y rutas coincidan sin construir una pantalla extra. Lo decide el equipo; Elvis lo documenta.

---

## 1 · Elvis — Contrato compartido *(bloqueante, va primero)*

**Entregable:** la única fuente de verdad de navegación + stubs de stores que consumen los demás. Es trabajo pequeño pero crítico: hay que entregarlo el día 1.

**Workflow:**
1. Liderar el kickoff y dejar **escrita** la decisión C (Especializaciones = filtro de Programas, salvo que el equipo decida otra cosa).
2. Crear `apps/web/src/config/navigation.ts` exportando un array tipado de links públicos: `{ label, path }` para Inicio, Nosotros, Programas, Multimedia, Contacto (Especializaciones según la decisión). Esta es la **única** lista de links del sitio.
3. Crear los stubs de stores con Zustand:
   - `src/stores/cartStore.ts` → estado `items[]` + selector de cantidad. Solo lo mínimo (la lógica real es Fase 4).
   - `src/stores/authStore.ts` → estado `user | null`, `isAuthenticated`. Lógica real en Fase 6.
4. Exponer hooks limpios para que Navbar no toque el store directo: `useCartCount()`, `useAuth()`.
5. Respetar la regla del repo: **nada de `localStorage` fuera de `authStore`**.
6. Abrir PR temprano y avisar al equipo: "el contrato está listo, construyan contra esto".

**Done:** `navigation.ts`, `cartStore`, `authStore` y sus hooks son importables; la decisión C está documentada.

---

## 2 · Santiago — Navbar (desktop)

**Entregable:** la barra superior: logo rojo, links desktop, badge de carrito, botón de sesión, sticky.

**Workflow:**
1. Importar `navigation.ts` y los hooks de Elvis (no inventar links propios).
2. Crear `src/components/layout/Navbar.tsx` con el logo rojo (tema CEE) a la izquierda.
3. Renderizar los links recorriendo `navigation.ts` con `<NavLink>` de React Router (para que marque el link activo).
4. Badge de carrito: leer `useCartCount()` y mostrar el número sobre el ícono. Botón de sesión condicional con `useAuth()`: "Iniciar Sesión" si no hay sesión, avatar/menú si la hay.
5. Sticky: `sticky top-0 z-50` con Tailwind; sombra sutil al hacer scroll (opcional).
6. Usar `Button` de shadcn tal cual — **no editar `components/ui/` a mano**.
7. Botón hamburguesa visible solo en mobile (`md:hidden`) que abre el MobileMenu de Isabel. **Coordinar con Isabel** quién maneja el estado abierto/cerrado (recomendación: el estado vive en Navbar y se pasa por props).
8. Ocultar los links de desktop en mobile (`hidden md:flex`).

**Done:** la navbar renderiza en desktop con links activos, badge de carrito y botón de sesión funcionando contra los stubs.

---

## 3 · Isabel — MobileMenu (menú hamburguesa)

**Entregable:** el menú lateral responsive que se abre con la hamburguesa en mobile.

**Workflow:**
1. Importar `navigation.ts` (mismos links que la navbar; no duplicar la lista).
2. Crear `src/components/layout/MobileMenu.tsx` usando el componente `Sheet` (drawer) de shadcn.
3. Acordar con Santiago el control del estado: el MobileMenu recibe `open` y `onClose` por props desde la Navbar.
4. Renderizar los links; al hacer click en uno, **navegar y cerrar** el menú.
5. Incluir dentro del menú el acceso a sesión y al carrito (espejo de lo que hay en la navbar desktop).
6. Accesibilidad: cerrar con `Esc`, manejo de foco y `aria-*` (shadcn ya trae buena parte).
7. Visible solo bajo el breakpoint `md`.

**Done:** el menú hamburguesa abre, cierra y navega correctamente en mobile.

---

## 4 · Diana — Footer

**Entregable:** el pie de página con navegación, contacto, redes y copyright dinámico (referencia visual: el footer estilo RIGE de la propuesta).

**Workflow:**
1. Importar `navigation.ts` para la columna "Enlaces rápidos".
2. Crear `src/components/layout/Footer.tsx` con columnas: marca + tagline, enlaces rápidos, contacto y redes ("Síguenos").
3. Copyright **dinámico**: `© {new Date().getFullYear()} Centro de Especialización Ejecutiva.` (no hardcodear el año).
4. Enlaces a Política de Privacidad y Términos de Servicio como placeholders por ahora.
5. Responsive: columnas en desktop, apiladas en mobile.
6. Tema rojo CEE; **no editar `components/ui/`**.

**Done:** el footer renderiza responsive, con enlaces desde `navigation.ts` y el año actual calculado.

---

## 5 · Tom — Router + lazy/Suspense + páginas placeholder

**Entregable:** el ruteo completo con carga diferida y una página placeholder por cada ruta.

**Workflow:**
1. Configurar React Router v6 con el `Layout` (de Renato) como **ruta padre** que contiene `<Outlet/>`; las páginas cuelgan de él.
2. Crear páginas placeholder mínimas en `src/pages/` (un `<h1>` con el nombre basta): Inicio, Nosotros, Programas, Multimedia, Contacto, Auth (login/register).
3. Envolver cada página con `lazy()` + `<Suspense>` para code splitting.
4. Definir un `fallback` de carga (spinner o skeleton simple).
5. Añadir una ruta **404** (Not Found).
6. **Alinear los `path` con `navigation.ts`** de Elvis (mismos strings exactos) — coordinar para que ningún link quede roto.

**Done:** se navega entre todas las páginas placeholder; el code splitting funciona (cada ruta carga su chunk).

---

## 6 · Renato — Layout (integrador) + QA responsive

**Entregable:** el componente `Layout` que compone todo, y la validación final del "Done" de la fase. Es el rol integrador: depende de los demás, así que cierra al final.

**Workflow:**
1. Crear `src/components/layout/Layout.tsx`: `Navbar` + `<main><Outlet/></main>` + `Footer`.
2. Arrancar con versiones placeholder de Navbar/Footer/MobileMenu e ir **reemplazándolas** conforme Santiago, Diana e Isabel entregan (no esperar a que todo esté listo para empezar).
3. Coordinar con Tom para que el `Layout` sea efectivamente la ruta padre con `<Outlet/>`.
4. Resolver el layout estructural: `min-h-screen` con footer pegado abajo, y el offset/espaciado correcto por la navbar sticky.
5. **QA responsive cross-device** (móvil, tablet, escritorio) — es el criterio de éxito de la fase.
6. Revisar los PRs de integración, resolver conflictos y verificar que **no hay errores de consola** al navegar.

**Done:** se navega entre páginas placeholder dentro del layout, en desktop y mobile, sin errores — el "Done cuando" de la Fase 2.

---

## Recordatorios del repo (para todos)

- Solo **pnpm** (no npm/yarn).
- No editar `components/ui/` a mano (es de shadcn).
- No usar `localStorage` directo fuera de `authStore`.
- El alias `@/` debe funcionar en Vite **y** TypeScript.
- Tipos compartidos siempre desde `@cee/types`; nunca redefinir localmente.

---

## Tabla resumen

| # | Persona | Frente | Archivo(s) principal(es) | Depende de |
|---|---------|--------|--------------------------|------------|
| 1 | **Elvis** | Contrato compartido | `config/navigation.ts`, `stores/cartStore.ts`, `stores/authStore.ts` | Kickoff (decisión C) |
| 2 | **Santiago** | Navbar desktop | `components/layout/Navbar.tsx` | Elvis |
| 3 | **Isabel** | MobileMenu | `components/layout/MobileMenu.tsx` | Elvis, Santiago (estado) |
| 4 | **Diana** | Footer | `components/layout/Footer.tsx` | Elvis |
| 5 | **Tom** | Router + placeholders | `router/`, `pages/*` | Elvis (paths), Renato (Layout) |
| 6 | **Renato** | Layout + QA final | `components/layout/Layout.tsx` | Santiago, Isabel, Diana, Tom |
