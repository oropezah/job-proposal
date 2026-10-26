"""Configuración compartida por los scripts de tools/."""
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).with_name(".env"))


def require(name: str) -> str:
    value = os.getenv(name, "").strip().strip('"').strip("'").strip()
    if not value or value.startswith("PEGA_"):
        sys.exit(f"Falta {name}. Abre tools/.env y pega el valor real (sin comillas).")
    return value


def supabase_url() -> str:
    return require("SUPABASE_URL").rstrip("/")


def service_key() -> str:
    return require("SUPABASE_SERVICE_KEY")


def site_base() -> str:
    return os.getenv("SITE_BASE_URL", "http://localhost:3000").strip().rstrip("/")


def auth_headers() -> dict:
    key = service_key()
    headers = {"apikey": key}
    # Las claves clásicas (JWT, empiezan con eyJ) van también como Bearer.
    # Las nuevas sb_secret_... solo se envían en "apikey".
    if key.startswith("eyJ"):
        headers["Authorization"] = f"Bearer {key}"
    return headers
