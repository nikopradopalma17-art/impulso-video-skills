#!/usr/bin/env python3
"""Audit a trailer cut plan for duration, repetition, dialogue, and ending issues."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def clip_duration(clip: dict) -> float:
    if clip.get("type") == "image" or Path(str(clip.get("src", ""))).suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
        return float(clip.get("duration", 0))
    start = float(clip.get("start", 0))
    end = float(clip.get("end", start))
    speed = float(clip.get("speed", 1.0))
    return max(0.0, (end - start) / speed)


def overlaps(a: dict, b: dict, tolerance: float) -> bool:
    if a.get("src") != b.get("src"):
        return False
    if a.get("type") == "image" or b.get("type") == "image":
        return False
    a0, a1 = float(a.get("start", 0)), float(a.get("end", 0))
    b0, b1 = float(b.get("start", 0)), float(b.get("end", 0))
    return max(a0, b0) < min(a1, b1) + tolerance


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("plan", type=Path)
    parser.add_argument("--overlap-tolerance", type=float, default=0.25)
    parser.add_argument("--min-final-card", type=float, default=2.0)
    args = parser.parse_args()

    plan = json.loads(args.plan.read_text(encoding="utf-8"))
    clips = plan.get("clips", [])
    durations = [clip_duration(clip) for clip in clips]
    total = sum(durations)
    dialogue = [
        (idx, clip, durations[idx])
        for idx, clip in enumerate(clips)
        if clip.get("audio_gain_db") is not None
    ]

    print(f"Output: {plan.get('output', '(not set)')}")
    print(f"Canvas: {plan.get('canvas', '1920x1080')} @ {plan.get('fps', 30)} fps")
    print(f"Clips: {len(clips)}")
    print(f"Total duration: {total:.2f}s")
    print(f"Dialogue/sync-audio clips: {len(dialogue)} ({sum(d[2] for d in dialogue):.2f}s)")

    warnings: list[str] = []
    for idx, duration in enumerate(durations):
        if duration <= 0:
            warnings.append(f"clip {idx}: non-positive duration")
        if duration < 0.25:
            warnings.append(f"clip {idx}: very short duration ({duration:.2f}s)")
        if durations[idx] > 6 and idx < len(clips) - 1:
            warnings.append(f"clip {idx}: long non-final shot ({duration:.2f}s), verify pacing")

    for i in range(len(clips)):
        for j in range(i + 1, len(clips)):
            if overlaps(clips[i], clips[j], args.overlap_tolerance):
                warnings.append(f"clips {i} and {j}: overlapping or repeated source range in {clips[i].get('src')}")

    if clips:
        final = clips[-1]
        final_duration = durations[-1]
        is_final_card = final.get("type") == "image" or Path(str(final.get("src", ""))).suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}
        if is_final_card and final_duration < args.min_final_card:
            warnings.append(f"final card: hold is short ({final_duration:.2f}s)")
        if not is_final_card and "logo" not in str(final.get("note", "")).lower() and "title" not in str(final.get("note", "")).lower():
            warnings.append("final clip: does not look like a title/logo/card ending")

    if warnings:
        print("\nWarnings:")
        for warning in warnings:
            print(f"- {warning}")
    else:
        print("\nWarnings: none")
    return 0


if __name__ == "__main__":
    sys.exit(main())
