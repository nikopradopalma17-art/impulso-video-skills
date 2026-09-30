# Beat-Sync Editing

Use this for 卡点视频, fast social cuts, beat-driven promos, and logo hits.

## Music Mapping

Start by finding:

- First strong downbeat or drop.
- Repeating beat interval.
- Secondary accents, fills, pauses, and final hit.
- Energy sections: intro, build, drop, climax, tail.

Use `scripts/analyze_bgm_hits.py` to estimate strong hit points, then verify by listening.

## Timeline Construction

- Choose 6-12 primary hit points for a short cut.
- Assign the strongest visual changes to the strongest hits.
- Use shorter shots during build sections and slightly longer holds on hero images.
- Place logo/title on a final clean hit, not during a busy fill.

## Visual Matching

Good beat cuts often change at least one of:

- Scale: wide to close, close to wide.
- Direction: left motion to right motion, vertical motion to stillness.
- Brightness: dark to bright, bright to dark.
- Color: warm to cool, muted to saturated.
- Subject: face to action, detail to world, object to result.

Avoid cutting between near-identical shots on consecutive beats; it reads like repetition rather than rhythm.

## 卡点 Patterns

- **Impact grid**: every beat gets a hard cut.
- **Hold-and-release**: hold across two beats, then cut rapidly for a burst.
- **Micro black**: 2-4 frames of black before a major hit.
- **Motion bridge**: match similar motion across shots for elegance.
- **Logo slam**: final card appears exactly on the hit, with no late fade.

## Common Problems

- Too many weak clips: cut the runtime shorter.
- Rhythm feels random: rebuild from the beat list instead of moving clips by eye.
- Cuts feel harsh but not powerful: add a short pre-hit hold or black frame.
- Logo lacks impact: place it earlier on the hit and hold longer.
