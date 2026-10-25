#!/usr/bin/env python3
"""Lista tus últimos pitches con vistas, reproducciones y si terminaron el video.

    python list_pitches.py
"""
import sys

import requests

from config import auth_headers, site_base, supabase_url


def main() -> None:
    params = {
        "select": "slug,client_name,job_title,views,plays,finishes,last_viewed_at,created_at",
        "order": "created_at.desc",
        "limit": "30",
    }
    resp = requests.get(f"{supabase_url()}/rest/v1/pitches", headers=auth_headers(), params=params, timeout=30)
    if not resp.ok:
        sys.exit(f"Supabase respondió {resp.status_code}: {resp.text}")

    rows = resp.json()
    if not rows:
        print("Todavía no hay pitches.")
        return

    print(f"{'vistas':>6} {'play':>5} {'fin':>4}  {'cliente':<10} {'título':<44} link")
    for r in rows:
        title = (r["job_title"] or "")[:42]
        print(
            f"{r['views']:>6} {r['plays']:>5} {r['finishes']:>4}  "
            f"{(r['client_name'] or '-'):<10} {title:<44} {site_base()}/{r['slug']}"
        )


if __name__ == "__main__":
    main()
