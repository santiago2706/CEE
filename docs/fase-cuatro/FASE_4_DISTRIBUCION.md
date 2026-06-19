# Fase 4 — Flujo de conversión directo (sin carrito)
> Plataforma Web CEE-FIIS · Equipo IDI / CCAT
> Distribución de tareas por miembro

---

## Objetivo de la fase
Cablear el embudo de captación **sin carrito de compras**: el usuario presiona "Inscribirme" en un curso y va directo a un registro/contacto **mock** con ese curso ya identificado, sin pasos intermedios de selección múltiple.

> ⚠️ **Fuera de alcance:** carrito de compras, selección de varios cursos a la vez, pasarelas de pago reales y facturación ERP. No se implementa pago real en esta etapa.

> 🔄 **Cambio respecto a la versión anterior de esta fase:** se descartó `cartStore`, el badge de cantidad en el Navbar y el drawer/página de carrito. El flujo ahora es directo: **curso → Inscribirme → registro/contacto**.

---

## Distribución de tareas

### 1. Santiago *(Responsable Técnico)* — Lógica de selección de curso a inscribir
**Qué hace:** define cómo se transporta la información del curso elegido desde el botón "Inscribirme" hasta la página de registro/contacto, sin necesidad de un store global de carrito.
**Cambios concretos:**
- Definir el mecanismo de paso de datos: parámetro de ruta o query param (ej. `/contacto?curso=<id>` o `/registro/:cursoId`), evaluando cuál encaja mejor con el router ya existente.
- Crear un helper o hook simple (ej. `useCursoSeleccionado()`) que lea ese parámetro y resuelva los datos del curso contra el mock de cursos.
- Documentar el contrato para que Renato, Diana y Tom lo consuman igual en todos lados.
- Revisar (code review) los PR del resto antes de hacer merge a `develop`, ya que todos dependen de este mecanismo.

### 2. Renato — Botón "Inscribirme" en Home y Catálogo
**Qué hace:** agrega el CTA de inscripción en las tarjetas de curso que se ven en listados.
**Cambios concretos:**
- Editar `CourseCard` (componente compartido usado en Home y Catálogo desde Fase 3).
- Agregar botón "Inscribirme" que navega a la ruta definida por Santiago, pasando el id del curso correspondiente a esa tarjeta.
- Verificar que funcione igual en el listado de Home y en el de Catálogo (incluyendo resultados filtrados/buscados).

### 3. Diana — Botón "Inscribirme" en Detalle de curso
**Qué hace:** agrega el CTA principal en la página de detalle, que es donde más probablemente convierte.
**Cambios concretos:**
- Editar el sidebar de `DetalleCurso` (ya existente desde Fase 3: precio, antes tenía botón de carrito y descarga de sílabo).
- Reemplazar el botón de carrito por "Inscribirme", que navega al flujo de registro/contacto con el curso ya identificado.
- Mantener el botón de descargar sílabo, que no cambia.

### 4. Tom — Página de registro/contacto con curso preseleccionado
**Qué hace:** arma la página a la que llega el usuario después de presionar "Inscribirme".
**Cambios concretos:**
- Editar/extender la página de registro/contacto (ya existente desde Fase 3, `contactService`).
- Leer el curso seleccionado (vía el helper de Santiago) y mostrarlo de forma visible en el formulario (ej. "Te estás inscribiendo a: *Nombre del curso*").
- Si no llega ningún curso en la URL (usuario entra directo a /contacto), el formulario debe seguir funcionando como contacto general, sin curso asociado.
- Envío del formulario sigue siendo mock: confirma en pantalla, no procesa pago ni matrícula real.

### 5. Isabel — Validaciones del formulario
**Qué hace:** asegura que el formulario de registro/contacto sea confiable antes de cerrar la fase.
**Cambios concretos:**
- Revisar/reforzar las validaciones ya existentes de `contactService` (campos requeridos, formato de email/teléfono, anti-spam).
- Validar el caso nuevo: que el curso preseleccionado se muestre correctamente y no se pierda si el usuario corrige otros campos y reenvía.
- Definir y dejar claros los mensajes de error y de éxito (qué ve el usuario si falta un campo, y qué ve si todo salió bien).

### 6. Elvis — QA del flujo completo
**Qué hace:** valida el embudo de principio a fin antes del cierre de la fase.
**Cambios concretos:**
- Probar el recorrido completo: presionar "Inscribirme" desde Home, desde Catálogo y desde Detalle de curso → llegar al formulario con el curso correcto preseleccionado → enviar → ver confirmación.
- Probar también el caso de entrar directo a /contacto sin curso (debe funcionar como contacto general).
- Repetir en mobile (responsive) y revisar consola del navegador en busca de errores o warnings.
- Reportar bugs encontrados al miembro responsable del componente afectado, antes del cierre de fase.

---

## Dependencias entre tareas
- Santiago entrega primero el mecanismo de paso de datos (aunque sea con un valor de prueba fijo) para que Renato, Diana y Tom puedan integrar en paralelo.
- Tom depende de que Renato y Diana tengan los botones "Inscribirme" enviando el parámetro correcto para poder probar que el curso llega bien a su página.
- Isabel y Elvis trabajan en paralelo desde que existan partes funcionales, validando incrementalmente en vez de esperar al final.

---

## Criterio de "Done" de la fase
- El botón "Inscribirme" existe en Home, Catálogo y Detalle de curso, y lleva al formulario de registro/contacto con el curso correcto identificado.
- El formulario sigue funcionando como contacto general si no hay curso preseleccionado.
- Las validaciones del formulario funcionan (campos requeridos, anti-spam) y muestran mensajes claros de error/éxito.
- Todo probado en desktop y mobile, sin errores de consola (validado por Elvis).

---

## Ramas a renombrar (de Fase 3 a Fase 4)

La convención del repositorio es `feature/fase{N}-{tarea}`, donde `{tarea}` describe **qué se está realizando**, no quién lo hace. Cada miembro debe renombrar su rama actual reemplazando tanto el número de fase como el nombre de la tarea por la que le toca en Fase 4.

| Miembro | Rama actual (Fase 3) | Rama nueva (Fase 4) |
|---------|----------------------|----------------------|
| Santiago | `feature/fase3-home-coursecard` | `feature/fase4-seleccion-curso` |
| Renato | `feature/fase3-catalogo` | `feature/fase4-cta-coursecard` |
| Diana | `feature/fase3-detalle-curso` | `feature/fase4-cta-detalle-curso` |
| Tom | `feature/fase3-nosotros-multimedia` | `feature/fase4-registro-contacto-prefill` |
| Isabel | `feature/fase3-contacto-auth` | `feature/fase4-validaciones-formulario` |
| Elvis | `feature/fase3-qa-paginas-publicas` | `feature/fase4-qa-flujo-inscripcion` |

> Ajusta la columna "Rama actual" si el nombre real con el que quedó tu rama de Fase 3 es distinto — lo importante es que la rama nueva describa la tarea de Fase 4, no la persona.

### Cómo renombrar (cada miembro, en su propia rama)

```bash
# 1. Asegúrate de estar parado en tu rama de Fase 3
git checkout feature/fase3-<tarea-anterior>

# 2. Trae lo último de develop antes de seguir trabajando
git pull origin develop

# 3. Renombra la rama localmente con el nombre de la tarea de Fase 4
git branch -m feature/fase3-<tarea-anterior> feature/fase4-<tarea-nueva>

# 4. Sube la rama nueva al remoto
git push origin feature/fase4-<tarea-nueva>

# 5. Elimina la rama vieja del remoto (ya no se usa)
git push origin --delete feature/fase3-<tarea-anterior>
```

> Ejemplo real para Diana (pasa de Detalle de curso a CTA en Detalle de curso):
> ```bash
> git checkout feature/fase3-detalle-curso
> git pull origin develop
> git branch -m feature/fase3-detalle-curso feature/fase4-cta-detalle-curso
> git push origin feature/fase4-cta-detalle-curso
> git push origin --delete feature/fase3-detalle-curso
> ```

**Nota para Santiago:** como su tarea (mecanismo de selección de curso) es la base de la que dependen Renato, Diana y Tom, conviene que sea el primero en renombrar `feature/fase4-seleccion-curso`, subir su avance inicial y avisar al equipo para que el resto haga `git pull` antes de empezar a integrar contra ese mecanismo.