/**
 * The audio graph.
 *
 * THE landmine here, and it is silent: `<Audio volume={(f) => ...}>` receives
 * AUDIO-LOCAL frames, not composition frames. Remotion derives that `f` from
 * useMediaStartsAt(), so if the <Audio> sits inside a <Sequence from={90}> or
 * carries a trimBefore, then f=0 is not composition frame 0 and every duck
 * window computed in composition space is wrong by that offset.
 *
 * The rule that removes the problem instead of managing it: mount the bed at
 * composition frame 0, outside any Sequence, with no trimBefore. Then the two
 * frame spaces coincide and a duck window means what it says. If an offset is
 * ever genuinely needed, pass it explicitly and add it inside duckAt — never
 * infer it from the callback.
 */

import { interpolate } from "remotion";

export type DuckWindow = readonly [number, number];

/**
 * Bed gain at composition frame `f`, ducked inside each window.
 *
 * Ramps are symmetric and short enough to feel like mixing rather than like a
 * gate. Overlapping windows take the minimum, so a dense passage stays ducked
 * instead of pumping between windows.
 */
export const duckAt = (
  f: number,
  windows: readonly DuckWindow[],
  gain: number,
  floor: number,
  rampFrames = 9,
): number => {
  let g = gain;
  for (const [a, b] of windows) {
    const d = interpolate(
      f,
      [a - rampFrames, a, b, b + rampFrames],
      [gain, floor, floor, gain],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    g = Math.min(g, d);
  }
  return g;
};

/**
 * A gentle lift at the head and tail so the bed doesn't start or stop abruptly.
 * Multiplied with the duck curve rather than folded into it, so the two concerns
 * stay separable.
 */
export const bedEnvelope = (
  f: number,
  durationInFrames: number,
  fadeInFrames = 24,
  fadeOutFrames = 45,
): number =>
  interpolate(
    f,
    [
      0,
      fadeInFrames,
      Math.max(fadeInFrames + 1, durationInFrames - fadeOutFrames),
      durationInFrames,
    ],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
