import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

// ---- Line boil -------------------------------------------------------------
// The hand-drawn wobble: a turbulence displacement whose seed changes every
// second frame (on twos, a 12 fps look at 24 fps) while everything else moves
// smoothly. Mount <BoilFilters /> once; apply with style={boil("soft")}.

const BOIL = { soft: 1.6, line: 3.2 } as const;
export type BoilStrength = keyof typeof BOIL;

export const BoilFilters: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 7;
  return (
    <svg width={0} height={0} style={{ position: "absolute" }}>
      <defs>
        {(Object.keys(BOIL) as BoilStrength[]).map((k) => (
          <filter
            key={k}
            id={`boil-${k}`}
            x="-5%"
            y="-5%"
            width="110%"
            height="110%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency={k === "soft" ? 0.012 : 0.03}
              numOctaves={2}
              seed={seed}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={BOIL[k]}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        ))}
      </defs>
    </svg>
  );
};

export const boil = (k: BoilStrength): React.CSSProperties => ({
  filter: `url(#boil-${k})`,
});

// ---- Pop-in ----------------------------------------------------------------
// Squash-and-stretch over 6 frames: squashed, overshoots tall, settles.
export const POP_FRAMES = 6;

export const popStyle = (frame: number): React.CSSProperties => {
  const t = [0, 2, 4, POP_FRAMES];
  const opts = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const sx = interpolate(frame, t, [0.2, 1.18, 0.94, 1], opts);
  const sy = interpolate(frame, t, [0.2, 0.84, 1.07, 1], opts);
  return {
    scale: `${sx} ${sy}`,
    opacity: interpolate(frame, [0, 1], [0, 1], opts),
  };
};

// Draw-on progress for strokes (arrows, swipes): 0..1 over `frames`.
export const drawProgress = (frame: number, frames: number): number =>
  interpolate(frame, [0, frames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

// Frames since `start` (negative before it).
export const useSince = (start: number): number => useCurrentFrame() - start;
