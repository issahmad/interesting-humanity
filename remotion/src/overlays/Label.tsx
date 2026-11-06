import React from "react";
import { AbsoluteFill } from "remotion";
import { popStyle, useSince } from "../motion";
import { fonts, palette, zonePoint } from "../theme";
import type { Zone } from "../types";

// Small lowercase handwritten label centred on a zone.
export const Label: React.FC<{ text: string; at: Zone; start: number }> = ({
  text,
  at,
  start,
}) => {
  const t = useSince(start);
  if (t < 0) return null;
  const p = zonePoint(at);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: p.x,
          top: p.y,
          translate: "-50% -50%",
          fontFamily: fonts.hand,
          fontSize: 58,
          color: palette.navy,
          whiteSpace: "nowrap",
          textTransform: "lowercase",
          ...popStyle(t),
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
