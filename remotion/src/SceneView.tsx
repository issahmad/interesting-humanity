import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { findCueMs } from "./cues";
import { boil } from "./motion";
import { Arrow } from "./overlays/Arrow";
import { Bubble } from "./overlays/Bubble";
import { Headline } from "./overlays/Headline";
import { Label } from "./overlays/Label";
import { fonts, palette } from "./theme";
import type { Overlay, Scene, Word } from "./types";

// Default entrance, in frames after the cut, when an overlay has no cue.
const DEFAULT_DELAY: Record<Overlay["type"], number> = {
  headline: 4,
  bubble: 8,
  arrow: 12,
  label: 14,
};

// Slow camera drift on the still: a gentle push-in plus a small pan, smooth
// (not on twos) so only the lines boil.
const Still: React.FC<{ src: string; index: number }> = ({ src, index }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const dirX = index % 2 === 0 ? -1 : 1;
  const opts = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  return (
    <AbsoluteFill style={{ backgroundColor: palette.cream, overflow: "hidden" }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          scale: interpolate(frame, [0, durationInFrames], [1.02, 1.07], opts),
          translate: interpolate(
            frame,
            [0, durationInFrames],
            ["0px 0px", `${dirX * 18}px -6px`],
            opts,
          ),
          ...boil("soft"),
        }}
      />
    </AbsoluteFill>
  );
};

// Stand-in until the scene's image exists: shows the scene id and its line,
// so timing and overlays can be checked before any image is generated.
const Placeholder: React.FC<{ scene: Scene }> = ({ scene }) => (
  <AbsoluteFill
    style={{
      backgroundColor: palette.cream,
      alignItems: "center",
      justifyContent: "center",
      padding: 200,
      textAlign: "center",
      fontFamily: fonts.hand,
      color: palette.navy,
    }}
  >
    <div style={{ fontSize: 40, opacity: 0.55 }}>
      {scene.id} · no image yet
    </div>
    <div style={{ fontSize: 52, marginTop: 24, lineHeight: 1.3 }}>
      {scene.text}
    </div>
  </AbsoluteFill>
);

export const SceneView: React.FC<{
  scene: Scene;
  index: number;
  words: Word[];
}> = ({ scene, index, words }) => {
  const { fps } = useVideoConfig();
  const startMs = scene.startSec * 1000;
  const startFrame = (o: Overlay): number => {
    if (o.cue) {
      const ms = findCueMs(words, o.cue, startMs, scene.endSec * 1000);
      if (ms !== undefined) return Math.round(((ms - startMs) / 1000) * fps);
    }
    return DEFAULT_DELAY[o.type];
  };
  return (
    <AbsoluteFill>
      {scene.image ? (
        <Still src={scene.image} index={index} />
      ) : (
        <Placeholder scene={scene} />
      )}
      {scene.overlays.map((o, i) => {
        const start = startFrame(o);
        switch (o.type) {
          case "headline":
            return (
              <Headline key={i} text={o.text} swipe={o.swipe} start={start} />
            );
          case "label":
            return <Label key={i} text={o.text} at={o.at} start={start} />;
          case "arrow":
            return <Arrow key={i} to={o.to} label={o.label} start={start} />;
          case "bubble":
            return (
              <Bubble key={i} at={o.at} content={o.content} start={start} />
            );
        }
      })}
    </AbsoluteFill>
  );
};
