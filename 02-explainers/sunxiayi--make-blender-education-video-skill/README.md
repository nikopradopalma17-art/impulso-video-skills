# Make Blender Education Video

An installable Codex and Claude Code skill for creating fact-checked English cinematic educational videos in Blender.

The skill guides an AI coding agent through the full production process: collecting a precise brief, researching and fact-checking the subject, finding reusable Blender workflows on GitHub, designing the explanation, building the scene, approving one representative frame, animating, burning in subtitles, and verifying the final video.

## Demos

These videos were created with the AI-agent and Blender workflow captured by this skill. The embedded previews are lightweight 540p versions; each demo also links to its original 4K MP4.

### Inside NVIDIA H100

60 seconds, English.

https://github.com/user-attachments/assets/952a50de-8dce-4ac0-97fb-eaf98bd62518

[Open the original 4K MP4](https://github.com/sunxiayi/make-blender-education-video-skill/releases/download/demos-v1/inside_nvidia_h100_60s_english_kokoro_4k.mp4)

### How the heart pumps blood

60 seconds, English and Chinese.

https://github.com/user-attachments/assets/6a985ffb-cf25-4d71-a288-d47c0d51c06f

[Open the original 4K MP4](https://github.com/sunxiayi/make-blender-education-video-skill/releases/download/demos-v1/how_the_heart_pumps_blood_v4_60s_bilingual_4k.mp4)

### How a four-stroke engine works

62 seconds, native-speed narration.

https://github.com/user-attachments/assets/4327dd1f-db69-49b5-bb6e-58f5cfea0fa0

[Open the original 4K MP4](https://github.com/sunxiayi/make-blender-education-video-skill/releases/download/demos-v1/how_a_four_stroke_engine_works_4k_no_speed.mp4)

### How a typical American house is built

92 seconds.

https://github.com/user-attachments/assets/b3fceacd-7802-4b4a-a04b-cfa32c663cdd

[Open the original 4K MP4](https://github.com/sunxiayi/make-blender-education-video-skill/releases/download/demos-v1/how_a_typical_american_house_is_built_4k.mp4)

## What it enforces

- English cinematic explainers only
- A required duration, audience, learning outcome, and visual reference
- A clear choice between agent-led research and user-supplied sources
- A claim ledger for factual, geometric, temporal, and visual accuracy
- A GitHub search for reusable, properly licensed Blender resources
- Exactly one 4K approval frame before any full-video render
- Large burned-in subtitles designed for readability
- Frame-exact assembly and final media QA

## Install for Codex

Download or clone this repository, then copy the skill into your Codex skills directory:

```bash
mkdir -p ~/.codex/skills
cp -R skills/make-blender-education-video ~/.codex/skills/
```

Restart Codex if the skill does not appear immediately.

## Install for Claude Code

Claude Code supports the same `SKILL.md` package directly. For a personal installation, copy the canonical skill folder:

```bash
mkdir -p ~/.claude/skills
cp -R skills/make-blender-education-video ~/.claude/skills/
```

This repository is also a Claude Code plugin. Clone it under Claude's personal skills directory to keep the full repository structure and plugin metadata:

```bash
git clone https://github.com/sunxiayi/make-blender-education-video-skill.git \
  ~/.claude/skills/blender-education-video
```

Restart Claude Code after installation. When installed as a plugin, the explicit command is:

```text
/blender-education-video:make-blender-education-video
```

To test a local checkout without installing it:

```bash
claude --plugin-dir .
```

## Requirements

- Codex or Claude Code with web, filesystem, and shell access
- Blender installed and runnable. This is a hard prerequisite; download it from the [official Blender website](https://www.blender.org/download/) before using the skill.
- Python 3.9 or newer
- FFmpeg and FFprobe; FFmpeg should include H.264/H.265 encoding and libass subtitle support
- Enough local storage and render capacity for the requested resolution and duration

Topic-specific models, templates, add-ons, and TTS systems are optional. The skill evaluates them per project rather than bundling unreviewed third-party assets.

## Use

In Codex, invoke the skill explicitly:

```text
Use $make-blender-education-video to create a cinematic explainer showing how a heat pump works.
```

The agent will first ask for the duration, audience, learning outcome, visual reference or style direction, and research approach. It should not start production until those inputs are confirmed.

## Repository layout

```text
.claude-plugin/plugin.json
skills/make-blender-education-video/
├── SKILL.md
├── agents/openai.yaml
├── assets/
├── references/
└── scripts/
```

`.claude-plugin/plugin.json` exposes the repository as a Claude Code plugin. `agents/openai.yaml` supplies Codex-specific display metadata. Both agents use the same canonical `SKILL.md`, references, assets, and scripts.

The Python utilities initialize a safe project structure, assemble a frame-exact picture master, burn in narration and ASS overlays, and verify the encoded output. They do not replace Blender or generate subject-specific geometry by themselves.

## Safety and licensing

The skill requires the agent to inspect third-party repositories, code, dependencies, asset provenance, and licenses before reuse. A repository license may not cover every bundled model, texture, dataset, font, or audio file.

No third-party Blender models or reference videos are bundled with the installable skill. Demo videos are published separately as GitHub Release assets. External projects mentioned by the skill are discovery candidates, not dependencies or factual authorities.

## License

MIT. See [LICENSE](LICENSE).
