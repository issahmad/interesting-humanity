import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export const WIPE_FRAMES = 3;

// A solid palette-colour panel sweeping left to right over 3 frames: left
// half, full frame, right half. Start it one frame before the cut so the full
// frame lands on the cut. Hard edge, no gradient.
export const ColorWipe: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: color,
        translate: interpolate(
          frame,
          [0, WIPE_FRAMES - 1],
          ["-50% 0%", "50% 0%"],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        ),
      }}
    />
  );
};
