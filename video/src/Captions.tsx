import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { createTikTokStyleCaptions, type Caption, type TikTokPage } from "@remotion/captions";

// How long words are grouped onto one caption "page" (ms). Lower = fewer words at a time.
const COMBINE_MS = 1200;

export const Captions: React.FC<{ file: string }> = ({ file }) => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const [handle] = useState(() => delayRender("Loading captions"));
  const { fps } = useVideoConfig();

  const load = useCallback(async () => {
    const res = await fetch(staticFile(file));
    setCaptions((await res.json()) as Caption[]);
    continueRender(handle);
  }, [file, handle]);

  useEffect(() => {
    load();
  }, [load]);

  const pages = useMemo(
    () =>
      captions
        ? createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: COMBINE_MS }).pages
        : [],
    [captions],
  );

  return (
    <AbsoluteFill>
      {pages.map((page, i) => {
        const next = pages[i + 1];
        const from = Math.round((page.startMs / 1000) * fps);
        const endMs = next ? next.startMs : page.startMs + page.durationMs;
        const duration = Math.max(1, Math.round((endMs / 1000) * fps) - from);
        return (
          <Sequence key={i} from={from} durationInFrames={duration} layout="none">
            <CaptionPage page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const CaptionPage: React.FC<{ page: TikTokPage }> = ({ page }) => {
  const frame = useCurrentFrame(); // relative to the Sequence start
  const { fps } = useVideoConfig();
  const nowMs = page.startMs + (frame / fps) * 1000;
  const enter = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 8 });

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 380 }}>
      <div
        style={{
          fontFamily: "Arial Black, Arial, sans-serif",
          fontSize: 84,
          fontWeight: 900,
          textAlign: "center",
          lineHeight: 1.15,
          maxWidth: 950,
          whiteSpace: "pre-wrap",
          color: "white",
          WebkitTextStroke: "14px black",
          paintOrder: "stroke",
          transform: `scale(${interpolate(enter, [0, 1], [0.85, 1])})`,
          opacity: enter,
        }}
      >
        {page.tokens.map((t) => {
          const active = t.fromMs <= nowMs && nowMs < t.toMs;
          return (
            <span key={t.fromMs} style={{ color: active ? "#ffd166" : "white" }}>
              {t.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
