"""
clasificador.py — Clasificador CEE-FIIS
Estrategia:
  - TIPO  : regex sobre texto del post (limpio y confiable)
  - TÍTULO: Groq siempre (el alt tiene ruido OCR, el texto es más limpio)
  - Efemérides se detectan ANTES que cursos para evitar falsos positivos
"""

import os
import re
import json
import logging
from pathlib import Path
from groq import Groq
from dotenv import load_dotenv

# ─── Config ───────────────────────────────────────────────────────────────────

load_dotenv(dotenv_path=Path(__file__).parent / ".env")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise EnvironmentError(
        "No se encontró GROQ_API_KEY en .env\n"
        "Crea el archivo .env con: GROQ_API_KEY=gsk_..."
    )

GROQ_MODEL = "llama-3.3-70b-versatile"
MAX_TOKENS  = 120

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

_client = Groq(api_key=GROQ_API_KEY)

# ─── Prompts ──────────────────────────────────────────────────────────────────

PROMPT_TITULO_CURSO = """Eres un extractor de nombres de cursos del CEE-FIIS (UNI).

Se te dará el texto de un post de Facebook que anuncia un curso, diplomado, taller o capacitación.
Tu tarea: extraer el nombre oficial y limpio del curso.

Reglas:
- Elimina palabras genéricas del inicio: "Curso de", "Curso Especializado en", "Especialización en", etc. NO las elimines si son parte del nombre oficial.
- Si el nombre tiene siglas conocidas (SSOMA, IA, UNI), consérvales.
- Sin fechas, sin emojis, sin hashtags, sin precios.
- Máximo 80 caracteres.
- Responde SOLO con el nombre, sin comillas, sin puntos al final.

Ejemplo correcto: Gestión de Seguridad, Salud Ocupacional y Medio Ambiente (SSOMA)
Ejemplo correcto: IA Aplicada a la Gestión Estratégica de Costos
Ejemplo correcto: Gestión por Procesos y Sistemas Integrados de Gestión de la Calidad"""

PROMPT_TITULO_OTROS = """Eres un clasificador de posts del CEE-FIIS (UNI).

Se te dará el texto de un post institucional (no es un curso).
Tu tarea: dar una descripción corta de qué trata en 3-5 palabras.

Reglas:
- Sin emojis, sin hashtags.
- Máximo 50 caracteres.
- Responde SOLO con la descripción, sin comillas, sin puntos al final.

Ejemplos: Día del Ingeniero, Convocatoria docente, Bienvenida nuevos alumnos"""

# ─── Detección de tipo por regex (sobre texto del post) ───────────────────────

# Palabras que indican efeméride/contenido institucional — tienen PRIORIDAD
_EFEMERIDE = re.compile(
    r'(?:feliz\s+(?:día|dia)\s+del?|'
    r'celebramos\s+(?:el\s+)?(?:día|dia)\s+del?|'
    r'hoy\s+(?:es\s+)?el\s+(?:día|dia)\s+del?|'
    r'saludamos\s+a\s+(?:todos\s+los)?|'
    r'felicitamos\s+a\s+(?:todos\s+los)?)',
    re.IGNORECASE
)

# Palabras que indican curso/capacitación
_CURSO = re.compile(
    r'(?:curso|diplomado|programa|especialización|especialización|'
    r'taller|capacitación|certificación|bootcamp|seminario|'
    r'especialízate\s+en|fórmate\s+en|certifícate\s+en|capacítate\s+en|'
    r'inscripciones\s+abiertas|vacantes\s+limitadas|inicio\s*:|'
    r'modalidad\s+virtual|certificación\s+(?:respaldada|a\s+nombre)|'
    r'fortalece\s+tus\s+(?:conocimientos|competencias))',
    re.IGNORECASE
)

def _detectar_tipo(texto: str) -> str:
    """
    Determina el tipo basándose en el texto del post.
    Efemérides tienen prioridad sobre cursos.
    """
    # 1. Efeméride primero
    if _EFEMERIDE.search(texto):
        return "Otros"

    # 2. Curso
    if _CURSO.search(texto):
        return "Curso"

    # 3. Indefinido → Groq decidirá
    return "indefinido"

# ─── Groq: extrae título limpio ───────────────────────────────────────────────

def _groq_titulo(texto: str, tipo: str) -> tuple[str, str]:
    """
    Llama a Groq para obtener título limpio y (si tipo=="indefinido") también el tipo.
    Retorna (tipo_final, titulo).
    """
    if tipo == "indefinido":
        # Groq decide tipo Y título
        system = """Eres un clasificador de posts del CEE-FIIS (UNI).

Responde ÚNICAMENTE con JSON válido, sin texto extra, sin markdown.

Clasifica el post:
- "Curso": anuncia o promociona un curso, diplomado, taller o capacitación con nombre propio.
- "Otros": cualquier otro contenido institucional.

Para "titulo":
- Si es Curso: nombre limpio del curso (sin "Curso de", sin fechas, sin emojis, máx 80 chars).
- Si es Otros: descripción corta en 3-5 palabras (máx 50 chars).

Formato exacto:
{"tipo": "Curso", "titulo": "nombre aquí"}"""
        user = texto[:1500]
        try:
            resp = _client.chat.completions.create(
                model=GROQ_MODEL, max_tokens=MAX_TOKENS, temperature=0.0,
                messages=[{"role": "system", "content": system},
                          {"role": "user",   "content": user}]
            )
            raw = resp.choices[0].message.content.strip()
            data = _parse_json(raw)
            return data.get("tipo", "Otros"), data.get("titulo", "Sin título").strip()
        except Exception as e:
            logger.error(f"Groq error (indefinido): {e}")
            return "Otros", "Contenido institucional"

    else:
        # Tipo ya conocido, solo necesitamos el título limpio
        system = PROMPT_TITULO_CURSO if tipo == "Curso" else PROMPT_TITULO_OTROS
        # Usar texto del post (más limpio que el alt)
        user = texto[:1500]
        try:
            resp = _client.chat.completions.create(
                model=GROQ_MODEL, max_tokens=MAX_TOKENS, temperature=0.0,
                messages=[{"role": "system", "content": system},
                          {"role": "user",   "content": user}]
            )
            titulo = resp.choices[0].message.content.strip()
            # Limpiar por si acaso mete comillas o puntos finales
            titulo = titulo.strip('"\'').rstrip('.')
            return tipo, titulo
        except Exception as e:
            logger.error(f"Groq error (título): {e}")
            return tipo, "Sin título"

# ─── Helpers JSON ─────────────────────────────────────────────────────────────

def _parse_json(raw: str) -> dict:
    raw = re.sub(r"```(?:json)?", "", raw).strip().rstrip("`").strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass
    m = re.search(r'\{[^{}]+\}', raw)
    if m:
        try:
            return json.loads(m.group())
        except json.JSONDecodeError:
            pass
    return {}

# ─── Función pública ──────────────────────────────────────────────────────────

def clasificar_post(alt_imagen: str = "", texto_post: str = "") -> dict:
    """
    Clasifica un post del CEE-FIIS.
    - Tipo:   regex sobre texto (efemérides primero, luego cursos)
    - Título: Groq sobre texto (ignora alt con ruido OCR)

    Returns: {"tipo": "Curso"|"Otros"|"Error", "titulo": str, "metodo": str}
    """
    texto = (texto_post or "").strip()
    alt   = (alt_imagen  or "").strip()

    if not texto and not alt:
        return {"tipo": "Otros", "titulo": "Post sin contenido", "metodo": "regex"}

    # Usar texto para todo; si texto vacío, usar alt como fallback
    fuente = texto if texto else alt

    # 1. Detectar tipo por regex
    tipo = _detectar_tipo(fuente)
    logger.info(f"[REGEX] tipo detectado: {tipo}")

    # 2. Groq para título (y tipo si indefinido)
    tipo_final, titulo = _groq_titulo(fuente, tipo)
    logger.info(f"[GROQ] tipo={tipo_final} | título={titulo}")

    metodo = "regex+groq" if tipo != "indefinido" else "groq"
    return {"tipo": tipo_final, "titulo": titulo, "metodo": metodo}

# ─── Tests con datos reales del CSV ───────────────────────────────────────────

if __name__ == "__main__":
    casos = [
        {
            "desc": "Efeméride — Día del Ingeniero (falso positivo antes)",
            "alt":  "ESPECIALIZACIÓN EJECUTIVA 8 DE JUNIO FELIZ DÍA DEL INGENIERO Hoy celebramos tu pasión",
            "txt":  "Detrás de cada gran obra, avance tecnológico y solución innovadora, existe un ingeniero comprometido con transformar el mundo. Hoy reconocemos la pasión, dedicación y esfuerzo de quienes construyen el presente. ¡Feliz Día del Ingeniero!",
        },
        {
            "desc": "Curso IA Costos — alt con ruido OCR",
            "alt":  "CURSO DE ESPECIALIZACIÓN EN I APLICADA EN LA GESTIÓN DE COSTOS 20 junio 2026",
            "txt":  "La Inteligencia Artificial ya está transformando la forma en que las empresas gestionan sus costos. Prepárate para dominar herramientas de IA aplicadas directamente a la gestión empresarial. Certificación respaldada por la Universidad Nacional de Ingeniería. Inicio: Sábado 20 de junio de 2026.",
        },
        {
            "desc": "Curso SSOMA — alt con basura árabe",
            "alt":  "ESPECIALIZACIÓN EJECUTIVA بر Curso especializado en SSOMA",
            "txt":  "La prevención, el control de riesgos y el cumplimiento de estándares de seguridad son aspectos cada vez más valorados. Fortalece tus conocimientos con el Curso Especializado en Gestión de Seguridad, Salud Ocupacional y Medio Ambiente SSOMA. Certificación UNI. Inicio: 20 de junio.",
        },
        {
            "desc": "Curso Procesos — alt con texto OCR largo",
            "alt":  "CURSO ESPECIALIZADO EN PLANIFICAR HACER VERFICAR ACTUAR lall GESTIÓN POR PROCESOS BHTyATиR PROCinO",
            "txt":  "Fortalece tus conocimientos con el Curso Especializado en Gestión por Procesos y Sistemas Integrados de Gestión de la Calidad. Certificación UNI. Inicio: 21 de junio. Domingos de 8:00 am – 1:00 pm.",
        },
        {
            "desc": "Post ambiguo — solo texto institucional",
            "alt":  "Imagen institucional CEE-FIIS",
            "txt":  "¡Grandes noticias para nuestra comunidad! Próximamente más información.",
        },
    ]

    print("=" * 65)
    print(f"  Clasificador CEE-FIIS — Regex + Groq ({GROQ_MODEL})")
    print("=" * 65)

    ok = 0
    esperados = ["Otros", "Curso", "Curso", "Curso", "Otros"]

    for i, (c, esp) in enumerate(zip(casos, esperados), 1):
        r = clasificar_post(c["alt"], c["txt"])
        check = "✅" if r["tipo"] == esp else "❌"
        if r["tipo"] == esp:
            ok += 1
        print(f"\nCaso {i} {check}: {c['desc']}")
        print(f"  → Tipo:   {r['tipo']}  (esperado: {esp})")
        print(f"  → Título: {r['titulo']}")
        print(f"  → Método: {r['metodo']}")

    print(f"\n{'='*65}")
    print(f"  Resultado: {ok}/{len(casos)} correctos")
    print("=" * 65)