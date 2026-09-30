/**
 * Transition vocabulary.
 *
 * Signatures verified against the installed @remotion/transitions 4.0.409 rather
 * than taken from docs: `clockWipe` and `iris` REQUIRE width/height, `wipe`
 * accepts eight directions including diagonals, and `fade` has a
 * `shouldFadeOutExitingScene` flag that turns a fade-over into a true
 * cross-dissolve. `iris` and `none` both ship even though the
 * remotion-best-practices skill documents neither.
 *
 * A "cut" is the ABSENCE of a transition element, not a zero-frame one — the
 * caller must not emit a <Transition> at all. Otherwise the duration arithmetic
 * (Σframes − Σtransitions) and TransitionSeries disagree.
 */

import { linearTiming, springTiming } from "@remotion/transitions";
import type { TransitionPresentation } from "@remotion/transitions";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { fade } from "@remotion/transitions/fade";
import { flip } from "@remotion/transitions/flip";
import { iris } from "@remotion/transitions/iris";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { CANVAS } from "./design";
import type { Scene } from "../schema/storyboard";

type Out = Scene["transitionOut"];

/** Fallback direction when none was authored, biased by the motion signature. */
const defaultDirection = (dir: number): "from-left" | "from-right" =>
  dir >= 0 ? "from-right" : "from-left";

export const presentationFor = (
  t: Out,
  motionDir: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): TransitionPresentation<any> => {
  const direction = t.direction ?? defaultDirection(motionDir);
  switch (t.kind) {
    case "fade":
      // A real cross-dissolve reads as editorial; a fade-over reads as a slide deck.
      return fade({ shouldFadeOutExitingScene: true });
    case "slide":
      return slide({ direction });
    case "wipe":
      return wipe({ direction });
    case "flip":
      return flip({ direction });
    case "clockWipe":
      return clockWipe({ width: CANVAS.width, height: CANVAS.height });
    case "iris":
      return iris({ width: CANVAS.width, height: CANVAS.height });
    case "cut":
      // Caller must not emit a Transition for a cut; this is unreachable and
      // exists only so the switch is exhaustive.
      return fade();
  }
};

export const timingFor = (t: Out) =>
  t.timing === "spring"
    ? springTiming({ config: { damping: 200 }, durationInFrames: t.frames })
    : linearTiming({ durationInFrames: t.frames });

export const isCut = (t: Out): boolean => t.kind === "cut" || t.frames === 0;
