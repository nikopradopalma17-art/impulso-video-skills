#!/usr/bin/env python3
"""Scan local media files with ffprobe and print JSON or Markdown inventory."""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

VIDEO_EXTS = {".mp4", ".mov", ".m4v", ".avi", ".mkv", ".webm"}
AUDIO_EXTS = {".mp3", ".wav", ".m4a", ".aac", ".flac", ".aiff"}
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"}


def run_json(cmd: list[str]) -> dict:
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        return {"error": proc.stderr.strip() or proc.stdout.strip()}
    try:
        return json.loads(proc.stdout)
    except json.JSONDecodeError as exc:
        return {"error": f"Could not parse ffprobe output: {exc}"}


def probe(path: Path) -> dict:
    suffix = path.suffix.lower()
    kind = "video" if suffix in VIDEO_EXTS else "audio" if suffix in AUDIO_EXTS else "image" if suffix in IMAGE_EXTS else "other"
    item = {"path": str(path), "kind": kind, "size_bytes": path.stat().st_size}
    if kind == "other":
        return item

    data = run_json(
        [
            "ffprobe",
            "-v",
            "error",
            "-print_format",
            "json",
            "-show_format",
            "-show_streams",
            str(path),
        ]
    )
    if "error" in data:
        item["error"] = data["error"]
        return item

    fmt = data.get("format", {})
    try:
        item["duration"] = round(float(fmt.get("duration", 0)), 3)
    except (TypeError, ValueError):
        item["duration"] = None
    item["bit_rate"] = int(fmt["bit_rate"]) if fmt.get("bit_rate", "").isdigit() else None

    streams = data.get("streams", [])
    video = next((s for s in streams if s.get("codec_type") == "video"), None)
    audio = next((s for s in streams if s.get("codec_type") == "audio"), None)
    if video:
        item["width"] = video.get("width")
        item["height"] = video.get("height")
        item["codec"] = video.get("codec_name")
        item["fps"] = rate_to_float(video.get("avg_frame_rate") or video.get("r_frame_rate"))
    if audio:
        item["has_audio"] = True
        item["audio_codec"] = audio.get("codec_name")
        item["sample_rate"] = int(audio["sample_rate"]) if str(audio.get("sample_rate", "")).isdigit() else None
        item["channels"] = audio.get("channels")
    else:
        item["has_audio"] = False
    return item


def rate_to_float(rate: str | None) -> float | None:
    if not rate or rate == "0/0":
        return None
    if "/" in rate:
        num, den = rate.split("/", 1)
        try:
            return round(float(num) / float(den), 3)
        except (TypeError, ValueError, ZeroDivisionError):
            return None
    try:
        return round(float(rate), 3)
    except ValueError:
        return None


def collect(paths: list[Path]) -> list[Path]:
    files: list[Path] = []
    for path in paths:
        if path.is_dir():
            for root, _, names in os.walk(path):
                for name in names:
                    candidate = Path(root) / name
                    if candidate.suffix.lower() in VIDEO_EXTS | AUDIO_EXTS | IMAGE_EXTS:
                        files.append(candidate)
        elif path.exists() and path.suffix.lower() in VIDEO_EXTS | AUDIO_EXTS | IMAGE_EXTS:
            files.append(path)
    return sorted(files)


def print_markdown(items: list[dict]) -> None:
    print("| kind | duration | size | resolution | audio | path |")
    print("|---|---:|---:|---|---|---|")
    for item in items:
        duration = "" if item.get("duration") is None else f"{item['duration']:.2f}s"
        size_mb = item["size_bytes"] / 1024 / 1024
        resolution = ""
        if item.get("width") and item.get("height"):
            resolution = f"{item['width']}x{item['height']}"
        audio = "yes" if item.get("has_audio") else "no"
        print(f"| {item['kind']} | {duration} | {size_mb:.1f} MB | {resolution} | {audio} | `{item['path']}` |")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paths", nargs="+", type=Path, help="Files or folders to scan")
    parser.add_argument("--format", choices=["json", "markdown"], default="markdown")
    args = parser.parse_args()

    files = collect(args.paths)
    items = [probe(path) for path in files]
    if args.format == "json":
        print(json.dumps(items, ensure_ascii=False, indent=2))
    else:
        print_markdown(items)
    return 0


if __name__ == "__main__":
    sys.exit(main())
