#!/usr/bin/env python3
"""Adjunta tu captura REAL del job al pitch, sin escribir nombres.

    python add_screenshot.py

Sin argumentos:
  - slug   -> el pitch más reciente
  - imagen -> la captura más nueva de tu carpeta de capturas de Windows

Opcional: python add_screenshot.py [SLUG] [ruta_de_imagen]
"""
import argparse
import os
import sys
import time
from pathlib import Path

import requests

from config import auth_headers, site_base, supabase_url

BUCKET = "pitch-videos"
ALLOWED = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg"}
MAX_MB = 5


def screenshots_dir() -> Path:
    env = os.getenv("SCREENSHOTS_DIR", "").strip().strip('"')
    if env:
        return Path(env)
    home = Path.home()
    for name in ("Screenshots", "Capturas de pantalla", "Capturas"):
        for base in (home / "Pictures", home / "OneDrive" / "Pictures", home / "Imágenes"):
            if (base / name).is_dir():
                return base / name
    return home / "Pictures" / "Screenshots"


def newest_image(folder: Path) -> Path:
    files = [f for f in folder.glob("*") if f.suffix.lower() in ALLOWED]
    if not files:
        sys.exit(f"No hay capturas (.png/.jpg) en {folder}. Toma una con Win+Shift+S.")
    return max(files, key=lambda f: f.stat().st_mtime)


def latest_slug() -> str:
    r = requests.get(
        f"{supabase_url()}/rest/v1/pitches",
        headers=auth_headers(),
        params={"select": "slug", "order": "created_at.desc", "limit": "1"},
        timeout=30,
    )
    if not r.ok or not r.json():
        sys.exit("No encuentro ningún pitch. Pídele a Claude que cree uno.")
    return r.json()[0]["slug"]


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("slug", nargs="?", help="Opcional. Por defecto: el pitch más reciente")
    p.add_argument("image", nargs="?", type=Path, help="Opcional. Por defecto: tu última captura")
    args = p.parse_args()

    slug = args.slug or latest_slug()
    image = args.image or newest_image(screenshots_dir())

    if not image.exists():
        sys.exit(f"No existe {image}")
    ext = image.suffix.lower()
    if ext not in ALLOWED:
        sys.exit("La captura debe ser .png o .jpg")
    size_mb = image.stat().st_size / 1e6
    if size_mb > MAX_MB:
        sys.exit(f"La imagen pesa {size_mb:.1f} MB (máximo {MAX_MB}). Recórtala un poco más.")
    age_min = (time.time() - image.stat().st_mtime) / 60
    print(f"Pitch:   {slug}")
    print(f"Captura: {image.name} (hecha hace {age_min:.0f} min)")

    check = requests.get(
        f"{supabase_url()}/rest/v1/pitches",
        headers=auth_headers(),
        params={"select": "slug", "slug": f"eq.{slug}"},
        timeout=30,
    )
    if not check.ok or not check.json():
        sys.exit(f"No encuentro un pitch con slug '{slug}'.")

    object_name = f"job-{slug}-{int(time.time())}{ext}"
    up = requests.post(
        f"{supabase_url()}/storage/v1/object/{BUCKET}/{object_name}",
        headers={**auth_headers(), "Content-Type": ALLOWED[ext], "x-upsert": "true"},
        data=image.read_bytes(),
        timeout=120,
    )
    if not up.ok:
        sys.exit(f"No se pudo subir la imagen ({up.status_code}): {up.text}")
    public_url = f"{supabase_url()}/storage/v1/object/public/{BUCKET}/{object_name}"

    patch = requests.patch(
        f"{supabase_url()}/rest/v1/pitches",
        headers={**auth_headers(), "Content-Type": "application/json", "Prefer": "return=minimal"},
        params={"slug": f"eq.{slug}"},
        json={"card_image_url": public_url},
        timeout=30,
    )
    if not patch.ok:
        sys.exit(f"No se pudo actualizar el pitch ({patch.status_code}): {patch.text}")

    print(f"Listo. Revisa: {site_base()}/{slug}")


if __name__ == "__main__":
    main()
