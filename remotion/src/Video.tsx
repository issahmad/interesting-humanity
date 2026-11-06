import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { Captions } from "./Captions";
import { ColorWipe, WIPE_FRAMES } from "./ColorWipe";
import { wordsIn } from "./cues";
import { BoilFilters } from "./motion";
import { SceneView } from "./SceneView";
import { palette, wipeColors } from "./theme";
import type { Timeline } from "./types";

// The whole video, driven by a video's timeline.json (passed as props).
// Files (audio, images) resolve against the video folder, which is used as
// Remotion's public dir: see remotion/README.md.
export const Video: React.FC<Timeline> = ({
  scenes,
  words,
  audio,
  captions = false,
}) => {
  const { fps } = useVideoConfig();
  const frameOf = (sec: number) => Math.round(sec * fps);
  return (
    <AbsoluteFill style={{ backgroundColor: palette.cream }}>
      <BoilFilters />
      {scenes.map((scene, i) => {
        const from = frameOf(scene.startSec);
        const duration = Math.max(1, frameOf(scene.endSec) - from);
        const sceneWords = wordsIn(
          words,
          scene.startSec * 1000,
          scene.endSec * 1000,
        );
        return (
          <Sequence
            key={scene.id}
            name={scene.id}
            from={from}
            durationInFrames={duration}
          >
            <SceneView scene={scene} index={i} words={words} />
            {captions ? (
              <Captions
                text={scene.text}
                words={sceneWords}
                offsetSec={scene.startSec}
              />
            ) : null}
          </Sequence>
        );
      })}
      {scenes.map((scene, i) =>
        i > 0 && scene.enter === "wipe" ? (
          <Sequence
            key={`wipe-${scene.id}`}
            name={`wipe ${scene.id}`}
            from={frameOf(scene.startSec) - 1}
            durationInFrames={WIPE_FRAMES}
          >
            <ColorWipe color={wipeColors[i % wipeColors.length]} />
          </Sequence>
        ) : null,
      )}
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
