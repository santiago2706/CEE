from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
import pandas as pd
import time
import random
from datetime import datetime
from utils import resolver_fecha
from clasificador import clasificar_post

def scraper_stealth_facebook(url, fecha_limite):
    limite_dt = datetime.strptime(fecha_limite, "%Y-%m-%d")
    alcanzo_fecha_limite = False

    print(f"🥷 Iniciando scraper en: {url}")
    datos_extraidos = []
    ids_contenido_vistos = set()
    ultimo_indice_procesado = 0

    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir="./edge_session_data",
            headless=False,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-dev-shm-usage",
            ],
            viewport={'width': 1280, 'height': 900},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edge/120.0.0.0"
        )

        page = context.pages[0] if context.pages else context.new_page()

        page.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            window.navigator.chrome = { runtime: {} };
            Object.defineProperty(navigator, 'languages', { get: () => ['es-PE', 'es', 'en-US', 'en'] });
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
        """)

        page.goto(url)

        try:
            page.locator('div[aria-label="Cerrar"]').click(timeout=4000)
        except:
            pass

        print("⏳ Esperando feed...")
        try:
            page.wait_for_function("""
                () => {
                    const items = document.querySelectorAll('[aria-posinset]');
                    return [...items].some(el => {
                        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
                        let node, count = 0;
                        while (node = walker.nextNode()) {
                            if (node.textContent.trim().length > 5 &&
                                node.textContent.trim() !== 'Facebook') count++;
                        }
                        return count > 3;
                    });
                }
            """, timeout=30000)
            print("✅ Feed cargado.")
        except PlaywrightTimeout:
            print("⚠️ Timeout esperando feed. Continuando...")

        time.sleep(3)
        print(f"👀 Extrayendo publicaciones hasta llegar a la fecha: {fecha_limite}...\n")
        intentos_sin_nuevos = 0

        while not alcanzo_fecha_limite and intentos_sin_nuevos < 10:

            posts = page.locator('[aria-posinset]').all()
            print(f"\n{'='*60}")
            print(f"[RONDA] Posts en DOM: {len(posts)} | Procesados hasta idx: {ultimo_indice_procesado} | Extraídos: {len(datos_extraidos)}")
            print(f"{'='*60}")
            nuevos_en_ronda = 0

            for i in range(ultimo_indice_procesado, len(posts)):
                if alcanzo_fecha_limite:
                    break

                post = posts[i]
                posinset = post.get_attribute('aria-posinset') or str(i)

                print(f"\n{'─'*50}")
                print(f"🔎 PROCESANDO idx={i+1} | posinset={posinset}")

                try:
                    post.scroll_into_view_if_needed()
                    time.sleep(random.uniform(0.8, 1.3))

                    page.mouse.wheel(0, 200)
                    time.sleep(0.3)
                    page.mouse.wheel(0, -200)
                    time.sleep(0.5)

                    estado_pre = post.evaluate("""
                        el => {
                            const inner = el.querySelector('[data-virtualized]');
                            const r = el.getBoundingClientRect();
                            return {
                                virtualizado: inner ? inner.getAttribute('data-virtualized') : 'sin-inner',
                                elementos: el.querySelectorAll('span, div[role="button"]').length,
                                en_viewport: r.top < window.innerHeight && r.bottom > 0,
                                rect_top: Math.round(r.top),
                                rect_bottom: Math.round(r.bottom)
                            }
                        }
                    """)
                    print(f"   PRE  → virtual={estado_pre['virtualizado']} | elems={estado_pre['elementos']} | viewport={estado_pre['en_viewport']} | top={estado_pre['rect_top']} bot={estado_pre['rect_bottom']}")

                    hidratado = False
                    try:
                        page.wait_for_function(
                            """(ps) => {
                                const el = document.querySelector('[aria-posinset="' + ps + '"]');
                                if (!el) return false;
                                const inner = el.querySelector('[data-virtualized]');
                                return inner && inner.getAttribute('data-virtualized') === 'false';
                            }""",
                            arg=posinset,
                            timeout=10000
                        )
                        hidratado = True
                        print(f"   ✅ Hidratado en intento 1")
                    except PlaywrightTimeout:
                        print(f"   ⏱️  Timeout intento 1 — forzando scroll más agresivo...")
                        page.mouse.wheel(0, 500)
                        time.sleep(1.2)
                        page.mouse.wheel(0, -500)
                        time.sleep(1.2)
                        post.scroll_into_view_if_needed()
                        time.sleep(1.0)
                        try:
                            page.wait_for_function(
                                """(ps) => {
                                    const el = document.querySelector('[aria-posinset="' + ps + '"]');
                                    if (!el) return false;
                                    const inner = el.querySelector('[data-virtualized]');
                                    return inner && inner.getAttribute('data-virtualized') === 'false';
                                }""",
                                arg=posinset,
                                timeout=8000
                            )
                            hidratado = True
                            print(f"   ✅ Hidratado en intento 2")
                        except PlaywrightTimeout:
                            print(f"   ❌ NO hidratado tras 2 intentos — BREAK sin avanzar índice")
                            break

                    if not hidratado:
                        break

                    time.sleep(random.uniform(0.5, 1.0))

                    estado_post = post.evaluate("""
                        el => {
                            const inner = el.querySelector('[data-virtualized]');
                            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
                            let nTextos = 0, node;
                            while (node = walker.nextNode())
                                if (node.textContent.trim().length > 5) nTextos++;
                            return {
                                virtualizado: inner ? inner.getAttribute('data-virtualized') : 'sin-inner',
                                elementos: el.querySelectorAll('span, div[role="button"]').length,
                                nodos_texto: nTextos
                            }
                        }
                    """)
                    print(f"   POST → virtual={estado_post['virtualizado']} | elems={estado_post['elementos']} | textos={estado_post['nodos_texto']}")

                    if estado_post['elementos'] < 5:
                        print(f"   ⚠️  Elementos insuficientes ({estado_post['elementos']}) — BREAK")
                        break

                    expandido = post.evaluate("""
                        el => {
                            const botones = Array.from(el.querySelectorAll('[role="button"]'));
                            const verMas = botones.find(b =>
                                b.textContent.trim() === 'Ver más' ||
                                b.textContent.trim() === 'See more'
                            );
                            if (verMas) { verMas.click(); return true; }
                            return false;
                        }
                    """)
                    if expandido:
                        print(f"   📖 'Ver más' expandido")
                        time.sleep(random.uniform(1.5, 2.0))

                    datos_js = post.evaluate("""
                        el => {
                            var padre = el.parentElement;

                            var contenedorTexto = el.querySelector('[data-ad-comet-preview="message"]');
                            var textoRaw = contenedorTexto
                                ? (contenedorTexto.innerText || contenedorTexto.textContent || "")
                                : "";
                            var contenido = textoRaw
                                .replace(/Ver menos$/i, '')
                                .replace(/Ver más$/i, '')
                                .replace(/See more$/i, '')
                                .replace(/https?:\\/\\/\\S+/g, '')
                                .replace(/\\n{2,}/g, '\\n')
                                .trim();

                            // ALT DE IMAGEN PRINCIPAL
                            var altImagen = "";
                            var imagenes = Array.from(padre.querySelectorAll('img'));
                            for (var im = 0; im < imagenes.length; im++) {
                                var alt = imagenes[im].alt || "";
                                if (alt.length > 30 && alt.toLowerCase().indexOf('emoji') === -1) {
                                    altImagen = alt;
                                    break;
                                }
                            }

                            var fecha = null;
                            var patronFecha = /^(Justo ahora|\\d+\\s*(min|h|d|semana|mes)|Ayer|Lunes|Martes|Miercoles|Jueves|Viernes|Sabado|Domingo|\\d{1,2}\\s*de\\s*[A-Za-z]+)/i;
                            var enlaces = Array.from(padre.querySelectorAll('a[role="link"], a[tabindex="0"]'));
                            for (var j = 0; j < enlaces.length; j++) {
                                var txtEnlace = (enlaces[j].innerText || enlaces[j].textContent || "").trim();
                                if (txtEnlace && patronFecha.test(txtEnlace)) { fecha = txtEnlace; break; }
                            }
                            if (!fecha) {
                                var spansF = Array.from(padre.querySelectorAll('span[dir="auto"]'));
                                for (var k = 0; k < spansF.length; k++) {
                                    var txtSpan = (spansF[k].innerText || spansF[k].textContent || "").trim();
                                    if (txtSpan && patronFecha.test(txtSpan) && txtSpan.length < 35) { fecha = txtSpan; break; }
                                }
                            }
                            if (!fecha) {
                                var labelsF = Array.from(padre.querySelectorAll('[aria-labelledby]'));
                                for (var i2 = 0; i2 < labelsF.length; i2++) {
                                    var bsHoja = Array.from(labelsF[i2].querySelectorAll('b')).filter(function(b) {
                                        return b.querySelectorAll('b').length === 0
                                            && window.getComputedStyle(b).display !== 'none';
                                    });
                                    if (bsHoja.length === 0) continue;
                                    var txt = bsHoja.map(function(b) { return b.textContent; }).join('').trim();
                                    if (txt && txt !== 'Learn More') { fecha = txt; break; }
                                }
                            }

                            var likes = "0";
                            var elLikes = padre.querySelector('[aria-label^="Me gusta:"]');
                            if (elLikes) {
                                var mL = (elLikes.getAttribute('aria-label') || '').match(/:\\s*([\\d][\\d.,]*)/);
                                if (mL) likes = mL[1];
                            }
                            if (likes === "0") {
                                var btnLike = padre.querySelector('[aria-label="Me gusta"]');
                                if (btnLike) {
                                    var spanL = Array.from(btnLike.querySelectorAll('span')).find(function(s) {
                                        return /^\\d+$/.test(s.textContent.trim()) && s.children.length === 0;
                                    });
                                    if (spanL) likes = spanL.textContent.trim();
                                }
                            }

                            var compartidas = "0";
                            var elComp = padre.querySelector('[aria-label="Envía esto a tus amigos o publícalo en tu perfil."]');
                            if (elComp) {
                                var txtComp = elComp.textContent.trim();
                                if (/^\\d/.test(txtComp)) compartidas = txtComp;
                            }

                            var comentarios = "0";
                            var todosSpans = Array.from(padre.querySelectorAll('span'));
                            for (var s2 = 0; s2 < todosSpans.length; s2++) {
                                var txtS = (todosSpans[s2].textContent || '').trim().toLowerCase();
                                if (/^\\d[\\d.,]*\\s*(comentario|comment)/.test(txtS) && todosSpans[s2].children.length === 0) {
                                    var mC = txtS.match(/^([\\d][\\d.,]*)/);
                                    if (mC) { comentarios = mC[1]; break; }
                                }
                            }
                            if (comentarios === "0") {
                                var btnCom = padre.querySelector('[aria-label="Dejar un comentario"]');
                                if (btnCom) {
                                    var spansCom = Array.from(btnCom.parentElement.querySelectorAll('span'));
                                    for (var sc = 0; sc < spansCom.length; sc++) {
                                        var tsc = spansCom[sc].textContent.trim();
                                        if (/^\\d+$/.test(tsc) && spansCom[sc].children.length === 0) {
                                            comentarios = tsc; break;
                                        }
                                    }
                                }
                            }

                            return {
                                contenido: contenido,
                                altImagen: altImagen,
                                fecha: fecha,
                                likes: likes,
                                comentarios: comentarios,
                                compartidas: compartidas
                            };
                        }
                    """)

                    contenido    = datos_js.get('contenido', '').strip()
                    contenido    = contenido.replace('\n', ' | ').replace('\r', '')
                    alt_imagen   = datos_js.get('altImagen', '')
                    fecha_raw    = datos_js.get('fecha') or "Fecha desconocida"
                    fecha        = resolver_fecha(fecha_raw)
                    likes        = datos_js.get('likes', "0")
                    comentarios  = datos_js.get('comentarios', "0")
                    compartidas  = datos_js.get('compartidas', "0")

                    print(f"   Contenido extraído: {len(contenido)} caracteres")
                    print(f"   Preview: {contenido[:120]}")
                    print(f"   Métricas → 👍{likes} 💬{comentarios} 🔁{compartidas} | Fecha raw: {fecha_raw}")

                    # VALIDAR FECHA LÍMITE
                    if "desconocida" not in fecha:
                        try:
                            post_dt = datetime.strptime(fecha, "%Y-%m-%d %H:%M:%S")
                            if post_dt < limite_dt:
                                print(f"   🛑 Se alcanzó la fecha límite ({fecha_limite}). Terminando scraper.")
                                alcanzo_fecha_limite = True
                                break
                        except ValueError:
                            pass

                    if not contenido:
                        print(f"   ⚠️ Contenido vacío — CONTINUE")
                        ultimo_indice_procesado = i + 1
                        continue

                    id_post = hash(contenido)
                    if id_post in ids_contenido_vistos:
                        print(f"   🔁 DUPLICADO detectado — CONTINUE (avanza índice a {i+2})")
                        ultimo_indice_procesado = i + 1
                        continue
                    ids_contenido_vistos.add(id_post)

                    # CLASIFICAR CON GEMINI
                    print(f"   🤖 Clasificando con Groq...")
                    clasificacion = clasificar_post(alt_imagen, contenido)
                    tipo   = clasificacion.get('tipo', 'Otros')
                    nombre = clasificacion.get('titulo', 'Sin título')
                    print(f"   🏷️  Tipo: {tipo} | Nombre: {nombre}")

                    datos_extraidos.append({
                        "Fecha"       : fecha,
                        "Tipo"        : tipo,
                        "Nombre"      : nombre,
                        "Contenido"   : contenido,
                        "Likes"       : likes,
                        "Comentarios" : comentarios,
                        "Compartidas" : compartidas
                    })

                    ultimo_indice_procesado = i + 1
                    nuevos_en_ronda += 1

                    print(f"\n   ✅ GUARDADO Post #{len(datos_extraidos):02d} [posinset={posinset}]")
                    print(f"   📅 {fecha}")

                except Exception as e:
                    print(f"   💥 EXCEPCIÓN en posinset={posinset}: {type(e).__name__}: {e}")
                    print(f"   → BREAK sin avanzar índice (se reintentará)")
                    break

            if nuevos_en_ronda == 0:
                intentos_sin_nuevos += 1
                print(f"\n   ⚠️  Sin nuevos posts esta ronda ({intentos_sin_nuevos}/10)")
            else:
                intentos_sin_nuevos = 0

            if not alcanzo_fecha_limite:
                scroll_px = random.randint(600, 1000)
                page.mouse.wheel(0, scroll_px)
                t = random.uniform(2.5, 4.5)
                print(f"   📜 Scroll {scroll_px}px | Esperando {t:.1f}s...")
                time.sleep(t)

        context.close()

        df = pd.DataFrame(datos_extraidos)
        if not df.empty:
            df = df.drop_duplicates(subset=['Contenido'])
        return df