# Claude GIF - Ultimate GIF Creator Skill for Claude Code

GIF creation skill for Claude Code with 6 generation pipelines: AI video-to-GIF (Veo 3.1), programmatic animations (Remotion), AI image sequences (Gemini/FLUX.2), animated SVG-to-transparent-GIF (Playwright), video conversion (FFmpeg), and GIF editing/optimization. Professional palette optimization, perfect loop creation, platform-specific sizing, and dithering control.

[![Claude Code Skill](https://img.shields.io/badge/Claude%20Code-Skill-blue)](https://claude.ai/claude-code)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Commands](#commands)
- [Generation Pipelines](#generation-pipelines)
- [Quality Presets](#quality-presets)
- [Architecture](#architecture)
- [Examples](#examples)
- [Requirements](#requirements)
- [Uninstall](#uninstall)
- [Contributing](#contributing)

## Installation

### Manual Install (Unix/macOS/Linux)

```bash
git clone --depth 1 https://github.com/AgriciDaniel/claude-gif.git
bash claude-gif/install.sh
```

<details>
<summary>One-liner (curl)</summary>

```bash
curl -fsSL https://raw.githubusercontent.com/AgriciDaniel/claude-gif/main/install.sh | bash
```

Prefer to review the script first?

```bash
curl -fsSL https://raw.githubusercontent.com/AgriciDaniel/claude-gif/main/install.sh > install.sh
cat install.sh
bash install.sh
rm install.sh
```

</details>

After install, run `/gif setup` in Claude Code to check and install dependencies.

## Quick Start

```bash
# Interactive mode (detects intent, routes to the right pipeline)
/gif

# Convert a video to GIF
/gif convert video.mp4

# Create a programmatic animation
/gif create "loading spinner with bounce easing"

# Generate AI video and convert to GIF
/gif generate "coffee steam rising from a mug, close-up, loop"

# Optimize for Discord (under 256KB)
/gif optimize large.gif --platform discord

# Convert animated SVG to transparent GIF
/gif convert animation.svg
```

## Commands

| Command | What it does |
|---------|-------------|
| `/gif` | Interactive mode - detects intent, routes to sub-skill |
| `/gif create <idea>` | Programmatic GIF via Remotion (text, spinners, charts) |
| `/gif generate <idea>` | AI video via Veo 3.1, converted to optimized GIF |
| `/gif convert <path>` | Video, images, or animated SVG to GIF |
| `/gif optimize <path>` | Reduce file size with multi-strategy optimization |
| `/gif edit <path>` | Speed, reverse, crop, text overlay, ping-pong, trim |
| `/gif setup` | Install dependencies and verify tools |

## Generation Pipelines

### 1. Remotion (Programmatic Animation)

Claude writes React components with `useCurrentFrame()`, `spring()`, and `interpolate()`. Remotion renders to PNG frames, then assembles with two-pass palette optimization.

Best for: text animations, loading spinners, data visualizations, meme templates, motion graphics.

### 2. Veo 3.1 (AI Video to GIF)

Generates short AI video clips via Google Veo 3.1, converts to optimized GIF with optional perfect loop blending. Cost: ~$0.60-$4.00 per clip.

Best for: cinematic loops, product demos, abstract art, realistic motion.

### 3. SVG to Transparent GIF (Playwright)

Renders animated SVGs (SMIL/CSS) frame-by-frame in headless Chromium with `omitBackground: true`, producing transparent PNGs assembled into transparent GIFs.

Best for: icons, logos, UI micro-interactions, embeddable stickers. Zero new dependencies if Playwright is already installed.

### 4. Video to GIF (FFmpeg)

Two-pass palette pipeline: `palettegen` analyzes all frames for optimal 256-color palette, `paletteuse` renders with dithering and `diff_mode=rectangle` (only encodes changed pixels).

Best for: screen recordings, movie clips, reaction GIFs.

### 5. Image Sequence to GIF

Assembles a directory of images (PNG, JPG, WebP) into an animated GIF with natural sort ordering and palette optimization.

Best for: stop-motion, photo sequences, frame-by-frame art.

### 6. AI Image Sequence to GIF

Generates N frames with progressive prompt changes via Gemini or FLUX.2, then assembles into animated GIF.

Best for: morphing effects, illustrated animations, sticker-style GIFs.

## Quality Presets

| Preset | Width | FPS | Colors | Dither | Target Size | Use Case |
|--------|-------|-----|--------|--------|-------------|----------|
| `discord` | 320 | 10 | 128 | bayer | 256 KB | Discord inline |
| `slack` | 400 | 12 | 192 | floyd_steinberg | 500 KB | Slack messages |
| `twitter` | 480 | 15 | 256 | floyd_steinberg | 15 MB | Twitter/X posts |
| `web` | 480 | 15 | 256 | floyd_steinberg | 2 MB | General web |
| `hq` | 640 | 20 | 256 | sierra2 | 10 MB | High quality |

```bash
# Use a preset
bash scripts/gif_convert.sh --input video.mp4 --preset discord --output out.gif

# Platform auto-fit (iterates optimization until under target)
python3 scripts/gif_optimize.py --input big.gif --platform discord
```

## Architecture

```
claude-gif/                        Parent orchestrator
  SKILL.md                         Command routing, presets, safety rules
  scripts/
    gif_convert.sh                 Core FFmpeg two-pass palette pipeline
    gif_optimize.py                Multi-strategy size reduction
    gif_loop.py                    Perfect loop crossfade blending
    gif_frames.py                  Frame extraction, assembly, SVG render
    setup.sh                       Dependency installer
    preflight.sh                   Safety checks
    check_deps.sh                  Dependency status (JSON)
  references/
    gif-optimization.md            Palette, dithering, color quantization
    platform-specs.md              Size limits per platform
    remotion-gif.md                Remotion animation patterns
    prompt-engineering.md           Veo prompts for loopable clips
    perfect-loops.md               Seamless loop techniques

claude-gif-create/                 Sub-skill: Remotion pipeline
claude-gif-generate/               Sub-skill: Veo AI video to GIF
claude-gif-convert/                Sub-skill: Video/images/SVG to GIF
claude-gif-optimize/               Sub-skill: Size and quality tuning
claude-gif-edit/                   Sub-skill: Modify existing GIFs
```

### Integration with Existing Skills

| Resource | Reused From | Purpose |
|----------|-------------|---------|
| `veo/scripts/generate.py` | claude-video / veo skill | Veo 3.1 video generation |
| `claude-video/scripts/image_generate.py` | claude-video skill | FLUX.2 local image generation |
| `gemini_generate_image` MCP tool | banana skill | Gemini API image generation |
| `~/.video-skill/` venv | claude-video skill | Python AI packages (Pillow, numpy) |

## Examples

### Perfect Loop Creation

```bash
# Assess how well a GIF loops (MAE score)
python3 scripts/gif_loop.py --input animation.gif --assess

# Create seamless loop with crossfade blending
python3 scripts/gif_loop.py --input animation.gif --method crossfade --frames 5

# Ping-pong loop (forward then reverse)
python3 scripts/gif_loop.py --input animation.gif --method pingpong
```

### Multi-Step Pipeline

```bash
# Generate AI video, convert to GIF, optimize for Slack
/gif generate "flickering candle flame, close-up, dark background"
# Then: /gif optimize output.gif --platform slack
```

### Animated SVG to Transparent GIF

```bash
# Render SVG animation at 20fps for 3 seconds
python3 scripts/gif_frames.py --svg animation.svg --output icon.gif \
  --fps 20 --width 200 --height 200 --svg-duration 3
```

## Requirements

**Required:**
- FFmpeg 6.0+
- Python 3.10+ with Pillow and numpy

**Optional (by pipeline):**
- Node.js 18+ (Remotion pipeline)
- Playwright + Chromium (SVG to GIF pipeline)
- gifsicle (lossy optimization - 30-50% extra size reduction)
- Veo API key / `GEMINI_API_KEY` (AI video generation)
- ImageMagick (fallback operations)

Run `/gif setup` to check all dependencies and install missing ones.

## Uninstall

```bash
git clone --depth 1 https://github.com/AgriciDaniel/claude-gif.git
bash claude-gif/uninstall.sh
```

<details>
<summary>One-liner (curl)</summary>

```bash
curl -fsSL https://raw.githubusercontent.com/AgriciDaniel/claude-gif/main/uninstall.sh | bash
```

</details>

## Ecosystem

Claude GIF is part of a family of Claude Code skills:

| Skill | What it does | How it connects |
|-------|-------------|-----------------|
| [Claude GIF](https://github.com/AgriciDaniel/claude-gif) | GIF creation, optimization, editing | Core - 6 generation pipelines |
| [Claude Video](https://github.com/AgriciDaniel/claude-video) | Video production suite | Provides Veo scripts and AI image generation |
| [Claude SEO](https://github.com/AgriciDaniel/claude-seo) | SEO analysis and audits | GIFs for OG images and content assets |
| [Claude Banana](https://github.com/AgriciDaniel/banana-claude) | AI image generation via Gemini | Generates frames for animated GIF sequences |

## Contributing

Contributions welcome! Please open an issue or submit a PR.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built for Claude Code by [@AgriciDaniel](https://github.com/AgriciDaniel)

---

## Author

Built by [Agrici Daniel](https://agricidaniel.com/about) - AI Workflow Architect.

- [Blog](https://agricidaniel.com/blog) - Deep dives on AI marketing automation
- [AI Marketing Hub](https://www.skool.com/ai-marketing-hub) - Free community, 2,800+ members
- [YouTube](https://www.youtube.com/@AgriciDaniel) - Tutorials and demos
- [All open-source tools](https://github.com/AgriciDaniel)
