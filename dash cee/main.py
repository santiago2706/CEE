import os
import time
import pandas as pd
import gspread
from pathlib import Path
from dotenv import load_dotenv
from google.oauth2.service_account import Credentials

from scraper import scraper_stealth_facebook
from scraper_ig import scraper_stealth_instagram
from scraper_linkedin import scraper_stealth_linkedin

load_dotenv(dotenv_path=Path(__file__).parent / ".env")


# ============================================================
# CONFIGURACIÓN GOOGLE SHEETS
# ============================================================
# Estos valores se leen del archivo .env 
# Así, para usar otra cuenta de Google / otra hoja de cálculo,
# solo hay que editar .env, sin tocar este código.

SHEET_ID = os.getenv("SHEET_ID")
GOOGLE_CREDENTIALS = os.getenv("GOOGLE_CREDENTIALS_PATH", "google_credentials.json")

if not SHEET_ID:
    raise ValueError(
        "Falta SHEET_ID en el archivo .env. "
        "Copia .env.example a .env y completa tus propios valores."
    )

if not os.path.exists(GOOGLE_CREDENTIALS):
    raise FileNotFoundError(
        f"No se encontró el archivo de credenciales de Google: '{GOOGLE_CREDENTIALS}'. "
        "Revisa GOOGLE_CREDENTIALS_PATH en tu .env."
    )

SHEET_URL = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit"
LOOKER_URL = os.getenv("LOOKER_URL", "")


# ============================================================
# COLUMNAS POR RED SOCIAL
# ============================================================

COLUMNAS_FACEBOOK = [
    "Fecha",
    "Tipo",
    "Nombre",
    "Contenido",
    "Likes",
    "Comentarios",
    "Compartidas"
]

COLUMNAS_INSTAGRAM = [
    "Fecha",
    "Tipo",
    "Nombre",
    "Contenido",
    "Likes",
    "Comentarios"
]

COLUMNAS_LINKEDIN = [
    "Fecha",
    "Tipo",
    "Nombre",
    "Contenido",
    "Likes",
    "Comentarios",
    "Compartidas"
]


# ============================================================
# CONFIGURACIÓN DE SCRAPERS
# ============================================================

CONFIG = {
    "facebook": {
        "nombre_hoja": "Facebook",
        "url": "https://www.facebook.com/centro.especializacion.ejecutiva.fiis",
        "fecha_limite": "2026-07-04",
        "archivo_csv": "dataset_fb_fiis.csv",
        "columnas": COLUMNAS_FACEBOOK
    },
    "instagram": {
        "nombre_hoja": "Instagram",
        "url": "https://www.instagram.com/cee_fiis_uni/",
        "fecha_limite": "2026-07-04",
        "archivo_csv": "resultados_instagram.csv",
        "columnas": COLUMNAS_INSTAGRAM
    },
    "linkedin": {
        "nombre_hoja": "LinkedIn",
        "url": "https://www.linkedin.com/in/centro-especializacion-ejecutiva-fiis/",
        "fecha_limite": "2026-07-04",
        "archivo_csv": "resultados_linkedin.csv",
        "columnas": COLUMNAS_LINKEDIN
    }
}


# ============================================================
# GOOGLE SHEETS
# ============================================================

def conectar_google_sheets():
    scopes = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive"
    ]

    creds = Credentials.from_service_account_file(
        GOOGLE_CREDENTIALS,
        scopes=scopes
    )

    cliente = gspread.authorize(creds)
    sheet = cliente.open_by_key(SHEET_ID)

    return sheet


def obtener_o_crear_hoja(sheet, nombre_hoja: str):
    """
    Busca una hoja por nombre.
    Si no existe, la crea.
    """
    try:
        return sheet.worksheet(nombre_hoja)
    except gspread.WorksheetNotFound:
        print(f"➕ Creando hoja: {nombre_hoja}")
        return sheet.add_worksheet(
            title=nombre_hoja,
            rows=1000,
            cols=20
        )


def preparar_hojas_base(sheet):
    """
    Asegura que existan las 3 hojas:
    Facebook, Instagram y LinkedIn.

    Si solo existe 'Hoja 1', la renombra a 'Facebook'.
    """
    nombres_objetivo = ["Facebook", "Instagram", "LinkedIn"]

    hojas = sheet.worksheets()
    titulos = [h.title for h in hojas]

    # Si existe solo Hoja 1, la usamos como Facebook
    if "Hoja 1" in titulos and "Facebook" not in titulos:
        hoja1 = sheet.worksheet("Hoja 1")
        hoja1.update_title("Facebook")
        print("✏️ Hoja 1 renombrada a Facebook")

    # Crear las hojas faltantes
    for nombre in nombres_objetivo:
        obtener_o_crear_hoja(sheet, nombre)

    # Eliminar Hoja 1 si todavía existe como hoja sobrante
    hojas = sheet.worksheets()
    titulos = [h.title for h in hojas]

    if "Hoja 1" in titulos and len(hojas) > 3:
        try:
            hoja1 = sheet.worksheet("Hoja 1")
            sheet.del_worksheet(hoja1)
            print("🗑️ Hoja 1 eliminada porque ya no era necesaria")
        except Exception as e:
            print(f"⚠️ No se pudo eliminar Hoja 1: {e}")


def actualizar_hoja(sheet, nombre_hoja: str, df: pd.DataFrame, columnas: list):
    """
    Limpia y actualiza una hoja específica del Google Sheets.
    """
    hoja = obtener_o_crear_hoja(sheet, nombre_hoja)

    df_final = preparar_dataframe(df, columnas)

    valores = [columnas] + df_final.astype(str).values.tolist()

    hoja.clear()

    hoja.update(
        range_name="A1",
        values=valores,
        value_input_option="USER_ENTERED"
    )

    print(f"✅ Hoja '{nombre_hoja}' actualizada con {len(df_final)} registros")


# ============================================================
# CSV Y DATAFRAME
# ============================================================

def preparar_dataframe(df: pd.DataFrame, columnas: list) -> pd.DataFrame:
    """
    Asegura que el DataFrame tenga solo las columnas necesarias
    y en el orden correcto.
    """
    df_final = df.copy()

    for col in columnas:
        if col not in df_final.columns:
            if col == "Compartidas":
                df_final[col] = "0"
            else:
                df_final[col] = ""

    df_final = df_final[columnas]

    return df_final


def guardar_csv(df: pd.DataFrame, archivo_salida: str, columnas: list):
    """
    Guarda el CSV local con las columnas correspondientes.
    """
    df_final = preparar_dataframe(df, columnas)

    try:
        df_final.to_csv(
            archivo_salida,
            index=False,
            encoding="utf-8-sig"
        )

        print(f"📁 CSV guardado: {archivo_salida}")
        print(f"✅ Registros en CSV: {len(df_final)}")

    except PermissionError:
        archivo_rescate = f"dataset_rescate_{int(time.time())}.csv"

        df_final.to_csv(
            archivo_rescate,
            index=False,
            encoding="utf-8-sig"
        )

        print(
            f"❌ No se pudo guardar '{archivo_salida}'. "
            f"Probablemente está abierto. Guardado como: {archivo_rescate}"
        )

    return df_final


# ============================================================
# EJECUCIÓN DE SCRAPERS
# ============================================================

def ejecutar_facebook(sheet):
    config = CONFIG["facebook"]

    print("\n" + "=" * 70)
    print("🚀 INICIANDO FACEBOOK")
    print("=" * 70)
    print(f"🌐 URL: {config['url']}")
    print(f"📅 Fecha límite: {config['fecha_limite']}")

    df = scraper_stealth_facebook(
        config["url"],
        fecha_limite=config["fecha_limite"]
    )

    if df.empty:
        print("⚠️ Facebook no extrajo datos.")
        actualizar_hoja(
            sheet,
            config["nombre_hoja"],
            pd.DataFrame(columns=config["columnas"]),
            config["columnas"]
        )
        return df

    df_final = guardar_csv(
        df,
        config["archivo_csv"],
        config["columnas"]
    )

    actualizar_hoja(
        sheet,
        config["nombre_hoja"],
        df_final,
        config["columnas"]
    )

    return df_final


def ejecutar_instagram(sheet):
    config = CONFIG["instagram"]

    print("\n" + "=" * 70)
    print("🚀 INICIANDO INSTAGRAM")
    print("=" * 70)
    print(f"🌐 URL: {config['url']}")
    print(f"📅 Fecha límite: {config['fecha_limite']}")

    df = scraper_stealth_instagram(
        url=config["url"],
        fecha_limite=config["fecha_limite"]
    )

    if df.empty:
        print("⚠️ Instagram no extrajo datos.")
        actualizar_hoja(
            sheet,
            config["nombre_hoja"],
            pd.DataFrame(columns=config["columnas"]),
            config["columnas"]
        )
        return df

    df_final = guardar_csv(
        df,
        config["archivo_csv"],
        config["columnas"]
    )

    actualizar_hoja(
        sheet,
        config["nombre_hoja"],
        df_final,
        config["columnas"]
    )

    return df_final


def ejecutar_linkedin(sheet):
    config = CONFIG["linkedin"]

    print("\n" + "=" * 70)
    print("🚀 INICIANDO LINKEDIN")
    print("=" * 70)
    print(f"🌐 URL: {config['url']}")
    print(f"📅 Fecha límite: {config['fecha_limite']}")

    df = scraper_stealth_linkedin(
        url=config["url"],
        fecha_limite=config["fecha_limite"]
    )

    if df.empty:
        print("⚠️ LinkedIn no extrajo datos.")
        actualizar_hoja(
            sheet,
            config["nombre_hoja"],
            pd.DataFrame(columns=config["columnas"]),
            config["columnas"]
        )
        return df

    df_final = guardar_csv(
        df,
        config["archivo_csv"],
        config["columnas"]
    )

    actualizar_hoja(
        sheet,
        config["nombre_hoja"],
        df_final,
        config["columnas"]
    )

    return df_final


# ============================================================
# MAIN GENERAL
# ============================================================

def principal():
    print("\n🔥 INICIANDO PROCESO COMPLETO")
    print("Orden de ejecución:")
    print("1️⃣ Facebook")
    print("2️⃣ Instagram")
    print("3️⃣ LinkedIn")
    print(f"\n🔗 Google Sheets: {SHEET_URL}")

    sheet = conectar_google_sheets()
    preparar_hojas_base(sheet)

    resultados = {
        "facebook": pd.DataFrame(),
        "instagram": pd.DataFrame(),
        "linkedin": pd.DataFrame()
    }

    # 1. Facebook
    try:
        resultados["facebook"] = ejecutar_facebook(sheet)
    except Exception as e:
        print(f"\n💥 ERROR EN FACEBOOK: {type(e).__name__}: {e}")

    # 2. Instagram
    try:
        resultados["instagram"] = ejecutar_instagram(sheet)
    except Exception as e:
        print(f"\n💥 ERROR EN INSTAGRAM: {type(e).__name__}: {e}")

    # 3. LinkedIn
    try:
        resultados["linkedin"] = ejecutar_linkedin(sheet)
    except Exception as e:
        print(f"\n💥 ERROR EN LINKEDIN: {type(e).__name__}: {e}")

    print("\n" + "=" * 70)
    print("✅ PROCESO COMPLETO FINALIZADO")
    print("=" * 70)

    print(f"📘 Facebook : {len(resultados['facebook'])} registros")
    print(f"📸 Instagram: {len(resultados['instagram'])} registros")
    print(f"💼 LinkedIn : {len(resultados['linkedin'])} registros")

    print(f"\n🔗 Revisa tu Google Sheets aquí:")
    print(SHEET_URL)

    if LOOKER_URL:
        print(f"\n📊 Revisa tu Dashboard aquí:")
        print(LOOKER_URL)


if __name__ == "__main__":
    principal()