/**
 * Art direction and motion signature resolution.
 *
 * This is where most of the perceived uniqueness between two videos comes from,
 * and none of it is bespoke code. The source site's real tokens become the
 * visual foundation; the motion signature — deterministically seeded off the
 * source URL — picks the easing family, stagger cadence and pan bias. Same nine
 * primitives, but an Anthropic page and a Stripe post do not look alike.
 */

import { random } from "remotion";
import { PACE, type EaseFamily, type PaceName } from "./design";
import { EASE } from "./easing";
import type { Art, Motion } from "../schema/storyboard";

export type Palette = {
  /** Page background. */
  bg: string;
  /** Primary text. */
  fg: string;
  /** De-emphasised text: captions, credits, spent callouts. */
  muted: string;
  accent: string;
  accentAlt: string;
  rule: string;
  radius: number;
  /** Dividers and separators. */
  hairline: number;
  /** Rules that act as a graphic element: underlines, sweeps, strikes. */
  ruleAccent: number;
};

/** Normal palette, plus the inverted variant used by exactly one shot. */
export const palette = (art: Art, inverted = false): Palette => {
  const base: Palette = {
    bg: art.groundColor,
    fg: art.ink,
    muted: art.inkMuted,
    accent: art.accent,
    accentAlt: art.accentAlt ?? art.accent,
    rule: art.inkMuted,
    radius: art.radius,
    // A harvested `ruleWidth` of 1 is a CSS hairline: designed for a browser at
    // 1-2x DPR viewed at arm's length. It does NOT transfer to video, which gets
    // H.264-compressed and watched at arbitrary scale — a 1px line simply
    // disappears. Measured on a real render: the 1px title rule was present in
    // the pixels and invisible to the eye. So harvested widths are scaled up to
    // video-legible minimums here, once, rather than patched per shot.
    hairline: Math.max(2, Math.round(art.ruleWidth * 2)),
    ruleAccent: Math.max(4, Math.round(art.ruleWidth * 4)),
  };
  if (!inverted) return base;
  // CaveatBeat inverts so the limitation lands structurally, not just verbally.
  return {
    ...base,
    bg: art.ink,
    fg: art.groundColor,
    muted: mix(art.groundColor, art.ink, 0.42),
    rule: mix(art.groundColor, art.ink, 0.55),
  };
};

/** Linear mix in sRGB. Good enough for scrims and muted text. */
export const mix = (a: string, b: string, t: number): string => {
  const pa = hexToRgb(a);
  const pb = hexToRgb(b);
  const c = [0, 1, 2].map((i) =>
    Math.round(pa[i]! + (pb[i]! - pa[i]!) * t),
  ) as [number, number, number];
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
};

export const rgba = (hex: string, alpha: number): string => {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
};

/** Relative luminance, for picking a readable scrim direction. */
export const luminance = (hex: string): number => {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const isDark = (hex: string): boolean => luminance(hex) < 0.4;

export type MotionKit = {
  ease: (n: number) => number;
  easeName: EaseFamily;
  stagger: number;
  enter: number;
  holdOut: number;
  pace: PaceName;
  /** Seeded, stable across renders. n indexes independent draws. */
  rnd: (n: number) => number;
  /** −1 or 1, from panBias; used to bias horizontal drift and slide direction. */
  dir: number;
  gridEnergy: number;
  revealStyle: Motion["revealStyle"];
};

export const motionKit = (m: Motion): MotionKit => {
  const p = PACE[m.pace];
  return {
    ease: EASE[m.easeFamily],
    easeName: m.easeFamily,
    stagger: p.stagger,
    enter: p.enter,
    holdOut: p.holdOut,
    pace: m.pace,
    // remotion's random() is the only permitted source of randomness; Math.random
    // is hard-overridden during rendering by lib/sandbox.ts.
    rnd: (n: number) => random(`${m.seed}:${n}`),
    dir: m.panBias === "rtl" ? -1 : 1,
    gridEnergy: m.gridEnergy,
    revealStyle: m.revealStyle,
  };
};

/**
 * Derive a full motion signature from a URL. Called at storyboard-authoring
 * time so the value is written into the JSON and stays stable, rather than being
 * recomputed (and possibly drifting) at render time.
 */
export const motionFromUrl = (
  url: string,
): Omit<Motion, "seed"> & { seed: string } => {
  const r = (n: number) => random(`${url}:sig:${n}`);
  const easeFamilies: EaseFamily[] = ["crisp", "editorial", "overshoot"];
  const paces: PaceName[] = ["staccato", "measured", "languid"];
  const reveals: Motion["revealStyle"][] = [
    "mask-up",
    "rise",
    "scale-settle",
    "clause-cascade",
  ];
  const vocabs: Motion["transitionVocab"][] = [
    ["cut", "fade", "wipe"],
    ["cut", "fade", "slide"],
    ["fade", "wipe", "clockWipe"],
    ["cut", "fade", "iris"],
  ];
  return {
    seed: url,
    // Editorial pacing is weighted toward `measured` because it suits article
    // content; the other two exist to keep the corpus from converging.
    pace: paces[Math.floor(r(1) * 3)] ?? "measured",
    easeFamily: easeFamilies[Math.floor(r(2) * 3)] ?? "editorial",
    panBias: r(3) > 0.5 ? "ltr" : "rtl",
    revealStyle: reveals[Math.floor(r(4) * reveals.length)] ?? "mask-up",
    transitionVocab: vocabs[Math.floor(r(5) * vocabs.length)] ?? [
      "cut",
      "fade",
      "wipe",
    ],
    gridEnergy: 0.15 + r(6) * 0.3,
  };
};
