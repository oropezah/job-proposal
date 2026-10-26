#!/usr/bin/env python3
"""Pega el intro y el video principal en UN solo archivo (requiere ffmpeg).

    python make_combined.py intro_raw.mp4 main_raw.mp4 combined.mp4

Con un solo archivo el navegador no tiene que cargar un segundo video: la transición
del intro al principal es continua, aunque el internet del cliente sea lento.

Al final imprime INTRO_SECONDS, que la página necesita para saber cuándo pasar del
círculo con tu cara a pantalla completa.
"""
import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

CRF_STEPS = [26, 29, 32, 35]  # menor número = mejor calidad y más peso


def probe(path: Path) -> dict:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type",
         "-of", "json", str(path)],
        check=True, capture_output=True, text=True,
    ).stdout
    data = json.loads(out)
    kinds = {s["codec_type"] for s in data.get("streams", [])}
    return {"duration": float(data["format"]["duration"]), "audio": "audio" in kinds, "video": "video" in kinds}


def encode(intro: Path, main: Path, dst: Path, crf: int, height: int) -> None:
    width = round(height * 16 / 9 / 2) * 2
    norm = (
        f"scale={width}:{height}:force_original_aspect_ratio=decrease,"
        f"pad={width}:{height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,format=yuv420p"
    )
    fc = (
        f"[0:v]{norm}[v0];[1:v]{norm}[v1];"
        "[0:a]aresample=44100,aformat=channel_layouts=stereo[a0];"
        "[1:a]aresample=44100,aformat=channel_layouts=stereo[a1];"
        "[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]"
    )
    cmd = [
        "ffmpeg", "-y", "-i", str(intro), "-i", str(main),
        "-filter_complex", fc, "-map", "[v]", "-map", "[a]",
        "-c:v", "libx264", "-preset", "medium", "-crf", str(crf),
        "-c:a", "aac", "-b:a", "96k",
        "-movflags", "+faststart",
        str(dst),
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def main() -> None:
    p = argparse.ArgumentParser(description="Une intro + principal en un solo video.")
    p.add_argument("intro", type=Path)
    p.add_argument("main", type=Path)
    p.add_argument("output", type=Path)
    p.add_argument("--max-mb", type=float, default=48.0, help="Peso máximo (el plan gratis permite 50)")
    p.add_argument("--height", type=int, default=720)
    args = p.parse_args()

    if shutil.which("ffmpeg") is None or shutil.which("ffprobe") is None:
        sys.exit("No encuentro ffmpeg. En Windows: winget install Gyan.FFmpeg y abre una terminal nueva.")
    for f in (args.intro, args.main):
        if not f.exists():
            sys.exit(f"No existe {f}")

    info_intro, info_main = probe(args.intro), probe(args.main)
    for name, info in (("intro", info_intro), ("principal", info_main)):
        if not info["video"]:
            sys.exit(f"El video {name} no tiene imagen.")
        if not info["audio"]:
            sys.exit(f"El video {name} no tiene audio. Revisa el micrófono al grabar.")

    for crf in CRF_STEPS:
        encode(args.intro, args.main, args.output, crf, args.height)
        size_mb = args.output.stat().st_size / 1e6
        print(f"crf {crf}: {size_mb:.1f} MB")
        if size_mb <= args.max_mb:
            break
    else:
        print("Aviso: sigue pesando más del máximo. Recorta el principal o usa --height 540.")

    total = probe(args.output)["duration"]
    print(f"\nListo: {args.output}  ({total:.1f} s en total)")
    print(f"INTRO_SECONDS={info_intro['duration']:.2f}")
    print("\nSiguiente paso: python upload_videos.py --combined " + str(args.output))


if __name__ == "__main__":
    main()
