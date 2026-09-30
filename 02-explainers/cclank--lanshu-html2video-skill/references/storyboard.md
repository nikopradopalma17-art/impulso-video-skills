# storyboard.json

The reviewable contract between understanding and rendering. Authoritative schema:
`assets/template/src/schema/storyboard.ts`.

Two rules shape the whole thing:

1. **Everything time-like inside a scene is normalised `0..1`, never a frame.**
   Scene durations get re-solved to hit the runtime target, so any authored frame
   number would silently desync emphasis, callouts and captions.
2. **Assets are local, always.** The schema rejects anything matching `^https?:`,
   because nothing in the render may wait on the network.

## Top level

```jsonc
{
  "version": 1,                      // literal 1
  "meta": {
    "sourceUrl":   "https://…",      // required, must parse as a URL
    "sourceTitle": "…",              // required, non-empty
    "lang":        "zh-Hans",        // required, LITERAL "zh-Hans"
    "coreMessage": "…",              // required, <= 40 chars
    "arc":         "claim-evidence-implication",   // required, one of five below
    "author":      "",               // optional
    "publishedAt": ""                // optional
  },
  "target": { "fps": 30, "width": 1920, "height": 1080,
              "seconds": 95, "toleranceFrames": 30 },
  "art":    { … },   // harvested design tokens — the "骨"
  "motion": { … },   // seeded motion signature — the "魂"
  "audio":  { "mode": "music", "bedGain": 0.32, "duckTo": 0.12 },
  "assets": [ … ],
  "scenes": [ … ]    // 4 to 14
}
```

Every field in `meta` marked required will fail validation if absent, and `lang`
must be exactly `"zh-Hans"` — the schema uses a literal, not a free string.

`fps`, `width` and `height` are also literals: `30`, `1920`, `1080`. Other formats
are P1, so the schema refuses them rather than rendering something mis-sized.

`meta.coreMessage` is capped at 40 characters — the Chinese equivalent of "15 words
or fewer". `meta.arc` is one of the five narrative arcs in
[editorial.md](editorial.md).

`target.seconds` is a goal, not a guarantee. The solver hits it when it can and
reports when it cannot; see [Timing](#timing).

## art

Harvested by `harvest.py` into `harvest.json`'s `tokens`, then hand-mapped. From
the reference article's real computed styles:

```jsonc
{
  "ground": "paper",            // paper | ink | tint
  "groundColor": "#faf9f5",     // tokens.bodyBg
  "ink": "#141413",             // tokens.bodyColor
  "inkMuted": "#5e5d59",        // from tokens.textColorsByUse
  "accent": "#d97757",          // tokens.cssVars["--color-clay"]
  "accentAlt": "#bcd1ca",       // tokens.cssVars["--color-cactus"]
  "radius": 16,                 // tokens.radii, most frequent
  "ruleWidth": 1,               // scaled up for video; see pitfalls.md
  "texture": "paper",           // none | grain | grid | paper
  "displayFace": "sans",        // tokens.h1Font
  "bodyFace": "serif",          // tokens.bodyFont (see note)
  "sourceLabel": "anthropic.com"
}
```

`displayFace` and `bodyFace` are independent on purpose — this site sets headings
in a sans and body in a serif, and collapsing that to one toggle loses the contrast
that makes its typography recognisable.

Pick `inkMuted` for readability rather than fidelity: the most-used muted colour on
the page may be far too light for a caption at video viewing distance.

## motion

```jsonc
{
  "seed": "anthropic.com/research/natural-language-autoencoders",
  "pace": "measured",           // staccato | measured | languid
  "easeFamily": "editorial",    // crisp | editorial | overshoot
  "panBias": "ltr",
  "revealStyle": "mask-up",
  "transitionVocab": ["cut", "fade", "wipe"],
  "gridEnergy": 0.22
}
```

`motionFromUrl()` in `src/lib/art.ts` derives a full signature deterministically
from a URL if you want one chosen for you. Write the result into the JSON rather
than recomputing at render time, so the value is stable and reviewable.

## assets

```jsonc
{
  "id": "fig-arch",
  "src": "media/fig-02.png",        // harvest.json calls this key `file`, not `src`
  "intrinsic": { "w": 4620, "h": 1410 },   // copy from harvest.json — must be accurate
  "role": "diagram",                // REQUIRED, no default:
                                    //   figure | diagram | screenshot | hero | logo
  "alt": "",                        // optional
  "sourceCaption": "In a natural language autoencoder, the activation verbalizer …"
}
```

Note the key rename: `harvest.json` exposes the path as `figures[].file`; the
storyboard field is `src`. `render.mjs` resolves it relative to the harvest
directory and stages the file, so `media/fig-02.png` is the right form to write.

`intrinsic` drives the resolution guard, so copy it rather than guessing. `role` is
required and has no default. `sourceCaption` keeps the untranslated original for
provenance and is never rendered.

**Check `harvest.json`'s `captionSource` before trusting a caption.** It is one of:

| value | meaning |
|---|---|
| `figcaption` | taken from the page's own `<figure>/<figcaption>` — authoritative |
| `proximity` | the paragraph that happened to follow the image — **verify it** |
| `none` | the page gave no caption |

`proximity` is a guess and it can be wrong in the worst way: on one real page all
three such captions were ordinary body prose, and one described the *next* chart.
When it says `proximity` or `none`, open the image and read the finding off the
chart itself — its own embedded title is usually the best source, and re-authoring
that as a Chinese headline is the intended move.

## scenes

```jsonc
{
  "id": "s4",
  "shot": "diagram",
  "weight": 2.8,                    // dimensionless — never frames
  "text": {
    "eyebrow": "机制",
    "headline": "一个负责说，一个负责猜"
  },
  "assets": [{ "ref": "fig-arch", "slot": "band",
               "move": { "kind": "hold", "target": {"x":0,"y":0,"w":1,"h":1} } }],
  "callouts": [
    { "at": 0.16, "text": "AV：把激活翻成一段人话", "anchor": {"x":0.13,"y":0.80} },
    { "at": 0.48, "text": "AR：只读这段话，反推原始激活", "anchor": {"x":0.46,"y":0.80} },
    { "at": 0.78, "text": "对得上，才算这句人话是真的", "anchor": {"x":0.82,"y":0.80} }
  ],
  "emphasis": [{ "at": 0.62, "kind": "punch", "target": "line:2" }],
  "transitionOut": { "kind": "fade", "frames": 14, "timing": "linear" }
}
```

`text` fields: `eyebrow` (24), `headline` (100), `sub` (160), `caption` (200),
`credit` (120), `items[]` (max 4, label 12 + text 60), `stat` (value 10, unit 8,
of 40). Those are schema caps; the real limits are the per-box character budgets in
[cjk-type.md](cjk-type.md), which are tighter.

**The `quote` shot carries its quotation in `headline`, and the attribution in
`credit`** — there is no dedicated field. Practical limit is about 36 CJK
characters or ~100 Latin, because it sets at statement size on `cols(9)` over three
lines. A long quotation therefore has to be **excerpted**: pick the clause that
carries the point and move the rest into narration or a following `statement` scene.
Trying to fit a whole paragraph will fail validation, and would be unreadable if it
did not.

**A `\n` in any text field is an authored line break, and it is honoured.** The
fitter splits on it, treats each part as its own paragraph, and disables line
balancing for multi-paragraph text. This is the tool for fixing a bad automatic
break: when the balancer splits 来不及 or 声明 across two lines, put the break where
it belongs yourself. Balancing only runs on single-paragraph text precisely so that
an authored break is never second-guessed.

Per-shot required fields, enforced by the schema:

| shot | also requires |
|---|---|
| `stat` | `text.stat` |
| `compare` | at least 2 `text.items` |
| `ladder` | at least 2 `text.items` |
| `diagram` | at least 2 `callouts` |

`stat` also renders `text.headline` at sub size beneath the number, which is a
useful place for the contrasting figure. `outro` renders `text.headline`, not
`meta.coreMessage` — usually you want the same sentence in both.

`emphasis.target` accepts `"headline"`, `"sub"`, `"line:N"` (1-based),
`"item:N"` and `"callout:N"`.

`anchor` and `focus` are in **source-image space**, normalised. `at` is normalised
within the scene. Callouts must be strictly ordered by `at`.

## fit: cover or contain

Every slot is 1.78:1 or wider, so an image taller than that loses height. Under
`"cover"` (the default) that lost height is cropped — and for a chart the height
that goes is the title and the axis labels, i.e. the content.

```jsonc
{ "ref": "fig-04", "slot": "inset", "fit": "contain",
  "move": { "kind": "hold", "target": {"x":0,"y":0,"w":1,"h":1} } }
```

| fit | Behaviour | Use for |
|---|---|---|
| `cover` | fills the slot, crops the overflow, Ken Burns applies | photographs, a figure used as a backdrop, anything wider than its slot |
| `contain` | whole image scaled to fit, letterboxed by the ground, **`move` ignored** | charts, schematics, screenshots, tables — anything whose edges carry meaning |

A 1.36:1 map in a 1.78:1 slot loses about 43% of its height under `cover`. If the
figure has a title, a legend, or axis labels, use `contain`. The resolution guard
adjusts automatically: a contained figure only needs its fitted size, so headroom
is much easier to satisfy.

The trade-off is that `contain` is static — there is nothing to pan within. A board
where every figure is contained will read as slides, so give at least one `cover`
figure a gentle `push-in` **where the material allows it**.

Sometimes it does not, and that is a legitimate outcome rather than a failure to
work around. An article whose figures are all charts, schematics and screenshots
sends all of them to `contain`, and none can take a crop: a chart loses its axis
labels, a screenshot loses the text that is the point of showing it. Two things to
know before fighting it:

- **A push-in whose target is the full width silently becomes a hold.**
  `expandRect` clamps at `w = 1`, so `{kind:"push-in", target:{...w:1...}}` has
  nothing to expand from. It will not error; it simply will not move.
- If every figure must be static, get the variation from elsewhere: alternate
  figure-led and text-led scenes, use `stat` and `quote` between figures, and let
  the `caveat` inversion carry the structural break. A static middle third is a
  real weakness — say so when handing the video over rather than hiding it.

## Moves

```jsonc
{ "kind": "hold",     "target": rect }
{ "kind": "push-in",  "target": rect, "amount": 1.18 }   // starts wide, settles on target
{ "kind": "pull-out", "target": rect, "amount": 1.18 }   // starts on target, opens out
{ "kind": "pan",      "from": rect, "to": rect }
{ "kind": "rects",    "from": rect, "to": rect }         // explicit both ends
```

Rects are normalised in source-image space and must lie inside the unit square.
The library then **snaps them to the destination box's aspect**, growing the
deficient axis so nothing you asked for is lost. Because `lerp` preserves the
width/height ratio and a convex combination of two contained rects stays contained,
every interpolated frame is both aspect-exact and inside the image — which is why
"the pan must not expose the frame edge" is a schema precondition rather than a
runtime hope.

Two guards fire before frame 0:

- **Resolution**: `dest.w / tightest.w` must not exceed `intrinsic.w`. A 1590px
  chart cannot fill a 1920 slot at any crop.
- **Shimmer**: zoom range is capped at 1.25x for moves of 4s or more (Chrome
  re-rasterises across large scale ranges and it crawls).

## Timing

Three tiers, and the floor is inviolable.

**1. Reading floor**, computed by the library from your text — never authored:

```
READ_CPS = { display: 5.5, headline: 5.0, statement: 4.6, sub: 4.4, caption: 4.0, quote: 3.4 }
floor = max(SHOT_FLOOR[shot], ceil(fps * (0.5 + Σ chars/READ_CPS + holdOut)))
```

CJK counts one unit per character; Latin runs count a **third** of their length,
because reading effort for Latin is per-word not per-glyph. `credit` is excluded
entirely — nobody reads a URL character by character, and counting it once inflated
an outro to 10 seconds of dead air.

`SHOT_FLOOR` exists because some shots need time to read as a *move*: `figure` 2.6s,
`diagram` 3.2s **per callout**, `compare` 3.0s.

**2. Weights.** The solver bisects for a `unit` such that
`Σ clamp(floor, weight·unit, cap) − Σ transitions = target`. Clamped scenes push
their slack onto unclamped ones.

**3. Voice mode inverts authority.** With `audio.mode: "voice"`, speech sets the
length: each scene runs as long as its `narration` takes to say, and
`target.seconds` becomes an assertion about the result rather than something to
solve for. The READING floor is dropped — the viewer is listening, not reading, and
keeping it would stretch scenes past their narration into dead air. Only the
per-shot "reads as a move" minimum survives.

With no measured audio, the spoken length is estimated from the narration text by
`lib/speech.ts`. That estimate is a pure function of the text, so it needs no side
channel and stays deterministic. See [narration.md](narration.md) for the model and
the `--sps` rate flag.

Expect a voice board to run considerably longer than the same content in music
mode — narration is slower than reading. The reference article is 95s read and 148s
narrated.

**The solver may only distribute slack above the floor.** If the floors alone
overflow, the pipeline **fails with an editorial instruction** naming the scenes
with the most slack to give back:

```
storyboard is 29.6s over target (floors 77.3s + transitions 2.7s vs target 45s).
  - scene "s4" (diagram) has a 12.4s floor from 12 chars — cut text or drop the scene
```

Squeezing text below its reading floor is the one failure a viewer notices every
single time, so it is not available.

If the caps cannot reach the target the video is simply shorter, and it says so —
add a scene or lower `target.seconds` rather than letting shots drag.

## Authoring loop

```bash
node scripts/render.mjs --storyboard ./work/myrun --still 0    # validate + one frame
```

The report gives resolved durations, each scene's `from` frame, pixel headroom per
asset and character budgets. Fix everything before rendering. What it cannot check
is text fitting — that needs a browser, so line-count overflow surfaces at render
time as a named failure (`scene "s6" field "headline" does not fit …`).
