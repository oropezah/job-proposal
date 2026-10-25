#!/usr/bin/env python3
"""Crea un pitch nuevo en Supabase y te devuelve el link para pegar en la propuesta.

Uso típico (con el JSON del job que te paso en el chat):
    python new_pitch.py --json job.json

O directo desde la terminal:
    python new_pitch.py --title "AI Agent for WhatsApp" --client Alex \
        --description "texto largo del job..." --skills "n8n, WhatsApp, API Integration"

Formato de job.json (todos opcionales menos title y description/summary):
    {
      "title": "...", "description": "...", "skills": ["n8n", "..."],
      "client_name": "Alex", "budget": "$25-$45/hr",
      "job_url": "https://www.upwork.com/jobs/~02...", "job_id": "02...",
      "card_image_url": null
    }
"""
import argparse
import json
import re
import secrets
import string
import sys
from pathlib import Path

import requests

from config import auth_headers, site_base, supabase_url

ALPHABET = string.ascii_lowercase + string.digits


def make_slug(length: int = 8) -> str:
    """Slug aleatorio: no se puede adivinar de un cliente a otro."""
    return "".join(secrets.choice(ALPHABET) for _ in range(length))


def clean_text(text: str) -> str:
    text = re.sub(r"<[^>]+>", " ", text or "")            # quita HTML
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)  # [texto](url) -> texto
    text = re.sub(r"[*_`#>]+", "", text)                  # restos de markdown
    return re.sub(r"\s+", " ", text).strip()


def summarize(text: str, limit: int = 420) -> str:
    """Recorta la descripción a un resumen corto, terminando en frase o palabra completa."""
    text = clean_text(text)
    if len(text) <= limit:
        return text
    cut = text[:limit]
    end = max(cut.rfind(". "), cut.rfind("! "), cut.rfind("? "))
    if end > limit * 0.5:
        return cut[: end + 1]
    return cut.rsplit(" ", 1)[0].rstrip(",;:") + "…"


def parse_skills(value) -> list:
    if not value:
        return []
    if isinstance(value, str):
        value = value.split(",")
    return [clean_text(str(s)) for s in value if clean_text(str(s))][:12]


def first_name(name) -> str | None:
    name = clean_text(name or "")
    return name.split(" ")[0] if name else None


def load_job(args) -> dict:
    job = {}
    if args.json:
        raw = sys.stdin.read() if args.json == "-" else Path(args.json).read_text(encoding="utf-8")
        job = json.loads(raw)
    overrides = {
        "title": args.title,
        "description": args.description,
        "summary": args.summary,
        "skills": args.skills,
        "client_name": args.client,
        "budget": args.budget,
        "job_url": args.job_url,
        "job_id": args.job_id,
        "card_image_url": args.card_image_url,
    }
    job.update({k: v for k, v in overrides.items() if v})
    return job


def build_row(job: dict) -> dict:
    title = clean_text(job.get("title", ""))
    body = job.get("summary") or job.get("description") or ""
    if not title or not body:
        sys.exit("Faltan datos: se necesita al menos title y description (o summary).")
    return {
        "slug": make_slug(),
        "client_name": first_name(job.get("client_name")),
        "job_title": title[:200],
        "job_summary": summarize(body),
        "job_skills": parse_skills(job.get("skills")),
        "job_budget": clean_text(job.get("budget", "")) or None,
        "job_url": job.get("job_url") or None,
        "upwork_job_id": str(job["job_id"]) if job.get("job_id") else None,
        "card_image_url": job.get("card_image_url") or None,
    }


def insert(row: dict) -> dict:
    url = f"{supabase_url()}/rest/v1/pitches"
    headers = {**auth_headers(), "Content-Type": "application/json", "Prefer": "return=representation"}
    for _ in range(3):  # reintenta si el slug ya existía (casi imposible)
        resp = requests.post(url, headers=headers, json=row, timeout=30)
        if resp.status_code == 409:
            row["slug"] = make_slug()
            continue
        if not resp.ok:
            sys.exit(f"Supabase respondió {resp.status_code}: {resp.text}")
        return resp.json()[0]
    sys.exit("No se pudo generar un slug único, intenta de nuevo.")


def main() -> None:
    p = argparse.ArgumentParser(description="Crea un pitch en Supabase y devuelve su link.")
    p.add_argument("--json", help="Ruta a un job.json (o '-' para leer de stdin)")
    p.add_argument("--title")
    p.add_argument("--description", help="Texto completo del job (se resume solo)")
    p.add_argument("--summary", help="Resumen ya hecho (si lo pasas, no se recorta la descripción)")
    p.add_argument("--skills", help="Skills separadas por coma")
    p.add_argument("--client", help="Nombre del cliente (solo se usa el primer nombre)")
    p.add_argument("--budget")
    p.add_argument("--job-url", dest="job_url")
    p.add_argument("--job-id", dest="job_id")
    p.add_argument("--card-image-url", dest="card_image_url", help="Captura auténtica opcional")
    p.add_argument("--dry-run", action="store_true", help="Muestra la fila sin guardarla")
    args = p.parse_args()

    row = build_row(load_job(args))

    if args.dry_run:
        print(json.dumps(row, indent=2, ensure_ascii=False))
        print(f"\n(dry-run) Link: {site_base()}/{row['slug']}")
        return

    saved = insert(row)
    print(f"{site_base()}/{saved['slug']}")


if __name__ == "__main__":
    main()
