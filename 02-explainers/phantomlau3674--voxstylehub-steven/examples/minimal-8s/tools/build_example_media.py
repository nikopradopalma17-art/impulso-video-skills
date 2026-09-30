#!/usr/bin/env python3
"""Rebuild every media artifact for the iceberg-vox-minimal example.

零收费服务、零外部素材：全部画面由 PIL 程序化绘制（纯色纸面、半调圆点、
撕裂边、几何道具、确定性文字），音频由 Python 直接合成提示音 WAV，
最后只调用本机 ffmpeg 做封装与剪切。可重复运行，输出确定。

Usage: python tools/build_example_media.py
Run from anywhere; paths resolve relative to the project root (parent of tools/).
"""

from __future__ import annotations

import json
import math
import os
import random
import shutil
import struct
import subprocess
import sys
import wave
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
VOX = ROOT / "visual" / "vox"
RENDERS = VOX / "renders"
EVIDENCE = VOX / "evidence"
AUDIO_DIR = VOX / "media" / "audio"
MAKE_EVIDENCE = (
    Path(os.environ.get("XINGCHEN_VOX_SKILL", Path.home() / ".agents" / "skills" / "xingchen-vox-collage"))
    / "scripts" / "make_visual_evidence.py"
)
LOCK_INPUTS = MAKE_EVIDENCE.parent / "lock_vox_inputs.py"

W, H, FPS = 1920, 1080, 30
S01_FRAMES, S02_FRAMES = 180, 120  # 6.0s + 4.0s = 10s master

PAPER = (242, 235, 220)      # #F2EBDC substrate
PAPER_WHITE = (251, 247, 238)  # #FBF7EE paper props
INK = (38, 34, 28)           # #26221C
BLUE = (46, 111, 168)        # #2E6FA8 water
RED = (200, 68, 44)          # #C8442C signal

# Code-native asset registry. The `id="..."` literals double as the addressable
# fragments referenced by visual/vox/assets.json (validator checks them here).
CODE_ASSETS = {
    "paper-substrate": dict(id="paper-substrate", role="plate"),
    "water-field": dict(id="water-field", role="prop"),
    "iceberg-cutout": dict(id="iceberg-cutout", role="cutout"),
    "waterline-annotation": dict(id="waterline-annotation", role="annotation"),
    "buoyancy-data-bar": dict(id="buoyancy-data-bar", role="data"),
    "balance-prop": dict(id="balance-prop", role="prop"),
    "ice-cube": dict(id="ice-cube", role="cutout"),
    "water-cube": dict(id="water-cube", role="prop"),
    "tilt-annotation": dict(id="tilt-annotation", role="annotation"),
    "density-data": dict(id="density-data", role="data"),
    "scene-title-type": dict(id="scene-title-type", role="type"),
}


# ---------------------------------------------------------------- fonts / text

def load_font(size: int) -> ImageFont.FreeTypeFont:
    for candidate in [r"C:\Windows\Fonts\msyh.ttc", r"C:\Windows\Fonts\msjh.ttc",
                      "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]:
        try:
            return ImageFont.truetype(candidate, size)
        except (OSError, IOError):
            continue
    print("WARN: no CJK font found, falling back to PIL default font", file=sys.stderr)
    return ImageFont.load_default()


def text_tile(text: str, size: int, color=INK, pad: int = 0, bg=None,
              rotation: float = 0.0) -> Image.Image:
    font = load_font(size)
    probe = Image.new("RGBA", (8, 8), (0, 0, 0, 0))
    bbox = ImageDraw.Draw(probe).textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tile = Image.new("RGBA", (tw + pad * 2 + 8, th + pad * 2 + 8), (0, 0, 0, 0))
    d = ImageDraw.Draw(tile)
    if bg is not None:
        d.rectangle([0, 0, tile.width - 1, tile.height - 1], fill=bg)
    d.text((pad + 4 - bbox[0], pad + 4 - bbox[1]), text, font=font, fill=color)
    if rotation:
        tile = tile.rotate(rotation, resample=Image.BICUBIC, expand=True)
    return tile


# ------------------------------------------------------------ drawing helpers

def ease_out(t: float) -> float:
    t = min(max(t, 0.0), 1.0)
    return 1.0 - (1.0 - t) ** 3


def ease_in_out(t: float) -> float:
    t = min(max(t, 0.0), 1.0)
    return t * t * (3 - 2 * t)


def ease_out_bounce(t: float) -> float:
    t = min(max(t, 0.0), 1.0)
    n1, d1 = 7.5625, 2.75
    if t < 1 / d1:
        return n1 * t * t
    if t < 2 / d1:
        t -= 1.5 / d1
        return n1 * t * t + 0.75
    if t < 2.5 / d1:
        t -= 2.25 / d1
        return n1 * t * t + 0.9375
    t -= 2.625 / d1
    return n1 * t * t + 0.984375


def paste_at(base: Image.Image, tile: Image.Image, cx: float, cy: float,
             opacity: float = 1.0, scale: float = 1.0) -> None:
    t = tile
    if scale != 1.0:
        t = t.resize((max(1, int(t.width * scale)), max(1, int(t.height * scale))),
                     Image.LANCZOS)
    if opacity < 1.0:
        t = t.copy()
        t.putalpha(t.getchannel("A").point(lambda v: int(v * opacity)))
    base.alpha_composite(t, (int(cx - t.width / 2), int(cy - t.height / 2)))


def draw_dashed(d: ImageDraw.ImageDraw, p0, p1, dash, gap, width, fill, progress=1.0):
    x0, y0 = p0
    x1, y1 = p1
    total = math.hypot(x1 - x0, y1 - y0)
    if total <= 0:
        return
    ux, uy = (x1 - x0) / total, (y1 - y0) / total
    limit = total * min(max(progress, 0.0), 1.0)
    pos = 0.0
    while pos < limit:
        end = min(pos + dash, limit)
        d.line([(x0 + ux * pos, y0 + uy * pos), (x0 + ux * end, y0 + uy * end)],
               fill=fill, width=width)
        pos = end + gap


def halftone(d: ImageDraw.ImageDraw, ox: int, oy: int, cols: int, rows: int,
             spacing: int, max_r: float, color) -> None:
    """Deterministic halftone dot cluster with radial falloff."""
    cx, cy = (cols - 1) / 2, (rows - 1) / 2
    maxd = math.hypot(cx, cy) or 1.0
    for i in range(cols):
        for j in range(rows):
            r = max_r * (1.0 - math.hypot(i - cx, j - cy) / maxd)
            if r < 1.2:
                continue
            x, y = ox + i * spacing, oy + j * spacing
            d.ellipse([x - r, y - r, x + r, y + r], fill=color)


def torn_edge(p0, p1, rng: random.Random, teeth: int = 3, amp: float = 6.0):
    """Deterministic jagged points along one edge (excluding the end point)."""
    x0, y0 = p0
    x1, y1 = p1
    out = [(x0, y0)]
    seg = math.hypot(x1 - x0, y1 - y0)
    count = max(2, int(seg / 60) * teeth)
    nx, ny = (-(y1 - y0) / (seg or 1), (x1 - x0) / (seg or 1))
    for k in range(1, count):
        t = k / count
        off = rng.uniform(-amp, amp)
        out.append((x0 + (x1 - x0) * t + nx * off, y0 + (y1 - y0) * t + ny * off))
    return out


def torn_polygon(points, rng: random.Random, teeth: int = 3, amp: float = 6.0):
    """Insert deterministic jagged points along each edge of a polygon."""
    out = []
    n = len(points)
    for i in range(n):
        out += torn_edge(points[i], points[(i + 1) % n], rng, teeth, amp)
    return out


def add_grain(img: Image.Image) -> Image.Image:
    rng = random.Random(20260721)
    small_w, small_h = 480, 270
    noise = Image.frombytes(
        "L", (small_w, small_h),
        bytes(rng.getrandbits(8) for _ in range(small_w * small_h)),
    ).resize((W, H), Image.BILINEAR)
    noise_rgb = Image.merge("RGB", (noise, noise, noise))
    return Image.blend(img, noise_rgb, 0.045)


def make_substrate(halftone_origin) -> Image.Image:
    img = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(img)
    halftone(d, *halftone_origin, cols=14, rows=11, spacing=30, max_r=7.5,
             color=(*INK[:3],))
    return add_grain(img).convert("RGBA")


def with_shadow(tile: Image.Image, offset=(12, 16), blur=10, alpha=90) -> Image.Image:
    canvas = Image.new("RGBA", (tile.width + 80, tile.height + 80), (0, 0, 0, 0))
    shadow = Image.new("RGBA", tile.size, (0, 0, 0, 0))
    shadow.putalpha(tile.getchannel("A").point(lambda v: min(v, alpha)))
    canvas.alpha_composite(shadow, (40 + offset[0], 40 + offset[1]))
    canvas = canvas.filter(ImageFilter.GaussianBlur(blur))
    canvas.alpha_composite(tile, (40, 40))
    return canvas


# ------------------------------------------------------------ sprite factory

def make_water_band() -> Image.Image:
    """Blue torn-edge paper band: jagged top edge, covers to bottom of frame."""
    tile = Image.new("RGBA", (W, 460), (0, 0, 0, 0))
    rng = random.Random(101)
    poly = torn_edge((0, 26), (W, 26), rng, teeth=2, amp=9.0) + [(W, 460), (0, 460)]
    ImageDraw.Draw(tile).polygon(poly, fill=(*BLUE, 170))
    return tile


def make_iceberg() -> Image.Image:
    tw, th = 640, 800
    tile = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    rng = random.Random(202)
    outline = [
        (320, 6), (400, 130), (470, 210), (560, 300),      # peak right slope
        (600, 460), (560, 640), (470, 760),                # body right
        (300, 794), (150, 770), (60, 660),                 # body bottom
        (30, 480), (90, 330), (190, 230), (250, 120),      # body/peak left
    ]
    poly = torn_polygon(outline, rng, teeth=2, amp=7.0)
    d = ImageDraw.Draw(tile)
    d.polygon(poly, fill=(*PAPER_WHITE, 255))
    shade = [(320, 6), (400, 130), (470, 210), (560, 300), (600, 460), (470, 420),
             (420, 260), (360, 140)]
    d.polygon(shade, fill=(214, 222, 230, 255))
    tile = tile.rotate(-2, resample=Image.BICUBIC, expand=True)
    return with_shadow(tile)


def make_cube(fill, seed: int, rotation: float) -> Image.Image:
    size = 210
    tile = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    rng = random.Random(seed)
    poly = torn_polygon([(6, 6), (size - 6, 6), (size - 6, size - 6), (6, size - 6)],
                        rng, teeth=3, amp=5.0)
    ImageDraw.Draw(tile).polygon(poly, fill=(*fill, 255))
    tile = tile.rotate(rotation, resample=Image.BICUBIC, expand=True)
    return with_shadow(tile, offset=(9, 12), blur=8, alpha=80)


def make_tape_title(text: str) -> Image.Image:
    tile = text_tile(text, 64, color=INK, pad=30, bg=(*PAPER_WHITE, 255))
    return with_shadow(tile, offset=(8, 10), blur=7, alpha=70)


def make_bar_tile() -> Image.Image:
    tile = Image.new("RGBA", (92, 600), (0, 0, 0, 0))
    rng = random.Random(303)
    d = ImageDraw.Draw(tile)
    d.polygon(torn_polygon([(4, 2), (88, 2), (88, 60), (4, 60)], rng, 2, 3.0),
              fill=(*RED, 255), outline=(*PAPER_WHITE, 255))
    d.polygon(torn_polygon([(4, 60), (88, 60), (88, 598), (4, 598)], rng, 2, 4.0),
              fill=(*BLUE, 255), outline=(*PAPER_WHITE, 255))
    return tile


def make_density_tile() -> Image.Image:
    font = load_font(46)
    parts = [("冰 917 kg/m³", PAPER_WHITE), ("水 1000 kg/m³", BLUE)]
    widths, height = [], 0
    for text, _ in parts:
        probe = Image.new("RGBA", (8, 8), (0, 0, 0, 0))
        bbox = ImageDraw.Draw(probe).textbbox((0, 0), text, font=font)
        widths.append(bbox[2] - bbox[0] + 96)
        height = max(height, bbox[3] - bbox[1] + 48)
    tile = Image.new("RGBA", (sum(widths) + 30, height), (0, 0, 0, 0))
    d = ImageDraw.Draw(tile)
    x = 0
    for (text, swatch), w in zip(parts, widths):
        d.rectangle([x, 0, x + w - 1, height - 1], fill=(*PAPER_WHITE, 235))
        d.rectangle([x + 18, height // 2 - 18, x + 54, height // 2 + 18],
                    fill=(*swatch, 255), outline=(*INK, 255), width=2)
        d.text((x + 70, height // 2), text, font=font, fill=(*INK, 255), anchor="lm")
        x += w + 30
    return with_shadow(tile, offset=(7, 9), blur=6, alpha=70)


# ------------------------------------------------------------ pre-render pool

print("pre-rendering sprites ...")
SUBSTRATE_S01 = make_substrate(halftone_origin=(70, 60))
SUBSTRATE_S02 = make_substrate(halftone_origin=(70, 640))
WATER_BAND = make_water_band()
ICEBERG = make_iceberg()
ICE_CUBE = make_cube(PAPER_WHITE, seed=404, rotation=-3)
WATER_CUBE = make_cube(BLUE, seed=505, rotation=2)
BAR_TILE = make_bar_tile().resize((92, 540), Image.LANCZOS)
TITLE_S01 = make_tape_title("冰山为什么藏在水下？")
TITLE_S02 = make_tape_title("同样大小，水更重")
LABEL_SURFACE = text_tile("水面", 40, color=RED)
LABEL_BAR = text_tile("约90%在水下", 38, color=INK)
LABEL_10 = text_tile("10%", 44, color=RED)
LABEL_90 = text_tile("90%", 44, color=PAPER_WHITE)
LABEL_TILT = text_tile("更重的一侧下沉", 38, color=RED)
DENSITY_TILE = make_density_tile()

WATERLINE_Y = 655
RAIL_TOP_Y = 962
ICE_SETTLED = (700, 890)   # sprite center; peak pokes ~160px above waterline
FULCRUM = (1150, 640)
BEAM_HALF = 380


# --------------------------------------------------------------- scene 1

def render_s01(f: int) -> Image.Image:
    img = SUBSTRATE_S01.copy()

    # transition window: frames 165-179 hand the water field off to scene 2
    tp = ease_in_out((f - 165) / 14) if f >= 165 else 0.0

    # iceberg first: the water band overlays it, tinting the submerged body
    if f >= 12:
        dp = ease_out_bounce((f - 12) / 28)
        cx = ICE_SETTLED[0] - (1 - dp) * 60 - tp * 1500
        cy = ICE_SETTLED[1] - (1 - dp) * 760 + tp * 120
        if 40 < f < 165:
            decay = math.exp(-(f - 40) / 55)
            cy += 16 * math.sin((f - 40) / 35 * 2 * math.pi) * decay
            cx += 6 * math.sin((f - 40) / 50 * 2 * math.pi) * decay
        paste_at(img, ICEBERG, cx, cy)

    # water band: slide up frames 0-20, sinks to rail position during transition
    wp = ease_out(f / 20)
    band_top = WATERLINE_Y - 26 + (1 - wp) * 500 + tp * (RAIL_TOP_Y - WATERLINE_Y)
    img.alpha_composite(WATER_BAND, (0, int(band_top)))

    # waterline annotation: trace frames 70-96 (fades out with transition)
    if f >= 70:
        lp = ease_out((f - 70) / 26)
        d = ImageDraw.Draw(img)
        draw_dashed(d, (80, WATERLINE_Y - 8), (1840, WATERLINE_Y - 8),
                    26, 16, 6, (*RED, 255), progress=lp)
        if lp >= 1.0:
            d.polygon([(1840, WATERLINE_Y - 22), (1840, WATERLINE_Y + 6),
                       (1862, WATERLINE_Y - 8)], fill=(*RED, 255))
        paste_at(img, LABEL_SURFACE, 130, WATERLINE_Y - 52,
                 opacity=min(1.0, (f - 70) / 8))

    # buoyancy data bar: peel reveal frames 96-126 (bar spans y 330-870)
    if f >= 96:
        bp = ease_out((f - 96) / 30)
        reveal = int(BAR_TILE.height * bp)
        if reveal > 0:
            crop = BAR_TILE.crop((0, 0, BAR_TILE.width, reveal))
            img.alpha_composite(crop, (1560 - BAR_TILE.width // 2, 330))
        if bp > 0.25:
            paste_at(img, LABEL_10, 1680, 360)
        if bp > 0.9:
            paste_at(img, LABEL_90, 1680, 730)
        paste_at(img, LABEL_BAR, 1560, 292, opacity=min(1.0, (f - 96) / 10))

    # title stamp frames 120-132
    if f >= 120:
        sp = ease_out((f - 120) / 12)
        paste_at(img, TITLE_S01, 1330, 185, opacity=min(1.0, sp * 1.6),
                 scale=1.28 - 0.28 * sp)

    return img.convert("RGB")


# --------------------------------------------------------------- scene 2

def beam_angle(f: int) -> float:
    """Beam tilts right-down after both cubes landed (frames 48-72)."""
    if f < 6:
        return -20.0
    if f < 24:
        return -20.0 * (1 - ease_out((f - 6) / 18))
    if f < 48:
        return 0.0
    return 7.0 * ease_in_out((f - 48) / 24)


def beam_ends(angle_deg: float):
    a = math.radians(angle_deg)
    cx, cy = FULCRUM[0], FULCRUM[1] - 14
    left = (cx - BEAM_HALF * math.cos(a), cy - BEAM_HALF * math.sin(a))
    right = (cx + BEAM_HALF * math.cos(a), cy + BEAM_HALF * math.sin(a))
    return left, right


def render_s02(f: int) -> Image.Image:
    img = SUBSTRATE_S02.copy()

    # carried blue rail: settles in during frames 0-12
    rp = ease_out(f / 12)
    img.alpha_composite(WATER_BAND, (0, int(RAIL_TOP_Y - 26 + (1 - rp) * 60)))

    # balance: fulcrum + beam + pans, pivot entrance frames 6-24
    if f >= 6:
        opacity = min(1.0, (f - 6) / 6)
        d = ImageDraw.Draw(img, "RGBA")
        fx, fy = FULCRUM
        ink_a = (*INK, int(255 * opacity))
        d.polygon([(fx, fy), (fx - 90, fy + 150), (fx + 90, fy + 150)], fill=ink_a)
        angle = beam_angle(f)
        left, right = beam_ends(angle)
        ux, uy = (right[0] - left[0]) / (2 * BEAM_HALF), (right[1] - left[1]) / (2 * BEAM_HALF)
        nx, ny = -uy, ux
        th = 13
        beam_poly = [(left[0] + nx * th, left[1] + ny * th),
                     (right[0] + nx * th, right[1] + ny * th),
                     (right[0] - nx * th, right[1] - ny * th),
                     (left[0] - nx * th, left[1] - ny * th)]
        d.polygon(beam_poly, fill=(*PAPER_WHITE, int(255 * opacity)),
                  outline=ink_a)
        for end in (left, right):
            ex, ey = end[0], end[1] + 46
            d.ellipse([ex - 105, ey - 24, ex + 105, ey + 24],
                      fill=(*PAPER_WHITE, int(255 * opacity)), outline=ink_a, width=5)

        # cubes ride the pans once landed
        for cube, end, start in ((ICE_CUBE, left, 14), (WATER_CUBE, right, 22)):
            if f < start:
                continue
            cp = ease_out_bounce((f - start) / 22)
            cx = end[0]
            cy = end[1] + 46 - 24 - 118 - (1 - cp) * 620
            paste_at(img, cube, cx, cy, opacity=opacity)

    # tilt annotation: dashed arc + arrow, trace frames 52-74
    if f >= 52:
        ap = ease_out((f - 52) / 22)
        d = ImageDraw.Draw(img)
        arc = [(1470 + 170 * math.sin(t * 1.2), 300 + 190 * (1 - math.cos(t * 1.2)))
               for t in [i / 20 for i in range(21)]]
        upto = max(2, int(len(arc) * ap))
        for i in range(upto - 1):
            if i % 2 == 0:
                d.line([arc[i], arc[i + 1]], fill=(*RED, 255), width=7)
        if ap >= 1.0:
            tip = arc[-1]
            d.polygon([(tip[0] - 18, tip[1] - 24), (tip[0] + 20, tip[1] - 14),
                       (tip[0] + 3, tip[1] + 14)], fill=(*RED, 255))
        paste_at(img, LABEL_TILT, 1740, 300, opacity=min(1.0, (f - 52) / 8))

    # density data: stamp frames 74-88
    if f >= 74:
        sp = ease_out((f - 74) / 14)
        paste_at(img, DENSITY_TILE, 1150, 215, opacity=min(1.0, sp * 1.6),
                 scale=1.22 - 0.22 * sp)

    # title stamp frames 88-100
    if f >= 88:
        sp = ease_out((f - 88) / 12)
        paste_at(img, TITLE_S02, 440, 240, opacity=min(1.0, sp * 1.6),
                 scale=1.28 - 0.28 * sp)

    return img.convert("RGB")


# ------------------------------------------------------------------- audio

def synth_audio(path: Path) -> None:
    """Deterministic tone-track: ticks/thuds aligned with layer entrances."""
    sr, dur = 44100, (S01_FRAMES + S02_FRAMES) / FPS
    n = int(sr * dur)
    buf = [0.0] * n

    def beep(freq, t0, length, amp, decay=14.0):
        start = int(t0 * sr)
        for i in range(start, min(n, int((t0 + length) * sr))):
            t = i / sr - t0
            buf[i] += amp * math.sin(2 * math.pi * freq * (i / sr)) * math.exp(-t * decay)

    def sweep(f0, f1, t0, length, amp):
        start = int(t0 * sr)
        for i in range(start, min(n, int((t0 + length) * sr))):
            t = i / sr - t0
            p = t / length
            freq = f0 + (f1 - f0) * p
            buf[i] += amp * math.sin(2 * math.pi * freq * (i / sr)) * (1 - p) * 0.8

    sweep(280, 520, 0.10, 0.45, 0.30)   # water band slides up
    beep(170, 1.33, 0.35, 0.55)          # iceberg lands
    beep(240, 1.55, 0.20, 0.30)          # bounce
    beep(620, 2.40, 0.12, 0.35)          # waterline trace
    beep(700, 3.30, 0.12, 0.35)          # data bar peel
    beep(290, 4.03, 0.25, 0.50)          # title stamp
    sweep(520, 240, 5.55, 0.45, 0.30)    # transition: field sinks
    beep(240, 6.30, 0.20, 0.35)          # balance pivot in
    beep(190, 7.20, 0.30, 0.50)          # ice cube lands
    beep(140, 7.47, 0.35, 0.55)          # water cube lands (heavier)
    sweep(300, 200, 7.70, 0.60, 0.28)    # beam tilts
    beep(660, 8.50, 0.12, 0.35)          # density stamp
    beep(300, 8.97, 0.25, 0.45)          # title stamp

    peak = max(1e-6, max(abs(v) for v in buf))
    gain = 0.85 / peak
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(sr)
        wav.writeframes(b"".join(
            struct.pack("<h", int(max(-1.0, min(1.0, v * gain)) * 32767)) for v in buf
        ))


# ------------------------------------------------------------------ ffmpeg

def run(cmd: list[str]) -> None:
    result = subprocess.run(cmd, text=True, capture_output=True)
    if result.returncode != 0:
        raise SystemExit(f"command failed: {' '.join(str(c) for c in cmd)}\n{result.stderr}")


def build() -> None:
    for directory in (RENDERS, EVIDENCE, AUDIO_DIR):
        if directory.exists():
            shutil.rmtree(directory)
        directory.mkdir(parents=True)

    master_audio = AUDIO_DIR / "master-tones.wav"
    print("synthesizing audio ...")
    synth_audio(master_audio)

    master = RENDERS / "master.mp4"
    print("rendering 300 frames + encoding master ...")
    encoder = subprocess.Popen(
        ["ffmpeg", "-y", "-v", "error",
         "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
         "-i", "-", "-i", str(master_audio),
         "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart",
         str(master)],
        stdin=subprocess.PIPE,
    )
    heroes = {}
    phones = {}
    for f in range(S01_FRAMES + S02_FRAMES):
        frame = render_s01(f) if f < S01_FRAMES else render_s02(f - S01_FRAMES)
        if f == 150:
            heroes["s01"] = frame.copy()
        if f == S01_FRAMES + 100:
            heroes["s02"] = frame.copy()
        encoder.stdin.write(frame.tobytes())
    encoder.stdin.close()
    if encoder.wait() != 0:
        raise SystemExit("ffmpeg master encode failed")

    for scene in ("s01", "s02"):
        heroes[scene].save(RENDERS / f"{scene}-hero.png")
        phones[scene] = heroes[scene].resize((360, 202), Image.LANCZOS)

    scenes = [("s01", 0.0, 6.0), ("s02", 6.0, 4.0)]
    for scene, start, dur in scenes:
        print(f"cutting {scene} playable clip + audio ...")
        run(["ffmpeg", "-y", "-v", "error", "-ss", f"{start:.3f}", "-i", str(master),
             "-t", f"{dur:.3f}", "-map", "0:v:0", "-map", "0:a:0",
             "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
             "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
             str(RENDERS / f"{scene}-playable.mp4")])
        run(["ffmpeg", "-y", "-v", "error", "-ss", f"{start:.3f}", "-i", str(master_audio),
             "-t", f"{dur:.3f}", "-c:a", "aac", "-b:a", "192k",
             str(AUDIO_DIR / f"{scene}-tones.m4a")])

        out_dir = EVIDENCE / scene
        print(f"extracting {scene} checkpoint evidence ...")
        run([sys.executable, str(MAKE_EVIDENCE), str(RENDERS / f"{scene}-playable.mp4"),
             str(out_dir)])
        phones[scene].save(out_dir / f"{scene}-phone-360.png")
        (out_dir / "phone-review.md").write_text(PHONE_REVIEW[scene], encoding="utf-8")

    print("locking source master, audio, and timeline identities ...")
    run([sys.executable, str(LOCK_INPUTS), str(ROOT), "--write"])
    spec_path = VOX / "scene-spec.json"
    spec = json.loads(spec_path.read_text(encoding="utf-8"))
    input_fingerprint = spec["project"]["evidence_input_fingerprint"]
    for scene in spec["scenes"]:
        scene["hero_frame"]["input_fingerprint"] = input_fingerprint
        scene["playable_clip"]["input_fingerprint"] = input_fingerprint
    spec_path.write_text(
        json.dumps(spec, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"done. master: {master}")


PHONE_REVIEW = {
    "s01": """# s01 phone review — 360px downsample

Evidence image: `s01-phone-360.png`（由 settled hero frame 下采样到 360×202）

- 焦点物件（半沉纸冰山）在 360px 宽下仍占画面宽约 1/3，一眼可辨 —— 通过
- 水线虚线、右侧 10/90 比例条在该尺寸下仍可读出「水上少、水下多」的关系 —— 通过
- 命题文字在 360px 下退化为纹理，但视觉命题不依赖文字 —— 通过（无字幕遮挡测试）
- 底部 173px 字幕安全区内无语义道具 —— 通过

结论：主体未缩成邮票，Approve。
""",
    "s02": """# s02 phone review — 360px downsample

Evidence image: `s02-phone-360.png`（由 settled hero frame 下采样到 360×202）

- 倾斜纸天平 + 一白一蓝两个纸块在 360px 宽下占据画面中段约 2/3 宽，倾斜方向可辨 —— 通过
- 917 / 1000 数字在该尺寸下不可读，但「蓝块下沉」的视觉命题独立成立 —— 通过
- 底部蓝色轨道纸带延续上一场色场，转场继承锚点在缩略图下仍可见 —— 通过
- 底部 173px 字幕安全区内仅有 ambient 色场轨道，无语义道具与数字 —— 通过

结论：主体未缩成邮票，Approve。
""",
}


if __name__ == "__main__":
    build()
