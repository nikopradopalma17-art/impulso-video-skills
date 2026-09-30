/**
 * Ken Burns. Absent from remotion-best-practices entirely, so all of it is here.
 *
 * Derivation. To show source rect V filling a destination box D, the image must
 * be drawn `D.w / V.w` wide in destination pixels. Rather than resize the layout
 * every frame — which forces Chrome to re-rasterise the texture and makes pans
 * shimmer — the layout is fixed at the TIGHTEST zoom and we only ever scale down:
 *
 *     tight     = the narrowest keyframe rect
 *     imgW      = D.w / tight.w              constant, so one rasterisation
 *     imgH      = imgW · ih / iw
 *     scale(t)  = tight.w / V.w              ∈ (0, 1] — always downsampling
 *     translate = (−V.x · D.w / V.w,  −V.y · D.h / V.h)
 *
 * Sanity check with rects {0,0,1,1} and {.25,.25,.5,.5}: tight.w=0.5, imgW=2·D.w.
 *   t=0 → scale 0.5, translate (0,0)            → the full frame fills D
 *   t=1 → scale 1,   translate (−.5D.w, −.5D.h) → source x ∈ [0.25iw, 0.75iw]  ✓
 *
 * The two consequences that are the whole point:
 *   - scale never exceeds 1, so Chrome only downsamples. No soft upscale, ever —
 *     the failure that looks fine in a thumbnail and mushy at 1080p.
 *   - layout size is t-independent, so the texture rasterises once and only the
 *     composite transform changes per frame. That is what kills pan shimmer.
 *
 * Do not add `willChange`; it promotes the layer and reintroduces the resampling
 * this design exists to avoid.
 */

import React from "react";
import { Img, interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../easing";
import {
  lerpRect,
  normalizeRectToAspect,
  aspectK,
  containSize,
  resolveMove,
  type Move,
  type Rect,
} from "../move";

export type Keyframe = { at: number; rect: Rect };

export type Viewport = {
  /** Visible source rect at the current frame. */
  V: Rect;
  /** Narrowest rect across all keyframes; sets the rasterisation size. */
  tight: Rect;
  imgW: number;
  imgH: number;
};

/**
 * Piecewise-linear viewport over an ordered keyframe list.
 *
 * Containment and aspect exactness both survive: each segment is a convex
 * combination of two contained, aspect-exact rects, and lerp is linear in each
 * component so the ratio is preserved (see lib/move.ts).
 */
export const useKeyframedViewport = (
  keyframes: readonly Keyframe[],
  intrinsic: { w: number; h: number },
  dest: { w: number; h: number },
  easing: (n: number) => number = EASE.editorial,
): Viewport => {
  const frame = useCurrentFrame();
  const k = aspectK(intrinsic, dest);

  const kfs: Keyframe[] = keyframes.map((kf) => ({
    at: kf.at,
    rect: normalizeRectToAspect(kf.rect, k),
  }));
  const first = kfs[0]!;
  const last = kfs[kfs.length - 1]!;

  let V: Rect;
  if (kfs.length === 1 || frame <= first.at) {
    V = first.rect;
  } else if (frame >= last.at) {
    V = last.rect;
  } else {
    let i = 0;
    while (i < kfs.length - 1 && frame > kfs[i + 1]!.at) i++;
    const a = kfs[i]!;
    const b = kfs[i + 1]!;
    const t = interpolate(frame, [a.at, Math.max(a.at + 1, b.at)], [0, 1], {
      easing,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    V = lerpRect(a.rect, b.rect, t);
  }

  let tight = kfs[0]!.rect;
  for (const kf of kfs) if (kf.rect.w < tight.w) tight = kf.rect;

  const imgW = dest.w / tight.w;
  return { V, tight, imgW, imgH: imgW * (intrinsic.h / intrinsic.w) };
};

/**
 * Map a point in normalised source space to a pixel offset inside the
 * destination box, under the current viewport. This is how DiagramWalk pins a
 * callout to a place in the figure and has it travel with the pan.
 */
export const projectPoint = (
  p: { x: number; y: number },
  V: Rect,
  dest: { w: number; h: number },
): { x: number; y: number } => ({
  x: ((p.x - V.x) / V.w) * dest.w,
  y: ((p.y - V.y) / V.h) * dest.h,
});

const assertNoUpscale = (
  imgW: number,
  intrinsic: { w: number; h: number },
  src: string,
): void => {
  // calculateMetadata catches this first; this is the backstop, because shipping
  // a soft hero shot is worse than failing loudly.
  if (imgW > intrinsic.w * 1.02) {
    throw new Error(
      `KenBurns would upscale: needs ${Math.ceil(imgW)}px wide, source "${src}" is ${intrinsic.w}px. ` +
        `Widen the crop rect or use a smaller slot.`,
    );
  }
};

/** Presentational layer. Takes an already-computed viewport. */
export const ImageLayer: React.FC<{
  readonly src: string;
  readonly viewport: Viewport;
  readonly dest: { w: number; h: number };
  readonly intrinsic: { w: number; h: number };
  readonly radius?: number;
}> = ({ src, viewport, dest, intrinsic, radius = 0 }) => {
  const { V, tight, imgW, imgH } = viewport;
  assertNoUpscale(imgW, intrinsic, src);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        borderRadius: radius,
      }}
    >
      <Img
        src={src}
        pauseWhenLoading
        maxRetries={2}
        delayRenderTimeoutInMilliseconds={30_000}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: imgW,
          height: imgH,
          transformOrigin: "0 0",
          scale: tight.w / V.w,
          // Two-value form is mandatory: a bare number means translateX only.
          translate: `${-V.x * (dest.w / V.w)}px ${-V.y * (dest.h / V.h)}px`,
        }}
      />
    </div>
  );
};

/**
 * Letterboxed: the whole image, scaled to fit, centred, with the ground showing
 * around it. No crop and therefore no move — for a chart or schematic the edges
 * are content, and every slot is 1.78:1 or wider, so "cover" would eat the title
 * and the axis labels of anything taller than that.
 */
export const ContainedImage: React.FC<{
  readonly src: string;
  readonly intrinsic: { w: number; h: number };
  readonly dest: { w: number; h: number };
  readonly radius?: number;
  /** Hairline drawn around the IMAGE, not the slot. See below. */
  readonly edgeColor?: string;
  readonly edgeWidth?: number;
}> = ({ src, intrinsic, dest, radius = 0, edgeColor, edgeWidth = 0 }) => {
  const size = containSize(intrinsic, dest);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Img
        src={src}
        pauseWhenLoading
        maxRetries={2}
        delayRenderTimeoutInMilliseconds={30_000}
        style={{
          width: size.w,
          height: size.h,
          borderRadius: radius,
          // The border hugs the fitted image rather than the slot box. A slot is
          // usually wider than the image it contains — a 3016px-wide diagram fits
          // 1259px into a 1640px band — so a border on the box reads as an empty
          // frame with a picture floating inside it.
          boxShadow: edgeWidth && edgeColor ? `0 0 0 ${edgeWidth / 2}px ${edgeColor}` : undefined,
        }}
      />
    </div>
  );
};

/** Dispatches on `fit`. Shots should use this rather than choosing themselves. */
export const FigureImage: React.FC<{
  readonly src: string;
  readonly intrinsic: { w: number; h: number };
  readonly dest: { w: number; h: number };
  readonly move: Move;
  readonly fit: "cover" | "contain";
  readonly durationInFrames: number;
  readonly easing?: (n: number) => number;
  readonly radius?: number;
  /** Forwarded to ContainedImage so the hairline hugs the image, not the slot. */
  readonly edgeColor?: string;
  readonly edgeWidth?: number;
}> = ({ fit, edgeColor, edgeWidth, ...rest }) =>
  fit === "contain" ? (
    <ContainedImage
      src={rest.src}
      intrinsic={rest.intrinsic}
      dest={rest.dest}
      radius={rest.radius}
      edgeColor={edgeColor}
      edgeWidth={edgeWidth}
    />
  ) : (
    <KenBurnsImage {...rest} />
  );

/** The common case: a single move across the whole shot. */
export const KenBurnsImage: React.FC<{
  readonly src: string;
  readonly intrinsic: { w: number; h: number };
  readonly dest: { w: number; h: number };
  readonly move: Move;
  readonly durationInFrames: number;
  readonly easing?: (n: number) => number;
  readonly radius?: number;
}> = ({
  src,
  intrinsic,
  dest,
  move,
  durationInFrames,
  easing = EASE.editorial,
  radius = 0,
}) => {
  const resolved = resolveMove(move, intrinsic, dest);
  const viewport = useKeyframedViewport(
    [
      { at: 0, rect: resolved.from },
      { at: Math.max(1, durationInFrames - 1), rect: resolved.to },
    ],
    intrinsic,
    dest,
    easing,
  );
  // resolveMove already normalised these, and normalizeRectToAspect is
  // idempotent, so the hook's re-normalisation is a no-op rather than a drift.
  return (
    <ImageLayer
      src={src}
      viewport={viewport}
      dest={dest}
      intrinsic={intrinsic}
      radius={radius}
    />
  );
};
