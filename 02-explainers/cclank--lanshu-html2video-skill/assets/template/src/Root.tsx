/**
 * Composition registration.
 *
 * The zod schema is NOT passed as Composition's `schema` prop: zStoryboard ends
 * in .superRefine(), which makes it a ZodEffects, and Remotion requires a plain
 * z.object() there. Validation happens in calculateMetadata instead, which is
 * strictly better for this pipeline — it runs once before frame 0, it can reject
 * with a real editorial message, and parsing there means zod's defaults are
 * filled in and written back into props for every frame-tab to share.
 */

import React from "react";
import { Composition } from "remotion";
import { CANVAS } from "./lib/design";
import { resolveTimeline } from "./lib/timeline";
import { maxZoomRatio } from "./lib/design";
import { resolveMove, zoomRatio, type Move } from "./lib/move";
import { SLOT_PX } from "./lib/design";
import { parseStoryboard, type Storyboard } from "./schema/storyboard";
import { DEMO_STORYBOARD } from "./demo-storyboard";
import { Html2Video } from "./Video";
import "./lib/sandbox";

type Props = { storyboard: Storyboard };

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Html2Video"
        component={Html2Video}
        durationInFrames={900}
        fps={CANVAS.fps}
        width={CANVAS.width}
        height={CANVAS.height}
        defaultProps={{ storyboard: DEMO_STORYBOARD } as Props}
        calculateMetadata={({ props }) => {
          // Throws a flattened, readable error — including the resolution-guard
          // messages — before a single frame is rendered.
          const sb = parseStoryboard(props.storyboard);
          const timeline = resolveTimeline(sb);

          for (const w of timeline.warnings) {
            console.warn(`[html2video] ${w}`);
          }

          // Shimmer guard. Chrome re-rasterises across large scale ranges, so a
          // slow move with a big zoom range visibly crawls. This depends on the
          // solved duration, so it can only be checked here — not in the schema.
          sb.scenes.forEach((scene, i) => {
            const frames = timeline.scenes[i]!.frames;
            const limit = maxZoomRatio(frames, sb.target.fps);
            for (const binding of scene.assets) {
              const asset = sb.assets.find((a) => a.id === binding.ref);
              if (!asset) continue;
              const resolved = resolveMove(
                binding.move as Move,
                asset.intrinsic,
                SLOT_PX[binding.slot],
              );
              const ratio = zoomRatio(resolved);
              if (ratio > limit + 1e-6) {
                throw new Error(
                  `scene "${scene.id}": zoom range ${ratio.toFixed(2)}x over ` +
                    `${(frames / sb.target.fps).toFixed(1)}s exceeds the ${limit}x cap for that ` +
                    `duration — the pan will shimmer. Reduce \`amount\`, or shorten the scene.`,
                );
              }
            }
          });

          return {
            durationInFrames: timeline.durationInFrames,
            fps: sb.target.fps,
            width: sb.target.width,
            height: sb.target.height,
            props: { storyboard: sb } as Props,
          };
        }}
      />
    </>
  );
};
