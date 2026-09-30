#!/usr/bin/env python3
"""Create a preview contact sheet from an exported video."""

from __future__ import annotations

import argparse
import json
import math
import subprocess
import sys
from pathlib import Path


def duration(path: Path) -> float:
    cmd = [
        "ffprobe",
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "json",
        str(path),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr.strip())
    return float(json.loads(proc.stdout)["format"]["duration"])


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("video", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--cols", type=int, default=5)
    parser.add_argument("--rows", type=int, default=3)
    parser.add_argument("--thumb-width", type=int, default=480)
    args = parser.parse_args()

    total = duration(args.video)
    frames = args.cols * args.rows
    interval = max(total / frames, 0.1)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    vf = f"fps=1/{interval:.6f},scale={args.thumb_width}:-1,tile={args.cols}x{args.rows}"
    cmd = ["ffmpeg", "-y", "-v", "error", "-i", str(args.video), "-vf", vf, "-frames:v", "1", str(args.output)]
    proc = subprocess.run(cmd)
    if proc.returncode != 0:
        raise RuntimeError("ffmpeg failed to create preview grid")
    print(f"Preview grid: {args.output}")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:
        print(f"error: {exc}", file=sys.stderr)
        sys.exit(1)
