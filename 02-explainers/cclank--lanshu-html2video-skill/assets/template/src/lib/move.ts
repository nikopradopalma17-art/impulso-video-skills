/**
 * Ken Burns move resolution.
 *
 * A move is two normalised viewport rects in SOURCE-IMAGE space. Two properties
 * make this formulation safe, and both are load-bearing:
 *
 *   CONTAINMENT.  V(t) = lerp(A, B, t) is a convex combination, so
 *       A ⊂ [0,1]² ∧ B ⊂ [0,1]²  ⟹  V(t) ⊂ [0,1]²  ∀t ∈ [0,1]
 *   i.e. "the pan must never expose the frame edge" is a precondition checked
 *   once, statically — not a runtime hope.
 *
 *   ASPECT.  If A and B share the same width/height ratio k, then so does
 *   lerp(A,B,t), because lerp is linear in each component:
 *       w(t) = k·h₁ + (k·h₂ − k·h₁)t = k·(h₁ + (h₂−h₁)t) = k·h(t)
 *   This matters because the renderer maps the crop onto the destination box
 *   with a single uniform scale. If the crop's PIXEL aspect did not equal the
 *   destination's, the vertical mapping would be wrong and the image would
 *   letterbox or overflow. Authors cannot reasonably hand-author aspect-exact
 *   rects, so `normalizeRectToAspect` snaps them here — growing, never shrinking,
 *   so nothing the author wanted in frame is lost.
 *
 * Both normalisation and resolution live here so the schema's validation and the
 * renderer can never disagree about what a move actually is.
 */

export type Rect = { x: number; y: number; w: number; h: number };

const clamp = (v: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, v));

/**
 * Desired width/height ratio for a crop rect, in NORMALISED units, such that
 * the cropped pixels have the same aspect as the destination box.
 *
 *   crop pixel aspect = (w·iw) / (h·ih)  and we want that to equal dest.w/dest.h
 *   ⟹  w/h = (dest.w/dest.h) · (ih/iw)
 */
export const aspectK = (
  intrinsic: { w: number; h: number },
  dest: { w: number; h: number },
): number => (dest.w / dest.h) * (intrinsic.h / intrinsic.w);

/**
 * Grow `r` to exactly the ratio `k`, keeping it centred on the author's region
 * of interest and fully inside the unit square. Grows the deficient axis rather
 * than cropping the other, so the author's region stays visible.
 */
export const normalizeRectToAspect = (r: Rect, k: number): Rect => {
  let w = r.w;
  let h = r.h;
  if (w / h < k) w = h * k;
  else h = w / k;

  // If growing pushed a side past the unit square, shrink both to fit while
  // holding the ratio.
  const shrink = Math.min(1, 1 / w, 1 / h);
  w *= shrink;
  h *= shrink;

  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  return {
    x: clamp(cx - w / 2, 0, 1 - w),
    y: clamp(cy - h / 2, 0, 1 - h),
    w,
    h,
  };
};

/** Grow about the centre by `factor`, guaranteed to stay inside the unit square. */
export const expandRect = (r: Rect, factor: number): Rect => {
  const w = Math.min(1, r.w * factor);
  const h = Math.min(1, r.h * factor);
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  return {
    x: clamp(cx - w / 2, 0, 1 - w),
    y: clamp(cy - h / 2, 0, 1 - h),
    w,
    h,
  };
};

export const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  w: a.w + (b.w - a.w) * t,
  h: a.h + (b.h - a.h) * t,
});

export type Move =
  | { kind: "rects"; from: Rect; to: Rect }
  | { kind: "push-in"; target: Rect; amount: number }
  | { kind: "pull-out"; target: Rect; amount: number }
  | { kind: "pan"; from: Rect; to: Rect; ease?: "linear" | "settle" }
  | { kind: "hold"; target: Rect };

export type ResolvedMove = { from: Rect; to: Rect; k: number };

/**
 * The single interpretation of a move. Endpoints come back aspect-exact and
 * contained, which is what the renderer's uniform-scale mapping requires.
 */
export const resolveMove = (
  m: Move,
  intrinsic: { w: number; h: number },
  dest: { w: number; h: number },
): ResolvedMove => {
  const k = aspectK(intrinsic, dest);
  const N = (r: Rect) => normalizeRectToAspect(r, k);

  switch (m.kind) {
    case "rects":
      return { from: N(m.from), to: N(m.to), k };
    case "pan":
      return { from: N(m.from), to: N(m.to), k };
    case "hold": {
      const r = N(m.target);
      return { from: r, to: r, k };
    }
    case "push-in": {
      // starts wide, settles onto the target
      const to = N(m.target);
      return { from: N(expandRect(to, m.amount)), to, k };
    }
    case "pull-out": {
      // starts on the target, opens out to reveal context
      const from = N(m.target);
      return { from, to: N(expandRect(from, m.amount)), k };
    }
  }
};

/** The tightest window the move ever shows — what sets the resolution demand. */
export const tightestRect = (m: ResolvedMove): Rect =>
  m.from.w <= m.to.w ? m.from : m.to;

/** Widest/tightest ratio, which drives the shimmer cap. */
export const zoomRatio = (m: ResolvedMove): number => {
  const lo = Math.min(m.from.w, m.to.w);
  const hi = Math.max(m.from.w, m.to.w);
  return lo <= 0 ? Infinity : hi / lo;
};

/**
 * Rendered size when an image is CONTAINED in a box rather than covering it:
 * scaled to fit entirely, letterboxed by the ground on the short axis.
 *
 * This exists because every slot is 1.78:1 or wider, so a figure taller than that
 * loses height to the crop — and for a chart, the height that goes is the title
 * and the axis labels, i.e. exactly the content. Cover is right for photographs
 * and for a figure acting as a backdrop; contain is right for anything whose
 * edges carry meaning.
 */
export const containSize = (
  intrinsic: { w: number; h: number },
  dest: { w: number; h: number },
): { w: number; h: number } => {
  const scale = Math.min(dest.w / intrinsic.w, dest.h / intrinsic.h);
  return { w: intrinsic.w * scale, h: intrinsic.h * scale };
};

/**
 * Source pixels the move needs at its tightest point. Because the endpoints are
 * aspect-exact, the width check implies the height check, but both are returned
 * so error messages can be concrete.
 */
export const requiredSourcePx = (
  m: Move,
  intrinsic: { w: number; h: number },
  dest: { w: number; h: number },
): { w: number; h: number } => {
  const resolved = resolveMove(m, intrinsic, dest);
  const t = tightestRect(resolved);
  return { w: dest.w / t.w, h: dest.h / t.h };
};
