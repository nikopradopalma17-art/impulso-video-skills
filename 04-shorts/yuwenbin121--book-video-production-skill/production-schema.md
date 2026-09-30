# Production manifest

Use YAML or JSON. Keep paths explicit and timestamps in seconds.

```yaml
project:
  title: ""
  platform: "douyin"
  duration_target: 30
  width: 1080
  height: 1920
  fps: 30
  language: "zh-CN"
  engine: "hyperframes"
book:
  title: ""
  author: ""
  edition: ""
  isbn: ""
sources:
  - claim: ""
    url_or_path: ""
    source_type: "official|book|interview|review|reader"
    confidence: "high|medium|low"
assets:
  book_cover_reference: ""
  publishing_cover: ""
  visual_plan: ""
  narration_raw: ""
  narration_master: ""
  music: ""
  music_source: ""
  music_license: ""
  logo: ""
narration:
  text: ""
  approved: false
transcript:
  path: ""
  timing_basis: "final narration master"
scenes:
  - id: "s01"
    start: 0
    end: 3
    narration: ""
    purpose: "hook"
    visual: ""
    on_screen_text: ""
    keyword: ""
    asset_source: ""
    animation: ""
status:
  research_gate: false
  script_gate: false
  audio_gate: false
  timing_gate: false
  visual_gate: false
  technical_gate: false
outputs:
  publishing_cover: ""
  preview: ""
  final_mp4: ""
```

Rules:

- Require `end > start`.
- Avoid overlapping scenes unless the design intentionally layers them.
- Set the final scene end to the final narration or composition duration.
- Record missing assets as empty values, never invented paths.
- Update gate fields only after the corresponding checks run.
