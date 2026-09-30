# Qingyun Cinematic Video Editor

[English](README.md) | [简体中文](README.zh-CN.md)

`qingyun-cine-skill` is a Codex skill for cinematic video editing workflows. It is designed for trailers, teasers, fast montage edits, music beat-sync cuts, short-form promos, character highlights, game or film reels, guofeng/xianxia edits, action promos, and story-driven recuts.

The core design is simple: **plan first, render after approval**. The skill helps Codex analyze footage, build a clear editing blueprint, wait for user confirmation, and only then render the final video.

## What It Does

This skill turns a loose editing request such as "make this trailer more cinematic" into a structured post-production workflow:

1. Understand the goal, source assets, format, duration, tone, subtitle needs, and music direction.
2. Analyze footage and audio before cutting.
3. Generate a shot manifest and contact sheet for review.
4. Design the rhythm, narrative arc, dialogue placement, title cards, subtitles, sound design, and QC targets.
5. Output a blueprint for approval.
6. Render only after the user explicitly confirms.

This prevents premature rendering and keeps creative control visible before time-consuming exports begin.

## Key Features

### PLAN-FIRST Workflow

The skill defaults to a two-phase workflow:

- **Phase 1: Blueprint only**
  - Create analysis files and edit plans.
  - No final MP4/MOV render.
  - Wait for explicit approval.

- **Phase 2: Render after approval**
  - Render from the approved `edit_plan.json`.
  - Mix audio, export the final cut, and run quality checks.

Only explicit instructions such as "directly render", "skip the plan", or "no confirmation needed" allow bypassing the approval step. Even then, the skill still creates an internal edit plan before rendering.

### Trailer-Level Story Structure

The skill guides edits around a cinematic structure instead of simple chronological stitching:

- Hook
- Setup
- Mystery or conflict
- Escalation
- Climax
- Title or logo landing

This is especially useful for trailers, action reels, character highlights, and short promotional films where the video needs to create a question, build pressure, and land with a memorable ending.

### Shot Analysis And Selection

Phase 1 can generate:

- `source_info.json` or `media_inventory.md`
- `shot_manifest.csv`
- `contact_sheet.jpg`

The shot manifest can include timing, duration, visual description, energy score, narrative function, dialogue status, and recommended usage. This helps separate strong trailer material from weak, repetitive, or low-quality shots.

### Beat-Sync And Music Planning

The skill supports music-driven edits with:

- Beat and impact point detection
- Drop and breakdown mapping
- Dialogue windows
- BGM ducking plans
- SFX moments such as hits, whooshes, risers, and sub drops

It is built for fast cuts, hard impacts, and controlled pacing rather than random montage.

### Dialogue, Subtitles, And Text Strategy

The blueprint can define:

- Whether to keep original dialogue
- Where dialogue should sit in the timeline
- How much the BGM should duck under speech
- Whether subtitles should be omitted, dialogue-only, or burned in
- Title card timing, duration, and tagline placement

This keeps text intentional and prevents the edit from becoming overloaded with captions or explanatory cards.

### Quality Control

The skill requires a QC plan or report that can check:

- Duration
- Resolution
- FPS
- Audio loudness and true peak
- Black frames or bad frames
- Repeated shots
- Long static shots
- Subtitle readability
- Title readability
- Whether the result feels like a finished trailer rather than a raw material showcase

### Privacy And Git Hygiene

The skill includes explicit rules to avoid leaking private information when preparing public repositories or reusable templates:

- Do not commit raw video, audio, renders, extracted frames, contact sheets, or private assets.
- Do not commit real local paths, usernames, project folders, tokens, cookies, or API keys.
- Use placeholders such as `<SOURCE_VIDEO>` and relative paths such as `sources/source_a.mp4`.
- Keep working media in ignored folders such as `work/`, `outputs/`, `render/`, `frames/`, or `stems/`.

## When To Use It

Use this skill when the user asks for:

- "剪一个预告片"
- "做电影级预告片"
- "优化这个混剪"
- "重剪一版"
- "剪得燃一点"
- "做短视频"
- "做宣传片"
- "做片花"
- "角色高光"
- "音乐卡点"
- "强踩点混剪"
- "保留对白"
- "加音效"
- "对齐鼓点"
- "film trailer"
- "promo video"
- "highlight reel"
- "beat-sync edit"

## Installation

Clone this repository into your Codex skills directory:

```bash
git clone https://github.com/qingyunAGI/qingyun-cine-skill.git ~/.codex/skills/qingyun-cine-skill
```

Restart Codex or reload skills if your environment requires it.

## Basic Operation

### 1. Provide The Editing Request

Example:

```text
帮我把这些素材剪成一个 35 秒电影级动作预告片，节奏要快，保留少量对白，结尾有片名卡。
```

If available, provide:

- Source video paths
- BGM or music direction
- Target duration
- Aspect ratio
- Platform
- Subtitle preference
- Tone references
- Must-use or must-avoid shots

If some details are missing, the skill should choose reasonable defaults and write assumptions into `intake_summary.md`.

### 2. Phase 1: Review The Blueprint

The skill should generate planning artifacts such as:

- `intake_summary.md`
- `media_inventory.md` or `source_info.json`
- `shot_manifest.csv`
- `contact_sheet.jpg`
- `beat_sheet.md`
- `edit_plan.json`
- `qc_plan.md` or preliminary `qc_report.txt`

At this stage, no final rendered video should exist.

### 3. Confirm Or Revise

Review the plan and respond with one of the following:

```text
按这个方案剪
```

```text
开始渲染
```

```text
可以出成片
```

Or request revisions:

```text
开头再狠一点，减少对白，把高潮提前到 25 秒。
```

### 4. Phase 2: Render And QC

After approval, the skill renders the final video and writes the QC report. A typical final delivery includes:

- Final MP4/MOV
- Final `qc_report.txt`
- Optional final contact sheet or keyframe check images
- Updated `edit_plan.json` if render-time changes were made

## Output File Overview

| File | Purpose |
| --- | --- |
| `intake_summary.md` | Captures goals, assumptions, missing information, and defaults. |
| `media_inventory.md` / `source_info.json` | Records source media duration, FPS, resolution, codecs, audio status, and quality notes. |
| `shot_manifest.csv` | Lists detected or selected shots with timing, energy, function, and recommended use. |
| `contact_sheet.jpg` | Visual overview for quick shot review. |
| `beat_sheet.md` | Human-readable edit structure and rhythm plan. |
| `edit_plan.json` | Machine-readable timeline plan used for rendering and audit. |
| `qc_report.txt` | Final quality-control notes after render. |

## Advantages

### Better Creative Alignment

Because the edit blueprint is visible before rendering, the user can approve the story structure, pacing, subtitle strategy, title card, and audio plan early. This reduces wasted render cycles and avoids the common "technically finished, creatively wrong" problem.

### More Cinematic Results

The skill pushes Codex to think like an editor: open with a hook, build mystery, escalate action, land the climax, and close with a memorable title or logo. This makes the final cut feel directed rather than assembled.

### Faster Iteration

With `beat_sheet.md` and `edit_plan.json`, revisions can target specific timeline regions instead of restarting from scratch. The user can say "make 15-25s faster" or "replace the second dialogue beat" and the plan remains auditable.

### Reproducible Rendering

The `edit_plan.json` timeline makes the edit easier to reproduce, debug, and revise. It records source ranges, timeline positions, visual roles, audio intent, title cards, subtitles, and QC targets.

### Safer Public Sharing

The skill includes privacy rules for Git repositories and reusable templates. It helps prevent accidental commits of private footage, local paths, generated renders, extracted frames, credentials, or unreleased project details.

### Flexible Across Genres

The workflow is not limited to one style. It can adapt to:

- Film trailers
- Action reels
- Guofeng/xianxia promos
- Game trailers
- Product promos
- Social short videos
- Character highlights
- Event recaps
- Music-driven montage edits

## Repository Structure

```text
qingyun-cine-skill/
├── SKILL.md
├── README.md
├── agents/
│   └── openai.yaml
├── references/
│   ├── beat-sync-editing.md
│   ├── cinematic-trailer-playbook.md
│   └── dialogue-and-sound.md
└── scripts/
    ├── analyze_bgm_hits.py
    ├── audit_cut_plan.py
    ├── build_trailer.py
    ├── make_preview_grid.py
    └── media_inventory.py
```

## Example Prompts

```text
帮我基于这些素材做一个 30 秒以内的电影级预告片。先不要渲染，先给我剪辑蓝图和镜头计划。
```

```text
优化这个混剪，开头 3 秒必须抓人，动作段要强踩点，保留两句对白，最后落片名。
```

```text
把这段游戏素材剪成角色高光短片，节奏燃一点，输出前先给 beat sheet 和 edit plan。
```

```text
我想直接出成片，无需确认，但你仍然先内部生成 edit_plan.json 再渲染。
```

## Notes For Contributors

Before committing changes to this repository, scan for sensitive content:

```bash
rg -n "/Users|/home|Downloads|Movies|Desktop|Documents|token|api[_-]?key|secret|password|cookie|Authorization|Bearer" .
find . -type f \( -name "*.mp4" -o -name "*.mov" -o -name "*.mp3" -o -name "*.wav" -o -name "*.jpg" -o -name "*.png" \) -print
```

Do not commit generated video projects, raw media, private paths, or credentials.
