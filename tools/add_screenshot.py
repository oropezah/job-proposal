#!/usr/bin/env python3
"""Adjunta una captura REAL del job posting a un pitch ya creado.

    python add_screenshot.py SLUG captura.png

La página mostrará tu captura en lugar de la tarjeta con el texto. Sube la imagen a Supabase
Storage (bucket pitch-videos, que acepta png y jpg) y la enlaza en la fila del pitch.
"""
import argparse
import mimetypes
import sys
import time
from pathlib import Path

import requests

from config import auth_headers, site_base, supabase_url

BUCKET = "pitch-videos"
ALLOWED = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg"}
MAX_MB = 5


def main() -> None:
    p = argparse.ArgumentParser(description="Adjunta una captura real del job a un pitch.")
    p.add_argument("slug", help="Slug del pitch (la parte final del link)")
    p.add_argument("image", type=Path, help="Captura en .png o .jpg")
    args = p.parse_args()

    if not args.image.exists():
        sys.exit(f"No existe {args.image}")
    ext = args.image.suffix.lower()
    if ext not in ALLOWED:
        sys.exit("La captura debe ser .png o .jpg")
    size_mb = args.image.stat().st_size / 1e6
    if size_mb > MAX_MB:
        sys.exit(f"La imagen pesa {size_mb:.1f} MB (máximo {MAX_MB}). Recórtala o guárdala como .jpg.")

    # 1) comprobar que el pitch existe
    check = requests.get(
        f"{supabase_url()}/rest/v1/pitches",
        headers=auth_headers(),
        params={"select": "slug", "slug": f"eq.{args.slug}"},
        timeout=30,
    )
    if not check.ok or not check.json():
        sys.exit(f"No encuentro un pitch con slug '{args.slug}'.")

    # 2) subir la imagen
    object_name = f"job-{args.slug}-{int(time.time())}{ext}"
    mime = ALLOWED.get(ext) or mimetypes.guess_type(args.image.name)[0] or "image/png"
    up = requests.post(
        f"{supabase_url()}/storage/v1/object/{BUCKET}/{object_name}",
        headers={**auth_headers(), "Content-Type": mime, "x-upsert": "true"},
        data=args.image.read_bytes(),
        timeout=120,
    )
    if not up.ok:
        sys.exit(f"No se pudo subir la imagen ({up.status_code}): {up.text}")
    public_url = f"{supabase_url()}/storage/v1/object/public/{BUCKET}/{object_name}"

    # 3) enlazarla al pitch
    patch = requests.patch(
        f"{supabase_url()}/rest/v1/pitches",
        headers={**auth_headers(), "Content-Type": "application/json", "Prefer": "return=minimal"},
        params={"slug": f"eq.{args.slug}"},
        json={"card_image_url": public_url},
        timeout=30,
    )
    if not patch.ok:
        sys.exit(f"No se pudo actualizar el pitch ({patch.status_code}): {patch.text}")

    print(f"Listo. Revisa: {site_base()}/{args.slug}")


if __name__ == "__main__":
    main()
