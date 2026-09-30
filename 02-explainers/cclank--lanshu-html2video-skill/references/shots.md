# The shot library

Ten shots. Each owns its layout, its entrance choreography and its emphasis
handling; the storyboard supplies content and intent only.

Two rules run through all of them, and they are what keeps the output from looking
like slides:

- **Readable content sits in flow layout inside the safe area.** Absolute
  positioning is for backgrounds, scrims and decoration. Reserve a slot for every
  element and animate it from that slot — never into space another element occupies.
- **No cards, badges, pills or tiny labels.** Those are web UI patterns; in video
  they read as clutter.

## Entrance primitives

Everything enters through one of two primitives, so timing stays consistent.

**`MaskUp`** — text rises from behind a hard edge, clipped to exactly one line
height. Reads as typeset rather than animated, which is why it is the default for
headlines. Selected by `motion.revealStyle: "mask-up"` or `"clause-cascade"`.

**`Rise`** — fade plus a short upward translate, with optional blur. The default
for anything that is not a line of type.

**`Rule`** — a hairline that draws itself via `scaleX` from a left or right origin.
Used for sweeps, underlines, strikes and row dividers.

Lines within a block stagger by `PACE[pace].stagger` (4 / 7 / 11 frames for
staccato / measured / languid). Entrance duration is `PACE[pace].enter`.

## Emphasis

Authored as `{ at: 0..1, kind, target }` and resolved to frames against the solved
scene duration, so re-timing can never desync it.

| kind | Effect |
|---|---|
| `punch` | brief `scale` to 1.035 and a tint to accent, returning to 1 — reads as stress, not as a layout change |
| `flash` | the ground dips to 0.82 opacity for 6 frames; the frame flinches |
| `underline` | an accent rule sweeps beneath the target |
| `strike` | a rule draws across the target, tilted 0.6 degrees so it reads as struck by hand rather than as a border |
| `rule-sweep` | times the shot's structural rule to a beat instead of to the entrance |
| `callout` | an accent rule plus dot marking a focal point |
| `desaturate` | drops the target to muted colour |

`target` is `"headline"`, `"sub"`, or `"line:N"` (1-based) to hit a single line.

## The shots

### `title`
Opening. Sets register, subject and source in one frame.

Eyebrow top-left in accent; display headline on `cols(8)`, left-aligned; an accent
rule on `cols(4)`; Latin sub beneath in muted. Headline reveals per line by
`MaskUp`; the rule draws on the `rule-sweep` beat if one is authored, otherwise
after the headline lands.

### `statement`
A single claim with nothing to compete against it. Centred column, `cols(10)`, at
most three lines at statement size. Nothing else in the frame — the emptiness is
the design. Use `punch` on the line that carries the turn.

### `stat`
One number made the subject. Value at 240px tabular in the display face, unit at
52px in accent, baseline-aligned; `of` caption beneath in `cols(9)`.

Digits cascade in 3 frames apart. Deliberately character-by-character rather than a
count-up, because a count-up breaks on non-numeric values like "3x" or "<1%".

### `quote`
A sentence worth quoting verbatim. The opening 「 hangs outside the text box
(`marginLeft: -1em`) — see [cjk-type.md](cjk-type.md) for why this matters.
Quote on `cols(9)`, attribution right-aligned beneath.

### `figure`
One self-contained finding and its image. Behaviour depends on the slot:

- **`full`** — the image IS the background. Ken Burns over the whole frame, text at
  the bottom over a scrim whose direction follows the ground's luminance.
- **`inset` / `band` / `left` / `right`** — the image is a flow child in a reserved
  box with a hairline edge, and the text sits in its own row beneath. No scrim, ink
  on paper.

Use `push-in` to settle onto a detail, `pull-out` to reveal context.

### `compare`
Two states of one thing. Headline, optional figure, then two labelled columns of
`cols(6)` with an accent divider that draws downward between them.

The `underline` emphasis sweeps across **both** columns rather than under each,
because the point of the shot is the relationship, not the pair.

### `diagram`
A mechanism, walked through one callout at a time.

**Default to `slot: "band"`, `"fit": "contain"`, and `move: hold` over the full
rect.** All three parts matter. Cropping a wide schematic destroys the
left-to-right flow that IS the diagram's content and magnifies the figure's own
labels until they outweigh the headline — so show it whole and move attention by
annotation instead.

`"fit": "contain"` is the part that is easy to leave out, and leaving it out
quietly re-introduces the crop: `band` is 3.28:1, so under the default `cover` a
2.5:1 diagram still loses height off the top and bottom — usually its subtitle and
its legend. `hold` over the full rect does not prevent that; only `contain` does.

Callout chips sit **below** the band, positioned at their anchor's projected x,
with a short accent leader up to the region they name. Exactly one is at full
strength; spent ones drop to 42% so the thread of what was already said stays
readable.

Panning remains available for figures genuinely too large to read at once: give
callouts a `focus` rect and the camera retargets between them, landing a beat
before the words arrive so the eye is already there.

### `caveat`
The limitation. **The one inverted shot in the system** — ink ground, paper text.
That is deliberate: the tonal break makes the caveat land structurally before it is
read, and it is why this shot needs no fade in (cut into it).

Headline off-centre on `cols(7)`, sub beneath with a tilted hairline available for
`strike`. Use `flash` early and `strike` late.

### `ladder`
Three or four takeaways. Numbered rows: label in accent at 30px, text at sub size,
hairline divider above each row.

The rule draws four frames **before** its text arrives — the line appears, then the
content lands on it. That small lead is what makes the sequence feel authored.

### `outro`
Core message centred at statement size; source label and URL small at bottom-left.
A very slow `scale` to 1.012 across the whole shot — 1.2% is deliberately near the
threshold of notice, so it reads as the film settling rather than as a move.

## Asset slots

Destination boxes in output pixels. These feed the resolution guard.

| slot | box | aspect | Use for |
|---|---|---|---|
| `full` | 1920x1080 | 1.78:1 | photographs, textures, a figure that can carry a frame |
| `band` | 1640x500 | 3.28:1 | wide schematics, timelines, anything 3:1 or wider |
| `inset` | 1240x520 | 2.38:1 | screenshots, transcripts, charts — the ground shows around it |
| `left` / `right` | 800x450 | 1.78:1 | side-by-side comparisons |

These are the *only* slot dimensions; `SLOT_PX` in `lib/design.ts` is the single
table, used by both the resolution guard and the renderer. (An earlier version kept
a second table of render boxes with different heights, so the guard validated a
rectangle that was never displayed. Do not reintroduce one.)

**Every slot is 1.78:1 or wider, which matters a lot for charts.** Under the default
`"fit": "cover"` an image taller than its slot loses the excess height — and on a
chart that height is the title and the axis labels. A 1.36:1 map in `inset` loses
~43% of its height. Set `"fit": "contain"` for anything whose edges carry meaning
and the whole image is letterboxed instead, with the ground showing above and below.
`contain` ignores `move`, since there is nothing to pan within.

Pixel budget under `cover`: a slot needs `dest.w / tightest_crop.w` source pixels. A
1590px-wide chart therefore **cannot** go in `full` at any crop (it would need
1920+), and only fits `inset` at crops of 0.78 or wider. Under `contain` the demand
is just the fitted size, so headroom is far easier to satisfy. The validator
computes both cases and refuses what will not work.

## Motion signature

Seeded from the source URL, so two different articles move differently with no
bespoke code. This — together with harvested colour and type, and the choice of
shots — is where the perceived uniqueness comes from.

```
easeFamily   crisp | editorial | overshoot
pace         staccato | measured | languid
panBias      ltr | rtl | converge | settle
revealStyle  mask-up | rise | scale-settle | clause-cascade
gridEnergy   0..1   background drift amount
transitionVocab  which transitions this video is allowed to use
```

Easing curves: `crisp` = `bezier(0.16, 1, 0.3, 1)` for decisive entrances,
`editorial` = `bezier(0.45, 0, 0.55, 1)` for pans, `overshoot` =
`bezier(0.34, 1.56, 0.64, 1)` for a slight bounce past target.

Enter with ease-out, exit with ease-in.

## Transitions

Available: `cut`, `fade`, `wipe`, `slide`, `flip`, `clockWipe`, `iris`.

`fade` is a true cross-dissolve (`shouldFadeOutExitingScene`), which reads as
editorial; a fade-over reads as a slide deck. `cut` is the **absence** of a
transition element, not a zero-frame one — total duration is
`Σ scene frames − Σ transition frames`.

Cut into tonal breaks (the `caveat`). Dissolve between related beats. Reserve
`wipe`, `slide` and `clockWipe` for act boundaries; using them between every scene
is what makes a video feel like a template.
