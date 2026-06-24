# REBRANDING.md — Plan de corrección de UI · CEE-FIIS

> **Alcance:** únicamente capa visual (UI) del frontend público y del panel admin (`apps/web` / `apps/admin`).
> **No cubre:** lógica de negocio, services, stores, routing, tipos (`@cee/types`) ni integración con backend. Esto es solo diseño.
> **Stack afectado:** Tailwind config, tokens CSS/CSS-vars, componentes shadcn (vía `tailwind.config` y wrappers, nunca editando `components/ui/` a mano), `index.css` global, e imports de fuentes.
> **Regla del repo a respetar:** no editar `components/ui/` directamente — los cambios de estilo se hacen vía tokens de Tailwind y clases utilitarias, o wrappers propios.

---

## Resumen del problema

La demo validó la dirección general (guinda `#682222`, layout edTech, animaciones GSAP corporativas), pero quedó con cuatro defectos de acabado que la hacen ver menos seria de lo deseado:

1. **Border-radius excesivo** → aspecto "blando"/infantil; resta seriedad corporativa.
2. **Poppins** → demasiado genérica y redondeada; no transmite autoridad institucional.
3. **Faltan imágenes reales** → placeholders de gradiente en hero, nosotros, cards, multimedia.
4. **Faltan logos de respaldo** (UNI / FIIS / CCAT) e **íconos de contacto** (WhatsApp, etc.).

El plan corrige esto en 8 partes secuenciales. Cada parte es autocontenida y dejable en un commit.

---

## Parte 1 — Sistema de tokens: radios, sombras y espaciado

**Objetivo:** reemplazar la escala de bordes redondeados por una más sobria y unificar sombras.

- **Reducir el radio global.** La escala actual (`8 / 12 / 16 / 22px`) baja a una escala corporativa contenida:
  - `--r-sm: 4px` (inputs, badges, pills pequeñas)
  - `--r-md: 6px` (botones, cards de contenido)
  - `--r-lg: 8px` (cards grandes, contenedores)
  - `--r-xl: 10px` (solo hero-card y banners destacados)
  - Eliminar cualquier `border-radius` ≥ 16px del proyecto.
- **Pills 100% redondeadas:** permitidas SOLO en el `eyebrow` y en badges de estado (Publicado/Borrador), porque ahí el óvalo es intencional y leíble. Todo lo demás usa la escala de arriba.
- **Avatares e íconos circulares:** se mantienen `border-radius: 50%` (un círculo no es lo mismo que una esquina blanda).
- **Unificar sombras** en 3 niveles y bajar su difusión (sombras más cerradas = más serio):
  - `--shadow-sm: 0 1px 2px rgba(40,20,20,.06), 0 2px 6px rgba(40,20,20,.04)`
  - `--shadow-md: 0 4px 12px rgba(40,20,20,.08)`
  - `--shadow-lg: 0 12px 32px rgba(40,20,20,.12)`
  - El hover de cards baja de `translateY(-8px)` a `translateY(-4px)` — más contenido.
- **Reflejar en `tailwind.config`:** `theme.extend.borderRadius` y `theme.extend.boxShadow` con estos mismos valores, para que las clases `rounded-md`, `shadow-md`, etc. de shadcn queden alineadas.

**Done:** ningún elemento supera 10px de radio (salvo pills/círculos justificados); las sombras son sutiles y consistentes.

---

## Parte 2 — Tipografía: reemplazar Poppins

**Objetivo:** sustituir Poppins por un emparejamiento tipográfico con más autoridad, sin perder legibilidad ni romper el manual (que exige Poppins solo en el **logo**, no en todo el sitio).

> Nota de marca: el manual fija Poppins **para el logotipo**. El cuerpo del sitio puede usar otra familia siempre que el logo conserve Poppins. Se aísla la fuente del logo para no violar el manual.

- **Emparejamiento propuesto (probar en este orden):**
  1. **Display/headings → `Fraunces` o `Spectral` (serif)** + **Body/UI → `Inter`** (sans). El serif en titulares da gravedad académica/institucional; Inter mantiene la UI limpia y moderna (es la fuente de v0/Vercel). Esta es la apuesta principal.
  2. **Alternativa todo-sans más sobria:** Display → `Geist` o `Söhne`-like (`Inter Tight` como sustituto gratuito); Body → `Inter`. Más minimalista, menos editorial.
  3. **Alternativa institucional clásica:** Display → `Libre Franklin`; Body → `Libre Franklin`. Una sola familia, pesos bien diferenciados.
- **Escala tipográfica** (mantener jerarquía, ajustar tracking):
  - h1 hero: `clamp(2.2rem, 4vw, 3.1rem)`, weight 600, `letter-spacing: -0.02em`
  - h2 sección: `2rem`, weight 600
  - h3 card: `1.05rem`, weight 600
  - body: `1rem`, weight 400, `line-height: 1.65`
  - Reducir el uso de weight 800; el máximo en titulares pasa a 600–700.
- **Aislar la fuente del logo:** crear una clase `.logo-wordmark { font-family: 'Poppins', sans-serif; }` que solo se aplica al texto del logo, para cumplir el manual.
- **Cargar fuentes** vía `@fontsource/*` (paquete npm, no CDN) para que entren al bundle y respeten el requisito de rendimiento del plan; documentar en `index.css`.

**Done:** el sitio usa el nuevo emparejamiento; el logo conserva Poppins; no hay weights 800 sueltos.

---

## Parte 3 — Imágenes del Hero y secciones institucionales

**Objetivo:** reemplazar los placeholders de gradiente del hero y de "Nosotros" por imágenes reales con tratamiento de marca.

- **Hero (Inicio):** sustituir el bloque diagonal de gradiente puro por una **fotografía profesional real** (estudiante/ejecutivo mirando hacia el texto, como exige el manual de marca, pág. 4) dentro del clip-path diagonal. Aplicar un overlay guinda semitransparente (`rgba(104,34,34,.55)`) para integrar la foto a la marca y garantizar contraste del texto blanco.
- **Tratamiento consistente:** todas las fotos institucionales llevan un overlay duotono guinda/negro para que se sientan parte del sistema, no stock genérico.
- **Sección "Nosotros":** reemplazar el `about-visual` (gradiente + ícono) por foto real de instalaciones o sesión de clase, con el mismo overlay y un borde/recorte diagonal sutil que haga eco del logo.
- **Definir `aspect-ratio` fijos** para evitar saltos de layout (CLS): hero `16/10`, about `4/3`, cards `16/9`.
- **`loading="lazy"`** en toda imagen fuera del viewport inicial; el hero carga `eager` con `fetchpriority="high"`.

**Done:** hero y nosotros usan fotos reales con overlay de marca; sin saltos de layout.

---

## Parte 4 — Imágenes de cursos (cards y detalle)

**Objetivo:** dar imagen real a cada curso en cards, catálogo y detalle.

- **Campo de datos:** cada curso ya tiene (o debe tener) `imageUrl` en su fixture/mock; la UI debe consumirlo. Donde no exista imagen, mantener el gradiente por categoría como **fallback** (no como default).
- **CourseCard:** la franja superior pasa de gradiente a `<img>` con `object-fit: cover`, manteniendo el badge de categoría y modalidad encima con su degradado de legibilidad inferior.
- **Detalle de curso:** el `detail-hero-img` y el `detail-side-img` usan la imagen real del curso.
- **Placeholder de carga:** mientras la imagen carga, mostrar el gradiente de categoría como skeleton (evita flash en blanco).
- **Consistencia:** todas las imágenes de curso comparten el mismo `aspect-ratio: 16/9` y el mismo tratamiento de esquinas (según nueva escala de radios de la Parte 1).

**Done:** cada curso muestra su imagen; fallback elegante por categoría; sin flashes en blanco.

---

## Parte 5 — Multimedia: thumbnails reales y lazy loading

**Objetivo:** que la galería multimedia muestre miniaturas reales de video y respete la estrategia de carga ya documentada (`ESTRATEGIA_VIDEOS.md`).

- **Thumbnails:** reemplazar el gradiente de cada `media-card` por la miniatura real del video (`thumbnailUrl`), con `loading="lazy"`.
- **Overlay de play:** mantener el botón de play circular, pero sobre la imagen real con un overlay oscuro (`rgba(26,20,20,.35)`) para contraste.
- **Iframe condicional:** confirmar que el `<iframe>` solo se monta al hacer clic (ya implementado según `ESTRATEGIA_VIDEOS.md`); la UI solo añade el lightbox/modal con la nueva escala de radios.
- **Etiqueta de categoría** (`media-tag`): alinear a la nueva escala de radios y a la tipografía nueva.

**Done:** miniaturas reales con lazy load; el patrón de iframe condicional se conserva.

---

## Parte 6 — Logos de respaldo institucional

**Objetivo:** incorporar los logos de las agrupaciones que respaldan al CEE (requisito del manual: co-branding CEE + UNI).

- **Ubicaciones donde deben aparecer:**
  1. **Footer** — fila de logos de respaldo (UNI, FIIS, CCAT) en versión monocromática blanca sobre el fondo negro.
  2. **Sección "Nosotros" → "Respaldo institucional"** — reemplazar los íconos-placeholder actuales (`ti-building-bank`, etc.) por los **logos vectoriales reales**.
  3. **Hero / barra de confianza** — opción de una franja discreta "Con el respaldo de" + logos, debajo del hero (patrón típico edTech).
- **Formato:** SVG vectorial preferente (escala sin pérdida); versión monocromática para fondos oscuros y a color para fondos claros.
- **Logo CEE oficial:** reemplazar la "C" reconstruida en SVG de la demo por el **archivo vectorial oficial** del manual (logo horizontal para navbar/footer).
- **Espaciado y tamaño:** logos de tamaño visual similar (el manual lo pide explícitamente), alineados por altura óptica, no por bounding box.

**Done:** logos oficiales en navbar, footer y sección de respaldo; co-branding CEE+UNI visible.

---

## Parte 7 — Íconos: contacto, redes y WhatsApp

**Objetivo:** completar el set de íconos faltantes, sobre todo los de contacto y canales.

- **Set de íconos:** estandarizar en **Tabler Icons** (ya en uso) para todo el sistema, salvo marcas que requieran su ícono oficial.
- **Íconos de contacto a añadir/confirmar:** teléfono, correo, ubicación (ya presentes) + **WhatsApp** (`ti-brand-whatsapp`), horario (`ti-clock`).
- **Botón flotante de WhatsApp:** añadir un FAB (floating action button) fijo abajo-derecha en el sitio público, con el ícono oficial de WhatsApp y enlace `https://wa.me/51966644502`. Respetar `prefers-reduced-motion`.
- **Redes sociales del footer:** confirmar íconos de marca (LinkedIn, Instagram, Facebook, YouTube) — ya presentes, alinear tamaños y estados hover a la nueva escala.
- **Íconos de marca (WhatsApp, redes):** los íconos `ti-brand-*` de Tabler son aceptables para UI; si se quiere fidelidad de marca estricta, usar los SVG oficiales de cada plataforma (ver sección de assets externos).

**Done:** WhatsApp presente como FAB y en contacto; set de íconos consistente y completo.

---

## Parte 8 — Pase final de consistencia y QA visual

**Objetivo:** auditar que todo el sistema quedó cohesivo tras los cambios anteriores.

- **Auditoría de radios:** grep por `rounded-2xl`, `rounded-3xl`, `border-radius` ≥ 16px → no deben quedar.
- **Auditoría de pesos tipográficos:** grep por `font-extrabold` / `weight: 800` → reducir a 600–700 salvo excepción justificada.
- **Contraste (accesibilidad):** verificar AA en texto sobre guinda, sobre fotos con overlay y en badges de estado.
- **Estados de foco:** anillo de foco visible y consistente en inputs, botones y links (requisito de calidad).
- **Responsive:** re-verificar móvil/tablet/desktop tras cambios de tipografía (el serif puede cambiar alturas de línea).
- **`prefers-reduced-motion`:** confirmar que GSAP y el FAB de WhatsApp lo respetan.
- **Dark mode (si aplica al admin):** verificar que los nuevos tokens funcionan en ambos modos.
- **Coherencia de copy:** sentence case, voz activa en CTAs (según skill de diseño).

**Done:** sistema visual cohesivo, accesible y responsive; sin remanentes de la estética anterior.

---

## Orden de ejecución recomendado

```
1 (tokens) → 2 (tipografía) → 3 (hero/nosotros) → 4 (cursos)
→ 5 (multimedia) → 6 (logos) → 7 (íconos) → 8 (QA)
```

Las partes 1 y 2 son **base** (todo lo demás hereda de ellas) y deben ir primero. Las partes 3–7 pueden paralelizarse entre varias personas una vez cerradas 1 y 2. La parte 8 es el cierre.

---

# 📦 Assets externos requeridos (imágenes, íconos y fuentes)

Esta es la lista completa de recursos que **deben proveerse desde fuera** (no se generan en código). Sin estos assets, las partes correspondientes quedan con fallback pero no finales.

## Fuentes tipográficas (Parte 2)
| Recurso | Uso | Fuente sugerida |
|---|---|---|
| Familia display (serif o sans) | Titulares h1–h3 | Google Fonts / `@fontsource` (Fraunces, Spectral, Inter Tight o Libre Franklin) |
| Familia body/UI | Cuerpo, UI, datos | `@fontsource/inter` |
| Poppins | **Solo el logo** (requisito del manual) | `@fontsource/poppins` (ya disponible) |

## Logos institucionales (Parte 6) — **CRÍTICO, los provee el CEE/UNI**
| Logo | Formato requerido | Variantes |
|---|---|---|
| **CEE (oficial)** | SVG vectorial | Horizontal y vertical; sobre fondo blanco y sobre fondo guinda |
| **UNI** (Universidad Nacional de Ingeniería) | SVG vectorial | Color + monocromático blanco |
| **FIIS** (Facultad de Ing. Industrial y de Sistemas) | SVG vectorial | Color + monocromático blanco |
| **CCAT** (Centro Cultural de Avanzada Tecnológica) | SVG vectorial | Color + monocromático blanco |

> ⚠️ El logo CEE de la demo es una **reconstrucción aproximada**. Debe reemplazarse por el archivo oficial del manual de marca antes de producción.

## Imágenes fotográficas (Partes 3, 4, 5)
| Ubicación | Cantidad | Especificación |
|---|---|---|
| **Hero (Inicio)** | 1 | Foto profesional/ejecutivo mirando hacia el texto, alta resolución (≥1920px ancho), apta para overlay guinda. Estilo del manual pág. 4 |
| **Nosotros** | 1–2 | Instalaciones FIIS-UNI o sesión de clase real |
| **Cursos (cards + detalle)** | 1 por curso (10 cursos) | Imagen representativa por curso, `16/9`, ≥1200px ancho. Evitar stock genérico (manual lo desaconseja) |
| **Multimedia (thumbnails)** | 1 por video (6+) | Miniatura del video real, `16/9`. Idealmente desde el `thumbnailUrl` de YouTube/CDN |
| **Testimonios (avatares)** | 3+ | Foto de cada egresado (opcional; hay fallback de iniciales) |
| **Docentes (avatares)** | 8 instructores | Foto de cada docente (opcional; hay fallback de iniciales) |

> **Tratamiento:** todas las fotos institucionales llevan overlay duotono guinda/negro para integrarse a la marca. Definir si el CEE entrega fotos propias o si se adquiere un banco con licencia.

## Íconos (Parte 7)
| Recurso | Origen | Nota |
|---|---|---|
| Set general de UI | **Tabler Icons** (ya integrado) | Outline; sin costo |
| WhatsApp | `ti-brand-whatsapp` o SVG oficial | Para FAB y contacto |
| Redes (LinkedIn, IG, FB, YouTube) | `ti-brand-*` o SVG oficiales | Footer |

> Si se requiere fidelidad de marca estricta en los íconos de redes/WhatsApp, descargar los SVG oficiales de cada plataforma (cada marca tiene guía de uso de su isotipo).

## Favicon / metadatos (Parte 8, opcional)
| Recurso | Formato |
|---|---|
| Favicon CEE | `.ico` + PNG 32/180/512 (derivado del logo oficial) |
| Open Graph image | PNG `1200×630` para previsualización al compartir |

---

## Resumen de dependencias externas

```
Bloqueantes para "final" (no para "funcional"):
  · Logos oficiales SVG: CEE, UNI, FIIS, CCAT   ← los provee el CEE/UNI
  · Fotos: hero, nosotros, 10 cursos, 6 multimedia ← define el CEE

No bloqueantes (tienen fallback en código):
  · Avatares de docentes y testimonios (fallback: iniciales)
  · Íconos de marca (fallback: Tabler ti-brand-*)
  · Fuentes (fallback: system-ui mientras cargan)
```
