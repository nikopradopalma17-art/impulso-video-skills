/**
 * Easing lives apart from design.ts on purpose: it is the only part of the
 * design system that imports from `remotion`, and keeping it separate lets the
 * pure numeric modules (design, move, timeline) be imported and unit-tested in
 * plain Node without pulling in React.
 */

import { Easing } from "remotion";
import type { EaseFamily } from "./design";

export const EASE: Record<EaseFamily, (n: number) => number> = {
  crisp: Easing.bezier(0.16, 1, 0.3, 1), // decisive UI-like entrance
  editorial: Easing.bezier(0.45, 0, 0.55, 1), // slow in, slow out; for pans
  overshoot: Easing.bezier(0.34, 1.56, 0.64, 1), // slight bounce past target
};

/** Exits use ease-in; entrances use ease-out. */
export const EASE_OUT_CUBIC = Easing.in(Easing.cubic);
