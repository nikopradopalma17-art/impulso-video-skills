# Changelog

All notable changes to the standalone distribution of `xingchen-vox-collage` are documented here. The core skill itself is byte-identical to the upstream export (see [UPSTREAM.md](UPSTREAM.md)); this changelog tracks the release layer (docs, scripts, examples, packaging).

## [0.2.0] - 2026-07-22

### Added

- Lightweight free-form creative exploration plus a copyable visual-ambition brief; no asset, layer, shot, or motion quotas.
- Publication-safe `creative-exploration-packet` design example and explicit smoke-fixture labeling for `minimal-8s`.
- Deterministic source-master, audio/timeline, and evidence-input fingerprints through `lock_vox_inputs.py`.
- Strict stale-evidence checks and conservative gross audio/timeline duration mismatch detection.

### Changed

- Hero-frame-first is now an authoring default with a documented representative in-motion-frame exception.
- Phone-review documentation now states that scripts verify artifact existence, while readability and visual approval remain human judgments.
- Evidence extraction records locked input identities, and the standalone example carries schema `1.4.0` fingerprints.

### Fixed

- Prevented an 86-second final master from passing strict validation while all scenes still referenced a stale 123-second narration file.

## [0.1.0] - 2026-07-21

### Added

- First standalone release of the Vox-Inspired Editorial Video Skill (`xingchen-vox-collage`).
- Core skill exported byte-for-byte from upstream `xingchen-skill-family` tag `v2026.07.21` (commit `b52efe58c1fdaab33e70858cbf15645c9219e298`, tree `b33f9630e6c3c08e57fbffd8a4f894daf071afcf`).
- Chinese and English READMEs with install, minimal prompt, failure-case fixes, cost model, and degradation path.
- `UPSTREAM.md` single-source-of-truth and anti-drift policy, plus `UPSTREAM_MANIFEST.json`.
- Release tooling: `scripts/build-release.ps1`, `scripts/verify-standalone.ps1`, `scripts/check-upstream-drift.ps1` (Windows PowerShell 5.1 compatible).
