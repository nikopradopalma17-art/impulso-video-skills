/**
 * The composition. Assembles a validated storyboard into a timeline.
 *
 * Timing note: resolveTimeline() is called here AND in calculateMetadata, and it
 * is the same pure function in both places. That is deliberate — one source of
 * truth for Σframes − Σtransitions means the component and the composition's
 * declared duration cannot drift apart.
 */

import React, { useMemo } from "react";
import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { TransitionSeries } from "@remotion/transitions";
import { WaitForFonts } from "./lib/WaitForFonts";
import { motionKit, palette } from "./lib/art";
import { bedEnvelope, duckAt, type DuckWindow } from "./lib/audio";
import { resolveTimeline } from "./lib/timeline";
import { isCut, presentationFor, timingFor } from "./lib/transitions";
import { SHOTS } from "./shots";
import type { Asset, Storyboard } from "./schema/storyboard";

/**
 * Duck the bed under each scene's text-reveal window, so the music steps back
 * exactly when there is something to read. In voice mode the narration windows
 * take over this job.
 */
const duckWindows = (sb: Storyboard, frames: number[]): DuckWindow[] => {
  const out: DuckWindow[] = [];
  let cursor = 0;
  sb.scenes.forEach((s, i) => {
    const f = frames[i]!;
    // Duck across the reading body of the scene, not its whole length: the tail
    // hold is where the music is allowed to come back up.
    const start = cursor + Math.round(f * 0.06);
    const end = cursor + Math.round(f * 0.72);
    if (end > start) out.push([start, end]);
    const isLast = i === sb.scenes.length - 1;
    cursor += f - (isLast || s.transitionOut.kind === "cut" ? 0 : s.transitionOut.frames);
  });
  return out;
};

export const Html2Video: React.FC<{ readonly storyboard: Storyboard }> = ({
  storyboard: sb,
}) => {
  const { durationInFrames, fps } = useVideoConfig();
  const timeline = useMemo(() => resolveTimeline(sb), [sb]);
  const kit = useMemo(() => motionKit(sb.motion), [sb.motion]);
  const pal = palette(sb.art);

  // Assets are resolved to staticFile() here, once. Nothing downstream ever sees
  // a bare path, and nothing ever sees a URL — the schema rejects those at
  // validation time so the render never waits on the network.
  const assets = useMemo(() => {
    const m = new Map<string, Asset>();
    for (const a of sb.assets) {
      m.set(a.id, { ...a, src: staticFile(a.src) });
    }
    return m;
  }, [sb.assets]);

  const windows = useMemo(
    () => duckWindows(sb, timeline.scenes.map((s) => s.frames)),
    [sb, timeline.scenes],
  );

  const children: React.ReactNode[] = [];
  sb.scenes.forEach((scene, i) => {
    const timing = timeline.scenes[i]!;
    const Shot = SHOTS[scene.shot];

    children.push(
      <TransitionSeries.Sequence
        key={`s-${scene.id}`}
        durationInFrames={timing.frames}
        // Decode images before the cut rather than on it.
        premountFor={Math.round(fps * 0.5)}
      >
        <Shot
          scene={scene}
          timing={timing}
          art={sb.art}
          kit={kit}
          assets={assets}
          fps={fps}
        />
      </TransitionSeries.Sequence>,
    );

    const isLast = i === sb.scenes.length - 1;
    if (!isLast && !isCut(scene.transitionOut)) {
      children.push(
        <TransitionSeries.Transition
          key={`t-${scene.id}`}
          presentation={presentationFor(scene.transitionOut, kit.dir)}
          timing={timingFor(scene.transitionOut)}
        />,
      );
    }
  });

  return (
    <AbsoluteFill style={{ backgroundColor: pal.bg }}>
      <WaitForFonts>
        <TransitionSeries>{children}</TransitionSeries>

        {sb.audio.mode === "music" && sb.audio.bed ? (
          // Mounted at composition frame 0 and NOT inside a Sequence, with no
          // trimBefore — that is what makes the volume callback's audio-local
          // frame identical to the composition frame. See lib/audio.ts.
          <Audio
            src={staticFile(sb.audio.bed)}
            loop
            volume={(f) =>
              duckAt(f, windows, sb.audio.bedGain, sb.audio.duckTo) *
              bedEnvelope(f, durationInFrames)
            }
          />
        ) : null}
      </WaitForFonts>
    </AbsoluteFill>
  );
};
