/**
 * What every shot receives, and the two things every shot needs to do before it
 * can lay anything out: fit its text, and turn normalised emphasis markers into
 * frames.
 *
 * Emphasis positions are authored as 0..1 rather than frames precisely so that
 * re-solving scene durations to hit a runtime target cannot desync them.
 */

import { useMemo } from "react";
import { CONTENT, TYPE, type SlotName } from "./design";
import { fitCJK, type FittedText, type LadderRole } from "./type/fit-cjk";
import { familyFor } from "./type/fonts";
import { normToFrame, type SceneTiming } from "./timeline";
import type { MotionKit } from "./art";
import type { Art, Asset, Scene } from "../schema/storyboard";
import type { LineEmphasis } from "./shots/primitives";

export type ShotProps = {
  readonly scene: Scene;
  readonly timing: SceneTiming;
  readonly art: Art;
  readonly kit: MotionKit;
  readonly assets: ReadonlyMap<string, Asset>;
  readonly fps: number;
};

export type ResolvedEmphasis = {
  kind: Scene["emphasis"][number]["kind"];
  /** Absolute frame within the scene. */
  at: number;
  target: string;
};

export const resolveEmphasis = (
  scene: Scene,
  frames: number,
): ResolvedEmphasis[] =>
  scene.emphasis.map((e) => ({
    kind: e.kind,
    at: normToFrame(e.at, frames),
    target: e.target,
  }));

/** First emphasis of a given kind, or null. Used to time rules and flashes. */
export const emphasisOf = (
  list: readonly ResolvedEmphasis[],
  kind: ResolvedEmphasis["kind"],
): ResolvedEmphasis | null => list.find((e) => e.kind === kind) ?? null;

/**
 * Per-line emphasis for a text field.
 *
 * `target: "headline"` stresses the whole block; `target: "line:2"` stresses
 * one line (1-based, as an author would count them).
 */
export const lineEmphasisFor = (
  list: readonly ResolvedEmphasis[],
  field: string,
  lineCount: number,
  accent: string,
): LineEmphasis[] => {
  const out: LineEmphasis[] = [];
  for (const e of list) {
    const kind =
      e.kind === "punch" ? "punch" : e.kind === "desaturate" ? "desaturate" : null;
    if (!kind) continue;

    if (e.target === field) {
      for (let i = 0; i < lineCount; i++) {
        out.push({ line: i, kind, at: e.at, accent });
      }
      continue;
    }
    const m = /^line:(\d+)$/.exec(e.target);
    if (m && field === "headline") {
      const idx = Number(m[1]) - 1;
      if (idx >= 0 && idx < lineCount) {
        out.push({ line: idx, kind, at: e.at, accent });
      }
    }
  }
  return out;
};

/**
 * Font for a role. Display-weight roles take the harvested display face; running
 * text takes the body face. `statement` counts as display: it is the one line in
 * the frame, so it should carry the site's display voice.
 */
const DISPLAY_ROLES = new Set<LadderRole>(["display", "headline", "statement"]);

export const fontFor = (role: LadderRole, art: Art): string =>
  familyFor(DISPLAY_ROLES.has(role) ? art.displayFace : art.bodyFace);

/** Running text: subs, captions, labels, credits, callouts. */
export const bodyFont = (art: Art): string => familyFor(art.bodyFace);

export type FitRequest = {
  text: string | undefined;
  role: LadderRole;
  /** Defaults to the full content box. */
  box?: { width: number; height: number };
  maxLines?: number;
  weight?: number | string;
  balance?: boolean;
};

const DEFAULT_MAX_LINES: Record<string, number> = {
  display: 2,
  headline: 3,
  statement: 3,
  sub: 3,
  caption: 2,
  label: 1,
  credit: 2,
  burnedCaption: 2,
};

/**
 * Fit a set of text fields in one memoised pass.
 *
 * Must only run once fonts are loaded — measureText would otherwise return
 * Latin-fallback metrics and bake in the wrong line breaks. WaitForFonts wraps
 * the whole composition to guarantee that, and fitCJK additionally passes
 * validateFontIsLoaded so a mistake throws rather than renders wrong.
 */
export const useFits = <K extends string>(
  requests: Record<K, FitRequest>,
  art: Art,
): Record<K, FittedText | null> =>
  useMemo(() => {
    const out = {} as Record<K, FittedText | null>;
    for (const key of Object.keys(requests) as K[]) {
      const r = requests[key];
      if (!r.text) {
        out[key] = null;
        continue;
      }
      const spec = TYPE[r.role];
      out[key] = fitCJK({
        text: r.text,
        role: r.role,
        box: r.box ?? { width: CONTENT.width, height: CONTENT.height },
        fontFamily: fontFor(r.role, art),
        fontWeight: r.weight ?? spec.weight,
        letterSpacing: `${spec.tracking}em`,
        maxLines: r.maxLines ?? DEFAULT_MAX_LINES[r.role] ?? 3,
        balance: r.balance,
      });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(requests), art.displayFace]);

/**
 * Turn overflow into a loud failure. A silently shrunk-past-legibility headline
 * is the kind of thing that ships and then looks amateur.
 */
export const assertNoOverflow = (
  fits: Record<string, FittedText | null>,
  sceneId: string,
): void => {
  for (const [field, f] of Object.entries(fits)) {
    if (f && f.overflow) {
      throw new Error(
        `scene "${sceneId}" field "${field}" does not fit even at the smallest size ` +
          `(${f.lines.length} lines at ${f.fontSize}px). Shorten the text — ` +
          `the type scale will not be broken to accommodate it.`,
      );
    }
  }
};

/** Destination box for an asset slot, as laid out inside the frame. */
export const slotRect = (
  slot: SlotName,
): { left: number; top: number; width: number; height: number } => {
  switch (slot) {
    case "full":
      return { left: 0, top: 0, width: 1920, height: 1080 };
    case "band":
      return { left: 140, top: 210, width: 1640, height: 500 };
    case "inset":
      return { left: 340, top: 150, width: 1240, height: 698 };
    case "left":
      return { left: 140, top: 300, width: 800, height: 450 };
    case "right":
      return { left: 980, top: 300, width: 800, height: 450 };
  }
};
