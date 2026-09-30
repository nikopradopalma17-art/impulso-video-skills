#!/usr/bin/env python3
"""Render a cinematic trailer from a JSON cut plan with ffmpeg."""

from __future__ import annotations

import argparse
import json
import math
import os
import shlex
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


def run(cmd: list[str]) -> None:
    pretty = " ".join(shlex.quote(part) for part in cmd)
    print(pretty)
    proc = subprocess.run(cmd)
    if proc.returncode != 0:
        raise RuntimeError(f"Command failed: {pretty}")


def has_audio(path: Path) -> bool:
    cmd = [
        "ffprobe",
        "-v",
        "error",
        "-select_streams",
        "a:0",
        "-show_entries",
        "stream=codec_type",
        "-of",
        "csv=p=0",
        str(path),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    return proc.returncode == 0 and bool(proc.stdout.strip())


def parse_canvas(value: str) -> tuple[int, int]:
    if "x" not in value:
        raise ValueError("canvas must look like 1920x1080")
    width, height = value.lower().split("x", 1)
    return int(width), int(height)


def atempo_chain(speed: float) -> str:
    if speed <= 0:
        raise ValueError("speed must be positive")
    factors: list[float] = []
    remaining = speed
    while remaining > 2.0:
        factors.append(2.0)
        remaining /= 2.0
    while remaining < 0.5:
        factors.append(0.5)
        remaining /= 0.5
    factors.append(remaining)
    return ",".join(f"atempo={factor:.6g}" for factor in factors)


def volume_filter(db: float | int | None) -> str:
    return f"volume={float(db):.3f}dB" if db is not None else "volume=0dB"


def render_video_clip(clip: dict, out_path: Path, width: int, height: int, fps: int, look: bool) -> float:
    src = Path(clip["src"]).expanduser()
    start = float(clip.get("start", 0))
    end = float(clip["end"])
    raw_duration = end - start
    if raw_duration <= 0:
        raise ValueError(f"Invalid clip duration for {src}")
    speed = float(clip.get("speed", 1.0))
    duration = raw_duration / speed
    audio_gain = clip.get("audio_gain_db")

    vfilters = [
        f"scale={width}:{height}:force_original_aspect_ratio=increase",
        f"crop={width}:{height}",
        "setsar=1",
        f"fps={fps}",
        f"setpts=PTS/{speed:.6g}",
    ]
    if look:
        vfilters.extend(["eq=contrast=1.08:saturation=0.95:brightness=-0.015", "vignette=PI/6"])
    vfilters.append("format=yuv420p")

    if audio_gain is not None and has_audio(src):
        filters = (
            f"[0:v]{','.join(vfilters)}[v];"
            f"[0:a]atrim=0:{raw_duration:.6f},asetpts=PTS-STARTPTS,"
            f"{volume_filter(audio_gain)},{atempo_chain(speed)},aresample=48000[a]"
        )
        cmd = [
            "ffmpeg",
            "-y",
            "-ss",
            f"{start:.6f}",
            "-t",
            f"{raw_duration:.6f}",
            "-i",
            str(src),
            "-filter_complex",
            filters,
            "-map",
            "[v]",
            "-map",
            "[a]",
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "18",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-movflags",
            "+faststart",
            str(out_path),
        ]
    else:
        cmd = [
            "ffmpeg",
            "-y",
            "-ss",
            f"{start:.6f}",
            "-t",
            f"{raw_duration:.6f}",
            "-i",
            str(src),
            "-f",
            "lavfi",
            "-t",
            f"{duration:.6f}",
            "-i",
            "anullsrc=channel_layout=stereo:sample_rate=48000",
            "-filter_complex",
            f"[0:v]{','.join(vfilters)}[v]",
            "-map",
            "[v]",
            "-map",
            "1:a",
            "-shortest",
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "18",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-movflags",
            "+faststart",
            str(out_path),
        ]
    run(cmd)
    return duration


def render_image_clip(clip: dict, out_path: Path, width: int, height: int, fps: int) -> float:
    src = Path(clip["src"]).expanduser()
    duration = float(clip.get("duration", 3.0))
    filters = [
        f"scale={width}:{height}:force_original_aspect_ratio=increase",
        f"crop={width}:{height}",
        "setsar=1",
        f"fps={fps}",
        "format=yuv420p",
    ]
    cmd = [
        "ffmpeg",
        "-y",
        "-loop",
        "1",
        "-t",
        f"{duration:.6f}",
        "-i",
        str(src),
        "-f",
        "lavfi",
        "-t",
        f"{duration:.6f}",
        "-i",
        "anullsrc=channel_layout=stereo:sample_rate=48000",
        "-filter_complex",
        f"[0:v]{','.join(filters)}[v]",
        "-map",
        "[v]",
        "-map",
        "1:a",
        "-shortest",
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "18",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-movflags",
        "+faststart",
        str(out_path),
    ]
    run(cmd)
    return duration


def concat_segments(segments: list[Path], out_path: Path) -> None:
    list_path = out_path.with_suffix(".txt")
    with list_path.open("w", encoding="utf-8") as handle:
        for segment in segments:
            handle.write(f"file {shlex.quote(str(segment))}\n")
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(list_path), "-c", "copy", str(out_path)])


def mix_bgm(joined: Path, output: Path, plan: dict, duration: float) -> None:
    bgm = plan.get("bgm")
    if not bgm:
        shutil.copy2(joined, output)
        return

    bgm_start = float(plan.get("bgm_start", 0))
    bgm_gain = float(plan.get("bgm_gain_db", -3))
    dialogue_gain = float(plan.get("dialogue_gain_db", 0))
    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        str(joined),
        "-stream_loop",
        "-1",
        "-ss",
        f"{bgm_start:.6f}",
        "-i",
        str(Path(bgm).expanduser()),
        "-filter_complex",
        (
            f"[1:a]atrim=0:{duration:.6f},asetpts=PTS-STARTPTS,volume={bgm_gain:.3f}dB[m];"
            f"[0:a]volume={dialogue_gain:.3f}dB[d];"
            "[m][d]amix=inputs=2:duration=first:dropout_transition=0,"
            "alimiter=limit=0.92[a]"
        ),
        "-map",
        "0:v",
        "-map",
        "[a]",
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-movflags",
        "+faststart",
        str(output),
    ]
    run(cmd)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("plan", type=Path, help="JSON cut plan")
    parser.add_argument("--no-look", action="store_true", help="Disable default cinematic color/vignette pass")
    parser.add_argument("--keep-temp", action="store_true")
    args = parser.parse_args()

    plan = json.loads(args.plan.read_text(encoding="utf-8"))
    width, height = parse_canvas(plan.get("canvas", "1920x1080"))
    fps = int(plan.get("fps", 30))
    output = Path(plan["output"]).expanduser()
    output.parent.mkdir(parents=True, exist_ok=True)

    tempdir = Path(tempfile.mkdtemp(prefix="cinematic-trailer-"))
    segments: list[Path] = []
    total_duration = 0.0
    try:
        for idx, clip in enumerate(plan["clips"]):
            out_segment = tempdir / f"segment_{idx:03d}.mp4"
            clip_type = clip.get("type", "video")
            if clip_type == "image" or Path(clip["src"]).suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
                duration = render_image_clip(clip, out_segment, width, height, fps)
            else:
                duration = render_video_clip(clip, out_segment, width, height, fps, not args.no_look)
            if not math.isfinite(duration) or duration <= 0:
                raise ValueError(f"Invalid rendered duration for clip {idx}")
            total_duration += duration
            segments.append(out_segment)

        joined = tempdir / "joined.mp4"
        concat_segments(segments, joined)
        mix_bgm(joined, output, plan, total_duration)
    finally:
        if args.keep_temp:
            print(f"Temp files kept at: {tempdir}")
        else:
            shutil.rmtree(tempdir, ignore_errors=True)

    print(f"Rendered: {output}")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:
        print(f"error: {exc}", file=sys.stderr)
        sys.exit(1)
