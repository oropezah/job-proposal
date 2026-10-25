"""Configuración compartida por los scripts de tools/."""
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).with_name(".env"))


def require(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        sys.exit(f"Falta {name}. Copia tools/.env.example a tools/.env y complétalo.")
    return value


def supabase_url() -> str:
    return require("SUPABASE_URL").rstrip("/")


def service_key() -> str:
    return require("SUPABASE_SERVICE_KEY")


def site_base() -> str:
    return os.getenv("SITE_BASE_URL", "http://localhost:3000").strip().rstrip("/")


def auth_headers() -> dict:
    key = service_key()
    return {"apikey": key, "Authorization": f"Bearer {key}"}
