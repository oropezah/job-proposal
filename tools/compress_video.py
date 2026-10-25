#!/usr/bin/env python3
"""Comprime un video a 720p H.264 para que pese poco y cargue rápido (requiere ffmpeg).

    python compress_video.py intro_raw.mov intro.mp4
    python compress_video.py main_raw.mov main.mp4 --max-mb 45

Si el resultado supera --max-mb, repite con más compresión hasta que quepa.
"""
import argparse
import shutil
import subprocess
import sys
from pathlib import Path

CRF_STEPS = [26, 29, 32, 35]  # menor número = mejor calidad y más peso


def encode(src: Path, dst: Path, crf: int, height: int) -> None:
    cmd = [
        "ffmpeg", "-y", "-i", str(src),
        "-vf", f"scale=-2:'min({height},ih)'",
        "-c:v", "libx264", "-preset", "medium", "-crf", str(crf),
        "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "96k",
        "-movflags", "+faststart",  # empieza a reproducir antes de bajar todo el archivo
        str(dst),
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def main() -> None:
    p = argparse.ArgumentParser(description="Comprime un video para la web.")
    p.add_argument("input", type=Path)
    p.add_argument("output", type=Path)
    p.add_argument("--max-mb", type=float, default=45.0, help="Peso máximo objetivo (default 45)")
    p.add_argument("--height", type=int, default=720, help="Alto máximo en px (default 720)")
    args = p.parse_args()

    if shutil.which("ffmpeg") is None:
        sys.exit("No encuentro ffmpeg. En Mac: brew install ffmpeg")
    if not args.input.exists():
        sys.exit(f"No existe {args.input}")

    for crf in CRF_STEPS:
        encode(args.input, args.output, crf, args.height)
        size_mb = args.output.stat().st_size / 1e6
        print(f"crf {crf}: {size_mb:.1f} MB")
        if size_mb <= args.max_mb:
            print(f"Listo: {args.output}")
            return

    print(f"Aviso: sigue pesando {size_mb:.1f} MB. Recorta el video o baja --height a 540.")


if __name__ == "__main__":
    main()
