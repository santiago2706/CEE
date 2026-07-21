import re
from datetime import datetime, timedelta

def resolver_fecha(fecha_raw):
    """Limpia y calcula la fecha exacta de una publicación de Facebook."""
    if not fecha_raw or fecha_raw == "Fecha desconocida":
        return "Fecha desconocida"

    ahora = datetime.now()
    txt = fecha_raw.strip().lower()

    # Minutos: "5 min"
    m = re.match(r'(\d+)\s*min', txt)
    if m:
        return (ahora - timedelta(minutes=int(m.group(1)))).strftime("%Y-%m-%d %H:%M:%S")

    # Horas: "4 h"
    m = re.match(r'(\d+)\s*h\b', txt)
    if m:
        return (ahora - timedelta(hours=int(m.group(1)))).strftime("%Y-%m-%d %H:%M:%S")

    # Hoy
    if txt.startswith('hoy'):
        m = re.search(r'(\d+):(\d+)', txt)
        if m:
            return ahora.strftime("%Y-%m-%d") + f" {m.group(1)}:{m.group(2)}:00"
        return ahora.strftime("%Y-%m-%d")

    # Ayer
    if txt.startswith('ayer'):
        ayer = ahora - timedelta(days=1)
        m = re.search(r'(\d+):(\d+)', txt)
        if m:
            return ayer.strftime("%Y-%m-%d") + f" {m.group(1)}:{m.group(2)}:00"
        return ayer.strftime("%Y-%m-%d")

    # Fecha exacta: "4 de junio a las 6:00 p. m."
    meses = {
        'enero':1,'febrero':2,'marzo':3,'abril':4,'mayo':5,'junio':6,
        'julio':7,'agosto':8,'septiembre':9,'octubre':10,'noviembre':11,'diciembre':12
    }
    m = re.match(r'(\d+)\s+de\s+(\w+)(?:.*?(\d+):(\d+))?', txt)
    if m:
        dia = int(m.group(1))
        mes = meses.get(m.group(2), 0)
        anio = ahora.year
        if mes:
            fecha_base = f"{anio}-{mes:02d}-{dia:02d}"
            if m.group(3) and m.group(4):
                return fecha_base + f" {m.group(3)}:{m.group(4)}:00"
            return fecha_base

    # Días: "3 d"
    m = re.match(r'(\d+)\s*d\b', txt)
    if m:
        return (ahora - timedelta(days=int(m.group(1)))).strftime("%Y-%m-%d")

    # Semanas: "2 semanas"
    m = re.match(r'(\d+)\s*semana', txt)
    if m:
        return (ahora - timedelta(weeks=int(m.group(1)))).strftime("%Y-%m-%d")

    # Meses relativos: "2 meses"
    m = re.match(r'(\d+)\s*mes', txt)
    if m:
        return (ahora - timedelta(days=int(m.group(1))*30)).strftime("%Y-%m-%d")

    return fecha_raw


import re
from datetime import datetime, timedelta
import pandas as pd


def _normalizar_hora(hora: int, minuto: int, periodo: str | None = None):
    """
    Convierte hora con a. m. / p. m. a formato 24 horas.
    """
    if not periodo:
        return hora, minuto

    periodo = periodo.lower().replace(" ", "").replace(".", "")

    if periodo in ["pm", "pｍ", "p"] and hora < 12:
        hora += 12

    if periodo in ["am", "aｍ", "a"] and hora == 12:
        hora = 0

    return hora, minuto


def resolver_fecha(fecha_raw, ahora=None):
    """
    Convierte fechas relativas o textos de Instagram/Facebook a formato:
    YYYY-MM-DD HH:MM:SS

    Soporta ejemplos:
    - "1 d"
    - "Hace 1 día"
    - "3 h"
    - "5 min"
    - "Hoy a las 6:00 p. m."
    - "Ayer a las 9:30 a. m."
    - "4 de junio a las 6:00 p. m."
    - "2026-06-12T23:00:24.000Z"
    """
    if not fecha_raw or str(fecha_raw).strip().lower() in ["fecha desconocida", "none", "null"]:
        return "Fecha desconocida"

    if ahora is None:
        ahora = datetime.now()

    txt = str(fecha_raw).strip().lower()

    txt = txt.replace("hace", "").strip()
    txt = txt.replace("aproximadamente", "").strip()
    txt = txt.replace("·", " ").strip()

    # ISO: 2026-06-12T23:00:24.000Z
    if re.match(r"\d{4}-\d{2}-\d{2}t\d{2}:\d{2}:\d{2}", txt):
        try:
            dt = datetime.strptime(txt[:19], "%Y-%m-%dT%H:%M:%S")
            return dt.strftime("%Y-%m-%d %H:%M:%S")
        except Exception:
            pass

    # Minutos: "5 min", "5 minutos"
    m = re.match(r"(\d+)\s*(min|minuto|minutos)\b", txt)
    if m:
        return (ahora - timedelta(minutes=int(m.group(1)))).strftime("%Y-%m-%d %H:%M:%S")

    # Horas: "4 h", "4 horas"
    m = re.match(r"(\d+)\s*(h|hora|horas)\b", txt)
    if m:
        return (ahora - timedelta(hours=int(m.group(1)))).strftime("%Y-%m-%d %H:%M:%S")

    # Días: "3 d", "1 día", "2 dias"
    m = re.match(r"(\d+)\s*(d|día|dia|días|dias)\b", txt)
    if m:
        return (ahora - timedelta(days=int(m.group(1)))).strftime("%Y-%m-%d %H:%M:%S")

    # Semanas: "2 semanas", "1 sem"
    m = re.match(r"(\d+)\s*(sem|semana|semanas)\b", txt)
    if m:
        return (ahora - timedelta(weeks=int(m.group(1)))).strftime("%Y-%m-%d %H:%M:%S")

    # Meses relativos: "2 meses", "1 mes"
    m = re.match(r"(\d+)\s*(mes|meses)\b", txt)
    if m:
        return (ahora - timedelta(days=int(m.group(1)) * 30)).strftime("%Y-%m-%d %H:%M:%S")

    # Hoy
    if txt.startswith("hoy"):
        m = re.search(r"(\d{1,2}):(\d{2})\s*(a\.?\s*m\.?|p\.?\s*m\.?|am|pm)?", txt)
        if m:
            hora = int(m.group(1))
            minuto = int(m.group(2))
            periodo = m.group(3)

            hora, minuto = _normalizar_hora(hora, minuto, periodo)

            return ahora.replace(
                hour=hora,
                minute=minuto,
                second=0,
                microsecond=0
            ).strftime("%Y-%m-%d %H:%M:%S")

        return ahora.replace(
            hour=0,
            minute=0,
            second=0,
            microsecond=0
        ).strftime("%Y-%m-%d %H:%M:%S")

    # Ayer
    if txt.startswith("ayer"):
        ayer = ahora - timedelta(days=1)

        m = re.search(r"(\d{1,2}):(\d{2})\s*(a\.?\s*m\.?|p\.?\s*m\.?|am|pm)?", txt)
        if m:
            hora = int(m.group(1))
            minuto = int(m.group(2))
            periodo = m.group(3)

            hora, minuto = _normalizar_hora(hora, minuto, periodo)

            return ayer.replace(
                hour=hora,
                minute=minuto,
                second=0,
                microsecond=0
            ).strftime("%Y-%m-%d %H:%M:%S")

        return ayer.replace(
            hour=0,
            minute=0,
            second=0,
            microsecond=0
        ).strftime("%Y-%m-%d %H:%M:%S")

    # Fecha exacta: "4 de junio a las 6:00 p. m."
    meses = {
        "enero": 1,
        "febrero": 2,
        "marzo": 3,
        "abril": 4,
        "mayo": 5,
        "junio": 6,
        "julio": 7,
        "agosto": 8,
        "septiembre": 9,
        "setiembre": 9,
        "octubre": 10,
        "noviembre": 11,
        "diciembre": 12
    }

    m = re.search(
        r"(\d{1,2})\s+de\s+(\w+)(?:\s+de\s+(\d{4}))?.*?(?:(\d{1,2}):(\d{2})\s*(a\.?\s*m\.?|p\.?\s*m\.?|am|pm)?)?",
        txt
    )

    if m:
        dia = int(m.group(1))
        mes_txt = m.group(2)
        anio = int(m.group(3)) if m.group(3) else ahora.year

        mes = meses.get(mes_txt)

        if mes:
            hora = 0
            minuto = 0

            if m.group(4) and m.group(5):
                hora = int(m.group(4))
                minuto = int(m.group(5))
                periodo = m.group(6)
                hora, minuto = _normalizar_hora(hora, minuto, periodo)

            try:
                fecha = datetime(anio, mes, dia, hora, minuto, 0)
                return fecha.strftime("%Y-%m-%d %H:%M:%S")
            except Exception:
                pass

    return str(fecha_raw)


def exportar_csv_instagram(df: pd.DataFrame, archivo="resultados_instagram.csv"):
    """
    Exporta solo las columnas que te importan:
    Fecha, Tipo, Nombre, Contenido, Likes, Comentarios.
    """
    columnas_finales = [
        "Fecha",
        "Tipo",
        "Nombre",
        "Contenido",
        "Likes",
        "Comentarios"
    ]

    df_final = df.copy()

    for col in columnas_finales:
        if col not in df_final.columns:
            df_final[col] = ""

    df_final = df_final[columnas_finales]

    df_final.to_csv(
        archivo,
        index=False,
        encoding="utf-8-sig"
    )

    return archivo