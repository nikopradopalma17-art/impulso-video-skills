# Vox-Inspired Editorial Video Skill

> Turn knowledge narration into a Vox-inspired film with visual ambition, editorial-collage texture, and frame-precise editability.

**Repository**: `voxstylehub-steven` ｜ **Internal skill directory**: `xingchen-vox-collage`

[中文 README](README.md)

---

## What it does in 15 seconds

This is a Codex skill for creators of knowledge / history / science / humanities / biography short videos. Give it a narration script and it produces an original editorial paper-collage explainer video using **Codex + Remotion + optional image/video generation tools**:

- Exact text, numbers, charts, and timing are all controlled by Remotion code — fixing a typo never means regenerating an image;
- Background / subject / props / foreground are independent layered assets you can edit or swap one at a time;
- A lightweight creative exploration happens before implementation, actively looking for material opportunities, spatial mechanisms, and meaningful motion;
- Video-generation credits are spent only on key shots that genuinely need continuous material motion; everything else renders deterministically.

## Pipeline (text diagram)

```
narration → creative exploration → visual proposition → hero/representative frame → independent materials → semantic motion → final cut
```

1. **Narration**: you provide the voiceover script or real audio timing;
2. **Creative exploration**: short free-form prose compares visual routes, material opportunities, sparse passages, and the narrative job of motion — no form and no score;
3. **Visual proposition**: each scene states what the picture must prove, not merely which nouns it contains;
4. **Hero / representative frame**: review a settled key frame by default; when meaning exists only in motion, review a representative in-motion frame and record why;
5. **Independent materials and motion**: split assets according to the chosen mechanism, and make motion establish hierarchy, causality, or a turn rather than adding generic energy;
6. **Final cut**: strict technical validation plus actual human viewing. Scripts prove artifact existence and input identity; people judge phone-size readability and visual quality.

## Minimal install

Copy `xingchen-vox-collage/` into your Codex skills directory (`~/.codex/skills/` or `~/.agents/skills/`).

Windows (PowerShell):

```powershell
Copy-Item -Recurse .\xingchen-vox-collage "$env:USERPROFILE\.codex\skills\"
```

macOS / Linux (bash):

```bash
cp -r xingchen-vox-collage ~/.codex/skills/
```

Dependencies:

- **FFmpeg**: required (strict validation and evidence generation decode video);
- **Python 3.10+**: required (the skill's init / validate / evidence scripts);
- **Node 18+ + Remotion**: optional, only when your project renders with Remotion.

## Minimal prompt

```
用 xingchen-vox-collage 把下面口播制作成 Vox-inspired 编辑拼贴视频。开工前先用一小段文字比较几种视觉路线，主动寻找素材机会并指出最可能变空或重复的段落；再提炼视觉命题、审 Hero Frame 或运动代表帧，按创意需要拆分独立素材。精确文字和时间由 Remotion 控制，动效必须帮助叙事。输出导演板、scene-spec、完整预览和严格验证证据。口播如下：……
```

(The prompt is written in Chinese because the skill's authoring workflow and contracts are Chinese-first; it works as-is when pasted into Codex.)

## Three failure cases and their fixes

This workflow comes from three real failure types. Scripts check only what they can prove; visual judgment remains explicitly human.

### 1. `caption-only-static` — the "fake animation" where only captions move

- **Before**: across a whole explanatory interval, the only changing layers are subtitles and labels; the background is a static image — a PowerPoint that prints text.
- **After**: the picture is decomposed into layers with independent semantic roles (background / subject / props / foreground), each actor gets a motion tier and staggered entrances; the validator blocks the branch when subtitles are the only changing layer across an explanatory interval.

### 2. `semantic-subject-too-small` — the subject becomes a postage stamp at phone size

- **Before**: the composition looks great on a 27-inch monitor, but after the phone downsample the essential semantic subject shrinks to a postage stamp while decorative empty space dominates — viewers don't know where to look.
- **After**: create a phone-downsample artifact and actually inspect it. The validator confirms that `phone_review_ref` and related artifacts exist; subject scale, focal hierarchy, and negative space are human judgments. Artifact existence does not prove viewing or approval.

### 3. `transition-anchor-break` — an adjacent-scene cut drops all continuity

- **Before**: a hard cut between two adjacent scenes abandons material, object, rail, aperture, color-field, and motion continuity, ripping away the viewer's visual anchor without anyone recording that this was deliberate.
- **After**: every transition must declare an inherited anchor (at least one of material / object / rail / aperture / color-field / motion) or explicitly record an intentional reset; the validator checks the transition contract of every adjacent scene pair.

## Full fidelity first; low cost is a fallback capability

- **Exact text / charts / timing are all Remotion code**: headlines, Chinese text, dates, numbers, charts, maps, labels, captions, and proof highlights are code-rendered — free, deterministic, and editable without regenerating images;
- **Generation credits go only to key shots**: image/video generation is consumed solely where continuous material motion (fluttering paper, smoke, fluid) is truly needed; everything else renders deterministically;
- **Zero models can still verify the pipeline**: code-native SVG, solid-color paper, halftone dots, torn-paper edges, and geometric props can exercise the workflow without an image model. `examples/minimal-8s` validates the contract, render chain, and evidence chain; it is not the visual-quality ceiling.

One successful 86-second production happened to use 8 scenes, 103 layers, and 78 approved assets. Those are facts from one production, never recommended ranges or quotas. The skill asks the model to search for enough material and picture mechanisms; topic, rhythm, and actual viewing decide the final density.

## Example boundaries

- `examples/minimal-8s`: deterministic technical smoke fixture; proves install, render, evidence, and strict validation, not a golden film.
- `examples/creative-exploration-packet`: original publication-safe design packet showing how to raise visual ambition without prescribing layer or asset counts. It is a design packet, not a rendered-film claim.

## Advanced

### Strict validation (validate_vox_branch.py)

```powershell
# While authoring: allow pending evidence (missing evidence becomes warnings)
python <skills-dir>\xingchen-vox-collage\scripts\validate_vox_branch.py <project-root> --allow-pending

# Before delivery: strict mode (hero-frame resolution, playable clips, checkpoints,
# phone review, adjacent-scene transition contracts)
python <skills-dir>\xingchen-vox-collage\scripts\validate_vox_branch.py <project-root>
```

A `PASS` with warnings means the structure is usable; it is not visual approval.

### Evidence generation (make_visual_evidence.py / build_scene_evidence.py)

```powershell
# After rendering a clip, produce visual evidence (contact sheet, extracted frames)
python <skills-dir>\xingchen-vox-collage\scripts\make_visual_evidence.py <clip.mp4> <evidence-dir>

# After assembling a full master, cut per-scene clips plus entry/settled/exit frames
# from the Lean scene timings
python <skills-dir>\xingchen-vox-collage\scripts\lock_vox_inputs.py <project-root> --write
python <skills-dir>\xingchen-vox-collage\scripts\build_scene_evidence.py <project-root> <evidence-dir>
```

`lock_vox_inputs.py` locks the actual audio bytes, canonical scene timings, and source-master bytes. Any later input change invalidates old hero/playable evidence in strict validation. `build_scene_evidence.py` requires a minimal Lean-state contract in `project-state.json` and records the same fingerprint in its evidence index. `examples/minimal-8s` ships a fixture you can copy. **Without a project-state.json, `validate_vox_branch.py` remains fully usable** — the sync check is skipped automatically. The extractor refuses to overwrite a non-empty evidence directory.

### Relationship to the Xingchen family (optional integration, not a dependency)

The core workflow of `xingchen-vox-collage` is **fully usable standalone**: the `xingchen-next`, `xingchen-lookdev`, and `remotion-render-adapter` skills mentioned in SKILL.md are optional integration points. Without those siblings, the full pipeline — visual proposition, Hero Frame, layering, Remotion motion, strict validation — works unchanged.

If your project runs under `xingchen-next`, `project-state.json` synchronization is an optional enhancement: when Lean state exists, strict validation additionally checks that `scene-spec.json` matches `project-state.json` on scene order, beat_id, timing, and timeline revision; when it does not exist, the check is skipped silently.

### Upstream drift check (check-upstream-drift.ps1)

`xingchen-vox-collage/` in this repository is a byte-level deterministic export from the upstream repository (see [UPSTREAM.md](UPSTREAM.md)). If you ever suspect local modification:

```powershell
powershell -File .\scripts\check-upstream-drift.ps1
```

Without `-UpstreamClone`, the script shallow-clones the upstream tag into a temporary directory for comparison; any core-file difference is reported in red with a non-zero exit.

## Degraded path without image/video models

With no image or video generation model, the skill does not stall:

1. **All visual assets go code-native**: SVG illustration, solid-color paper substrates, halftone dots, torn-paper edges, and geometric props are generated in code — zero model calls;
2. **All motion is Remotion**: paper-native verbs (slide / reveal / peel / pivot / stamp / drop / trace / wipe) plus shallow depth-separated parallax, fully deterministic;
3. **Real-source crops**: your own or licensed archival images and screenshots can be cropped into editorial sheets along the source-collage route;
4. **Validation is unaffected**: strict validation, evidence generation, and phone-downsample review all keep working.

`examples/minimal-8s` proves the technical viability of this degraded path; it is not a full-fidelity visual showcase.

## Common errors

- **FFmpeg missing**: checks that depend on decoding (playable clips, full decode, evidence generation) fail loudly with `ffmpeg is unavailable` or `ffmpeg is required` — they never fake success. Install FFmpeg and confirm it is on PATH.
- **Evidence directory not empty**: `make_visual_evidence.py` / `build_scene_evidence.py` refuse to overwrite a non-empty evidence directory (`refusing to overwrite`). Point at an empty directory or archive the old evidence first.
- **scene-spec out of sync with project-state**: strict validation reports `scene-spec ... must match project-state ...` (scene order / beat_id / timing drift beyond one frame / timeline revision mismatch). One of the two sources of truth is stale — update scene-spec from project-state, or re-extract the evidence.
- **Hero frame resolution mismatch**: the `hero_frame` image must match the width/height declared in `scene-spec.json`, or strict validation fails. Regenerate the Hero Frame at the intended resolution — do not upscale to fudge it.
- **Stale input fingerprint**: after replacing narration, changing scene timing, or overwriting the master, strict validation reports a stale fingerprint. Run `lock_vox_inputs.py --write`, rebuild evidence, and record the new `evidence_input_fingerprint` in the reviewed hero/playable contracts. Never relabel old evidence with a new fingerprint.

## License and notices

- Code and original documentation in this repository are under the [MIT License](LICENSE) (Copyright (c) 2026 Phantomlau3674); MIT covers only the code and original documentation;
- Outputs of third-party models (image / video / TTS, etc.) are governed by the terms of the respective services;
- Rights to user-supplied material (narration, images, archival assets) must be cleared by the user;
- The name "Vox" is used only to describe a visual genre. This project is **not affiliated with Vox, nor does it copy Vox trademarks, layouts, or specific works**; it reuses causal grammar, not packaging;
- The repository examples contain no third-party restricted material.
