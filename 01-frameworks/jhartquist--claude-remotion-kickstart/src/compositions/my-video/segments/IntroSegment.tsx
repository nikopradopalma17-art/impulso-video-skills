import { AbsoluteFill, Img, staticFile } from "remotion";

export const IntroSegment: React.FC = () => {
  return (
    <AbsoluteFill className="bg-white flex items-center justify-center">
      <Img src={staticFile("images/logo.png")} alt="Logo" />
    </AbsoluteFill>
  );
};
