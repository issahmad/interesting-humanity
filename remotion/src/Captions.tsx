import React, { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { captionStarts, chunkAtFrame, splitCaptions } from "./captionChunks";
import { fonts, palette, stroke } from "./theme";
import type { Word } from "./types";

// Adapted from the tech-explainer pipeline's Captions.tsx, restyled for this
// channel: cream pill, navy outline, handwriting, the spoken word in tomato.
// Render inside the scene's Sequence; `words` are this scene's words with
// times from the start of the narration, `offsetSec` is the scene start.

const LEAD_SECONDS = 0.08;

export const Captions: React.FC<{
  text: string;
  words: Word[];
  offsetSec: number;
}> = ({ text, words, offsetSec }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const chunks = useMemo(() => splitCaptions(text), [text]);
  const starts = useMemo(
    () =>
      captionStarts(chunks, words)?.map((s) => s - offsetSec) ?? null,
    [chunks, words, offsetSec],
  );
  if (chunks.length === 0) return null;

  const t = frame / fps + LEAD_SECONDS;
  let index = 0;
  let startFrame: number;
  let active = -1;
  if (starts) {
    for (let i = 0; i < starts.length; i++) if (starts[i] <= t) index = i;
    startFrame = Math.max(0, Math.round((starts[index] - LEAD_SECONDS) * fps));
    const first = chunks
      .slice(0, index)
      .reduce((n, c) => n + c.split(/\s+/).filter(Boolean).length, 0);
    const n = chunks[index].split(/\s+/).filter(Boolean).length;
    for (let k = 0; k < n; k++) {
      if (words[first + k].startMs / 1000 - offsetSec <= t) active = k;
    }
  } else {
    ({ index, startFrame } = chunkAtFrame(chunks, frame, durationInFrames));
  }
  const opacity = interpolate(frame - startFrame, [0, 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 36,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: 1300,
          padding: "8px 30px",
          borderRadius: 30,
          backgroundColor: palette.cream,
          border: `${stroke.detail + 1}px solid ${palette.navy}`,
          color: palette.navy,
          fontFamily: fonts.hand,
          fontSize: 50,
          lineHeight: 1.2,
          textAlign: "center",
          textWrap: "balance",
          opacity,
        }}
      >
        {chunks[index]
          .split(/\s+/)
          .filter(Boolean)
          .map((w, i, all) => (
            <span
              key={i}
              style={{ color: i === active ? palette.tomato : palette.navy }}
            >
              {w}
              {i < all.length - 1 ? " " : ""}
            </span>
          ))}
      </div>
    </div>
  );
};
