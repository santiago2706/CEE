# DESIGN.md — Plataforma Web CEE-FIIS

> **Especificación de Diseño Integral** · Centro de Especialización Ejecutiva
> 
> Este documento define la identidad visual, arquitectura de componentes, estructura de páginas y guías de implementación para la plataforma web del CEE.

---

## Tabla de Contenidos

1. [Identidad Visual](#1-identidad-visual)
2. [Paleta de Colores](#2-paleta-de-colores)
3. [Tipografía](#3-tipografía)
4. [Logotipos y Recursos Gráficos](#4-logotipos-y-recursos-gráficos)
5. [Estructura Macro de la Página](#5-estructura-macro-de-la-página)
6. [Componentes de Interfaz](#6-componentes-de-interfaz)
7. [Módulos y Secciones](#7-módulos-y-secciones)
8. [Layout y Grillas](#8-layout-y-grillas)
9. [Responsive y Breakpoints](#9-responsive-y-breakpoints)
10. [Animaciones y Transiciones](#10-animaciones-y-transiciones)
11. [Guía de Aplicación Gráfica](#11-guía-de-aplicación-gráfica)
12. [Estándares de Accesibilidad](#12-estándares-de-accesibilidad)

---

## 1. Identidad Visual

### 1.1. Propósito

La identidad visual del CEE refleja **profesionalismo, modernidad y confianza**. La paleta guinda, plomo y blanco comunica rigor académico y contemporaneidad. El logotipo geométrico (letra "C") representa movimiento, evolución y capacidad técnica.

### 1.2. Tono Visual

- **Formal sin ser rígido:** elegancia en los espacios, limpieza en la composición.
- **Centrado en el usuario:** jerarquía visual clara, mensajes directos.
- **Profesional real:** imágenes auténticas de profesionales y estudiantes, no genéricas.
- **Moderno y escalable:** diseño que funciona desde mobile hasta desktop sin perder integridad.

### 1.3. Principios de Diseño

| Principio | Descripción |
|-----------|-------------|
| **Claridad** | Cada elemento tiene un propósito visual claro; no hay decoración innecesaria. |
| **Jerarquía** | El tamaño, color y posición guían la lectura hacia acciones clave. |
| **Espacio** | Uso generoso de espacios en blanco para respirar y enfocar la atención. |
| **Consistencia** | Componentes, tipografía y espaciado siguen patrones reconocibles. |
| **Accesibilidad** | Contraste suficiente, textos legibles, navegación intuitiva. |

---

## 2. Paleta de Colores

### 2.1. Colores Institucionales

**Para publicidad se usan máximo 4 colores y solo estos con diferente luminosidad.**

#### Primarios

| Nombre | Hex | RGB | Uso |
|--------|-----|-----|-----|
| **Guinda (Burgundy)** | `#682222` | R:104, G:34, B:34 | Color principal, botones, headings, acentos |
| **Negro** | `#000000` | R:0, G:0, B:0 | Texto base, bordes, énfasis máxima |
| **Plomo (Gris)** | `#A9A9A9` | R:169, G:169, B:169 | Fondos secundarios, textos débiles, divisores |
| **Blanco** | `#FFFFFF` | R:255, G:255, B:255 | Fondos principales, textos sobre guinda |

### 2.2. Extensión de Paleta (Tailwind)

Para la implementación en Tailwind, extender los colores institucionales:

```javascript
// tailwind.config.ts
colors: {
  cee: {
    burgundy: '#682222',    // guinda
    slate: '#A9A9A9',       // plomo
    dark: '#000000',        // negro
    light: '#FFFFFF',       // blanco
    // Variaciones para estados (hover, focus, disabled)
    'burgundy-dark': '#4a1515',
    'burgundy-light': '#8b3a3a',
    'slate-light': '#c0c0c0',
    'slate-dark': '#757575',
  }
}
```

### 2.3. Usos Específicos

- **Guinda:** CTAs primarios, badges activos, headings principales, hover states.
- **Negro:** Cuerpo de texto, iconos, bordes de énfasis.
- **Plomo:** Textos secundarios, separadores, fondos suaves.
- **Blanco:** Espacios en blanco, fondos claros, contraste sobre guinda.

### 2.4. Degradados

Permitidos para fondos y secciones decorativas (hero, banners):
- Guinda → Plomo (de arriba a abajo)
- Guinda → Negro (alta intensidad)
- Plomo → Blanco (transición suave)

**Nunca usar más de 2 colores en un degradado.**

---

## 3. Tipografía

### 3.1. Familia Tipográfica Principal: Poppins

**Justificación:** Poppins es moderna, geométrica y altamente legible en pantalla. Incluye todas las variantes necesarias (Regular, Bold, SemiBold).

### 3.2. Jerarquía Tipográfica

| Nivel | Elemento | Tamaño | Weight | Line Height | Uso |
|-------|----------|--------|--------|-------------|-----|
| **H1** | Heading 1 | 48px / 3rem | Bold (700) | 1.2 | Títulos principales, hero |
| **H2** | Heading 2 | 36px / 2.25rem | Bold (700) | 1.3 | Títulos de sección |
| **H3** | Heading 3 | 28px / 1.75rem | SemiBold (600) | 1.4 | Subtítulos, cards |
| **H4** | Heading 4 | 24px / 1.5rem | SemiBold (600) | 1.4 | Labels, subtítulos pequeños |
| **Body** | Párrafo | 16px / 1rem | Regular (400) | 1.6 | Texto principal |
| **Body S** | Párrafo pequeño | 14px / 0.875rem | Regular (400) | 1.5 | Descripciones, helper text |
| **Caption** | Etiqueta | 12px / 0.75rem | Regular (400) | 1.4 | Meta información, timestamps |

### 3.3. Aplicación en CSS

```css
/* Tailwind + Poppins */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

body {
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  color: #000000;
}

h1 { @apply text-4xl font-bold leading-tight; }
h2 { @apply text-3xl font-bold leading-snug; }
h3 { @apply text-2xl font-semibold leading-snug; }
h4 { @apply text-xl font-semibold leading-snug; }
p  { @apply text-base font-normal leading-relaxed; }
small { @apply text-xs leading-tight text-gray-600; }
```

### 3.4. Especificidades

- **Headings:** Usar guinda (`#682222`) o negro según contexto.
- **Body text:** Negro en fondos claros; blanco en fondos guinda.
- **Enlaces:** Guinda con subrayado al hover.
- **Botones:** Texto blanco sobre guinda; guinda sobre blanco con borde.
- **Énfasis:** Bold para palabras clave dentro de párrafos.

---

## 4. Logotipos y Recursos Gráficos

### 4.1. Logotipo del CEE

**Versión Horizontal:** Logo geométrico (letra "C") + texto "CENTRO DE ESPECIALIZACIÓN EJECUTIVA" alineado a la derecha.

**Versión Vertical:** Logo centrado, texto debajo.

#### Especificaciones

- **Tamaño mínimo:** 80px de ancho (versión horizontal).
- **Espaciado alrededor:** Al menos 20px de margen libre.
- **Versiones:**
  - Logo sobre fondo blanco (default)
  - Logo sobre fondo guinda
  - Versión monocromática (blanco sobre guinda)

#### Usos

- **Header/Navbar:** Logo horizontal, 60-80px de ancho, alineado a izquierda.
- **Footer:** Logo horizontal o vertical, 50-60px de ancho.
- **Favicon:** Versión simplificada de la "C", 16x16px, 32x32px.

### 4.2. Logo de UNI

El logotipo de la Universidad Nacional de Ingeniería aparece como co-branding:
- **Tamaño similar** al logo CEE.
- **Posición:** Generalmente en esquina opuesta (si CEE a izquierda, UNI a derecha).
- **Contexto:** En materiales institucionales, certificados, carátulas.

### 4.3. Recurso Gráfico Decorativo

**Composición base:**

```
┌─────────────────────────┐
│  [Profesional/Foto]     │  ← Imagen humana mirando hacia el texto
│  (No genérica)          │
└─────────────────────────┘
                          
Fondo degradé:
Guinda → Plomo → Blanco
(Máximo 3 colores, diferente luminosidad)

Elementos complementarios:
- Logo CEE (izquierda o derecha)
- Logo UNI (esquina opuesta)
- Texto: "Gancho" (llamado a la acción) + "Módulos" (descripción)
- Contacto: WhatsApp + correo
```

#### Reglas de Aplicación

1. **Imágenes:** Profesionales reales, contexto laboral, miradas hacia el texto, no stock photos genéricas.
2. **Texto:** Máximo 1 título + 1-2 líneas de descripción; evitar sobrecarga.
3. **Símbolos:** Solo los necesarios (WhatsApp sí, íconos decorativos no).
4. **Espacio:** Respetar márgenes, no abarrotar.
5. **QR:** Si se incluye, debe estar bien posicionado y legible.

#### Errores a Evitar

- ❌ Múltiples personas sin dirección visual clara.
- ❌ Cambios abruptos de color (guinda → blanco sin transición).
- ❌ Textos sueltos después de QR.
- ❌ Íconos de tamaño inconsistente.
- ❌ Imágenes genéricas o con marcas de agua.
- ❌ Elementos decorativos que no aportan al mensaje.

---

## 5. Estructura Macro de la Página

### 5.1. Arquitectura de Navegación

La página está organizada en las siguientes secciones principales:

```
┌───────────────────────────────────────────┐
│          HEADER / NAVBAR                  │  (sticky)
│  Logo | Links | Search | Cart | Auth      │
├───────────────────────────────────────────┤
│                                           │
│  MAIN CONTENT                             │
│  (varía según ruta/página)                │
│                                           │
├───────────────────────────────────────────┤
│          FOOTER                           │
│  Nav | Contacto | Copyright               │
└───────────────────────────────────────────┘
```

### 5.2. Mapa de Sitio (Rutas Principales)

```
/ (HOME)
  ├─ Hero + Catálogo destacado
  ├─ Sección "Nosotros" (opcional en home)
  └─ CTA "Explorar Cursos"

/programas (CATÁLOGO)
  ├─ Filtros (Categoría, Modalidad)
  ├─ Búsqueda
  ├─ Grid de cursos
  └─ Paginación

/programas/:id (DETALLE DE CURSO)
  ├─ Breadcrumb
  ├─ Título + Imagen
  ├─ Perfil del Egresado
  ├─ Sílabo (acordeón)
  ├─ Plana Docente
  └─ Sidebar (Precio + Carrito + Descargar Sílabo)

/especializaciones (ESPECIALIZACIONES)
  └─ Similar a /programas o filtro dentro de /programas

/nosotros (ABOUT)
  ├─ Misión/Visión/Valores
  ├─ Historia
  └─ Multimedia (videos, testimonios)

/multimedia (VIDEOS & RECURSOS)
  ├─ Galería de videos
  └─ Testimonios

/contacto (CONTACT FORM)
  └─ Formulario 100% responsive + mapa (opcional)

/carrito (CART)
  ├─ Resumen de items
  ├─ Total
  └─ Checkout (mock)

/login, /register (AUTH)
  └─ Formularios split-layout o modal

/admin/* (BACKOFFICE - apps/admin)
  ├─ Dashboard
  ├─ CRUD Cursos
  ├─ Ventas
  └─ ProtectedRoute
```

---

## 6. Componentes de Interfaz

### 6.1. Navbar / Header

**Sticky:** sí, permanece visible al scroll.

**Estructura (Desktop):**

```
┌─────────────────────────────────────────────────────────┐
│ [Logo]  Links      Search     [Cart Badge] [Auth Icon] │
└─────────────────────────────────────────────────────────┘
```

**Componentes:**

- **Logo CEE:** 60-80px, clickeable a home.
- **Navigation Links:** Inicio | Programas | Especializaciones | Nosotros | Multimedia | Contacto (texto en negro, hover guinda).
- **Search Bar:** Input text, placeholder "Buscar cursos...", ancho ~200px.
- **Cart Badge:** Icono carrito, badge rojo con número de items (si > 0).
- **Auth Button:** Icono usuario, dropdown con "Iniciar sesión" / "Registrarse" / "Mi perfil" / "Logout".

**Altura:** 70-80px.

**Responsive (Mobile):**

- Logo pequeño.
- Menú hamburguesa (3 líneas).
- Search y cart como iconos.
- Mobile menu slide-in desde izquierda.

### 6.2. Footer

**Estructura:**

```
┌─────────────────────────────────────────────────────────┐
│ FOOTER                                                  │
├─────────────────────────────────────────────────────────┤
│ Col 1: Links        Col 2: Contacto    Col 3: Social   │
│ - Inicio            - Email            - Instagram     │
│ - Programas         - WhatsApp         - LinkedIn      │
│ - Nosotros          - Teléfono         - Facebook      │
│ - Contacto          - Ubicación        - Twitter       │
├─────────────────────────────────────────────────────────┤
│ © 2024 CEE. Todos los derechos reservados.              │
└─────────────────────────────────────────────────────────┘
```

**Estilos:**

- Fondo: Guinda `#682222`.
- Texto: Blanco `#FFFFFF`.
- Links: Blanco, hover guinda claro.
- Altura: 300-350px (desktop), responsive.

### 6.3. Botones

#### Tipos

| Tipo | Estilos | Uso |
|------|---------|-----|
| **Primary** | Fondo guinda, texto blanco, padding md | CTAs principales (Inscribirse, Añadir) |
| **Secondary** | Borde guinda, texto guinda, fondo transparent | Acciones secundarias (Ver Beneficios) |
| **Danger** | Fondo rojo, texto blanco | Eliminar, Cancelar |
| **Ghost** | Sin fondo, texto gris, hover guinda | Links en contexto, salir |

#### Ejemplos CSS

```css
/* Primary Button */
.btn-primary {
  @apply px-6 py-3 bg-cee-burgundy text-white rounded-lg font-semibold
         hover:bg-cee-burgundy-dark transition-colors duration-200;
}

/* Secondary Button */
.btn-secondary {
  @apply px-6 py-3 border-2 border-cee-burgundy text-cee-burgundy bg-white rounded-lg
         font-semibold hover:bg-cee-burgundy hover:text-white transition-all duration-200;
}

/* Icon Button */
.btn-icon {
  @apply w-10 h-10 flex items-center justify-center rounded-full
         hover:bg-cee-burgundy hover:text-white transition-colors duration-200;
}
```

### 6.4. Cards (Tarjetas de Curso)

**Estructura:**

```
┌─────────────────────────────┐
│  [Imagen del Curso]         │  200px height
├─────────────────────────────┤
│ [Categoría Badge]           │
│ Título del Curso            │  H4, bold
│ Duración + 48 horas         │  Caption, gris
│ Descripción breve...        │  Body S
├─────────────────────────────┤
│ S/ 350        S/ 500 (tachado) │ Precio (actual + original)
│ [Añadir]  [Ver Detalles]    │ Botones
└─────────────────────────────┘
```

**Estilos:**

- Ancho: 280-320px.
- Sombra: `0 2px 8px rgba(0,0,0,0.1)`.
- Hover: Sombra aumenta, imagen zoom suave (1.05).
- Categoría: Badge guinda, texto blanco, tamaño caption.

### 6.5. Formularios

#### Input Text

```css
.input-text {
  @apply w-full px-4 py-3 border border-gray-300 rounded-lg
         focus:border-cee-burgundy focus:ring-2 focus:ring-cee-burgundy/20
         focus:outline-none transition-all duration-200;
}
```

#### Validación

- **Error:** Borde rojo, mensaje de error en caption rojo debajo.
- **Success:** Borde verde, checkmark.
- **Focus:** Borde guinda, ring guinda suave.

#### Anti-spam

- CAPTCHA (Google reCAPTCHA v3 recomendado).
- Rate limiting en backend.
- Mensajes de error claros.

### 6.6. Badges y Tags

| Tipo | Estilos | Uso |
|------|---------|-----|
| **Categoría** | Fondo guinda, texto blanco, size caption, padding sm | "Ingeniería", "Gestión" |
| **Estado Curso** | Fondo plomo, texto blanco | "Publicado", "Borrador", "En Revisión" (admin) |
| **Modalidad** | Fondo guinda claro, texto guinda | "Virtual", "Presencial" |
| **Nivel** | Borde guinda, texto guinda | "Intermedio", "Avanzado" |

### 6.7. Modales y Drawers

- **Modal:** Overlay oscuro (rgba(0,0,0,0.5)), centro de pantalla, max-width 500px.
- **Drawer:** Slide desde lateral (mobile), overlay, z-index alto.
- **Cierre:** Botón X (esquina superior), ESC key, click fuera (en modales).

---

## 7. Módulos y Secciones

### 7.1. Hero Section (Home)

**Estructura:**

```
┌───────────────────────────────────────────────┐
│                                               │
│  Fondo Degradé (Guinda → Plomo)               │
│                                               │
│  [Imagen Professional - Derecha]              │
│                                               │
│  ┌─ IZQUIERDA ─────────────────────┐         │
│  │                                 │         │
│  │ "Potencia tu Futuro con         │         │
│  │  Cursos Especializados"         │ H1     │
│  │                                 │         │
│  │ Descubre nuestra oferta...      │ Body   │
│  │ (2-3 líneas máximo)             │         │
│  │                                 │         │
│  │ [Explorar Cursos] [Ver Benef.]  │ Botones│
│  │                                 │         │
│  └─────────────────────────────────┘         │
│                                               │
└───────────────────────────────────────────────┘
```

**Medidas:**

- Altura: 500-600px (desktop), 400-500px (tablet), 300-400px (mobile).
- Padding: 40-60px horizontal.
- Imagen: ~40% ancho, alineada derecha, sin recorte.

### 7.2. Catálogo de Cursos

**Estructura:**

```
┌─────────────────────────────────────────┐
│ CATÁLOGO DE CURSOS                      │ H2
├─────────────────────────────────────────┤
│ Filtros │ Búsqueda                      │
├─────────────────────────────────────────┤
│ [Card] [Card] [Card] [Card]             │
│ [Card] [Card] [Card] [Card]             │
│ [Card] [Card] [Card] [Card]             │
├─────────────────────────────────────────┤
│ Paginación: < 1 2 3 4 >                 │
└─────────────────────────────────────────┘
```

**Características:**

- **Filtros:** Categoría (dropdown), Modalidad (checkboxes), Precio (rango slider).
- **Búsqueda:** Input text con debounce 300ms.
- **Grid:** 4 columnas (desktop), 2 (tablet), 1 (mobile).
- **Cards:** 280px ancho, sombra suave, hover con zoom.
- **Paginación:** 12-16 items por página.

### 7.3. Detalle de Curso

**Estructura:**

```
┌─────────────────────────────────────────────────────┐
│ Inicio > Programas > Gestión de Proyectos           │ Breadcrumb
├─────────────────────────────────────────────────────┤
│ [Imagen Grande - 60% ancho]  │ [SIDEBAR - 40%]    │
│                              │                      │
│ H1: Título del Curso         │ Categoría           │
│ Horas: 48h | Nivel: Inter.   │ S/ 149.00           │
│ Descripción breve...         │ S/ 250.00 (tachado) │
│                              │ [Añadir al Carrito] │
│                              │ [Descargar Sílabo]  │
├──────────────────────────────┼──────────────────────┤
│ H3: Perfil del Egresado      │                      │
│ ✓ Capacidad para...          │                      │
│ ✓ Habilidad para...          │                      │
│ ✓ Competencia en...          │                      │
├──────────────────────────────┤                      │
│ H3: Sílabo del Curso         │                      │
│ ▼ Módulo 1: Fundamentos      │                      │
│   • Tema 1.1                 │                      │
│   • Tema 1.2                 │                      │
│ ▼ Módulo 2: Aplicaciones     │                      │
│   • Tema 2.1                 │                      │
├──────────────────────────────┤                      │
│ H3: Plana Docente            │                      │
│ [Avatar] Dr. Nombre          │                      │
│ Especialización, Cédula #    │                      │
└──────────────────────────────┴──────────────────────┘
```

**Componentes:**

- **Breadcrumb:** Navegación jerárquica, texto small.
- **Imagen Principal:** 600px altura mínimo, responsive.
- **Sidebar:** Sticky a 200px del top, 40% ancho (desktop), 100% (mobile).
- **Acordeón (Sílabo):** Cada módulo es una fila expandible.
- **Docentes:** Cards pequeñas con avatar, nombre, especialidad.

### 7.4. Formulario de Contacto

**Estructura:**

```
┌────────────────────────────────────┐
│ Contáctanos                        │ H2
├────────────────────────────────────┤
│ [Nombre]        [Email]            │ 2 cols
│ [Teléfono]      [Asunto]           │ 2 cols
│ [Mensaje]                          │ Full width
│                                    │
│ [ ] Acepto términos y políticas    │ Checkbox
│ [reCAPTCHA]                        │ CAPTCHA
│                                    │
│ [Enviar]                           │ Button primary
└────────────────────────────────────┘
```

**Validaciones:**

- Email: RFC 5322 (básico).
- Teléfono: 9 dígitos.
- Mensaje: Mínimo 10 caracteres.
- CAPTCHA: Google reCAPTCHA v3.
- Rate limit: 1 formulario por IP cada 30 segundos.

**Éxito:**

- Modal o inline message: "Gracias, tu mensaje fue enviado. Nos contactaremos pronto."
- Envío de email al correo del CEE con datos del usuario.
- Redirección a home o stay on page (según UX).

### 7.5. Carrito

**Estructura (Página):**

```
┌─────────────────────────────────────┐
│ MI CARRITO                          │ H2
├─────────────────────────────────────┤
│ Items:                              │
│ [Curso 1]  S/ 350  [x]              │ 1 por fila
│ [Curso 2]  S/ 280  [x]              │
│ [Curso 3]  S/ 199  [x]              │
├─────────────────────────────────────┤
│ TOTAL: S/ 829                       │ H3, guinda
│                                     │
│ [Continuar Comprando] [Checkout]    │ Botones
└─────────────────────────────────────┘
```

**Estructura (Drawer/Modal):**

```
Similar, pero comprimido horizontalmente.
Ancho: 400-500px (desktop), 100% (mobile).
```

### 7.6. Autenticación (Login / Register)

**Estructura (Split Layout):**

```
┌──────────────────┬──────────────────┐
│ LOGIN            │ REGISTER         │
├──────────────────┼──────────────────┤
│ Email            │ Nombre           │
│ Contraseña       │ Email            │
│ [ ] Recordarme   │ Contraseña       │
│ [ ] ¿Olvidaste?  │ Confirmar Pwd    │
│                  │ Teléfono         │
│ [Iniciar sesión] │ [Registrarse]    │
│                  │ [ ] Acepto T&C   │
│ ¿Sin cuenta?     │                  │
│ [Crear una]      │ ¿Ya tienes?      │
│                  │ [Inicia sesión]  │
└──────────────────┴──────────────────┘
```

**Responsive (Mobile):**

- Una columna, tabs (Login / Register).
- Mismos campos, full-width inputs.

---

## 8. Layout y Grillas

### 8.1. Sistema de Grilla (Grid)

**12 columnas, responsive:**

```css
.grid-container {
  @apply grid grid-cols-12 gap-6 px-6 max-w-7xl mx-auto;
}

/* Desktop */
.col-main { @apply col-span-8; }
.col-sidebar { @apply col-span-4; }

/* Tablet */
@media (max-width: 1024px) {
  .col-main { @apply col-span-8; }
  .col-sidebar { @apply col-span-4; }
}

/* Mobile */
@media (max-width: 768px) {
  .col-main { @apply col-span-12; }
  .col-sidebar { @apply col-span-12; }
}
```

### 8.2. Espaciado Estándar

| Escala | Valor | Tailwind | Uso |
|--------|-------|----------|-----|
| **xs** | 4px | `gap-1` | Espaciado muy compacto |
| **sm** | 8px | `gap-2` | Espaciado entre elementos |
| **md** | 16px | `gap-4` | Espaciado estándar |
| **lg** | 24px | `gap-6` | Espaciado entre secciones |
| **xl** | 32px | `gap-8` | Espaciado grande |
| **2xl** | 48px | `gap-12` | Espaciado muy grande |

### 8.3. Máximo Ancho de Contenido

```css
.max-w-container {
  @apply max-w-7xl mx-auto; /* 1280px */
}

/* Algunas secciones pueden ser full-width (hero, footer) */
.full-width {
  @apply w-full;
}
```

---

## 9. Responsive y Breakpoints

### 9.1. Breakpoints Tailwind

| Nombre | Ancho | Dispositivo |
|--------|-------|-------------|
| `sm` | 640px | Móvil pequeño (iPhone SE) |
| `md` | 768px | Tablet (iPad) |
| `lg` | 1024px | Laptop pequeño |
| `xl` | 1280px | Escritorio estándar |
| `2xl` | 1536px | Pantalla grande |

### 9.2. Estrategia Responsive

**Mobile-first:** Estilos base para mobile, luego `@media (min-width: ...)` para desktop.

```css
/* Base: Mobile */
.card {
  width: 100%;
  columns: 1;
}

/* Tablet y superior */
@media (min-width: 768px) {
  .card {
    width: 280px;
    columns: 2;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .card {
    columns: 4;
  }
}
```

### 9.3. Checklist Responsive

- ✅ Navbar: hamburguesa en mobile, links en desktop.
- ✅ Cards: 1 columna (mobile), 2 (tablet), 4 (desktop).
- ✅ Sidebar: Debajo del main (mobile), al lado (desktop).
- ✅ Formularios: Full-width inputs (mobile), 2 columnas (desktop).
- ✅ Imágenes: Escalen sin distorsión (aspect-ratio).
- ✅ Texto: Legible en mobile (mínimo 14px).
- ✅ Botones: Mínimo 44x44px (touch target).
- ✅ Espaciado: Ajustado para pantalla pequeña (no ahogar).

---

## 10. Animaciones y Transiciones

### 10.1. Transiciones Estándar

```css
/* Duración estándar: 200-300ms */
.transition-default {
  transition: all 200ms ease-in-out;
}

.transition-slow {
  transition: all 300ms ease-in-out;
}
```

### 10.2. Efectos Comunes

| Efecto | Trigger | Animación | Duración |
|--------|---------|-----------|----------|
| **Hover Card** | Hover | Sombra ↑, Zoom 1.05 | 200ms |
| **Button Hover** | Hover | Fondo oscuro, Scale 0.98 | 150ms |
| **Link Underline** | Hover | Underline guinda | 200ms |
| **Modal Entrada** | Click | Fade in + Slide up | 300ms |
| **Acordeón Toggle** | Click | Max-height expand | 300ms |
| **Fade in on Scroll** | Intersection | Opacity 0→1 | 500ms |

### 10.3. Recomendaciones

- ✅ Animaciones fluidas, no abruptas.
- ✅ Duración 150-300ms (no más de 500ms).
- ✅ Easing: `ease-in-out` para suavidad.
- ✅ No animar en redes lentas (respetar `prefers-reduced-motion`).
- ✅ No más de 2 animaciones simultáneas.

---

## 11. Guía de Aplicación Gráfica

### 11.1. Composición Estándar (Flyers, Banners)

**Regla de Terceras:**

```
┌─────────┬─────────┬─────────┐
│ Logo    │ Logo    │         │ (Sobre línea superior)
├─────────┼─────────┼─────────┤
│         │         │[Profesional] │ (Centro derecha, mirando izq)
│  Texto  │  Texto  │         │
│ (Gancho)│(Módulos)│         │
│         │         │         │
├─────────┼─────────┼─────────┤
│ Contacto│ Contacto│         │ (Sobre línea inferior)
└─────────┴─────────┴─────────┘
```

### 11.2. Variantes de Posición

#### Variante A: Logos Izquierda

- Logo CEE (arriba izquierda).
- Logo UNI (abajo derecha).
- Texto y gancho a izquierda-centro.
- Profesional a derecha, mirando izquierda.

#### Variante B: Logos Derecha

- Logo UNI (arriba derecha).
- Logo CEE (abajo izquierda).
- Profesional a izquierda, mirando derecha.
- Texto y gancho a derecha-centro.

### 11.3. Criterios de Diseño

| Criterio | ✅ Sí | ❌ No |
|----------|------|-------|
| **Imágenes** | Profesionales reales, contexto laboral | Genéricas, stock photos obvias |
| **Colores** | Máximo 4 (guinda, plomo, blanco, negro) | Colores adicionales sin contraste |
| **Texto** | Claro, jerárquico, máx 3 líneas | Desordenado, demasiado pequeño |
| **Símbolos** | WhatsApp, iconos funcionales | Decorativos innecesarios |
| **Espacio** | Generoso, respira | Apretado, asfixiante |
| **QR** | Bien posicionado, legible | Pequeño, sin contexto |

---

## 12. Estándares de Accesibilidad

### 12.1. WCAG 2.1 Level AA (Objetivo)

- ✅ Contraste mínimo 4.5:1 para texto normal.
- ✅ Contraste mínimo 3:1 para texto grande (18px+).
- ✅ Textos legibles, mínimo 14px en pantalla.
- ✅ Enlaces con suficiente tamaño de toque (44x44px).
- ✅ Enfoque visible en elementos interactivos.

### 12.2. Implementación

#### Color de Texto sobre Fondos

| Fondo | Texto Recomendado | Ratio |
|-------|------------------|-------|
| Blanco | Negro | 21:1 ✅ |
| Guinda | Blanco | 4.8:1 ✅ |
| Plomo | Blanco o Negro | 6:1 ✅ |
| Guinda | Guinda claro | < 3:1 ❌ |

#### Ejemplos CSS

```css
/* Accesible */
.accessible {
  color: #000000;         /* Negro */
  background: #FFFFFF;    /* Blanco */
  /* Ratio: 21:1 */
}

/* Accesible */
.accessible-inverted {
  color: #FFFFFF;         /* Blanco */
  background: #682222;    /* Guinda */
  /* Ratio: 4.8:1 */
}

/* NO accesible */
.inaccessible {
  color: #8b3a3a;         /* Guinda claro */
  background: #682222;    /* Guinda */
  /* Ratio: < 3:1 */
}
```

### 12.3. Otras Prácticas

- **Alt text en imágenes:** Descripción significativa, no "imagen1.jpg".
- **Labels en formularios:** `<label for="email">Email</label>`.
- **ARIA:** `aria-label`, `aria-describedby`, `role` cuando sea necesario.
- **Keyboard navigation:** Tab, Enter, Escape deben funcionar.
- **Focus visible:** Borde guinda o ring en focus.
- **Íconos:** Si son funcionales, incluir texto o aria-label.
- **Videos:** Subtítulos opcionales para videos de demostración.

### 12.4. Testing

- Verificar en tools: WAVE, Axe, Lighthouse.
- Probar con lectores de pantalla (NVDA, JAWS).
- Navegar solo con teclado.
- Probar con filtros de visión (daltonismo).

---

## 13. Notas de Implementación

### 13.1. Stack Tech Recomendado

- **Frontend:** React + Vite + TypeScript.
- **Estilos:** Tailwind CSS + shadcn/ui.
- **Componentes:** Componentización atómica (Button, Card, Input, etc.).
- **State:** Zustand para cart y auth.
- **Rutas:** React Router v6 con lazy loading.

### 13.2. Estructura de Carpetas

```
apps/web/src/
├── components/
│   ├── ui/              (shadcn: Button, Card, Input, etc.)
│   ├── layout/          (Navbar, Footer, Layout)
│   ├── sections/        (Hero, CatalogSection, etc.)
│   └── common/          (Badge, Avatar, etc.)
├── pages/               (Page components, lazy loaded)
├── styles/
│   └── globals.css      (Poppins import, tailwind)
├── types/               (@cee/types import)
├── store/               (Zustand: cartStore, authStore)
└── services/            (API calls, mocks)
```

### 13.3. Desarrollo de Componentes

**Cada componente debe tener:**

1. **TypeScript types** clara.
2. **Props documentadas**.
3. **Estados visuales** (hover, focus, disabled, loading).
4. **Responsive behavior**.
5. **Accesibilidad** (ARIA, keyboard navigation).
6. **Storybook** (opcional pero recomendado).

---

## 14. Checklist de Entrega

### 14.1. Antes de Producción

- ✅ Todos los componentes responden a Poppins.
- ✅ Colores CEE aplicados (guinda, plomo, blanco, negro).
- ✅ Navbar sticky, responsive.
- ✅ Footer con navegación y contacto.
- ✅ Hero section con gradiente.
- ✅ Cards de curso con sombra y hover.
- ✅ Formulario de contacto con validación y CAPTCHA.
- ✅ Carrito funcional (add, remove, total).
- ✅ Auth login/register con split layout.
- ✅ Responsive verificado (mobile, tablet, desktop).
- ✅ Contraste AA verificado (WAVE, Axe).
- ✅ Keyboard navigation funcional.
- ✅ Imágenes optimizadas (lazy loading, webp).
- ✅ Fuentes de Google cargadas sin FOUT.
- ✅ Meta tags y SEO básico.
- ✅ Deploy en hosting.

### 14.2. Documentación

- ✅ Este DESIGN.md.
- ✅ Guía de componentes (Storybook o similar).
- ✅ Guía de colores en Tailwind config.
- ✅ Guía de uso de logotipos.

---

## 15. Referencias y Recursos

### 15.1. Documentos Fuente

- `MANUAL_GRAFIC.pdf` — Manual de identidad visual oficial.
- `PLAN_IMPLEMENTACION_CEE_WEB.md` — Fases de desarrollo.
- `Plan_de_Trabajo__CCAT_x_CEE_2.pdf` — Requisitos y benchmarking.
- `Propuesta_de_módulos__Pagina_Web_CEE.pdf` — Propuesta de módulos.

### 15.2. Herramientas Recomendadas

- **Design:** Figma (para mockups, prototipos).
- **Dev:** VS Code + Prettier + ESLint.
- **Testing:** Axe DevTools, WAVE, Lighthouse.
- **Assets:** Unsplash/Pexels (fotos profesionales), Feather Icons.
- **Fonts:** Google Fonts (Poppins).
- **Hosting:** Vercel, Netlify (React optimizado).

---

## Versión y Historial

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2024 | Creación inicial con especificaciones completas |

---

**Documento vivo.** Actualizar a medida que el proyecto avanza.

*Equipo IDI / CCAT — Centro de Especialización Ejecutiva (CEE)*
