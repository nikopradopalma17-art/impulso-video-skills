# Chinese typography for 1920x1080

The existing `remotion-best-practices` guidance on video layout is prose-only and
keyed to a 1080-wide *vertical* frame, so none of it transfers. These are the
numbers for a 1920x1080 landscape frame, and they are derived rather than guessed.

## Safe area and grid

```
SAFE     = { top: 96, right: 140, bottom: 128, left: 140 }
CONTENT  = 1640 x 856
GRID     = 12 columns x 100px + 11 gutters x 40px = 1640 exactly
RHYTHM   = 8px   (every vertical gap is a multiple)
```

Bottom is deeper than top to reserve the caption band. With `--voice`,
`bottom: 240` gives a 1640x744 content box and a caption band of
`{ height: 168, bottom: 72 }`. Both insets sit outside the 5% title-safe rect
(96 / 54), so nothing readable is at risk of being cropped by a player.

`cols(n) = n*100 + (n-1)*40` — so `cols(7)` is 940, `cols(8)` 1080, `cols(9)` 1220,
`cols(10)` 1360, `cols(12)` 1640. Use these for text box widths; do not invent
widths.

## Type scale

Sizes derive from cap-height as a fraction of frame **height** — the real
legibility invariant — then get about 12% more for CJK stroke density.

| Role | px | weight | line-height | tracking | soft max | hard max |
|---|---|---|---|---|---|---|
| display | 128 | 600/700 | 1.18 | −0.01em | 10 | 12 |
| headline | 96 | 700 | 1.22 | 0 | 14 | 17 |
| statement | 72 | 600 | 1.30 | 0 | 18 | 22 |
| sub | 52 | 500 | 1.45 | 0.01em | 26 | 31 |
| caption | 44 | 400 | 1.55 | 0.02em | 30 | 36 |
| label / eyebrow | 30 | 600 | 1.40 | 0.16em | — | — |
| credit | 26 | 400 | 1.50 | 0.06em | — | — |
| stat value | 240 | 700 tabular | 1.00 | −0.02em | — | — |
| burned-in caption | 56 | 500 | 1.40 | 0.01em | 24 | 29 |

### Why hardMax is exact, not an estimate

Every CJK ideograph and every full-width punctuation mark in the Source Han
lineage (Noto Sans SC, Noto Serif SC) has an advance width of **exactly 1.000em**
at 1000 upem. So for a content width `Wc` and tracking `t`:

```
hardMax = floor(Wc / (px * (1 + t)))
```

With `Wc = 1640`: headline `floor(1640/96) = 17`, statement `floor(1640/72) = 22`,
sub `floor(1640/(52*1.01)) = 31`, caption `floor(1640/(44*1.02)) = 36`. All match
the table.

**These are per the full content width.** A shot using a narrower box gets
proportionally fewer characters, and this is the most common authoring mistake.
Worked example: `FigureReveal` fits its headline in `cols(8)` = 1080px when
full-bleed, so at 96px that is 11 characters per line, not 17 — a 22-character
headline needs three lines and will fail the two-line budget. Check the box width
in the shot before counting characters.

`softMax` is the editorial target. Shorter lines read faster on screen, and a
headline that fills every line to the hard limit reads as crowded even when it fits.

## Fitting: `fitCJK`

`@remotion/layout-utils` cannot do this job:

- `fitText` is width-only (`withinWidth`) — no line count, no height budget.
- `fitTextOnNLines` splits on `" "`, so a Chinese sentence is one token and it
  shrinks the type until the whole sentence fits a single line.
- `fillTextBox` accumulates `word + " "`, which is the same Latin assumption.

`src/lib/type/fit-cjk.ts` replaces them with three deliberate differences:

**1. Cluster on line-break rules, not spaces.** A cluster is one CJK character or
one atomic Latin/technical run, so "Opus 4.6" and "4620x1410" never split.

Kinsoku is enforced both ways:
- 行頭禁則 (`NO_START`) — a closing bracket, comma or period may not begin a line,
  so it gets pulled up onto the previous line (追い込み), tolerating one cluster of
  overflow.
- 行末禁則 (`NO_END`) — an opening bracket may not end a line, so it is pushed down
  with the following cluster.

**2. A discrete size ladder, not a binary search.** A search to 0.01px can land on
a different value if `measureText` differs by a hair between Chrome builds — and a
different size changes the *line breaks*, which is a visible jump between two
renders of the same storyboard. Ladders are stable under metric noise and keep the
type scale honest (steps, not 73.41px):

```
display    128 116 104 96 88
headline    96  88  80 72 64
statement   72  64  58 52 46
sub         52  48  44 40 36
caption     44  40  36 32
```

**3. Line count and block height are first-class.** Overflow at the smallest rung
sets a flag, and `assertNoOverflow` turns it into a build failure naming the scene
and field. A silently shrunk-past-legibility headline is the kind of thing that
ships and then looks amateur.

Two- and three-line blocks additionally get **balanced**: the cut points are
re-chosen to even out line widths, ties breaking toward the earliest cut so the
result is deterministic. Ragged-right looks accidental at display sizes.

`Intl.Segmenter` is available and would keep two-character words intact, but it is
**off by default** — ICU word-break data varies between Chrome builds, so the same
storyboard could break differently on two machines. Per-character plus kinsoku is
self-contained and provably identical everywhere.

## Fonts

Two variable faces, named for what they are rather than the role they play, because
real sites pair them both ways round:

```
FONT_SANS  = "H2V Sans"   ← Noto Sans SC VF
FONT_SERIF = "H2V Serif"  ← Noto Serif SC VF
```

`art.displayFace` and `art.bodyFace` are **independent**. Anthropic, for instance,
sets headings in a sans (`anthropicSans` 700) and body copy in a serif
(`anthropicSerif`) — collapsing that to one toggle loses the contrast that makes a
site's typography recognisable. `fontFor(role, art)` treats `display`, `headline`
and `statement` as display roles and everything else as body.

### Why not `@remotion/google-fonts`

`NotoSansSC` there exposes **101 subsets x 9 weights**, and Chinese does not live
in a subset you can name — it is spread across subsets literally called `"[21]"`
through `"[119]"`. `loadFont()` creates one `FontFace` and one render-blocking
`delayRender()` per (style, weight, subset), so loading Chinese "properly" means
200+ handles and 200+ CDN fetches **per frame tab**. That is the `delayRender`
blow-up, the nondeterminism and the payload problem in one.

### Local subsetting

`scripts/build_fonts.mjs` runs `pyftsubset` over the two variable sources with
exactly the codepoints the storyboard uses, plus a fixed base set (ASCII,
full-width punctuation and brackets, full-width digits, arrows and marks).

Measured on a real 95-second board: **311 unique codepoints (188 CJK) becomes
125.7 KB total** — versus about 36 MB for the full faces. Zero network at render.

`pyftsubset` preserves the `wght` axis through subsetting (verified: `fvar` survives
as wght 100..900), so **two files cover every weight in the scale**. They are
registered with `weight: "100 900"` and one `delayRender` handle for both.

The base set is always included because CJK punctuation is full-width and
metrically load-bearing — the hardMax numbers above assume a 1.000em advance, so a
fallback glyph there would break layout, not merely look wrong.

Sources are pinned by URL and cached in `~/.cache/html2video/fonts/` so every
machine subsets from byte-identical input. If the download fails the script falls
back to a macOS system font **and says so**: system fonts differ between OS
versions, so line breaking is no longer reproducible.

## Details worth the code

**Hanging punctuation on pull quotes.** The opening 「 gets `marginLeft: "-1em"`.
CJK quotation marks occupy a full 1em box, so without hanging it the quote looks
visibly indented relative to everything else in the frame. This is the difference
between "generated" and "set".

**`whiteSpace: "pre"` on fitted lines.** Kinsoku attaches trailing spaces to
clusters; letting them collapse shifts the line away from what was measured.

**`fontVariantNumeric: "tabular-nums"`** on any animating number, so digits do not
jitter as they change width.
