#!/usr/bin/env python3
"""Estimate strong music hit points from an audio file using ffmpeg PCM output."""

from __future__ import annotations

import argparse
import audioop
import math
import subprocess
import sys
from pathlib import Path


def extract_pcm(path: Path, sample_rate: int) -> bytes:
    cmd = [
        "ffmpeg",
        "-v",
        "error",
        "-i",
        str(path),
        "-ac",
        "1",
        "-ar",
        str(sample_rate),
        "-f",
        "s16le",
        "-",
    ]
    proc = subprocess.run(cmd, capture_output=True)
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr.decode("utf-8", "ignore"))
    return proc.stdout


def analyze(path: Path, sample_rate: int, window_ms: int) -> list[tuple[float, float]]:
    pcm = extract_pcm(path, sample_rate)
    samples_per_window = max(1, int(sample_rate * window_ms / 1000))
    bytes_per_window = samples_per_window * 2
    energies: list[float] = []

    for offset in range(0, len(pcm), bytes_per_window):
        chunk = pcm[offset : offset + bytes_per_window]
        if len(chunk) < 2:
            break
        rms = audioop.rms(chunk, 2)
        db = 20 * math.log10(max(rms, 1) / 32768)
        energies.append(db)

    hits: list[tuple[float, float]] = []
    if len(energies) < 5:
        return hits

    for i in range(2, len(energies) - 2):
        local = energies[i - 2 : i + 3]
        before = energies[max(0, i - 12) : i]
        avg_before = sum(before) / len(before) if before else energies[i]
        is_peak = energies[i] == max(local)
        lift = energies[i] - avg_before
        if is_peak and lift >= 3.0 and energies[i] > -24:
            hits.append((i * window_ms / 1000, energies[i]))

    deduped: list[tuple[float, float]] = []
    for ts, db in hits:
        if deduped and ts - deduped[-1][0] < 0.35:
            if db > deduped[-1][1]:
                deduped[-1] = (ts, db)
        else:
            deduped.append((ts, db))
    return deduped


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("audio", type=Path)
    parser.add_argument("--sample-rate", type=int, default=8000)
    parser.add_argument("--window-ms", type=int, default=50)
    parser.add_argument("--limit", type=int, default=30)
    args = parser.parse_args()

    hits = analyze(args.audio, args.sample_rate, args.window_ms)
    for ts, db in hits[: args.limit]:
        print(f"{ts:7.2f}s  {db:6.1f} dB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
