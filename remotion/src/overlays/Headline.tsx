import React from "react";
import { AbsoluteFill } from "remotion";
import { boil, drawProgress, popStyle, useSince } from "../motion";
import { fonts, palette, swipeColor } from "../theme";
import type { Swipe } from "../types";

// Rough-edged highlighter bar, stretched behind the text.
const SWIPE_PATH =
  "M1,3 L20,1.5 L45,2.8 L70,1 L99,2.5 L98.5,10 L99.5,18 L75,19.2 L50,17.8 L25,19.5 L0.8,18 L1.8,10 Z";

// Chunky ALL CAPS headline on a highlighter swipe, top-left, tilted -2.5deg.
// The swipe paints on left to right, then the words pop in.
export const Headline: React.FC<{
  text: string;
  swipe: Swipe;
  start: number;
}> = ({ text, swipe, start }) => {
  const t = useSince(start);
  if (t < 0) return null;
  const reveal = drawProgress(t, 5);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 84,
          maxWidth: 1050,
          rotate: "-2.5deg",
          transformOrigin: "left center",
        }}
      >
        <div style={{ position: "relative", display: "inline-block" }}>
          <svg
            viewBox="0 0 100 20"
            preserveAspectRatio="none"
            style={{
              position: "absolute",
              left: -30,
              right: -30,
              top: -6,
              bottom: -10,
              width: "calc(100% + 60px)",
              height: "calc(100% + 16px)",
              clipPath: `inset(0 ${100 - reveal * 100}% 0 0)`,
              ...boil("line"),
            }}
          >
            <path d={SWIPE_PATH} fill={swipeColor[swipe]} />
          </svg>
          <div
            style={{
              position: "relative",
              fontFamily: fonts.headline,
              fontSize: 104,
              lineHeight: 1.05,
              color: palette.navy,
              textTransform: "uppercase",
              letterSpacing: 1,
              transformOrigin: "left bottom",
              ...popStyle(t - 3),
            }}
          >
            <span style={{ display: "inline-block", scale: "0.9 1" }}>
              {text}
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
