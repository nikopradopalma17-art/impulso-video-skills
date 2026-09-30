/**
 * Duration solving.
 *
 * The tempting bug here is a solver that scales everything to hit the target
 * runtime and ends up putting a 24-character caption on screen for 1.4s.
 * Viewers notice that every single time, so the floor is inviolable:
 *
 *   - the READABILITY FLOOR is computed from content by this module. Authors
 *     never write frames, only a dimensionless `weight`.
 *   - the solver may only distribute slack ABOVE the floor.
 *   - if the floors alone overflow the target, we FAIL with an editorial
 *     instruction rather than squeeze.
 *
 * One function is the single source of truth for the timeline, used by both
 * calculateMetadata and the component, so they can never disagree about
 * Σframes − Σtransitions.
 */

import {
  LEAD_IN_SECONDS,
  PACE,
  READ_CPS,
  SHOT_CAP_SECONDS,
  SHOT_FLOOR_SECONDS,
} from "./design";
import { estimateSpeechSeconds } from "./speech";
import type { Scene, Storyboard } from "../schema/storyboard";

/**
 * Reading cost of a string in "character units".
 *
 * A CJK ideograph is one unit. Latin runs cost a THIRD of their length, not half:
 * half-width was the wrong model, because it describes advance width rather than
 * reading effort. Latin is read as whole words at roughly 200wpm, so a 41-character
 * English phrase takes ~1.5-2s, not the ~4.8s a half-rate model predicted — which
 * had been inflating title cards to 8.6s of dead air. Newlines are free.
 */
export const readingUnits = (text: string): number => {
  let units = 0;
  let latinRun = 0;
  const flush = () => {
    if (latinRun > 0) {
      units += Math.ceil(latinRun / 3);
      latinRun = 0;
    }
  };
  for (const ch of text) {
    if (ch === "\n" || ch === "\r") continue;
    if (/[0-9A-Za-zÀ-ɏ'’.\-]/.test(ch)) {
      latinRun++;
    } else {
      flush();
      if (ch !== " " && ch !== "　") units += 1;
    }
  }
  flush();
  return units;
};

/** Seconds of reading the scene's text demands, before any hold. */
const textReadSeconds = (scene: Scene): number => {
  const t = scene.text;
  // A quote is read slower than a headline — it is meant to be dwelt on.
  const headlineRole = scene.shot === "quote" ? "quote" : "headline";
  let s = 0;
  const add = (str: string | undefined, role: string) => {
    if (!str) return;
    s += readingUnits(str) / (READ_CPS[role] ?? 4.5);
  };

  add(t.eyebrow, "label");
  add(t.headline, headlineRole);
  add(t.sub, "sub");
  add(t.caption, "caption");
  // `credit` is deliberately NOT counted. It is a provenance stamp, not prose:
  // nobody reads a source URL character by character, and letting a 49-character
  // URL gate the outro's duration pushed that scene to 10s of dead air.
  for (const item of t.items ?? []) {
    add(item.label, "label");
    add(item.text, "sub");
  }
  if (t.stat) {
    add(t.stat.value, "display");
    add(t.stat.unit, "label");
    add(t.stat.of, "caption");
  }
  for (const c of scene.callouts) add(c.text, "sub");
  return s;
};

/**
 * Minimum for the shot to read as a *move* rather than a still. A 1.2s Ken
 * Burns push reads as a glitch, not a push.
 */
const shotFloorSeconds = (scene: Scene): number => {
  const base = SHOT_FLOOR_SECONDS[scene.shot] ?? 2.6;
  if (scene.shot === "diagram") {
    return base * Math.max(1, scene.callouts.length);
  }
  if (scene.shot === "ladder") {
    return base + 0.7 * (scene.text.items?.length ?? 0);
  }
  return base;
};

export type SceneTiming = {
  id: string;
  /** Absolute start frame within the composition, transitions accounted for. */
  from: number;
  frames: number;
  floor: number;
  cap: number;
  clampedAtCap: boolean;
  clampedAtFloor: boolean;
};

export type Timeline = {
  scenes: SceneTiming[];
  /** What the composition's durationInFrames must be. */
  durationInFrames: number;
  transitionFrames: number;
  targetFrames: number;
  /** Set when Σcap could not reach the target; the video is simply shorter. */
  shortfallFrames: number;
  unit: number;
  /**
   * Non-fatal problems worth telling the author about. Overflow throws instead,
   * because an unreadable video is not a warning-level event.
   */
  warnings: string[];
};

export class TimelineOverflowError extends Error {
  constructor(
    message: string,
    readonly overflowFrames: number,
    readonly suggestions: string[],
  ) {
    super(message);
    this.name = "TimelineOverflowError";
  }
}

/** Frames the shot needs to read as a move, independent of its text. */
const shotFloorFrames = (scene: Scene, fps: number): number =>
  Math.ceil(fps * shotFloorSeconds(scene));

/** Frames the shot needs for its text to be readable, plus the move minimum. */
const floorFramesFor = (scene: Scene, fps: number, holdOut: number): number => {
  const read = LEAD_IN_SECONDS + textReadSeconds(scene) + holdOut;
  return Math.max(shotFloorFrames(scene, fps), Math.ceil(fps * read));
};

/**
 * Solve the timeline.
 *
 * In voice mode, narration audio length takes authority: durations come from
 * `voiceDurations` (seconds, keyed by scene id) and the target runtime becomes
 * an assertion rather than something to solve for.
 */
export const resolveTimeline = (
  sb: Storyboard,
  voiceDurations?: Record<string, number>,
): Timeline => {
  const fps = sb.target.fps;
  const holdOut = PACE[sb.motion.pace].holdOut;

  // A "cut" is the absence of a transition, not a zero-length one.
  const transitionFrames = sb.scenes.reduce((acc, s, i) => {
    const isLast = i === sb.scenes.length - 1;
    if (isLast || s.transitionOut.kind === "cut") return acc;
    return acc + s.transitionOut.frames;
  }, 0);

  const targetFrames = Math.round(sb.target.seconds * fps);
  const floors = sb.scenes.map((s) => floorFramesFor(s, fps, holdOut));
  const shotFloors = sb.scenes.map((s) => shotFloorFrames(s, fps));
  const caps = sb.scenes.map((s, i) =>
    Math.max(floors[i]!, Math.ceil(fps * (SHOT_CAP_SECONDS[s.shot] ?? 12))),
  );

  let frames: number[];
  let unit = 0;
  let shortfallFrames = 0;

  if (sb.audio.mode === "voice") {
    const tail = Math.round(fps * holdOut);
    // Speech takes authority here, and the READING floor deliberately does not
    // apply: the viewer is listening, not reading. Keeping it would stretch a
    // scene past its narration and leave dead air with a still frame on screen.
    // Only the per-shot "reads as a move" minimum survives.
    //
    // With no measured audio (which is the 口播-script case), the duration is
    // estimated from the narration text. That estimate is a pure function of the
    // text, so it needs no side channel and stays deterministic.
    frames = sb.scenes.map((s, i) => {
      const measured = voiceDurations?.[s.id];
      const spoken = measured ?? estimateSpeechSeconds(s.narration ?? "");
      const fromSpeech = Math.ceil(spoken * fps) + tail;
      return Math.max(shotFloors[i]!, fromSpeech);
    });
  } else {
    const needed = targetFrames + transitionFrames;
    const sumFloor = floors.reduce((a, b) => a + b, 0);
    const sumCap = caps.reduce((a, b) => a + b, 0);

    if (sumFloor > needed + sb.target.toleranceFrames) {
      const over = sumFloor - needed;
      // Rank by how much slack each scene could give back, so the advice is actionable.
      const ranked = sb.scenes
        .map((s, i) => ({
          id: s.id,
          shot: s.shot,
          floor: floors[i]!,
          textUnits: readingUnits(
            [
              s.text.headline,
              s.text.sub,
              s.text.caption,
              ...(s.text.items ?? []).map((it) => it.text),
            ]
              .filter(Boolean)
              .join(""),
          ),
        }))
        .sort((a, b) => b.floor - a.floor)
        .slice(0, 3);
      const suggestions = ranked.map(
        (r) =>
          `scene "${r.id}" (${r.shot}) has a ${(r.floor / fps).toFixed(1)}s floor from ${r.textUnits} chars — cut text or drop the scene`,
      );
      throw new TimelineOverflowError(
        `storyboard is ${(over / fps).toFixed(1)}s over target ` +
          `(floors ${(sumFloor / fps).toFixed(1)}s + transitions ${(transitionFrames / fps).toFixed(1)}s ` +
          `vs target ${sb.target.seconds}s). Shorten text or remove a scene — ` +
          `durations will not be squeezed below the reading floor.`,
        over,
        suggestions,
      );
    }

    if (sumCap < needed) {
      shortfallFrames = needed - sumCap;
      frames = [...caps];
    } else {
      // f(unit) = Σ clamp(floor_i, weight_i·unit, cap_i) is monotonically
      // non-decreasing, so plain bisection converges. Clamped scenes correctly
      // push their slack onto the unclamped ones.
      const at = (u: number) =>
        sb.scenes.reduce(
          (acc, s, i) =>
            acc + Math.min(caps[i]!, Math.max(floors[i]!, s.weight * u)),
          0,
        );
      let lo = 0;
      let hi = Math.max(
        ...sb.scenes.map((s, i) => caps[i]! / Math.max(0.0001, s.weight)),
      );
      for (let iter = 0; iter < 60; iter++) {
        const mid = (lo + hi) / 2;
        if (at(mid) < needed) lo = mid;
        else hi = mid;
      }
      unit = (lo + hi) / 2;
      frames = sb.scenes.map((s, i) =>
        Math.round(Math.min(caps[i]!, Math.max(floors[i]!, s.weight * unit))),
      );

      // Rounding drift: push the remainder onto scenes that still have headroom,
      // never onto one sitting at its floor.
      let drift = needed - frames.reduce((a, b) => a + b, 0);
      for (let pass = 0; pass < 3 && drift !== 0; pass++) {
        for (let i = 0; i < frames.length && drift !== 0; i++) {
          const step = drift > 0 ? 1 : -1;
          const next = frames[i]! + step;
          if (next >= floors[i]! && next <= caps[i]!) {
            frames[i] = next;
            drift -= step;
          }
        }
      }
    }
  }

  // Lay scenes out. Overlapping transitions mean scene n+1 starts before
  // scene n ends, which is exactly what TransitionSeries does internally.
  const scenes: SceneTiming[] = [];
  let cursor = 0;
  sb.scenes.forEach((s, i) => {
    scenes.push({
      id: s.id,
      from: cursor,
      frames: frames[i]!,
      floor: floors[i]!,
      cap: caps[i]!,
      // In voice mode the cap is never applied (speech sets the length), so
      // reporting it would print `cap` on nearly every scene and mean nothing.
      clampedAtCap: sb.audio.mode !== "voice" && frames[i]! >= caps[i]!,
      clampedAtFloor: sb.audio.mode !== "voice" && frames[i]! <= floors[i]!,
    });
    const isLast = i === sb.scenes.length - 1;
    const overlap =
      isLast || s.transitionOut.kind === "cut" ? 0 : s.transitionOut.frames;
    cursor += frames[i]! - overlap;
  });

  const durationInFrames =
    frames.reduce((a, b) => a + b, 0) - transitionFrames;

  const warnings: string[] = [];
  if (sb.audio.mode === "voice") {
    const off = durationInFrames - targetFrames;
    if (Math.abs(off) > sb.target.toleranceFrames) {
      // Not a failure: in voice mode speech dictates length and `target.seconds`
      // only records what came out. Say the number so it can be corrected.
      warnings.push(
        `narration runs ${(durationInFrames / fps).toFixed(1)}s, ` +
          `${off > 0 ? "over" : "under"} the stated target of ${sb.target.seconds}s. ` +
          `In 口播 mode speech sets the length — set target.seconds to ` +
          `${Math.round(durationInFrames / fps)} to match.`,
      );
    }
  }
  if (shortfallFrames > 0) {
    warnings.push(
      `runtime is ${(shortfallFrames / fps).toFixed(1)}s short of the ${sb.target.seconds}s target: ` +
        `every scene is already at its per-shot cap. Add a scene or lower target.seconds to about ` +
        `${Math.floor(durationInFrames / fps)}s — stretching shots past their cap makes them drag.`,
    );
  }
  if (sb.audio.mode === "voice") {
    // The failure this catches: narration carries the content, so on-screen text
    // has to be short enough to absorb at a glance. If a scene shows more text
    // than its narration lasts, the viewer is asked to read and listen at once and
    // will do neither.
    sb.scenes.forEach((s, i) => {
      const readNeeds = floors[i]!;
      if (frames[i]! < readNeeds) {
        const over = ((readNeeds - frames[i]!) / fps).toFixed(1);
        warnings.push(
          `scene "${s.id}": its on-screen text needs ${over}s longer to read than the ` +
            `narration lasts. In 口播 mode the words do the work — cut the caption, or ` +
            `keep only the headline.`,
        );
      }
    });
  }

  const atFloor = scenes.filter((s) => s.clampedAtFloor).length;
  if (sb.audio.mode !== "voice" && atFloor > scenes.length * 0.6) {
    warnings.push(
      `${atFloor} of ${scenes.length} scenes are pinned at their reading floor, so weights are ` +
        `barely doing anything. The board is text-heavy for its runtime — either cut text or raise ` +
        `target.seconds so pacing becomes expressive rather than forced.`,
    );
  }

  return {
    scenes,
    durationInFrames,
    transitionFrames,
    targetFrames,
    shortfallFrames,
    unit,
    warnings,
  };
};

/** Normalised 0..1 position within a scene → absolute frame inside that scene. */
export const normToFrame = (at: number, frames: number): number =>
  Math.round(at * Math.max(0, frames - 1));
