import { Composition } from "remotion";
import { Main, mainSchema } from "./Main";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 1080x1920 = vertical (Shorts/Reels). Use 1920x1080 for YouTube landscape. */}
      <Composition
        id="Main"
        component={Main}
        durationInFrames={30 * 8}
        fps={30}
        width={1080}
        height={1920}
        schema={mainSchema}
        defaultProps={{
          captionsFile: "captions.json",
          color: "#4f8cff",
        }}
      />
    </>
  );
};
