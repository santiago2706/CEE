from playwright.sync_api import sync_playwright
import pandas as pd
import time
import random
import re
from datetime import datetime, timedelta
from urllib.parse import urlparse

from clasificador import clasificar_post


# ============================================================
# SELECTOR PRINCIPAL CONFIRMADO POR CONSOLA
# ============================================================

POST_CARD_SELECTOR = "div.feed-shared-update-v2"


# ============================================================
# UTILIDADES
# ============================================================

def _numero(texto: str) -> str:
    """Extrae el primer número de un texto."""
    m = re.search(r"[\d][,.\d]*", texto or "")
    return m.group(0).replace(",", "").replace(".", "") if m else "0"


def _fecha_a_datetime(fecha: str):
    """Convierte fecha string a datetime si es posible."""
    if not fecha or "desconocida" in fecha.lower():
        return None

    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
        try:
            return datetime.strptime(fecha, fmt)
        except ValueError:
            pass

    return None


def resolver_fecha_linkedin(fecha_raw: str) -> str:
    """
    Convierte fechas relativas de LinkedIn a formato YYYY-MM-DD HH:MM:SS.

    Ejemplos:
    - 5 min
    - 3 h
    - 1 día
    - 2 días
    - 1 semana
    - 2 meses
    - 1 año
    """
    if not fecha_raw:
        return "Fecha desconocida"

    ahora = datetime.now()

    txt = str(fecha_raw).strip().lower()
    txt = txt.replace("hace", "").strip()
    txt = txt.replace("•", " ").strip()
    txt = txt.replace("·", " ").strip()
    txt = re.sub(r"\s+", " ", txt)

    # ISO
    if re.match(r"\d{4}-\d{2}-\d{2}t\d{2}:\d{2}:\d{2}", txt):
        try:
            dt = datetime.strptime(txt[:19], "%Y-%m-%dT%H:%M:%S")
            return dt.strftime("%Y-%m-%d %H:%M:%S")
        except Exception:
            pass

    # Minutos
    m = re.search(r"(\d+)\s*(min|minuto|minutos)\b", txt)
    if m:
        return (ahora - timedelta(minutes=int(m.group(1)))).strftime("%Y-%m-%d %H:%M:%S")

    # Horas
    m = re.search(r"(\d+)\s*(h|hora|horas)\b", txt)
    if m:
        return (ahora - timedelta(hours=int(m.group(1)))).strftime("%Y-%m-%d %H:%M:%S")

    # Días
    m = re.search(r"(\d+)\s*(d|día|dia|días|dias)\b", txt)
    if m:
        return (ahora - timedelta(days=int(m.group(1)))).strftime("%Y-%m-%d %H:%M:%S")

    # Semanas
    m = re.search(r"(\d+)\s*(sem|semana|semanas)\b", txt)
    if m:
        return (ahora - timedelta(weeks=int(m.group(1)))).strftime("%Y-%m-%d %H:%M:%S")

    # Meses aproximados
    m = re.search(r"(\d+)\s*(mes|meses)\b", txt)
    if m:
        return (ahora - timedelta(days=int(m.group(1)) * 30)).strftime("%Y-%m-%d %H:%M:%S")

    # Años aproximados
    m = re.search(r"(\d+)\s*(año|años|year|years)\b", txt)
    if m:
        return (ahora - timedelta(days=int(m.group(1)) * 365)).strftime("%Y-%m-%d %H:%M:%S")

    return "Fecha desconocida"


def normalizar_url_linkedin(url: str) -> str:
    """Limpia query params de una URL de LinkedIn."""
    if not url:
        return ""

    parsed = urlparse(url)

    if not parsed.scheme:
        return url

    return f"{parsed.scheme}://{parsed.netloc}{parsed.path}"


def obtener_url_actividad(perfil_url: str) -> str:
    """
    Convierte:
    https://www.linkedin.com/in/slug/
    en:
    https://www.linkedin.com/in/slug/recent-activity/all/
    """
    perfil_url = perfil_url.rstrip("/")
    return perfil_url + "/recent-activity/all/"


def exportar_csv_linkedin(df: pd.DataFrame, archivo="resultados_linkedin.csv"):
    """Exporta el CSV final."""
    columnas = [
        "Fecha",
        "Tipo",
        "Nombre",
        "Contenido",
        "Likes",
        "Comentarios",
        "Compartidas"
    ]

    df_final = df.copy()

    for col in columnas:
        if col not in df_final.columns:
            df_final[col] = ""

    df_final = df_final[columnas]

    df_final.to_csv(
        archivo,
        index=False,
        encoding="utf-8-sig"
    )

    return archivo


# ============================================================
# NAVEGACIÓN
# ============================================================

def _cerrar_popups(page):
    """Cierra popups comunes de LinkedIn si aparecen."""
    selectores = [
        'button[aria-label="Descartar"]',
        'button[aria-label="Cerrar"]',
        'button[aria-label="Dismiss"]',
        'button:has-text("Entendido")',
        'button:has-text("Ahora no")',
        'button:has-text("Not now")',
        'button:has-text("Dismiss")',
        'button:has-text("Omitir")',
        'button:has-text("Skip")'
    ]

    for sel in selectores:
        try:
            page.locator(sel).first.click(timeout=1200)
            time.sleep(0.5)
        except Exception:
            pass


def _ir_a_publicaciones(page, perfil_url: str):
    """
    Entra directamente a la sección de publicaciones recientes.
    Si LinkedIn redirige, igual imprime la URL final.
    """
    actividad_url = obtener_url_actividad(perfil_url)

    print("🌐 Abriendo publicaciones de LinkedIn...")
    print(f"🔗 URL actividad: {actividad_url}")

    page.goto(actividad_url, wait_until="domcontentloaded")
    time.sleep(8)

    _cerrar_popups(page)

    # Intentar asegurar pestaña Publicaciones si aparece
    try:
        page.get_by_role(
            "button",
            name=re.compile(r"Publicaciones|Posts", re.I)
        ).first.click(timeout=3000)

        print("✅ Pestaña Publicaciones asegurada.")
        time.sleep(3)
    except Exception:
        pass

    print(f"📍 Página actual: {page.url}")


def _debug_linkedin(page, nombre="debug_linkedin"):
    """Guarda captura y datos de depuración."""
    try:
        print(f"🔎 URL actual: {page.url}")

        page.screenshot(
            path=f"{nombre}.png",
            full_page=True
        )

        print(f"🖼️ Captura guardada: {nombre}.png")

        texto = page.locator("body").inner_text(timeout=5000)
        print("\n🧾 Texto visible parcial:")
        print(texto[:2000])

        selectores_debug = [
            "main",
            "article",
            "div.feed-shared-update-v2",
            "div[data-urn]",
            "div.update-components-text",
            "div.feed-shared-inline-show-more-text",
            "span.break-words",
            "div[dir='ltr']",
            "div.occludable-update"
        ]

        print("\n📌 Conteo de selectores:")
        for sel in selectores_debug:
            try:
                print(f"   {sel}: {page.locator(sel).count()}")
            except Exception as e:
                print(f"   {sel}: error {e}")

    except Exception as e:
        print(f"⚠️ No se pudo generar debug: {e}")


def _scroll_linkedin(page):
    """
    Scroll robusto para LinkedIn.
    """
    try:
        antes = page.evaluate("() => window.scrollY")
    except Exception:
        antes = -1

    print(f"   📍 Scroll antes: {antes}")

    try:
        page.mouse.move(700, 760)
        time.sleep(0.3)
    except Exception:
        pass

    # Llevar último post visible al viewport
    try:
        cards = page.locator(POST_CARD_SELECTOR).all()
        if cards:
            cards[-1].scroll_into_view_if_needed(timeout=5000)
            time.sleep(1.5)
    except Exception:
        pass

    # Scroll JS
    try:
        page.evaluate(
            """
            () => {
                window.scrollBy({
                    top: 1500,
                    left: 0,
                    behavior: 'smooth'
                });
            }
            """
        )
        time.sleep(2.5)
    except Exception:
        pass

    # PageDown fallback
    try:
        page.keyboard.press("PageDown")
        time.sleep(1.5)
    except Exception:
        pass

    # Wheel fallback
    try:
        page.mouse.wheel(0, random.randint(1200, 1800))
        time.sleep(2.5)
    except Exception:
        pass

    try:
        despues = page.evaluate("() => window.scrollY")
    except Exception:
        despues = -1

    print(f"   📍 Scroll después: {despues}")

    if antes == despues:
        print("   ⚠️ El scroll no cambió.")
    else:
        print("   ✅ Scroll realizado.")


def _esperar_publicaciones(page) -> bool:
    """
    Espera publicaciones reales de LinkedIn.
    Según diagnóstico, los posts aparecen como div.feed-shared-update-v2.
    """
    print("⏳ Esperando publicaciones...")

    for intento in range(1, 16):
        try:
            page.wait_for_timeout(2000)

            posts = page.locator("div.feed-shared-update-v2").count()
            textos = page.locator("div.update-components-text").count()
            urns = page.locator("div[data-urn]").count()

            print(
                f"   Intento {intento}/15 → "
                f"posts: {posts} | textos: {textos} | urns: {urns}"
            )

            if posts > 0:
                print("✅ Publicaciones cargadas.\n")
                return True

        except Exception as e:
            print(f"   ⚠️ Error esperando publicaciones: {e}")

        try:
            page.evaluate("window.scrollBy(0, 600)")
            page.wait_for_timeout(1500)
        except Exception:
            pass

    return False


# ============================================================
# EXTRACCIÓN
# ============================================================

def _expandir_ver_mas(card):
    """Hace click en 'ver más' dentro de una publicación."""
    try:
        card.evaluate(
            r"""
            (card) => {
                const candidatos = Array.from(
                    card.querySelectorAll('button, span[role="button"], a, span')
                );

                for (const el of candidatos) {
                    const txt = (el.innerText || el.textContent || '')
                        .trim()
                        .toLowerCase();

                    if (
                        txt === 'ver más' ||
                        txt === '...ver más' ||
                        txt === '…ver más' ||
                        txt === 'más' ||
                        txt === 'see more' ||
                        txt === '...see more' ||
                        txt === '…see more'
                    ) {
                        el.click();
                        return true;
                    }
                }

                return false;
            }
            """
        )

        time.sleep(0.7)

    except Exception:
        pass


def _limpiar_contenido_linkedin(texto: str) -> str:
    """Limpia el contenido textual de LinkedIn."""
    if not texto:
        return ""

    texto = texto.replace("\r", "")
    texto = texto.replace("\n\n", "\n")
    texto = texto.replace("… más", "")
    texto = texto.replace("...ver más", "")
    texto = texto.replace("…ver más", "")
    texto = texto.replace("hashtag\n", "#")
    texto = texto.replace("hashtag ", "#")
    texto = texto.replace("\n#", " #")
    texto = re.sub(r"https?://\S+", "", texto)
    texto = re.sub(r"\s+", " ", texto)
    texto = texto.strip()

    return texto


def _extraer_datos_card(card) -> dict:
    """
    Extrae datos de una publicación visible de LinkedIn.
    Usa los selectores confirmados en consola:
    - div.feed-shared-update-v2
    - div.update-components-text
    - div.feed-shared-inline-show-more-text
    - span.break-words
    """
    _expandir_ver_mas(card)

    datos = card.evaluate(
        r"""
        (card) => {
            function limpiar(txt) {
                return (txt || '')
                    .replace(/\s+/g, ' ')
                    .replace(/\n{2,}/g, '\n')
                    .trim();
            }

            function limpiarMultilinea(txt) {
                return (txt || '')
                    .replace(/\r/g, '')
                    .replace(/\n{3,}/g, '\n\n')
                    .trim();
            }

            function numeroDesdeTexto(texto, patrones) {
                texto = texto || '';

                for (const p of patrones) {
                    const m = texto.match(p);
                    if (m && m[1]) {
                        return m[1].replace(/[,.]/g, '');
                    }
                }

                return "0";
            }

            const textoCard = limpiar(card.innerText || card.textContent || '');

            // ID
            const idPost =
                card.getAttribute('data-urn') ||
                card.getAttribute('data-id') ||
                '';

            // URL
            let urlPost = '';

            const links = Array.from(card.querySelectorAll('a[href]'));

            for (const a of links) {
                const href = a.getAttribute('href') || '';

                if (
                    href.includes('/feed/update/') ||
                    href.includes('activity-') ||
                    href.includes('urn:li:activity') ||
                    href.includes('/posts/')
                ) {
                    urlPost = a.href || href;
                    break;
                }
            }

            // FECHA
            let fechaTexto = '';

            const posiblesFecha = Array.from(
                card.querySelectorAll('span, a, time')
            ).map(el => limpiar(el.innerText || el.textContent || ''));

            const regexFecha = /(\d+\s*(min|minuto|minutos|h|hora|horas|d|día|dia|días|dias|sem|semana|semanas|mes|meses|año|años))\b/i;

            for (const t of posiblesFecha) {
                if (regexFecha.test(t)) {
                    fechaTexto = t;
                    break;
                }
            }

            // CONTENIDO
            let contenido = '';

            const selectoresContenido = [
                'div.update-components-text',
                'div.feed-shared-inline-show-more-text',
                'span.break-words'
            ];

            let candidatosContenido = [];

            for (const sel of selectoresContenido) {
                const els = Array.from(card.querySelectorAll(sel));

                for (const el of els) {
                    const t = limpiarMultilinea(el.innerText || el.textContent || '');

                    if (
                        t.length > 20 &&
                        !/^centro de especialización/i.test(t) &&
                        !/^universidad nacional/i.test(t) &&
                        !/^seguir$/i.test(t) &&
                        !/^siguiendo$/i.test(t) &&
                        !/^recomendar$/i.test(t) &&
                        !/^comentar$/i.test(t) &&
                        !/^compartir$/i.test(t) &&
                        !/^enviar$/i.test(t) &&
                        !/^like$/i.test(t) &&
                        !/^comment$/i.test(t) &&
                        !/^share$/i.test(t) &&
                        !/^send$/i.test(t)
                    ) {
                        candidatosContenido.push(t);
                    }
                }
            }

            candidatosContenido.sort((a, b) => b.length - a.length);

            if (candidatosContenido.length > 0) {
                contenido = candidatosContenido[0];
            }

            contenido = contenido
                .replace(/https?:\/\/\S+/g, '')
                .replace(/\s*\.\.\.\s*ver más\s*/gi, ' ')
                .replace(/\s*…\s*más\s*/gi, ' ')
                .replace(/\s*\.\.\.\s*see more\s*/gi, ' ')
                .replace(/\s*…\s*see more\s*/gi, ' ')
                .trim();

            // ALT IMAGEN
            let altImagen = '';

            const imgs = Array.from(card.querySelectorAll('img'));

            for (const img of imgs) {
                const alt = limpiar(img.alt || '');
                const low = alt.toLowerCase();

                if (
                    alt.length > 20 &&
                    !low.includes('foto de perfil') &&
                    !low.includes('profile picture') &&
                    !low.includes('emoji')
                ) {
                    altImagen = alt;
                    break;
                }
            }

            // MÉTRICAS
            const ariaLabels = Array.from(card.querySelectorAll('[aria-label]'))
                .map(el => el.getAttribute('aria-label') || '')
                .join(' | ');

            const textoMetricas = ariaLabels + ' | ' + textoCard;

            const likes = numeroDesdeTexto(textoMetricas, [
                /([\d,.]+)\s*(reacciones|reacción|reaccion|reaction|reactions)/i,
                /([\d,.]+).*?(reacciones|reacción|reaccion|reaction|reactions)/i
            ]);

            const comentarios = numeroDesdeTexto(textoMetricas, [
                /([\d,.]+)\s*(comentarios|comentario|comments|comment)/i,
                /([\d,.]+).*?(comentarios|comentario|comments|comment)/i
            ]);

            const compartidas = numeroDesdeTexto(textoMetricas, [
                /([\d,.]+)\s*(veces\s+)?(compartido|compartidos|compartida|compartidas)/i,
                /([\d,.]+)\s*(republicaciones|republicación|repost|reposts|shares|share)/i,
                /([\d,.]+).*?(compartido|compartidos|compartida|compartidas|republicaciones|republicación|repost|reposts|shares|share)/i
            ]);

            return {
                idPost: idPost,
                urlPost: urlPost,
                fechaTexto: fechaTexto,
                contenido: contenido,
                altImagen: altImagen,
                likes: likes,
                comentarios: comentarios,
                compartidas: compartidas
            };
        }
        """
    )

    return datos or {}


def _obtener_cards_visibles(page):
    """Obtiene publicaciones reales visibles de LinkedIn."""
    try:
        cards = page.locator("div.feed-shared-update-v2").all()
        cards_validos = []

        for card in cards:
            try:
                txt = card.inner_text(timeout=2000).strip()

                if len(txt) > 50:
                    cards_validos.append(card)

            except Exception:
                pass

        return cards_validos

    except Exception:
        return []


# ============================================================
# SCRAPER PRINCIPAL
# ============================================================

def scraper_stealth_linkedin(url: str, fecha_limite: str) -> pd.DataFrame:
    """
    Scrapea publicaciones de LinkedIn hasta una fecha límite.

    Columnas finales:
    Fecha, Tipo, Nombre, Contenido, Likes, Comentarios, Compartidas
    """
    limite_dt = datetime.strptime(fecha_limite, "%Y-%m-%d")

    datos_extraidos = []
    posts_procesados = set()
    alcanzo_fecha_limite = False

    print(f"💼 Iniciando scraper LinkedIn en: {url}")
    print(f"📅 Capturando publicaciones desde hoy hasta: {fecha_limite}\n")

    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir="./edge_session_data_linkedin",
            headless=False,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-dev-shm-usage"
            ],
            viewport={
                "width": 1366,
                "height": 900
            },
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0"
            )
        )

        page = context.pages[0] if context.pages else context.new_page()

        page.add_init_script(
            """
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });

            Object.defineProperty(navigator, 'languages', {
                get: () => ['es-PE', 'es', 'en-US', 'en']
            });

            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3]
            });
            """
        )

        _ir_a_publicaciones(page, url)

        if not _esperar_publicaciones(page):
            print("⚠️ No se detectaron publicaciones.")
            print("📌 Generando debug para revisar qué cargó LinkedIn...")
            _debug_linkedin(page)
            context.close()
            return pd.DataFrame()

        print("=" * 60)
        print("🚀 Procesando publicaciones de LinkedIn...")
        print("=" * 60)

        rondas_sin_nuevos = 0
        fallos_consecutivos = 0

        MAX_RONDAS_SIN_NUEVOS = 8
        MAX_FALLOS_CONSECUTIVOS = 5

        while not alcanzo_fecha_limite and rondas_sin_nuevos < MAX_RONDAS_SIN_NUEVOS:

            if fallos_consecutivos >= MAX_FALLOS_CONSECUTIVOS:
                print("\n💥 Demasiados fallos consecutivos. Abortando.")
                break

            cards = _obtener_cards_visibles(page)

            if not cards:
                rondas_sin_nuevos += 1

                print(
                    f"   Sin publicaciones visibles. "
                    f"Scroll... ({rondas_sin_nuevos}/{MAX_RONDAS_SIN_NUEVOS})"
                )

                _scroll_linkedin(page)
                continue

            nuevos_en_ronda = 0

            print(f"\n📌 Cards visibles en esta ronda: {len(cards)}")

            for card in cards:

                if alcanzo_fecha_limite:
                    break

                try:
                    datos = _extraer_datos_card(card)

                    if not datos:
                        continue

                    id_post = (
                        datos.get("idPost") or
                        datos.get("urlPost") or
                        datos.get("contenido", "")[:100]
                    )

                    if not id_post:
                        continue

                    if id_post in posts_procesados:
                        continue

                    posts_procesados.add(id_post)
                    nuevos_en_ronda += 1

                    fecha_texto = datos.get("fechaTexto", "")
                    fecha = resolver_fecha_linkedin(fecha_texto)

                    print(f"\n{'─' * 55}")
                    print(f"🔎 Publicación: {id_post}")
                    print(f"   📅 Fecha texto : {fecha_texto}")
                    print(f"   📅 Fecha final : {fecha}")

                    post_dt = _fecha_a_datetime(fecha)

                    if post_dt and post_dt < limite_dt:
                        print(
                            f"   🛑 Publicación anterior a {fecha_limite}. "
                            f"Se alcanzó el límite. Deteniendo scraping."
                        )
                        alcanzo_fecha_limite = True
                        break

                    contenido = (datos.get("contenido") or "").strip()
                    contenido = _limpiar_contenido_linkedin(contenido)

                    alt_imagen = (datos.get("altImagen") or "").strip()

                    likes = _numero(datos.get("likes", "0"))
                    comentarios = _numero(datos.get("comentarios", "0"))
                    compartidas = _numero(datos.get("compartidas", "0"))

                    print(
                        f"   📝 Contenido: "
                        f"{contenido[:120]}{'…' if len(contenido) > 120 else ''}"
                    )

                    print(
                        f"   🖼️ Alt: "
                        f"{alt_imagen[:100]}{'…' if len(alt_imagen) > 100 else ''}"
                    )

                    print(
                        f"   👍 {likes} | 💬 {comentarios} | 🔁 {compartidas}"
                    )

                    if not contenido and not alt_imagen:
                        print("   ⚠️ Sin contenido ni alt. Saltando.")
                        continue

                    print("   🤖 Clasificando con Groq...")

                    clasificacion = clasificar_post(alt_imagen, contenido)

                    tipo = clasificacion.get("tipo", "Otros")
                    nombre = clasificacion.get("titulo", "Sin título")

                    print(f"   🏷️ Tipo: {tipo} | Nombre: {nombre}")

                    datos_extraidos.append(
                        {
                            "Fecha": fecha,
                            "Tipo": tipo,
                            "Nombre": nombre,
                            "Contenido": contenido,
                            "Likes": likes,
                            "Comentarios": comentarios,
                            "Compartidas": compartidas
                        }
                    )

                    fallos_consecutivos = 0

                    print(f"   ✅ GUARDADO Publicación #{len(datos_extraidos):02d}")

                    time.sleep(random.uniform(1.0, 1.8))

                except Exception as e:
                    print(f"   💥 EXCEPCIÓN: {type(e).__name__}: {e}")
                    fallos_consecutivos += 1
                    time.sleep(1.5)

            if alcanzo_fecha_limite:
                break

            if nuevos_en_ronda == 0:
                rondas_sin_nuevos += 1
            else:
                rondas_sin_nuevos = 0

            print("\n📜 Bajando para cargar más publicaciones...")
            _scroll_linkedin(page)

        context.close()

    df = pd.DataFrame(datos_extraidos)

    if not df.empty:
        df = df.drop_duplicates(subset=["Fecha", "Contenido"])
        df = df.sort_values("Fecha", ascending=False).reset_index(drop=True)

        columnas_finales = [
            "Fecha",
            "Tipo",
            "Nombre",
            "Contenido",
            "Likes",
            "Comentarios",
            "Compartidas"
        ]

        df = df[columnas_finales]

    print(f"\n🎉 Scraping LinkedIn terminado. Total publicaciones extraídas: {len(df)}")

    return df