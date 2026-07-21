from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
import pandas as pd
import time
import random
import re
from datetime import datetime
from urllib.parse import urlparse

from utils import resolver_fecha, exportar_csv_instagram
from clasificador import clasificar_post


POST_SELECTOR = 'a[href*="/p/"], a[href*="/reel/"]'


def _numero(texto: str) -> str:
    """Extrae el primer número de un string. '1,234 Me gusta' → '1234'"""
    m = re.search(r"[\d][,.\d]*", texto or "")
    return m.group(0).replace(",", "").replace(".", "") if m else "0"


def normalizar_url_instagram(href: str) -> str:
    """Convierte href relativo o absoluto en URL válida de Instagram."""
    if not href:
        return ""

    if href.startswith("http"):
        return href

    return "https://www.instagram.com" + href


def url_canonica_instagram(href: str) -> str:
    """
    Devuelve una URL limpia y única para deduplicar.
    Elimina query params.
    """
    url = normalizar_url_instagram(href)
    parsed = urlparse(url)
    return f"https://www.instagram.com{parsed.path}"


def path_instagram(href: str) -> str:
    """Devuelve solo el path del post."""
    if not href:
        return ""

    if href.startswith("http"):
        return urlparse(href).path

    return href


def _selector_anchor(href: str) -> str:
    """Selector robusto para encontrar el post en el grid."""
    href_abs = normalizar_url_instagram(href)
    href_path = path_instagram(href)

    return (
        f'a[href="{href}"], '
        f'a[href="{href_abs}"], '
        f'a[href="{href_path}"]'
    )


def _cerrar_popups(page):
    """Cierra popups comunes de Instagram."""
    selectores = [
        '[aria-label="Cerrar"]',
        'button:has-text("Ahora no")',
        'button:has-text("Not Now")',
        'button:has-text("Rechazar")',
        'button:has-text("Reject")'
    ]

    for sel in selectores:
        try:
            page.locator(sel).first.click(timeout=1500)
            time.sleep(0.6)
        except Exception:
            pass


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


def _parsear_fecha(fecha_iso: str, fecha_texto: str) -> str:
    """
    Convierte la fecha del post a formato estándar.
    Prioridad:
    1. time[datetime]
    2. texto visible: Hace 1 día, 1 d, 2 h, etc.
    """
    if fecha_iso:
        try:
            dt_obj = datetime.strptime(fecha_iso[:19], "%Y-%m-%dT%H:%M:%S")
            return dt_obj.strftime("%Y-%m-%d %H:%M:%S")
        except Exception:
            try:
                return resolver_fecha(fecha_iso)
            except Exception:
                pass

    if fecha_texto:
        try:
            return resolver_fecha(fecha_texto)
        except Exception:
            pass

    return "Fecha desconocida"


def _hover_metrics(page, href: str) -> dict:
    """
    Hace hover sobre el thumbnail del post en el grid y captura
    likes y comentarios del overlay.
    """
    likes = "0"
    comentarios = "0"

    try:
        selector = _selector_anchor(href)
        el = page.locator(selector).first

        el.scroll_into_view_if_needed(timeout=8000)
        time.sleep(0.4)
        el.hover(timeout=8000)
        time.sleep(1.1)

        metrics = page.evaluate(
            r"""
            ({href, path}) => {
                const links = Array.from(
                    document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]')
                );

                const a = links.find(x =>
                    x.getAttribute('href') === href ||
                    x.href === href ||
                    x.pathname === path
                );

                if (!a) return null;

                const container = a.closest('div') || a.parentElement;
                if (!container) return null;

                const nums = [];
                const allSpans = Array.from(container.querySelectorAll('span'));

                for (const s of allSpans) {
                    const t = (s.innerText || s.textContent || '').trim();

                    if (/^[\d,.]+$/.test(t) && s.children.length === 0) {
                        nums.push(t.replace(/[,.]/g, ''));
                    }
                }

                return {
                    likes: nums[0] || "0",
                    comentarios: nums[1] || "0"
                };
            }
            """,
            {
                "href": normalizar_url_instagram(href),
                "path": path_instagram(href)
            }
        )

        if metrics:
            likes = metrics.get("likes", "0")
            comentarios = metrics.get("comentarios", "0")

    except Exception as e:
        print(f"   ⚠️ Hover error: {e}")

    return {
        "likes": likes,
        "comentarios": comentarios
    }


def _expandir_ver_mas(page):
    """Hace clic en 'más', 'ver más' o 'more' antes de leer el caption."""
    try:
        page.evaluate(
            r"""
            () => {
                const dialog = document.querySelector('div[role="dialog"]');
                const root = dialog || document.querySelector('main') || document.body;

                const candidatos = Array.from(
                    root.querySelectorAll('[role="button"], button, span, div')
                );

                for (const b of candidatos) {
                    const txt = (b.innerText || b.textContent || '')
                        .trim()
                        .toLowerCase();

                    if (txt === 'más' || txt === 'ver más' || txt === 'more') {
                        b.click();
                        return true;
                    }
                }

                return false;
            }
            """
        )

        time.sleep(0.6)

    except Exception:
        pass


def _extraer_datos_post(page) -> dict:
    """
    Extrae fecha, caption, alt imagen, likes y comentarios
    desde el post abierto.
    """
    _expandir_ver_mas(page)

    datos_js = page.evaluate(
        r"""
        () => {
            const dialog = document.querySelector('div[role="dialog"]');
            const root = dialog || document.querySelector('main') || document.body;

            // FECHA
            const timeEl = root.querySelector('time[datetime]') ||
                           document.querySelector('time[datetime]');

            const fechaISO = timeEl ? timeEl.getAttribute('datetime') : null;
            const fechaTexto = timeEl
                ? (timeEl.innerText || timeEl.textContent || '').trim()
                : '';

            // CAPTION
            let caption = "";

            const h1 = root.querySelector('h1');
            if (h1) {
                caption = (h1.innerText || h1.textContent || "").trim();
            }

            if (caption.length < 10) {
                const spans = Array.from(root.querySelectorAll('span[dir="auto"]'));

                const textos = spans
                    .map(s => (s.innerText || s.textContent || "").trim())
                    .filter(t =>
                        t.length > 20 &&
                        !t.startsWith('http') &&
                        !/^ver traducción$/i.test(t) &&
                        !/^see translation$/i.test(t) &&
                        !/^responder$/i.test(t) &&
                        !/^reply$/i.test(t) &&
                        !/^me gusta$/i.test(t) &&
                        !/^likes$/i.test(t)
                    );

                textos.sort((a, b) => b.length - a.length);

                if (textos.length > 0) {
                    caption = textos[0];
                }
            }

            caption = caption
                .replace(/https?:\/\/\S+/g, '')
                .replace(/\n{2,}/g, '\n')
                .trim();

            // ALT IMAGEN
            let altImagen = "";
            const imgs = Array.from(root.querySelectorAll('img'));

            for (const img of imgs) {
                const alt = (img.alt || "").trim();
                const altLower = alt.toLowerCase();

                if (
                    alt.length > 20 &&
                    !altLower.includes('emoji') &&
                    !altLower.includes('foto de perfil') &&
                    !altLower.includes('profile picture')
                ) {
                    altImagen = alt;
                    break;
                }
            }

            // TEXTO GENERAL DEL POST
            const textoRoot = (root.innerText || root.textContent || '').trim();

            // LIKES
            let likes = "0";

            const matchLikes1 = textoRoot.match(/([\d,.]+)\s*(me gusta|likes?)/i);
            if (matchLikes1) {
                likes = matchLikes1[1].replace(/[,.]/g, '');
            }

            // COMENTARIOS
            let comentarios = "0";

            const matchComentarios1 = textoRoot.match(/ver\s+(los\s+)?([\d,.]+)\s+comentarios?/i);
            const matchComentarios2 = textoRoot.match(/view\s+all\s+([\d,.]+)\s+comments?/i);

            if (matchComentarios1) {
                comentarios = matchComentarios1[2].replace(/[,.]/g, '');
            } else if (matchComentarios2) {
                comentarios = matchComentarios2[1].replace(/[,.]/g, '');
            }

            return {
                fechaISO: fechaISO,
                fechaTexto: fechaTexto,
                contenido: caption,
                altImagen: altImagen,
                likes: likes,
                comentarios: comentarios
            };
        }
        """
    )

    return datos_js or {}


def _abrir_post_desde_grid(page, href: str) -> bool:
    """
    Intenta abrir el post haciendo click desde el grid.
    Retorna True si pudo abrirlo.
    """
    try:
        selector = _selector_anchor(href)
        el = page.locator(selector).first

        el.scroll_into_view_if_needed(timeout=8000)
        time.sleep(0.4)
        el.click(timeout=8000)

        page.wait_for_selector('time[datetime]', timeout=10000)

        return True

    except Exception:
        return False


def _cerrar_post_y_volver_grid(page, url_perfil: str):
    """
    Cierra modal con Escape.
    Si se navegó a otra página, vuelve al perfil.
    """
    try:
        page.keyboard.press("Escape")
        time.sleep(1.0)
    except Exception:
        pass

    perfil_limpio = url_perfil.rstrip("/")

    if perfil_limpio not in page.url.rstrip("/"):
        try:
            page.goto(url_perfil, wait_until="domcontentloaded")
            time.sleep(3)
            _cerrar_popups(page)
        except Exception:
            pass


def _obtener_hrefs_visibles(page, procesados_urls: set) -> list:
    """Obtiene los hrefs visibles del grid que aún no fueron procesados."""
    hrefs_visibles = []

    try:
        anchors = page.locator(POST_SELECTOR).all()

        for a in anchors:
            try:
                h = a.get_attribute("href")

                if not h:
                    continue

                url_post = url_canonica_instagram(h)

                if url_post not in procesados_urls:
                    hrefs_visibles.append(h)

            except Exception:
                pass

    except Exception as e:
        print(f"⚠️ Error leyendo anchors visibles: {e}")

    return hrefs_visibles


def scraper_stealth_instagram(url: str, fecha_limite: str) -> pd.DataFrame:
    """
    Scrapea publicaciones de un perfil de Instagram.

    Flujo correcto:
    1. Lee posts visibles del grid.
    2. Abre cada post.
    3. Lee la fecha real desde el post abierto.
    4. Si el post es anterior a fecha_limite, se detiene.
    5. Si está dentro del rango, extrae contenido, métricas y clasifica.
    6. Hace scroll y repite.
    """
    limite_dt = datetime.strptime(fecha_limite, "%Y-%m-%d")

    datos_extraidos = []
    procesados_urls = set()
    alcanzo_fecha_limite = False

    print(f"📸 Iniciando scraper Instagram en: {url}")
    print(f"📅 Capturando posts desde hoy hasta: {fecha_limite}\n")

    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir="./edge_session_data",
            headless=False,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-dev-shm-usage"
            ],
            viewport={
                "width": 1280,
                "height": 900
            },
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36 Edge/120.0.0.0"
            )
        )

        page = context.pages[0] if context.pages else context.new_page()

        page.add_init_script(
            """
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });

            window.navigator.chrome = { runtime: {} };

            Object.defineProperty(navigator, 'languages', {
                get: () => ['es-PE', 'es', 'en-US', 'en']
            });

            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3]
            });
            """
        )

        page.goto(url, wait_until="domcontentloaded")
        time.sleep(5)

        _cerrar_popups(page)

        print("⏳ Esperando grid de publicaciones...")

        try:
            page.wait_for_selector(POST_SELECTOR, timeout=20000)
            print("✅ Grid cargado.\n")
        except PlaywrightTimeout:
            print("⚠️ Timeout esperando grid. Continuando de todas formas...\n")

        print("=" * 60)
        print("🚀 Procesando post por post según fecha real...")
        print("=" * 60)

        rondas_sin_nuevos = 0
        fallos_consecutivos = 0

        MAX_RONDAS_SIN_NUEVOS = 6
        MAX_FALLOS_CONSECUTIVOS = 5

        while not alcanzo_fecha_limite and rondas_sin_nuevos < MAX_RONDAS_SIN_NUEVOS:

            if fallos_consecutivos >= MAX_FALLOS_CONSECUTIVOS:
                print("\n💥 Demasiados fallos consecutivos. Abortando.")
                break

            hrefs_visibles = _obtener_hrefs_visibles(page, procesados_urls)

            if not hrefs_visibles:
                rondas_sin_nuevos += 1

                print(
                    f"   Sin posts nuevos visibles. "
                    f"Scroll... ({rondas_sin_nuevos}/{MAX_RONDAS_SIN_NUEVOS})"
                )

                page.mouse.wheel(0, random.randint(900, 1300))
                time.sleep(random.uniform(2.5, 4.0))

                continue

            rondas_sin_nuevos = 0

            print(f"\n📌 Posts nuevos visibles en esta ronda: {len(hrefs_visibles)}")

            for href in hrefs_visibles:

                if alcanzo_fecha_limite:
                    break

                url_post = url_canonica_instagram(href)

                if url_post in procesados_urls:
                    continue

                procesados_urls.add(url_post)

                print(f"\n{'─' * 55}")
                print(f"🔎 Abriendo post: {url_post}")

                try:
                    metrics = {
                        "likes": "0",
                        "comentarios": "0"
                    }

                    try:
                        metrics = _hover_metrics(page, href)

                        print(
                            f"   🖱️ Hover → 👍 {metrics['likes']} | "
                            f"💬 {metrics['comentarios']}"
                        )

                    except Exception:
                        pass

                    abierto_desde_grid = _abrir_post_desde_grid(page, href)

                    if not abierto_desde_grid:
                        print("   ↪ No se pudo abrir desde grid. Navegando directo...")

                        page.goto(url_post, wait_until="domcontentloaded")
                        time.sleep(random.uniform(3.0, 4.0))

                        try:
                            page.wait_for_selector('time[datetime]', timeout=10000)
                        except PlaywrightTimeout:
                            print("   ⚠️ No cargó time[datetime]. Saltando post.")

                            fallos_consecutivos += 1

                            _cerrar_post_y_volver_grid(page, url)

                            continue

                    time.sleep(random.uniform(1.5, 2.2))

                    datos_js = _extraer_datos_post(page)

                    if not datos_js:
                        print("   ⚠️ No se pudieron extraer datos JS. Saltando.")

                        fallos_consecutivos += 1

                        _cerrar_post_y_volver_grid(page, url)

                        continue

                    fecha_iso = datos_js.get("fechaISO")
                    fecha_texto = datos_js.get("fechaTexto")

                    fecha = _parsear_fecha(fecha_iso, fecha_texto)

                    print(f"   📅 Fecha ISO   : {fecha_iso}")
                    print(f"   📅 Fecha texto : {fecha_texto}")
                    print(f"   📅 Fecha final : {fecha}")

                    post_dt = _fecha_a_datetime(fecha)

                    if post_dt and post_dt < limite_dt:
                        print(
                            f"   🛑 Post anterior a {fecha_limite}. "
                            f"Se alcanzó el límite. Deteniendo scraping."
                        )

                        alcanzo_fecha_limite = True

                        _cerrar_post_y_volver_grid(page, url)

                        break

                    contenido = (datos_js.get("contenido") or "").strip()
                    contenido = contenido.replace("\n", " | ").replace("\r", "")

                    alt_imagen = (datos_js.get("altImagen") or "").strip()

                    likes_modal = _numero(datos_js.get("likes", "0"))
                    likes = likes_modal if likes_modal != "0" else metrics.get("likes", "0")

                    comentarios_modal = _numero(datos_js.get("comentarios", "0"))
                    comentarios = (
                        comentarios_modal
                        if comentarios_modal != "0"
                        else metrics.get("comentarios", "0")
                    )

                    print(
                        f"   📝 Caption: "
                        f"{contenido[:120]}{'…' if len(contenido) > 120 else ''}"
                    )

                    print(
                        f"   🖼️ Alt: "
                        f"{alt_imagen[:100]}{'…' if len(alt_imagen) > 100 else ''}"
                    )

                    print(f"   👍 {likes} | 💬 {comentarios}")

                    if not contenido and not alt_imagen:
                        print("   ⚠️ Sin contenido ni alt. Saltando.")

                        fallos_consecutivos += 1

                        _cerrar_post_y_volver_grid(page, url)

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
                            "URL": url_post
                        }
                    )

                    fallos_consecutivos = 0

                    print(f"   ✅ GUARDADO Post #{len(datos_extraidos):02d}")

                    _cerrar_post_y_volver_grid(page, url)

                    time.sleep(random.uniform(1.2, 2.2))

                except Exception as e:
                    print(f"   💥 EXCEPCIÓN: {type(e).__name__}: {e}")

                    fallos_consecutivos += 1

                    _cerrar_post_y_volver_grid(page, url)

                    time.sleep(2)

            if not alcanzo_fecha_limite:
                print("\n📜 Bajando para cargar más posts...")

                page.mouse.wheel(0, random.randint(900, 1300))

                time.sleep(random.uniform(2.8, 4.2))

        context.close()

    df = pd.DataFrame(datos_extraidos)

    if not df.empty:
        df = df.drop_duplicates(subset=["URL"])
        df = df.sort_values("Fecha", ascending=False).reset_index(drop=True)

        columnas_finales = [
            "Fecha",
            "Tipo",
            "Nombre",
            "Contenido",
            "Likes",
            "Comentarios"
        ]

        df = df[columnas_finales]

    print(f"\n🎉 Scraping terminado. Total posts extraídos: {len(df)}")

    return df


