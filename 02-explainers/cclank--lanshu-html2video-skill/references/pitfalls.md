# Pitfalls

Every entry here cost a debugging cycle or a bad render. Read this before editing
`assets/template/src/`, and add to it when something new bites.

## Contents

- [Remotion's rendering model](#remotions-rendering-model)
- [Things the official docs get wrong](#things-the-official-docs-get-wrong)
- [Props and the silent wrong-video failure](#props-and-the-silent-wrong-video-failure)
- [Rendering reliability](#rendering-reliability)
- [Assets and image quality](#assets-and-image-quality)
- [Audio frame spaces](#audio-frame-spaces)
- [Layout failures](#layout-failures)
- [Determinism](#determinism)

---

## Remotion's rendering model

Frames are rendered by several browser tabs in parallel, and **those tabs share no
state**. Everything else follows from that.

**CSS animations, transitions and Tailwind `animate-*` are forbidden.** They do
not render, or worse, they render differently per tab and the video flickers
mid-shot. Animate only from `useCurrentFrame()`.

Harvested pages are full of `@keyframes`, `transition:` and `animate-*`, so
harvested CSS is **never passed through as CSS**. `harvest.py` reduces the page's
styling to a flat JSON of primitives via `getComputedStyle`, and `zArt` validates
that against an allow-list with type and range checks. There is no path by which
page CSS reaches the render.

**`useState`/`useEffect` for anything visual is a bug**, for the same reason: the
effect timing differs per tab. The one exception is `WaitForFonts`, which uses
them to gate the whole composition, and which is allowed by name.

## Things the official docs get wrong

The bundled `remotion-best-practices` skill is good on timing, sequencing,
transitions and audio, and is worth reading. But it has errors and gaps that
matter here.

**`interpolate()` cannot return a string.** Verified against
`node_modules/remotion/dist/cjs/interpolate.d.ts`:

```ts
export declare function interpolate(input: number, inputRange: readonly number[],
  outputRange: readonly number[], options?: InterpolateOptions): number;
```

The skill's own example — `translate: interpolate(frame, [0,100], ["0px 0px", "100px 100px"])`
— does not typecheck. Wrap a numeric interpolate in a template literal instead.

**`translate` needs the two-value form.** `translate: 26` is translateX only, so a
"rise" animation written that way slides sideways. Always `translate: \`0 ${y}px\``.
`src/lib/shots/primitives.tsx` is the reference for the correct pattern.

**Ken Burns is not covered at all** — no pan, no zoom, no overscan. All of it is
in `src/lib/move.ts` and `src/lib/shots/KenBurnsImage.tsx`.

**`iris` and `none` transitions exist** in `@remotion/transitions` 4.0.409 even
though the skill documents neither. `clockWipe` and `iris` require explicit
`width`/`height` props; `fade` has a `shouldFadeOutExitingScene` flag that turns a
fade-over into a real cross-dissolve (this skill sets it).

**`delayRender()`'s 30-second default timeout is never mentioned.** This project
allows exactly three `delayRender` sites — the font handle, `<Img>` decode, and
`<Audio>` in voice mode — and forbids `http://` or `https://` anywhere in `src/`
or in any `asset.src`, so nothing in the render waits on the network. That
invariant is why the timeouts are generous rather than tight.

**CJK font guidance is absent and the examples are actively wrong** for Chinese:
every `loadFont` example hardcodes `subsets: ["latin"]`, which renders Chinese as
tofu. See [cjk-type.md](cjk-type.md).

## Props and the silent wrong-video failure

**Remotion MERGES `--props` with `defaultProps`.** The composition's props are
shaped `{ storyboard: … }`. Passing `storyboard.json` directly therefore leaves
`props.storyboard` pointing at the built-in demo board, and Remotion renders the
DEMO with your board's keys sitting unused alongside it.

This fails silently and produces a plausible video. It cost two rounds of
"why didn't my change take effect".

`scripts/render.mjs` wraps props automatically. Use it. If you must call Remotion
directly, the props file has to look like `{"storyboard": { … }}`.

Related: regenerate the props file after every storyboard edit. `render.mjs` does
this each run, which is the actual fix — a stale intermediate is not a mistake
worth remembering, it is one worth deleting.

## Rendering reliability

**Concurrency above ~4 fails against the system Chrome.** Symptom:

```
Error: Visited "http://localhost:3001/index.html" but got no response.
  at getPool (…/render-frames.js)
```

One of N parallel tabs never loads. Measured here: 8 fails, 3 is stable. Stills
always work because they use one tab. `render.mjs` defaults to 8 — pass
`--concurrency 3` when it bites.

Remotion prefers its own `chrome-headless-shell`, which is more reliable for
rendering than a full Chrome. Note that `npx remotion browser ensure` will NOT
download it if `remotion.config.ts` already sets `setBrowserExecutable()` — it
reports "Has browser at …" and exits. To force the download, comment out the
browser-executable branch first.

**Composition duration comes from `calculateMetadata`.** Asking for a frame beyond
it fails with `RangeError: Cannot use frame N: Duration of composition is M`. The
validation report prints each scene's `from` frame; use it to pick still frames.

## Assets and image quality

**Image proxies silently degrade figures.** Next.js sites serve
`/_next/image?url=<original>&w=3840&q=75`. A fetcher that follows the rendered
`<img src>` gets the proxied file. Measured on the reference article: a
4620x1410 source came back as **3840x1172 and palette-quantised to 256 colours**.

`harvest.py` decodes the `url=` parameter and downloads the original. Since this
pipeline's premise is that figures have spare pixels to push into, that 20% and
the colour depth both matter. If you add a fetch path, preserve this behaviour.

**Never upscale.** `KenBurnsImage` fixes the layout at the tightest zoom so
`scale` never exceeds 1 and Chrome only ever downsamples. The schema additionally
rejects any crop needing more source pixels than the image has, before frame 0.
A soft hero shot looks fine in a thumbnail and obviously wrong at 1080p.

**Zoom range is capped by duration** (`maxZoomRatio`): 1.25x for moves of 4s or
more, 1.6x for short ones. Chrome re-rasterises across large scale ranges, and on
a slow move that shimmers.

**Intermediate frames are PNG, not JPEG.** `jpeg` is the right default for video
footage and is what other Remotion projects set, but this pipeline renders flat
colour fields and fine CJK strokes — precisely where JPEG's DCT ringing appears
along glyph edges and where chroma subsampling eats a 2px accent rule.

Measured, rather than assumed. Rendering scene s4 both ways and comparing against
a `remotion still` of the same frame as ground truth:

| intermediate | SSIM | segment size |
|---|---|---|
| jpeg | 0.9874 | 149.7 kB |
| png | **0.9944** | 159 kB |

Error roughly halved for 6% more bitrate. The cost of PNG is render time and temp
disk, not quality, so it is the default here. Revisit only if a board is dominated
by photographic material.

## Audio frame spaces

**`<Audio volume={(f) => …}>` receives AUDIO-LOCAL frames, not composition
frames.** Remotion derives `f` from `useMediaStartsAt()`, so if the `<Audio>` is
inside a `<Sequence from={90}>` or carries a `trimBefore`, every duck window
computed in composition space is wrong by that offset — and nothing errors.

The rule that removes the problem rather than managing it: **mount the bed at
composition frame 0, outside any Sequence, with no `trimBefore`.** Then the two
frame spaces coincide. If an offset is ever genuinely needed, pass it explicitly
and add it inside `duckAt` — never infer it from the callback.

## Layout failures

**Do not mix absolutely positioned images with flex text.** The first version of
`FigureReveal` did, and headlines landed on top of figures. Once the image is a
flow child in the same layout pass, overlap becomes impossible to write rather
than something to remember. Full-bleed is the deliberate exception: there the
image IS the background and text sits over a scrim.

**Do not crop into a wide schematic.** The first `DiagramWalk` panned across a
3.28:1 diagram at 55% width. That destroyed the left-to-right flow that was the
diagram's entire content, and magnified the figure's own labels until they
outweighed the headline. A schematic wants to be shown whole, at the largest size
that fits, with attention moved by annotation. `move: hold` over the full rect is
the intended default.

**Do not put callout chips on top of a diagram.** A diagram is already dense with
type. Chips belong in the margin the layout reserves for them, with a short leader
up to the region they name.

**Rules thinner than 2px do not exist in video.** A harvested `ruleWidth: 1` is a
CSS hairline designed for a browser at arm's length; after H.264 and arbitrary
viewing scale it vanishes. Measured: a 1px title rule was present in the pixels
and invisible to the eye. `palette()` scales harvested widths up to
`hairline` (min 2px) and `ruleAccent` (min 4px) once, centrally.

**A dark scrim over a light figure on a light ground reads as a mistake.** Scrim
direction follows the ground's luminance (`isDark()`), and scrims are only used
for full-bleed.

**Do not keep a second table of box dimensions.** `SLOT_PX` in `lib/design.ts` is
the only one. An earlier version added a parallel `FLOW_BOX` for render geometry
with different heights, so the resolution guard aspect-normalised the crop to
1.78:1 while the renderer normalised it to 2.38:1 — the guard validated a rectangle
that was never displayed, and its "needs Npx" figure described pixels nobody
sampled. Nothing failed; the numbers were just quietly meaningless.

**Every slot is 1.78:1 or wider, so a taller figure loses height under `cover`.**
On a chart that height is the title and the axis labels. This was found by a cold
run on a chart-heavy article, where the operator resorted to pre-padding PNGs
externally to force the aspect. Use `"fit": "contain"` instead — see
[storyboard.md](storyboard.md#fit-cover-or-contain).

**Centre the image+text group in a non-full-bleed figure, not its contents.** Both
children are the slot's width, so left-anchoring the column leaves all the slack on
one side and a 1240px chart in a 1920px frame looks accidentally off-centre.

**The character-budget check must be per shot.** Assuming "headline at 96px on two
lines" everywhere was wrong in both directions: it rejected legal copy on
`statement` and `outro` (which set the headline at 72px on three lines) and waved
through text far too long for a `figure` in a `left`/`right` slot, whose real box is
800px. `TEXT_BOX` in `lib/design.ts` holds the per-shot boxes; keep it in sync with
what the shots pass to `useFits`.

## Determinism

Two symptoms, one root cause. Parallel-tab disagreement shows up as mid-shot
flicker; run-to-run disagreement shows up as an unreproducible render.

- `remotion`'s `random(seed)` is the only permitted randomness.
- `src/lib/sandbox.ts` — imported first from `Root.tsx` — hard-overrides
  `Math.random`, `Date.now` and `performance.now` while rendering. Overrides
  rather than lint rules, because a lint rule cannot see a transitive dependency.
- `Intl.Segmenter` is deliberately **off** for layout. It works, and it would give
  slightly nicer Chinese line breaks, but ICU word-break data varies between
  Chrome builds — so the same storyboard could break lines differently on two
  machines. Per-character plus kinsoku is self-contained and provably identical.
- Fonts are subset locally from pinned sources, so metrics are byte-identical
  everywhere. If the download fails and the skill falls back to a macOS system
  font, it says so — and that guarantee is gone.

Anything unloaded when `measureText` runs silently returns Latin-fallback metrics,
which bakes in the wrong line breaks. `fitCJK` passes
`validateFontIsLoaded: true` so that throws instead of lying.
