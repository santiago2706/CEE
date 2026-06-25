Plan de Mejoras de UI/UX — Plataforma Web CEE-FIIS


Equipo IDI / CCAT · Frontend del Centro de Especialización Ejecutiva (FIIS)
Complemento del documento PLAN_IMPLEMENTACION_CEE_WEB.md. Documento vivo.
Origen: 6 correcciones de diseño solicitadas sobre el sitio actual, traducidas a tareas de desarrollo sobre el stack real (React + Vite + TS, shadcn/ui, Tailwind), no a generación de imágenes.




0. Cómo leer este documento

Las 6 correcciones llegaron escritas como prompts de generación de imágenes. Eso sirve para diseño visual, pero el sitio se construye con componentes React, así que aquí cada cambio se reescribe como:


Qué se cambia (intención de diseño).
Dónde (componente / archivo del monorepo).
Tareas concretas (checklist accionable).
Done cuando (criterio de aceptación).


Cada iniciativa se mapea a la fase correspondiente del plan de implementación para no duplicar trabajo:

Cambio solicitadoIniciativaFase del plan base1. Banner / Hero re-alineadoAFase 3 (Home)2. Navbar con doble logo + linksBFase 2 (Layout)3. Cards de BlogCFase 3 (sección nueva: Blog)4. Multimedia → "Testimonios"DFase 3 (Nosotros + Multimedia)5. Formulario de contacto + FooterEFase 2 (Footer) + Fase 3 (Contacto)6. Perfil con foto + pestaña "Profesores"FFase 2 (Navbar) + Fase 3 (Detalle)Botón flotante de WhatsApp (transversal)GFase 2 (Layout)Tokens de marca (transversal)BaseFase 2 / config


1. Tokens de marca a fijar (hacer ANTES de todo)

Del MANUAL_GRAFIC.pdf — máximo 4 colores, solo estos con distinta luminosidad. Hay que alinear el tema actual ("rojo CEE") con el guinda oficial del manual.

RolColorHEXUsoPrimario (guinda/vino)Guinda#682222Botones, títulos, contenedores, pestaña "Profesores"Secundario (plomo)Gris#A9A9A9Detalles, bordes suaves, estados deshabilitadosNeutro oscuroNegro#000000Texto, footerBaseBlanco#FFFFFFFondos de tarjetas, formularios

Tareas


 En packages/config (o tailwind.config) definir/renombrar el primario a #682222 y exponerlo como brand.primary; gris como brand.muted.
 Crear tonos derivados por luminosidad (ej. primary-700, primary-50) — el manual exige variar solo luminosidad, no introducir colores nuevos.
 Reemplazar usos sueltos de "rojo" hardcodeado por el token.
 Definir un fondo crema y un gris claro con patrón sutil como tokens (surface-cream, surface-grey) — se usan en las iniciativas C y E.


Done cuando: todo color de marca sale de un token; no quedan HEX sueltos en componentes.


2. Decisiones abiertas que estos cambios introducen

Conviene cerrarlas antes de programar, porque cambian el alcance respecto al plan original:

O1. "Blog" y "Multimedia/Testimonios" como secciones nuevas.
El plan base (Fase 3) no contemplaba un Blog ni una sección de Testimonios independiente; solo "Nosotros + Multimedia". Los cambios 3 y 4 las introducen como secciones de primer nivel del navbar.
→ Confirmar: ¿se agregan al alcance estas dos secciones y sus rutas (/blog, /testimonios)?

O2. Links del navbar.
El cambio pide: Inicio · Nosotros · Programas · Blog · Multimedia · Contacto. La maqueta de la Propuesta de módulos solo mostraba Programas · Nosotros. Hay además la duda previa "Especializaciones vs Programas".
→ Congelar la lista definitiva de items del menú antes de la Fase 2.

O3. Segundo logo (universidad / aliado).
El cambio 2 pide dos logos: el del CEE (manual) + el de la universidad. Falta el archivo vectorial (SVG) del logo de la universidad con permiso de uso.
→ Conseguir el asset oficial; sin él la tarea B queda bloqueada parcialmente.

O4. "Profesores" / plana docente como entidad de datos.
El cambio 6 pide un overlay de docentes con foto, cargo, próximos eventos/clases y link a su perfil completo. Eso implica una entidad Teacher/Faculty en @cee/types y fixtures mock.
→ Definir el contrato del tipo Teacher con backend (campos: foto, título, bio, cursos/eventos, slug de perfil).


3. Iniciativas y tareas

Iniciativa A — Hero / Banner principal (Cambio 1)

Qué se cambia: eliminar el espacio muerto a la izquierda. El bloque diagonal guinda pasa a ser el contenedor del texto, alineado a la izquierda. Texto completo ("Especialízate con el Centro de Especialización Ejecutiva" + descripción + badge "PRÓXIMO A INICIAR"). Imagen de fondo (oficina) más limpia a la derecha.
Dónde: apps/web/src/sections/Hero.tsx (componente del Home, Fase 3 frente 1).

Tareas


 Reestructurar el layout del hero a grid de 2 columnas: contenido (izquierda, ~55–60%) / imagen (derecha).
 Mover el contenedor diagonal guinda para que albergue todo el texto, alineado a la izquierda; quitar el padding/espacio vacío inicial.
 Recrear el corte diagonal con CSS (clip-path) usando brand.primary, en vez de incrustarlo en una imagen.
 Componente Badge reutilizable para "PRÓXIMO A INICIAR".
 Imagen de fondo: optimizar (WebP), loading adecuado, leve desenfoque/overlay para legibilidad.
 Verificar responsive: en mobile el texto va arriba a ancho completo y la imagen debajo o como fondo.


Done cuando: el hero no tiene espacio en blanco a la izquierda, el texto vive dentro del bloque guinda y se ve equilibrado en desktop y mobile.


Iniciativa B — Navbar con doble logo (Cambio 2)

Qué se cambia: dos logos a la izquierda (CEE del manual + universidad/aliado), links de navegación, "Mi Perfil" + icono y flecha de sesión a la derecha.
Dónde: apps/web/src/components/layout/Navbar.tsx (Fase 2).

Tareas


 Integrar el logo CEE como SVG (no PNG) para nitidez; ubicarlo a la izquierda.
 Añadir el segundo logo (universidad) — bloqueado por O3; dejar slot listo con placeholder mientras llega el asset.
 Separador vertical entre ambos logos; asegurar altura y alineación consistentes.
 Implementar los links definitivos (según O2) con estado activo (React Router NavLink).
 Mantener badge de carrito (cartStore) y botón de sesión (authStore), sticky.
 Reservar el área derecha para "Mi Perfil" + pestaña "Profesores" (ver Iniciativa F).
 MobileMenu: colapsar links en hamburguesa; decidir cómo se muestran los dos logos en mobile (probablemente solo el del CEE).


Done cuando: ambos logos se ven nítidos y alineados, los links funcionan con estado activo, y todo es responsive.


Iniciativa C — Sección y cards de Blog (Cambio 3)

Qué se cambia: fondo de página gris claro con patrón sutil (distinto del blanco). Tres cards uniformes con sombra (drop-shadow) y borde fino guinda, tipografía pulida, fecha estandarizada ("11 DE MAYO DE 2026"), y arreglar el placeholder del tercer artículo (imagen real + texto completo).
Dónde: nueva ruta /blog → apps/web/src/pages/Blog.tsx + apps/web/src/components/BlogCard.tsx (depende de O1).

Tareas


 Crear tipo BlogPost en @cee/types (título, fecha ISO, cover, resumen, slug) + fixtures mock.
 BlogCard: imagen de portada con fallback/skeleton (nada de placeholders rotos), box-shadow y border fino brand.primary, hover sutil.
 Helper de formato de fecha que produzca "11 DE MAYO DE 2026" (utilidad formatDateLong, locale es-PE).
 Fondo de sección con surface-grey + patrón CSS sutil (no imagen pesada).
 Asegurar uniformidad de altura (CSS grid / line-clamp en resumen).
 Estado de carga (skeletons) y estado vacío.


Done cuando: las tres cards son idénticas en estilo, ninguna muestra placeholder, las fechas están unificadas y destacan sobre el fondo gris.


Iniciativa D — Multimedia → "Testimonios" (Cambio 4)

Qué se cambia: renombrar el título "Multimedia" a "Testimonios"; degradado guinda más rico; texto descriptivo nuevo enfocado en egresados; miniaturas de video de mayor calidad.
Dónde: apps/web/src/sections/Multimedia.tsx → renombrar a Testimonios.tsx (Fase 3 frente 4).

Tareas


 Renombrar componente/sección y el item de menú (coordinar con O2; decidir si la ruta queda /multimedia o pasa a /testimonios, con redirect si hace falta).
 Reemplazar copy del título y del párrafo por el texto de historias de éxito de egresados.
 Fondo: degradado con tonos de brand.primary por luminosidad (sin colores fuera del manual).
 VideoCard con thumbnail de calidad, lazy-load del iframe/poster y carga diferida del reproductor (requisito de rendimiento del plan, Fase 7).
 Confirmar fuente de los videos (CDN / YouTube no listado) para no penalizar la carga.


Done cuando: la sección dice "Testimonios", el copy habla de egresados, y los videos cargan diferidos sin afectar el tiempo de carga inicial.


Iniciativa E — Formulario de Contacto + Footer (Cambio 5)

Qué se cambia: fondo de página crema (que contraste con el formulario blanco); quitar la "barra de tareas de Windows" que aparece de fondo en la maqueta; añadir un footer profesional gris oscuro con teléfono, dirección y correo.
Dónde: apps/web/src/pages/Contacto.tsx + apps/web/src/components/layout/Footer.tsx (Fase 2/3).

Tareas


 Página de contacto: fondo surface-cream, contenedor del formulario blanco con sombra → contraste claro.
 Quitar cualquier imagen de fondo decorativa "de escritorio" (la barra de tareas); reemplazar por espacio limpio.
 Form con validación y anti-spam vía contactService (ya previsto en Fase 3 frente 5): campos Nombre Completo, Correo, etc., y textarea.
 Botón "Enviar mensaje" en brand.primary; estados loading / éxito / error.
 Footer: fondo gris oscuro, datos de contacto (teléfono, dirección física, correo) legibles y bien organizados, navegación y copyright dinámico.
 Asegurar que el formulario notifica al correo del CEE sin pérdida de datos (criterio de QA, Fase 7).


Done cuando: el formulario blanco resalta sobre el fondo crema, no hay artefactos de escritorio, y existe un footer profesional con datos de contacto.


Iniciativa F — Perfil con foto + pestaña "Profesores" (Cambio 6)

Qué se cambia: "Mi Perfil" con foto (placeholder real); nueva pestaña guinda "Profesores" a la derecha; al abrirla, overlay/submenú con tarjetas de docentes (foto, cargo, próximos eventos/clases, link a perfil completo); reubicar el icono de cerrar sesión más a la derecha.
Dónde: Navbar.tsx + nuevo TeachersMenu.tsx + apps/web/src/pages/TeacherProfile.tsx (depende de O4).

Tareas


 Tipo Teacher en @cee/types (foto, nombre, título, bio, lista de eventos/cursos, slug) + fixtures mock.
 Avatar en "Mi Perfil" con foto/placeholder e iniciales de respaldo.
 Pestaña "Profesores" en brand.primary con texto blanco, claramente diferenciada.
 TeachersMenu: overlay/dropdown accesible (foco, Esc para cerrar, ARIA) con tarjetas de docente.
 Tarjeta de docente: foto, cargo, resumen de próximos eventos/clases, link "Ver perfil".
 Página TeacherProfile (/profesores/:slug) con información profesional ampliada.
 Reubicar el icono de logout a la derecha del nuevo bloque, sin romper el layout mobile.
 Reutilizar la "Plana Docente" del detalle de curso (Fase 3 frente 3) consumiendo el mismo tipo Teacher.


Done cuando: "Mi Perfil" muestra avatar, la pestaña "Profesores" abre un overlay con docentes navegables a su perfil, y el logout sigue accesible.


Iniciativa G — Botón flotante de WhatsApp (transversal)

Qué se cambia: el icono verde de WhatsApp aparece fijo abajo a la derecha en todas las vistas.
Dónde: apps/web/src/components/layout/WhatsAppFab.tsx, montado en Layout.

Tareas


 Componente flotante fijo (position: fixed, bottom-right) con z-index sobre el contenido.
 Link https://wa.me/<numero> con número del CEE configurable por variable de entorno.
 Accesible (aria-label), tamaño táctil correcto en mobile, sin tapar el footer.


Done cuando: el botón aparece en todas las páginas, abre WhatsApp con el número del CEE y no estorba en mobile.


4. Orden sugerido de ejecución


Tokens de marca (sección 1) — base para todo lo demás.
Iniciativa B (Navbar) y G (WhatsApp) — son layout, desbloquean al resto (Fase 2).
Iniciativa A (Hero) y E (Contacto + Footer) — alto impacto visible.
Iniciativa D (Testimonios) — renombrado + rendimiento.
Iniciativa C (Blog) y F (Profesores) — dependen de cerrar O1 y O4 (tipos + mocks).



Recordatorio del repo: solo pnpm; no editar components/ui/ a mano (shadcn); localStorage solo vía authStore; tipos siempre desde @cee/types.




5. Resumen de bloqueos a resolver

IDBloqueoNecesario paraResponsableO1Confirmar Blog y Testimonios en el alcanceIniciativas C, DCEE / IDIO2Lista final de links del navbarIniciativa BCEE / IDIO3SVG oficial del logo de la universidadIniciativa BCEEO4Contrato del tipo Teacher con backendIniciativa FIDI + Backend