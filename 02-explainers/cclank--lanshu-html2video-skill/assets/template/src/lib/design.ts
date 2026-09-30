/**
 * The design system, as numbers.
 *
 * Every value here is for a 1920x1080 frame. The existing remotion-best-practices
 * guidance is prose-only and keyed to a 1080-wide *vertical* frame, so none of it
 * transfers; these numbers are derived here and are the single source of truth.
 */

export const CANVAS = { width: 1920, height: 1080, fps: 30 } as const;

/**
 * Safe area. Bottom is deeper than top to reserve the caption band.
 * Content box: 1920-140-140 = 1640 wide, 1080-96-128 = 856 tall.
 * Both insets sit outside the 5% title-safe rect (96 / 54).
 */
export const SAFE = { top: 96, right: 140, bottom: 128, left: 140 } as const;
export const SAFE_WITH_CAPTIONS = { ...SAFE, bottom: 240 } as const;

export const CONTENT = {
  width: CANVAS.width - SAFE.left - SAFE.right, // 1640
  height: CANVAS.height - SAFE.top - SAFE.bottom, // 856
} as const;

/** 12 * 100 + 11 * 40 = 1640 exactly. Columns land on integers. */
export const GRID = { cols: 12, col: 100, gutter: 40 } as const;

/** Width of a span of n columns, gutters included. */
export const cols = (n: number): number =>
  n * GRID.col + Math.max(0, n - 1) * GRID.gutter;

/** Left offset of column index i (0-based), relative to the content box. */
export const colX = (i: number): number => i * (GRID.col + GRID.gutter);

/** Vertical rhythm. Every gap should be a multiple of this. */
export const RHYTHM = 8;

/**
 * Destination boxes for asset slots, in output pixels.
 *
 * THIS IS THE ONLY TABLE. It feeds both the resolution guard and the renderer,
 * and that is not incidental: an earlier version had a second table of render
 * boxes with different heights, so the guard aspect-normalised the crop to
 * 1.78:1 while the renderer normalised it to 2.38:1 — meaning the guard
 * validated a rectangle that was never displayed, and its "needs Npx" figure
 * described pixels nobody sampled. Never add a parallel table; change these.
 *
 * Heights leave room for a text row beneath, inside the 856px content box.
 */
export const SLOT_PX = {
  full: { w: 1920, h: 1080 },
  band: { w: 1640, h: 500 },
  inset: { w: 1240, h: 520 },
  left: { w: 800, h: 450 },
  right: { w: 800, h: 450 },
} as const;

export type SlotName = keyof typeof SLOT_PX;

/**
 * Text boxes per shot and field, so the validator can check character budgets
 * against the width the shot ACTUALLY lays out in rather than against the full
 * content width. `role` matters as much as width: `statement` and `outro` set
 * their headline at 72px on three lines, not 96px on two, so a budget computed
 * from the headline role rejected legal copy.
 *
 * Keep in sync with the shots; the widths here are the ones they pass to useFits.
 */
export const TEXT_BOX: Record<
  string,
  Partial<Record<"headline" | "sub" | "caption", { role: TypeRole; width: number; maxLines: number }>>
> = {
  title: {
    headline: { role: "display", width: cols(8), maxLines: 2 },
    sub: { role: "sub", width: cols(7), maxLines: 2 },
  },
  statement: { headline: { role: "statement", width: cols(10), maxLines: 3 } },
  stat: {
    headline: { role: "sub", width: cols(8), maxLines: 2 },
    caption: { role: "caption", width: cols(9), maxLines: 2 },
  },
  quote: { headline: { role: "statement", width: cols(9), maxLines: 3 } },
  figure: {
    headline: { role: "headline", width: cols(8), maxLines: 2 },
    caption: { role: "caption", width: cols(8), maxLines: 2 },
  },
  compare: {
    headline: { role: "headline", width: cols(10), maxLines: 2 },
    caption: { role: "caption", width: cols(10), maxLines: 2 },
  },
  diagram: { headline: { role: "headline", width: cols(9), maxLines: 2 } },
  caveat: {
    headline: { role: "headline", width: cols(7), maxLines: 2 },
    sub: { role: "sub", width: cols(7), maxLines: 3 },
  },
  ladder: { headline: { role: "headline", width: cols(8), maxLines: 2 } },
  outro: { headline: { role: "statement", width: cols(9), maxLines: 3 } },
};

/**
 * Narrower text box when a figure sits beside the text rather than behind it.
 * `figure` with slot left/right lays out in 800px, not cols(8).
 */
export const SIDE_SLOT_TEXT_WIDTH = 800;

/**
 * Type scale. Sizes are derived from cap-height as a fraction of frame HEIGHT
 * (the real legibility invariant), then increased ~12% for CJK stroke density.
 *
 * hardMax is geometry, not an estimate: every CJK ideograph and every full-width
 * punctuation mark in the Source Han lineage (Noto Sans/Serif SC) has an advance
 * width of exactly 1.000em at 1000 upem. So for content width Wc and tracking t:
 *     hardMax = floor(Wc / (px * (1 + t)))
 * With Wc = 1640: headline floor(1640/96)=17, statement floor(1640/72)=22,
 * sub floor(1640/(52*1.01))=31, caption floor(1640/(44*1.02))=36.
 *
 * softMax is the editorial target — shorter lines read faster on screen.
 */
export const TYPE = {
  display: { px: 128, weight: 600, lh: 1.18, tracking: -0.01, softMax: 10, hardMax: 12 },
  headline: { px: 96, weight: 700, lh: 1.22, tracking: 0, softMax: 14, hardMax: 17 },
  statement: { px: 72, weight: 600, lh: 1.3, tracking: 0, softMax: 18, hardMax: 22 },
  sub: { px: 52, weight: 500, lh: 1.45, tracking: 0.01, softMax: 26, hardMax: 31 },
  caption: { px: 44, weight: 400, lh: 1.55, tracking: 0.02, softMax: 30, hardMax: 36 },
  label: { px: 30, weight: 600, lh: 1.4, tracking: 0.16, softMax: 24, hardMax: 30 },
  credit: { px: 26, weight: 400, lh: 1.5, tracking: 0.06, softMax: 48, hardMax: 59 },
  statValue: { px: 240, weight: 700, lh: 1.0, tracking: -0.02, softMax: 6, hardMax: 8 },
  burnedCaption: { px: 56, weight: 500, lh: 1.4, tracking: 0.01, softMax: 24, hardMax: 29 },
} as const;

export type TypeRole = keyof typeof TYPE;

export const trackingEm = (role: TypeRole): string => `${TYPE[role].tracking}em`;

/**
 * Easing families. One is picked per video from the motion signature, which is
 * seeded off the source URL — so two different articles move differently
 * without any bespoke code. The functions themselves live in ./easing so this
 * module stays free of `remotion` imports and can be unit-tested in Node.
 */
export type EaseFamily = "crisp" | "editorial" | "overshoot";

/**
 * Pace. Drives stagger between elements, entrance duration, and the trailing
 * hold after the last element lands (which is what makes a shot feel finished
 * rather than cut off).
 */
export const PACE = {
  staccato: { stagger: 4, enter: 12, holdOut: 0.35 },
  measured: { stagger: 7, enter: 16, holdOut: 0.55 },
  languid: { stagger: 11, enter: 22, holdOut: 0.8 },
} as const;

export type PaceName = keyof typeof PACE;

/**
 * Chinese silent-reading rate, characters per second, measured against short
 * on-screen lines rather than running prose. Larger type reads faster because
 * it takes fewer saccades, hence the per-role differences.
 *
 * These produce the readability FLOOR. The duration solver may only distribute
 * slack above it — never below. Squeezing text under its read floor is the one
 * failure a viewer notices every single time.
 */
export const READ_CPS: Record<string, number> = {
  display: 5.5,
  headline: 5.0,
  statement: 4.6,
  sub: 4.4,
  caption: 4.0,
  quote: 3.4,
  label: 6.0,
  credit: 6.0,
};

/** Lead-in before the first element has landed and reading can start. */
export const LEAD_IN_SECONDS = 0.5;

/**
 * Per-shot minimum, because some shots need time to read as a *move* rather
 * than as a still. A 1.2s Ken Burns push reads as a glitch, not a push.
 */
export const SHOT_FLOOR_SECONDS: Record<string, number> = {
  title: 3.0,
  statement: 2.8,
  stat: 2.6,
  quote: 3.0,
  figure: 2.6,
  compare: 3.0,
  diagram: 3.2, // per callout; multiplied by callout count
  caveat: 2.8,
  ladder: 2.6, // plus per-item
  outro: 3.0,
};

/** Upper bound per shot, so one scene cannot eat the runtime. */
export const SHOT_CAP_SECONDS: Record<string, number> = {
  title: 7.0,
  statement: 8.667,
  stat: 7.0,
  quote: 9.0,
  figure: 11.334,
  diagram: 15.0,
  compare: 12.667,
  caveat: 10.334,
  ladder: 13.334,
  outro: 8.667,
};

/**
 * Zoom-ratio cap by duration. Chrome re-rasterises across large scale ranges,
 * which shimmers on slow moves. Short moves can be more aggressive because the
 * eye has less time to notice.
 */
export const maxZoomRatio = (durationInFrames: number, fps: number): number => {
  const s = durationInFrames / fps;
  return s >= 4 ? 1.25 : s >= 2.5 ? 1.4 : 1.6;
};
