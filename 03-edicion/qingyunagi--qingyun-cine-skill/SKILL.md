---
name: qingyun-cine-skill
description: PLAN-FIRST cinematic video editing workflow for trailers, teasers, montage videos, short-form edits, music beat-sync 卡点 videos, promo films, showreels, character highlights, game/film/action/guofeng edits, and re-cuts from local video, audio, image, title, and brand assets. Use this skill whenever the user asks to 剪辑视频, 做预告片, 做电影级预告片, 优化混剪, 重剪一版, 做短视频, 卡点混剪, 剪得燃一点, 做宣传片, 做片花, 做角色高光, 加对白, 加音效, 对齐鼓点, or otherwise create or improve an edited video. Default behavior is always blueprint first, user approval second, render last.
---

# Qingyun Cinematic Video Editor

## Name

`qingyun-cine-skill`

## Description

Create directed, polished video edits from source media: cinematic trailers, teaser edits, fast montage cuts, music beat-sync edits, promo films, social short videos, character highlights, game or film recaps, action reels, guofeng/xianxia edits, title cards, logo endings, and cinematic posters/key visuals.

This skill is a **PLAN-FIRST two-phase workflow**. On first contact, do not render a final movie unless a bypass condition is explicitly met. First produce the editing blueprint, then wait for the user's confirmation.

## Trigger Phrases

Use this skill for Chinese or English requests like:

- "帮我剪一个预告片", "做电影级预告片", "剪个大片感预告"
- "优化这个混剪", "给这个片子重剪一版", "剪得燃一点"
- "做个短视频", "做宣传片", "做片花", "做角色高光"
- "音乐卡点", "卡点混剪", "对齐鼓点", "强踩点"
- "加对白", "保留原声", "加音效", "做片头片尾"
- "game trailer", "film trailer", "promo video", "highlight reel", "beat sync edit"

When the request is about video editing, trailer structure, pacing, shot choice, dialogue/sound design, title cards, or final video delivery, assume this skill applies.

## Non-Negotiable Rules

1. Default to **PLAN-FIRST mode** for every triggered request.
2. Do **not** render a final trailer, final cut, exported MP4/MOV, or final video in Phase 1.
3. Phase 1 may generate analysis files, contact sheets, shot manifests, beat sheets, and edit plans.
4. Only enter Phase 2 after explicit approval such as "按这个方案剪", "开始渲染", "可以出成片", "确认执行", "OK 渲染", or equivalent.
5. If the user explicitly says "直接出成片", "无需确认", "跳过方案", or equivalent, bypass approval is allowed, but still create an internal `edit_plan.json` before rendering.
6. If information is incomplete, do not stall. Use reasonable defaults and write assumptions into `intake_summary.md`.
7. Ask the user for files only when required source video, audio, image, or asset paths are missing or inaccessible.
8. At the end of Phase 1, explicitly tell the user: **no final video has been rendered yet and you are waiting for confirmation**.
9. Preserve existing user files and prior renders. Use new versioned output names such as `trailer_v2.mp4`, `trailer_v7.mp4`, or `promo_cut_v1.mp4`.
10. Treat every edit as directed storytelling, not file stitching: hook, setup, escalation, climax, title/logo landing.
11. Keep reusable docs, examples, schemas, and Git-bound artifacts privacy-safe: do not include real usernames, home directories, project names, API tokens, cookies, or private media paths.

## Phase 1: Blueprint Only

Goal: build the edit plan and let the user approve the creative direction before rendering.

Do these steps:

1. Intake
   - Identify target format, duration, aspect ratio, tone, platform, language, subtitle preference, and music/dialogue needs.
   - If details are missing, choose defaults and document them in `intake_summary.md`.
   - If source files are missing, ask for them before analysis.

2. Media analysis
   - Probe source media for duration, fps, resolution, orientation, codecs, audio presence, loudness, and obvious quality issues.
   - Detect or manually segment shots/scenes.
   - Generate `shot_manifest.csv` with usable shot candidates and rejection notes.
   - Generate `contact_sheet.jpg` or equivalent preview sheets.

3. Story and rhythm design
   - Create a story spine: hook, premise, mystery/problem, escalation, climax, title/logo.
   - Map music energy, beat/drop points, dialogue windows, sound-design hits, and silence/ducking moments.
   - Decide subtitle usage, title-card usage, text density, and typography direction.

4. Edit plan
   - Create `beat_sheet.md`.
   - Create `edit_plan.json` with clip timings, source ranges, roles, audio intent, and text/title items.
   - Audit repeated shots, long static shots, weak images, off-brief material, dialogue length, and title-card readability.

5. Phase 1 closeout
   - Summarize the blueprint and the files generated.
   - State clearly that no final video has been rendered.
   - Ask for explicit approval to render or revise the plan.

Do not export a final MP4/MOV during Phase 1.

## Phase 2: Render After Approval

Enter Phase 2 only when the user explicitly confirms the blueprint or invokes a bypass condition.

Do these steps:

1. Render from the approved `edit_plan.json`.
2. Mix audio according to the approved sound plan: BGM, original dialogue, SFX, ducking, final limiter, and tail.
3. Export with versioned filename and stable settings.
4. Generate final contact sheet and keyframe checks.
5. Run QC: duration, resolution, fps, audio loudness/peaks, black frames, repeated shots, title readability, subtitle readability if subtitles exist.
6. Write or update `qc_report.txt`.
7. Deliver the final video path and the QC summary.

## Required Output Files

Phase 1 default outputs:

- `intake_summary.md`
- `source_info.json` or `media_inventory.md`
- `shot_manifest.csv`
- `contact_sheet.jpg`
- `beat_sheet.md`
- `edit_plan.json`
- `qc_plan.md` or preliminary `qc_report.txt`

Phase 2 default outputs:

- Final rendered video, for example `trailer_v1.mp4`
- Final `contact_sheet.jpg` or versioned preview grid
- Keyframe check images for hook, dialogue, action, climax, and title/logo
- Final `qc_report.txt`
- Updated `edit_plan.json` if render-time changes were made

If a deliverable is impossible or irrelevant, note the reason in `intake_summary.md` or `qc_report.txt`.

## Privacy And Git Hygiene

When preparing a skill, template, example repo, or any artifact that may be uploaded to Git:

- Do not commit raw source media, rendered videos, audio stems, contact sheets, thumbnails, extracted frames, waveform images, or user-provided private assets unless the user explicitly asks.
- Do not commit generated working directories such as `work/`, `outputs/`, `render/`, `cache/`, `tmp/`, `frames/`, `stems/`, or `downloads/`.
- Do not commit analysis files that contain private local paths, filenames, faces, client assets, or unreleased creative material unless they are sanitized.
- Do not store real absolute paths like `/Users/name/...`, `/home/name/...`, drive names, cloud-sync paths, project folders, or download folders in publishable files.
- Prefer relative paths such as `sources/source_a.mp4`, placeholders such as `<SOURCE_VIDEO>`, or environment variables such as `${PROJECT_ROOT}` in examples and public plans.
- If absolute paths are needed for an internal render, keep that file in an ignored local work directory and create a sanitized copy before sharing.
- Never commit `.env`, credentials, API keys, auth tokens, cookies, private CLI configs, SSH keys, service-account files, or generated transcripts containing private information.
- Use `.env.example` or `config.example.json` with fake values when configuration examples are useful.
- Before committing, run a privacy scan such as:

```bash
rg -n "/Users|/home|Downloads|Movies|Desktop|Documents|token|api[_-]?key|secret|password|cookie|Authorization|Bearer" .
find . -type f \( -name "*.mp4" -o -name "*.mov" -o -name "*.mp3" -o -name "*.wav" -o -name "*.jpg" -o -name "*.png" \) -print
```

Recommended `.gitignore` entries for editing projects:

```gitignore
.env
.env.*
!.env.example
work/
outputs/
render/
renders/
cache/
tmp/
frames/
stems/
downloads/
*.mp4
*.mov
*.m4v
*.mp3
*.wav
*.aac
*.jpg
*.jpeg
*.png
*.tiff
*.psd
*.aep
*.prproj
```

## edit_plan.json Schema

Use JSON that is explicit enough to render and audit:

```json
{
  "version": "v1",
  "mode": "film_trailer | beat_sync | promo | montage | highlight | short_video",
  "canvas": "1920x1080",
  "fps": 30,
  "duration_target_sec": 34,
  "output": "outputs/trailer_v1.mp4",
  "source_pool": {
    "A": "sources/source_a.mp4",
    "BGM": "sources/music.wav"
  },
  "assumptions": [
    "No subtitles unless user confirms.",
    "Use 16:9 horizontal master."
  ],
  "timeline": [
    {
      "t": 0.0,
      "dur": 0.8,
      "source_id": "A",
      "in": 12.4,
      "out": 13.2,
      "speed": 1.0,
      "role": "hook | setup | mystery | dialogue | action | vfx | climax | title",
      "visual_intent": "male eye close-up",
      "audio": "none | original_dialogue | bgm | hit | whoosh | riser | sub_drop",
      "subtitle": null,
      "notes": "why this shot belongs here"
    }
  ],
  "audio_plan": {
    "bgm_source_id": "BGM",
    "target_lufs": -14,
    "true_peak_max_db": -1,
    "dialogue_ducking_db": -9,
    "sfx_events": [
      { "t": 3.2, "kind": "hit", "purpose": "red woman reveal" }
    ]
  },
  "text_plan": {
    "subtitles": "none | dialogue_only | burned_in",
    "title_cards": [
      { "t": 31.5, "dur": 2.1, "text": "Title", "tagline": "Optional tagline" }
    ]
  },
  "qc_targets": {
    "max_duration_sec": 34,
    "no_static_non_title_over_sec": 1.5,
    "max_primary_vfx_reuse": 2
  }
}
```

## beat_sheet.md Schema

Use Markdown with these sections:

```markdown
# Beat Sheet

## Summary
- Deliverable:
- Duration:
- Aspect ratio / resolution:
- Tone:
- Core story question:

## Assumptions
- ...

## Structure
- 0.0-3.0s: Hook
- 3.0-8.0s: Setup
- 8.0-15.0s: Dialogue / mystery
- 15.0-27.0s: Escalation
- 27.0-31.5s: Climax
- 31.5-end: Title/logo

## Dialogue Plan
- Time range:
- Source:
- Purpose:
- Ducking:

## Music And SFX Plan
- BGM:
- Beat/drop points:
- Hits/whooshes/risers/sub drops:

## Subtitle And Text Plan
- Subtitles:
- Title card:
- Tagline:

## Shot Use Notes
- Keep:
- Shorten:
- Avoid:
- Use as flash:

## QC Plan
- Duration:
- Resolution/fps:
- Audio loudness/peaks:
- Repetition:
- Readability:
```

## qc_report.txt Requirements

For Phase 1, `qc_report.txt` or `qc_plan.md` must say it is preliminary and that no final video has been rendered.

For Phase 2, `qc_report.txt` must include:

- Final output path, duration, resolution, fps, codec, audio format, and size.
- Loudness and peak results when audio exists.
- Black-frame or freeze-frame checks when relevant.
- Contact sheet/keyframe review status.
- Repeated-shot audit summary.
- Subtitle readability status, or "no subtitles by user request".
- Title/logo readability status.
- Any known limitations, compromises, or missing assets.

## Bypass Conditions

Bypass Phase 1 confirmation only when the user explicitly says:

- "直接出成片"
- "无需确认"
- "跳过方案"
- "不要等我确认"
- "直接渲染"
- "just render it"
- "no need to confirm"

Even in bypass mode:

- Create `intake_summary.md` with assumptions.
- Create an internal `edit_plan.json` before rendering.
- Run final QC after rendering.
- Tell the user which assumptions were used.

Ambiguous urgency such as "快点", "尽快", or "你看着办" is **not** a bypass condition.

## Examples

Example 1:

User: "帮我剪一个 34 秒电影级预告片。"

Correct response:
- Analyze sources.
- Generate `intake_summary.md`, `shot_manifest.csv`, `contact_sheet.jpg`, `beat_sheet.md`, and `edit_plan.json`.
- Stop before rendering.
- Say: "目前还没有渲染成片，正在等待你确认。"

Example 2:

User: "OK，按这个方案剪，可以出成片。"

Correct response:
- Enter Phase 2.
- Render from the approved plan.
- Generate final video and QC files.

Example 3:

User: "直接出成片，不用确认。"

Correct response:
- Use bypass mode.
- Create `intake_summary.md` and `edit_plan.json` internally.
- Render and QC.
- Report assumptions and final output.

Example 4:

User: "剪得燃一点，做个卡点混剪。"

Correct response:
- Trigger this skill.
- Do not render yet.
- Build beat-sync blueprint with music-hit map, shot rhythm, SFX plan, and edit plan.
- Wait for explicit confirmation.
