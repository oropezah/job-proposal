#!/usr/bin/env python3
"""Sube tus dos videos a Supabase Storage y te imprime las variables para Vercel.

    python upload_videos.py --intro intro.mp4 --main main.mp4

Puedes subir solo uno (--intro o --main). Cada subida usa un nombre nuevo con marca de tiempo,
así el navegador del cliente nunca ve una versión vieja en caché.
"""
import argparse
import mimetypes
import sys
import time
from pathlib import Path

import requests

from config import auth_headers, supabase_url

BUCKET = "pitch-videos"
FREE_LIMIT_MB = 50


def upload(path: Path, prefix: str) -> str:
    if not path.exists():
        sys.exit(f"No existe {path}")
    size_mb = path.stat().st_size / 1e6
    if size_mb > FREE_LIMIT_MB:
        sys.exit(
            f"{path.name} pesa {size_mb:.1f} MB y el plan gratis permite {FREE_LIMIT_MB} MB. "
            "Corre compress_video.py primero."
        )

    object_name = f"{prefix}-{int(time.time())}{path.suffix.lower()}"
    mime = mimetypes.guess_type(path.name)[0] or "video/mp4"
    url = f"{supabase_url()}/storage/v1/object/{BUCKET}/{object_name}"
    headers = {**auth_headers(), "Content-Type": mime, "x-upsert": "true", "cache-control": "max-age=31536000"}

    print(f"Subiendo {path.name} ({size_mb:.1f} MB)...")
    with path.open("rb") as fh:
        resp = requests.post(url, headers=headers, data=fh, timeout=900)
    if not resp.ok:
        sys.exit(f"Supabase respondió {resp.status_code}: {resp.text}")
    return f"{supabase_url()}/storage/v1/object/public/{BUCKET}/{object_name}"


def main() -> None:
    p = argparse.ArgumentParser(description="Sube los videos a Supabase Storage.")
    p.add_argument("--intro", type=Path, help="Intro corto (6-8 s)")
    p.add_argument("--main", type=Path, help="Video principal (60-90 s)")
    args = p.parse_args()
    if not args.intro and not args.main:
        p.error("Pasa al menos --intro o --main")

    lines = []
    if args.intro:
        lines.append(f"INTRO_VIDEO_URL={upload(args.intro, 'intro')}")
    if args.main:
        lines.append(f"MAIN_VIDEO_URL={upload(args.main, 'main')}")

    print("\nPega esto en Vercel -> Settings -> Environment Variables (y en .env.local si pruebas en local),")
    print("luego haz Redeploy:\n")
    print("\n".join(lines))


if __name__ == "__main__":
    main()
