import React from "react";
import { AbsoluteFill } from "remotion";
import { boil, popStyle, useSince } from "../motion";
import { fonts, offRegister, palette, stroke, zonePoint } from "../theme";
import type { Zone } from "../types";

// Scribbled lightbulb for content="lightbulb".
const Bulb: React.FC = () => (
  <svg width={110} height={130} viewBox="0 0 110 130">
    <path
      d="M55,10 C25,10 12,34 18,56 C22,72 36,78 38,96 L72,96 C74,78 88,72 92,56 C98,34 85,10 55,10 Z"
      fill={palette.mustard}
      transform={`translate(${offRegister / 2},${offRegister / 2})`}
    />
    <path
      d="M55,10 C25,10 12,34 18,56 C22,72 36,78 38,96 L72,96 C74,78 88,72 92,56 C98,34 85,10 55,10 Z M40,106 L70,106 M44,116 L66,116"
      fill="none"
      stroke={palette.navy}
      strokeWidth={stroke.main - 1}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Rounded squircle thought bubble (never a cloud) with 3 trailing dots that
// lead down toward the middle of the frame, where the hero usually stands.
export const Bubble: React.FC<{ at: Zone; content: string; start: number }> = ({
  at,
  content,
  start,
}) => {
  const t = useSince(start);
  if (t < 0) return null;
  const c = zonePoint(at);
  const isBulb = content.trim().toLowerCase() === "lightbulb";
  const w = isBulb ? 240 : Math.max(220, content.length * 62 + 90);
  const h = 200;
  const toward = { x: 960 - c.x, y: 760 - c.y };
  const len = Math.hypot(toward.x, toward.y) || 1;
  const ux = toward.x / len;
  const uy = toward.y / len;
  const dots = [
    { d: 150, r: 18 },
    { d: 196, r: 12 },
    { d: 230, r: 7 },
  ];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {dots.map((dot, i) => {
        const x = c.x + ux * dot.d;
        const y = c.y + uy * dot.d;
        return (
          <svg
            key={i}
            width={60}
            height={60}
            style={{
              position: "absolute",
              left: x - 30,
              top: y - 30,
              ...boil("line"),
              ...popStyle(t - 4 - i * 2),
            }}
          >
            <circle
              cx={30 + offRegister / 2}
              cy={30 + offRegister / 2}
              r={dot.r}
              fill={palette.cream}
            />
            <circle
              cx={30}
              cy={30}
              r={dot.r}
              fill="none"
              stroke={palette.navy}
              strokeWidth={stroke.detail + 1}
            />
          </svg>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: c.x - w / 2,
          top: c.y - h / 2,
          width: w,
          height: h,
          ...popStyle(t),
        }}
      >
        <svg
          width={w + offRegister + 8}
          height={h + offRegister + 8}
          style={{ position: "absolute", left: -4, top: -4, ...boil("line") }}
        >
          <rect
            x={4 + offRegister}
            y={4 + offRegister}
            width={w}
            height={h}
            rx={70}
            fill={palette.cream}
          />
          <rect
            x={4}
            y={4}
            width={w}
            height={h}
            rx={70}
            fill="none"
            stroke={palette.navy}
            strokeWidth={stroke.main}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: fonts.headline,
            fontSize: 104,
            color: palette.navy,
            textTransform: content.length > 1 ? "lowercase" : "none",
          }}
        >
          {isBulb ? <Bulb /> : content}
        </div>
      </div>
    </AbsoluteFill>
  );
};
