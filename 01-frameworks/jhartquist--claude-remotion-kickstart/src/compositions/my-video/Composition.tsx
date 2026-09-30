import { Series, useVideoConfig } from "remotion";
import { IntroSegment } from "./segments/IntroSegment";
import { getDurationInFrames } from "../../config";
import { INTRO_DURATION_SECONDS } from "./config";
import { createComposition } from "../../utils/createComposition";

const MyVideoComposition: React.FC = () => {
  const { fps } = useVideoConfig();
  const introDuration = getDurationInFrames(INTRO_DURATION_SECONDS, fps);

  return (
    <Series>
      <Series.Sequence durationInFrames={introDuration}>
        <IntroSegment />
      </Series.Sequence>
    </Series>
  );
};

const TOTAL_DURATION_SECONDS = INTRO_DURATION_SECONDS;

export const MyVideo = createComposition({
  name: "MyVideo",
  component: MyVideoComposition,
  durationInSeconds: TOTAL_DURATION_SECONDS,
  preset: "Landscape-1080p",
});
