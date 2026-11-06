import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { evolvePath } from "@remotion/paths";
import { boil, drawProgress, popStyle, useSince } from "../motion";
import {
  fonts,
  HEIGHT,
  offRegister,
  palette,
  stroke,
  WIDTH,
  zonePoint,
} from "../theme";
import type { Zone } from "../types";

type Pt = { x: number; y: number };
const DRAW_FRAMES = 10;

// A looping doodle arrow from a tail (small circle + optional label) to the
// object in `to`. It bends gently and makes one small loop on the way.
const geometry = (to: Zone) => {
  const target = zonePoint(to);
  const centre = { x: WIDTH / 2, y: HEIGHT / 2 };
  let away: Pt;
  if (to === "center") {
    away = { x: -0.88, y: 0.47 };
  } else {
    // Point the tail toward the frame centre, turned 25deg so it isn't straight.
    const a =
      Math.atan2(centre.y - target.y, centre.x - target.x) +
      (25 * Math.PI) / 180;
    away = { x: Math.cos(a), y: Math.sin(a) };
  }
  const tail = { x: target.x + away.x * 400, y: target.y + away.y * 400 };
  const head = { x: target.x + away.x * 80, y: target.y + away.y * 80 };

  const dir = { x: head.x - tail.x, y: head.y - tail.y };
  const L = Math.hypot(dir.x, dir.y);
  const u = { x: dir.x / L, y: dir.y / L };
  const n = { x: -u.y, y: u.x };
  const R = 34;
  const pts: Pt[] = [];
  for (let i = 0; i <= 90; i++) {
    const t = i / 90;
    const wave = 38 * Math.sin(Math.PI * t);
    const k = Math.min(1, Math.max(0, (t - 0.42) / 0.18));
    const loopBack = k > 0 && k < 1 ? -R * Math.sin(2 * Math.PI * k) : 0;
    const loopSide = k > 0 && k < 1 ? R * (1 - Math.cos(2 * Math.PI * k)) : 0;
    pts.push({
      x: tail.x + dir.x * t + n.x * (wave + loopSide) + u.x * loopBack,
      y: tail.y + dir.y * t + n.y * (wave + loopSide) + u.y * loopBack,
    });
  }
  const d =
    `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}` +
    pts
      .slice(1)
      .map((p) => ` L${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join("");
  const last = pts[pts.length - 1];
  const prev = pts[pts.length - 4];
  const ang = Math.atan2(last.y - prev.y, last.x - prev.x);
  const wing = (s: number): Pt => ({
    x: last.x - 36 * Math.cos(ang + s * 0.5),
    y: last.y - 36 * Math.sin(ang + s * 0.5),
  });
  // Label just beyond the tail, anchored on the side facing away from the
  // arrow so the text never covers the tail circle.
  const labelAt = { x: tail.x - u.x * 34, y: tail.y - u.y * 34 };
  const side = (v: number) => (v < -0.35 ? "-100%" : v > 0.35 ? "0%" : "-50%");
  const labelTranslate = `${side(-u.x)} ${side(-u.y)}`;
  return { d, tail, last, w1: wing(1), w2: wing(-1), labelAt, labelTranslate };
};

export const Arrow: React.FC<{ to: Zone; label?: string; start: number }> = ({
  to,
  label,
  start,
}) => {
  const g = useMemo(() => geometry(to), [to]);
  const t = useSince(start);
  if (t < 0) return null;
  const p = drawProgress(t, DRAW_FRAMES);
  const evolved = evolvePath(p, g.d);
  const headOn = t >= DRAW_FRAMES - 1;
  const line = {
    stroke: palette.tomato,
    strokeWidth: stroke.main,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    fill: "none",
  } as const;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={WIDTH} height={HEIGHT} style={boil("line")}>
        <circle
          cx={g.tail.x + offRegister}
          cy={g.tail.y + offRegister}
          r={13}
          fill={palette.tomato}
        />
        <circle
          cx={g.tail.x}
          cy={g.tail.y}
          r={13}
          fill="none"
          stroke={palette.navy}
          strokeWidth={stroke.detail}
        />
        <path
          d={g.d}
          {...line}
          strokeDasharray={evolved.strokeDasharray}
          strokeDashoffset={evolved.strokeDashoffset}
        />
        {headOn ? (
          <path
            d={`M${g.w1.x},${g.w1.y} L${g.last.x},${g.last.y} L${g.w2.x},${g.w2.y}`}
            {...line}
          />
        ) : null}
      </svg>
      {label ? (
        <div
          style={{
            position: "absolute",
            left: g.labelAt.x,
            top: g.labelAt.y,
            translate: g.labelTranslate,
            fontFamily: fonts.hand,
            fontSize: 54,
            color: palette.navy,
            whiteSpace: "nowrap",
            textTransform: "lowercase",
            ...popStyle(t - 2),
          }}
        >
          {label}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
