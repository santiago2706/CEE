# Plan de Tareas — Rediseño de la Home y mejoras de UI · CEE-FIIS

> Documento derivado de `PLAN_IMPLEMENTACION_CEE_WEB.md` y del `MANUAL_GRAFIC.pdf`.
> Objetivo: implementar los cambios solicitados sobre la página principal y elevar el
> nivel visual/profesional del sitio, con asignación clara de ramas por tarea.

---

**Convención de nombres de ramas**

```
<tipo>/<área>-<descripción-corta-en-kebab-case>

tipos: feat | fix | refactor | style | chore | docs
```

Base: ramas salen de `develop` (o `main` si no hay `develop`) y vuelven por PR.

**Tabla maestra requisito → rama**

| # | Requisito del usuario | Rama |
|---|----------------------|------|
| 1 | Sliders de eventos en la Home | `feat/home-event-slider` |
| 2 | Cada sección ocupa el viewport (scroll snap) | `feat/fullsection-scroll-snap` |
| 3 | Quitar carrito / compra (pago por correo) | `refactor/remove-cart-and-purchase` |
| 4 | Agregar "Nosotros" (+ 2ª sección) | `feat/about-section` |
| 5 | Tipografía un poco más grande | `style/typography-scale-up` |
| 6 | Jugar con la paleta de colores | `style/brand-color-palette` |
| 6b | Agregar el brochure (descarga) | `feat/brochure-download` |
| 7 | Promo para usuarios logueados (no admins) | `feat/member-promo-banner` |
| 8 | Agregar un contador | `feat/event-countdown` |
| 9 | Orden Cursos→Programas→Nosotros + CTA | `feat/home-section-order-and-cta` |
| 10 | Botones principales a los costados | `feat/home-side-action-buttons` |
| — | Mejora visual general (extra) | `style/home-visual-polish` |
| — | Limpieza/QA final del rediseño | `chore/home-redesign-qa` |

---

## 1. Tareas de los requisitos

### Tarea 1 — Slider de eventos en la Home
**Rama:** `feat/home-event-slider`

- Crear `EventSlider` (carrusel) como pieza central de la *main window*.
- Usar un carrusel accesible (shadcn `Carousel` sobre Embla, ya alineado al stack;
  evitar dependencias nuevas pesadas). Soporta teclado, swipe táctil y *dots*.
- Datos desde la capa **mock** (`VITE_USE_MOCKS`): fixture `events.ts` con
  `{ id, titulo, fecha, imagen, cta }`.
- Autoplay con pausa al hover/focus y respeto a `prefers-reduced-motion`.
- Lazy-load de imágenes del slider (rendimiento, alineado a Fase 7).

**Done cuando:** el carrusel rota entre ≥3 eventos mock, navegable por teclado y táctil,
sin errores de consola, responsive.

---

### Tarea 2 — "Cada sección ocupa la pantalla": snap inteligente
**Rama:** `feat/fullsection-scroll-snap`

**Decisión de diseño (cerrada, criterio propio).** En vez de forzar a ciegas "una pantalla
= una sección" (que en móvil corta contenido y molesta), se implementa un **snap suave que
encaja al inicio de cada sección pero deja respirar al contenido alto**:

- `scroll-snap-type: y proximity` (**no** `mandatory`) → encaja al acercarse, sin
  "secuestrar" el scroll del usuario.
- Cada `<section>` con `scroll-snap-align: start` y **`min-height: 100svh`** (no `height`):
  - Secciones livianas (Hero/sliders, Nosotros, CTA) llenan la pantalla.
  - Secciones con contenido largo (Cursos, Programas, Blog) **pueden crecer** más allá del
    viewport y nunca recortan; el snap solo fija su **inicio**.
- El **slider de eventos es horizontal**, así que no compite con el snap vertical.
- **Móvil:** se relaja a scroll normal con anclas (el snap a pantalla completa estorba en
  pantallas pequeñas); navegación por las anclas laterales (ver Tarea 10).
- **Accesibilidad:** snap desactivado bajo `prefers-reduced-motion: reduce`; foco visible;
  scroll por teclado funcional.
- **Orientación:** indicador "scroll ↓" en el Hero + **dots/anclas de sección laterales**
  que marcan la sección activa y permiten saltar (se integra con la Tarea 10).
- Las secciones pesadas se **renderizan de forma diferida** (no penalizar la carga inicial).

**Done cuando:** en desktop el viewport "encaja" elegantemente al inicio de cada sección sin
bloquear el scroll; el contenido largo nunca se corta; en móvil el scroll es natural; con
*reduced motion* no hay snap; las anclas laterales reflejan la sección activa.

---

### Tarea 3 — Quitar carrito y referencias a compra
**Rama:** `refactor/remove-cart-and-purchase`

- Eliminar/ocultar: badge de carrito del Navbar, `cartStore`, drawer/página de carrito,
  botones "Añadir al carrito", precios tachados y cualquier "Checkout".
- En `CourseCard` y "Detalle de curso", reemplazar el bloque de compra por un CTA
  **"Solicitar información"** / **"Inscríbete por correo"** que abra `mailto:` o el
  formulario de contacto con el curso pre-seleccionado.
- Revisar el plan: marcar **Fase 4 como fuera de alcance** y dejar nota en el `.md`.
- Buscar referencias muertas: `grep` de `cart`, `precio`, `checkout`, `comprar`.

**Done cuando:** no existe ninguna mención visible a carrito/compra; el flujo de interés
termina en correo/contacto; build sin imports rotos.

---

### Tarea 4 — Sección "Nosotros" + Blog
**Rama:** `feat/about-section`

- Sección **Nosotros**: misión, vínculo con la UNI/FIIS, propuesta de valor
  (lenguaje de marca: *"Impulsa tu carrera, lidera tu futuro"*), foto institucional.
- **Blog** (2ª sección, confirmada): listado de entradas con tarjeta
  (`{ id, titulo, resumen, imagen, fecha, slug }`) desde mock. En la Home, mostrar las
  **3 más recientes** con un "Ver todo el blog" → página `/blog` (lista) y `/blog/:slug`
  (detalle). Preparar el tipo en `@cee/types` para cuando exista backend.
- Encaja en el orden de la Tarea 9 y como sección del snap de la Tarea 2.

**Done cuando:** "Nosotros" renderiza con contenido real/mock y el Blog muestra las últimas
entradas en Home con navegación a lista/detalle, responsive.

> Sub-rama opcional si el blog crece: `feat/blog-list-and-detail` derivada de esta.

---

### Tarea 5 — Tipografía más grande
**Rama:** `style/typography-scale-up`

- Subir la **escala tipográfica base** en Tailwind (`theme.fontSize`) ~10–15%: body de
  16→17/18px, y reescalar la jerarquía (h1…h6) de forma proporcional con `clamp()` para
  que sea fluida (`clamp(min, vw, max)`).
- Revisar `line-height` y `letter-spacing` para legibilidad; no romper layouts existentes.
- Verificar contraste y que no aparezcan desbordes en tarjetas/botones.

**Done cuando:** el texto es notablemente más legible en desktop y móvil, sin overflow
ni saltos de layout.

---

### Tarea 6 — Jugar con la paleta de colores (según manual de marca)
**Rama:** `style/brand-color-palette`

Paleta **oficial** del `MANUAL_GRAFIC.pdf` (regla: máx. 4 colores, variando luminosidad):

| Rol | HEX | Nota |
|-----|-----|------|
| Guinda / primario | `#682222` | Color institucional principal |
| Plomo / neutro | `#A9A9A9` | Secundario / bordes / texto suave |
| Negro | `#000000` | Texto / contraste |
| Blanco | `#FFFFFF` | Fondo |

- ⚠️ **Corregir el "tema rojo" genérico** del esqueleto (Fase 0 menciona "tema rojo")
  por el **guinda `#682222`** real de marca.
- Definir **tokens** en CSS variables / `tailwind.config` con una **rampa de luminosidad**
  del guinda (50…900) para usar degradados y estados (hover/active) **sin salir de la marca**.
- Aplicar degradados guinda↔negro en hero/sliders (estilo de los flyers del manual).
- Mantener el blanco como fondo base; plomo para superficies/cards secundarias.

**Done cuando:** todo el sitio usa los tokens de marca; existe una rampa documentada;
los degradados respetan el manual (4 colores, distinta luminosidad).

---

### Tarea 6b — Brochure descargable
**Rama:** `feat/brochure-download`

- Subir el brochure (PDF) a `apps/web/public/` o servirlo desde CDN.
- Botón/CTA "Descargar brochure" en Home (zona de Nosotros y/o hero secundario) y en Footer.
- Tracking simple del click (evento) si hay analítica; `download` attr + `target=_blank`.
- Versionar el nombre del archivo (`brochure-cee-2026.pdf`) para evitar caché viejo.

**Done cuando:** el brochure se descarga en 1 clic desde la Home, en desktop y móvil.

---

### Tarea 7 — Promo para usuarios logueados (no admins)
**Rama:** `feat/member-promo-banner`

- Componente `MemberPromo` que se muestra **solo si** `authStore.user` existe **y**
  `role !== 'admin'` (miembros/alumnos sí; admin no).
- Contenido: descuento/beneficio, código o CTA. Cerrable (persistir cierre en `authStore`,
  **no** `localStorage` directo — regla del repo).
- Estado de carga: no parpadear antes de resolver la sesión.

**Done cuando:** miembro logueado ve la promo; admin y anónimo no la ven; el cierre persiste.

---

### Tarea 8 — Contador doble: cuenta regresiva de cursos + estadísticas
**Rama:** `feat/event-countdown`

Dos contadores, ambos confirmados:

**8.1 Cuenta regresiva al inicio del curso** (`CourseCountdown`)
- Muestra días/horas/min/seg hasta `curso.fechaInicio`.
- Se ubica en la tarjeta/detalle del curso y, para el curso destacado, en el Hero/slider.
- Al llegar a cero: estado **"¡Ya inició!"** / **"Inscripciones cerradas"** según regla de
  negocio; no romper el layout.
- `useEffect` con cleanup del intervalo; un solo intervalo compartido si hay varios
  contadores en pantalla (performance).

**8.2 Contadores de estadísticas** (`StatsCounter`)
- Cifras institucionales (ej. alumnos formados, programas, egresados, años) con animación
  **count-up** que arranca al entrar en viewport (`IntersectionObserver`).
- Datos desde mock/config; formato con separador de miles.

- Ambos respetan `prefers-reduced-motion` (sin animación, muestran el valor final).

**Done cuando:** la cuenta regresiva corre y maneja el fin del plazo correctamente, y las
estadísticas animan una sola vez al verse, sin parpadeos ni fugas de intervalos.

---

### Tarea 9 — Orden de secciones + llamado a la acción
**Rama:** `feat/home-section-order-and-cta`

- Reordenar la Home: **1) Hero/Sliders → 2) Cursos → 3) Programas → 4) Nosotros →
  5) Blog → 6) Contacto/CTA → Footer.**
- Añadir un **CTA principal** claro y repetido en puntos clave (hero + cierre):
  "Inscríbete" / "Solicita información" → correo/contacto.
- Coordinar el orden con el scroll-snap (Tarea 2) y los botones laterales (Tarea 10).

**Done cuando:** la Home sigue el orden pedido y hay un CTA visible y consistente.

---

### Tarea 10 — Botones principales a los costados
**Rama:** `feat/home-side-action-buttons`

- Mover las acciones principales (p. ej. "Cursos", "Programas", "Brochure", "Contacto")
  a **columnas/barras laterales** fijas, dejando la *main window* libre para los sliders.
- Implementación: barras laterales `sticky`/`fixed` en desktop; en móvil **colapsan**
  a una barra inferior o a los dots/controles del slider (no estorbar el contenido).
- Accesibilidad: foco, `aria-label`, contraste sobre el degradado guinda.

**Done cuando:** en desktop los botones viven a los costados sin tapar el slider; en móvil
hay una variante usable; navegable por teclado.

---

## 2. Tareas extra recomendadas (mejorar lo visual / profesional)

### Extra A — Pulido visual de la Home
**Rama:** `style/home-visual-polish`

- **Espaciado y ritmo:** escala de spacing consistente (8pt), aire entre secciones.
- **Sombras y bordes:** elevar cards con sombras suaves y `radius` coherente con el
  logo redondeado del manual.
- **Microinteracciones:** hover/focus states, transiciones de 150–250ms, *skeletons*
  de carga en sliders/cards.
- **Hero con degradado de marca** (guinda↔negro) e imagen de profesional mirando al texto
  (recurso descrito en el manual).
- **Iconografía** coherente (lucide-react), evitar mezclar estilos.
- **Estados vacíos/carga/error** decentes en componentes con datos mock.

**Done cuando:** la Home se ve cohesionada, moderna y "premium" sin salirse de la marca.

---

### Extra B — Accesibilidad, SEO y rendimiento
**Rama:** `chore/home-redesign-qa`

- **A11y:** contraste AA, foco visible, `alt` en imágenes, navegación por teclado en
  slider/snap, `prefers-reduced-motion` respetado en todo.
- **SEO/meta:** títulos, descripción, Open Graph para que el sitio comparta bien.
- **Rendimiento:** lazy-load de imágenes/vídeo, `width/height` para evitar CLS,
  comprimir el brochure y los assets del slider.
- **QA responsive:** móvil / tablet / escritorio (indicador de éxito del plan).
- **Limpieza:** quitar código muerto del carrito, *console.logs*, imports sin uso.

**Done cuando:** Lighthouse razonable (perf/a11y/SEO), sin warnings de consola, responsive OK.

---

## 3. Orden sugerido de trabajo (para evitar choques de merge)

1. `refactor/remove-cart-and-purchase` *(limpia primero el terreno)*
2. `style/brand-color-palette` + `style/typography-scale-up` *(base visual)*
3. `feat/home-section-order-and-cta` *(define la estructura de la Home)*
4. `feat/fullsection-scroll-snap` + `feat/home-side-action-buttons` *(layout)*
5. `feat/home-event-slider` + `feat/event-countdown`
6. `feat/about-section` + `feat/brochure-download` + `feat/member-promo-banner`
7. `style/home-visual-polish`
8. `chore/home-redesign-qa` *(cierre)*

> Reglas del repo a respetar en todas: solo **pnpm**, no editar `components/ui/` a mano,
> nada de `localStorage` fuera de `authStore`, tipos siempre desde `@cee/types`.

---

> Resueltos: sin carrito · 2ª sección = **Blog** · contador = **regresiva de curso +
> estadísticas** · scroll-snap = **snap inteligente** (decisión cerrada en la Tarea 2).
