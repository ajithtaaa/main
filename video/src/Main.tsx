import { AbsoluteFill, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { Scene } from "./Scene";
import { Captions } from "./Captions";

export const mainSchema = z.object({
  captionsFile: z.string(),
  color: zColor(),
});

export const Main: React.FC<z.infer<typeof mainSchema>> = ({ captionsFile, color }) => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#0b1020, #1b2440)" }}>
      {/* Three.js layer — animation is driven by the frame number, not a clock */}
      <ThreeCanvas width={width} height={height} camera={{ position: [0, 0, 6], fov: 50 }}>
        <Scene color={color} />
      </ThreeCanvas>
      {/* Remotion captions layer on top */}
      <Captions file={captionsFile} />
    </AbsoluteFill>
  );
};
